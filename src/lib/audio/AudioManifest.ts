// src/lib/audio/AudioManifest.ts
// NUR Lingo Audio Engine — Manifest Management

import {
  AudioManifest,
  AudioManifestEntry,
  AudioStatus,
  AudioProviderType,
  LanguageCode,
} from "./AudioTypes";

const MANIFEST_URL = "/audio/manifest.json";
const MANIFEST_SCHEMA_VERSION = 1;

/**
 * In-memory manifest with lazy loading and caching
 */
class AudioManifestManager {
  private manifest: AudioManifest | null = null;
  private loadingPromise: Promise<AudioManifest> | null = null;
  private statusCache = new Map<string, boolean>(); // id-lang -> exists
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 60_000; // 1 minute

  /**
   * Get the full manifest, loading it if necessary
   */
  async getManifest(): Promise<AudioManifest> {
    // Return cached if fresh
    if (this.manifest && Date.now() - this.lastFetchTime < this.CACHE_TTL) {
      return this.manifest;
    }

    // Deduplicate concurrent loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadManifest();
    return this.loadingPromise;
  }

  /**
   * Load manifest from server
   */
  private async loadManifest(): Promise<AudioManifest> {
    try {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) {
        // Return empty manifest if not found
        return this.createEmptyManifest();
      }

      const data = await response.json();

      // Validate schema version
      if (data.schemaVersion && data.schemaVersion > MANIFEST_SCHEMA_VERSION) {
        console.warn("[AudioManifest] Manifest schema newer than expected");
      }

      this.manifest = this.normalizeManifest(data);
      this.lastFetchTime = Date.now();
      this.loadingPromise = null;

      // Build status cache for fast lookups
      this.rebuildStatusCache();

      return this.manifest;
    } catch {
      console.warn("[AudioManifest] Failed to load manifest, using empty");
      this.loadingPromise = null;
      return this.createEmptyManifest();
    }
  }

  /**
   * Create an empty manifest structure
   */
  private createEmptyManifest(): AudioManifest {
    return {
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      totalEntries: 0,
      entries: {},
      stats: {
        hy: { total: 0, ready: 0, missing: 0 },
        en: { total: 0, ready: 0, missing: 0 },
        ru: { total: 0, ready: 0, missing: 0 },
      },
    };
  }

  /**
   * Normalize raw manifest data
   */
  private normalizeManifest(data: Record<string, unknown>): AudioManifest {
    const entries: Record<string, AudioManifestEntry> = {};

    // Handle flat format { "000001": {}, "000002": {} }
    if (data.entries) {
      Object.assign(entries, data.entries);
    } else {
      // Each key at root level is an audio ID
      for (const [id, value] of Object.entries(data)) {
        if (id === "schemaVersion" || id === "lastUpdated" || id === "stats") continue;
        if (typeof value === "object" && value !== null) {
          entries[id] = this.normalizeEntry(id, value as Record<string, unknown>);
        }
      }
    }

    // Compute stats
    const stats = this.computeStats(entries);

    return {
      schemaVersion: (data.schemaVersion as number) ?? MANIFEST_SCHEMA_VERSION,
      lastUpdated: (data.lastUpdated as string) ?? new Date().toISOString(),
      totalEntries: Object.keys(entries).length,
      entries,
      stats,
    };
  }

  /**
   * Normalize a single entry
   */
  private normalizeEntry(id: string, data: Record<string, unknown>): AudioManifestEntry {
    return {
      id,
      text: (data.text as string) ?? "",
      lang: (data.lang as LanguageCode) ?? "hy",
      filename: (data.filename as string) ?? `${id.padStart(6, "0")}.mp3`,
      duration: data.duration as number | undefined,
      provider: (data.provider as AudioProviderType) ?? AudioProviderType.MP3,
      version: (data.version as number) ?? 1,
      checksum: data.checksum as string | undefined,
      generatedAt: data.generatedAt as string | undefined,
      size: data.size as number | undefined,
      sampleRate: data.sampleRate as number | undefined,
      status: (data.status as AudioStatus) ?? AudioStatus.READY,
    };
  }

  /**
   * Compute statistics from entries
   */
  private computeStats(entries: Record<string, AudioManifestEntry>): AudioManifest["stats"] {
    const stats: AudioManifest["stats"] = {
      hy: { total: 0, ready: 0, missing: 0 },
      en: { total: 0, ready: 0, missing: 0 },
      ru: { total: 0, ready: 0, missing: 0 },
    };

    for (const entry of Object.values(entries)) {
      const langStats = stats[entry.lang] ?? stats.hy;
      langStats.total++;
      if (entry.status === AudioStatus.READY) {
        langStats.ready++;
      } else if (entry.status === AudioStatus.MISSING) {
        langStats.missing++;
      }
    }

    return stats;
  }

  /**
   * Rebuild the status cache for fast lookups
   */
  private rebuildStatusCache(): void {
    this.statusCache.clear();
    if (!this.manifest) return;

    for (const [id, entry] of Object.entries(this.manifest.entries)) {
      const key = `${id}-${entry.lang}`;
      this.statusCache.set(key, entry.status === AudioStatus.READY);
    }
  }

  /**
   * Check if audio exists (fast check using manifest)
   */
  hasAudio(id: string, lang: LanguageCode): boolean | null {
    const key = `${id}-${lang}`;

    // Check fast cache first
    if (this.statusCache.has(key)) {
      return this.statusCache.get(key)!;
    }

    // Check manifest if loaded
    if (this.manifest) {
      const entry = this.manifest.entries[id];
      if (entry && entry.lang === lang) {
        return entry.status === AudioStatus.READY;
      }
    }

    return null; // Unknown, needs HEAD check
  }

  /**
   * Get entry by ID
   */
  async getEntry(id: string): Promise<AudioManifestEntry | null> {
    const manifest = await this.getManifest();
    return manifest.entries[id] ?? null;
  }

  /**
   * Get entry by ID and language
   */
  async getEntryByLang(id: string, lang: LanguageCode): Promise<AudioManifestEntry | null> {
    const manifest = await this.getManifest();
    const entry = manifest.entries[id];
    if (entry && entry.lang === lang) {
      return entry;
    }
    return null;
  }

  /**
   * Check if audio exists, performing HEAD check if needed
   */
  async checkAudioExists(id: string, lang: LanguageCode): Promise<boolean> {
    // Check manifest first
    const manifestResult = this.hasAudio(id, lang);
    if (manifestResult !== null) {
      return manifestResult;
    }

    // Perform HEAD request to check
    const paddedId = id.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    try {
      const response = await fetch(url, { method: "HEAD" });
      const exists = response.ok;

      // Update cache
      this.statusCache.set(`${id}-${lang}`, exists);

      return exists;
    } catch {
      this.statusCache.set(`${id}-${lang}`, false);
      return false;
    }
  }

  /**
   * Get statistics for a language
   */
  async getStats(lang: LanguageCode): Promise<{ total: number; ready: number; missing: number }> {
    const manifest = await this.getManifest();
    return manifest.stats[lang] ?? { total: 0, ready: 0, missing: 0 };
  }

  /**
   * Get all missing audio IDs
   */
  async getMissingAudio(lang?: LanguageCode): Promise<string[]> {
    const manifest = await this.getManifest();
    const missing: string[] = [];

    for (const [id, entry] of Object.entries(manifest.entries)) {
      if (entry.status === AudioStatus.MISSING) {
        if (!lang || entry.lang === lang) {
          missing.push(id);
        }
      }
    }

    return missing;
  }

  /**
   * Clear manifest cache (e.g., after updates)
   */
  clearCache(): void {
    this.manifest = null;
    this.statusCache.clear();
    this.lastFetchTime = 0;
  }

  /**
   * Update an entry (for local updates after generation)
   */
  updateEntry(id: string, updates: Partial<AudioManifestEntry>): void {
    if (!this.manifest) return;

    const existing = this.manifest.entries[id] ?? {
      id,
      text: "",
      lang: "hy" as LanguageCode,
      filename: `${id.padStart(6, "0")}.mp3`,
      provider: AudioProviderType.MP3,
      version: 1,
      status: AudioStatus.UNKNOWN,
    };

    this.manifest.entries[id] = { ...existing, ...updates };

    // Update status cache
    if (updates.lang && updates.status) {
      this.statusCache.set(`${id}-${updates.lang}`, updates.status === AudioStatus.READY);
    }

    // Recompute stats
    this.manifest.stats = this.computeStats(this.manifest.entries);
    this.manifest.lastUpdated = new Date().toISOString();
  }
}

export const audioManifest = new AudioManifestManager();
