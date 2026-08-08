// src/lib/audio/audio-cache.ts

export class AudioCache {
  private cache = new Map<string, HTMLAudioElement>();
  private loading = new Map<string, Promise<HTMLAudioElement>>();

  get(key: string): HTMLAudioElement | undefined {
    return this.cache.get(key);
  }

  set(key: string, audio: HTMLAudioElement): void {
    this.cache.set(key, audio);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  async getOrLoad(url: string): Promise<HTMLAudioElement> {
    // If already cached, return
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // If already loading, wait for it
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // Start loading
    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = "metadata";

      audio.onloadeddata = () => {
        this.cache.set(url, audio);
        this.loading.delete(url);
        resolve(audio);
      };

      audio.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load audio: ${url}`));
      };

      audio.load();
    });

    this.loading.set(url, promise);
    return promise;
  }

  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const audioCache = new AudioCache();