"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TextEntry {
  id: string;
  hy: string;
  en: string;
  ru: string;
  type: string;
}

interface Progress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  current: string;
}

export default function AudioGeneratorPage() {
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [progress, setProgress] = useState<Progress>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    current: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(10);
  const [lang, setLang] = useState<"hy" | "en" | "ru" | "all">("hy");

  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Fetch texts from the content database
  useEffect(() => {
    async function fetchTexts() {
      try {
        const response = await fetch("/api/lexicon/full");
        if (response.ok) {
          const data = await response.json();
          setTexts(data.texts || []);
          setProgress((p) => ({ ...p, total: data.texts?.length || 0 }));
        }
      } catch (err) {
        addLog("Failed to fetch texts from database");
      }
    }
    fetchTexts();
  }, []);

  // Generate single audio via Edge Function
  const generateAudio = useCallback(
    async (entry: TextEntry, language: string): Promise<boolean> => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            text: entry[language as keyof TextEntry],
            lang: language,
            id: entry.id,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Unknown" }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();

        // Save to local storage or upload to Supabase Storage
        // For now, we'll just verify it worked
        if (audioBlob.size > 500) {
          addLog(`✅ ${entry.id}.${language}: Generated (${audioBlob.size} bytes)`);
          return true;
        } else {
          throw new Error("Audio too small");
        }
      } catch (err) {
        addLog(`❌ ${entry.id}.${language}: ${(err as Error).message}`);
        return false;
      }
    },
    [supabaseUrl, supabaseAnonKey]
  );

  // Download and save audio file to public/audio
  const saveAudioFile = useCallback(
    async (entry: TextEntry, language: string): Promise<boolean> => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            text: entry[language as keyof TextEntry],
            lang: language,
            id: entry.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const audioBlob = await response.blob();

        // Create download link
        const paddedId = entry.id.padStart(6, "0");
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paddedId}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await new Promise((r) => setTimeout(r, 100)); // Small delay

        return true;
      } catch (err) {
        return false;
      }
    },
    [supabaseUrl, supabaseAnonKey]
  );

  // Start batch generation
  const startGeneration = useCallback(async () => {
    if (isGenerating || texts.length === 0) return;

    setIsGenerating(true);
    setProgress((p) => ({ ...p, processed: 0, success: 0, failed: 0 }));
    addLog(`Starting generation for ${texts.length} entries...`);

    const langsToProcess = lang === "all" ? ["hy", "en", "ru"] : [lang];
    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const entry of texts) {
      for (const language of langsToProcess) {
        const text = entry[language as keyof TextEntry];
        if (!text) continue;

        setProgress((p) => ({
          ...p,
          current: `${entry.id}.${language}: ${text.substring(0, 30)}...`,
        }));

        const ok = await generateAudio(entry, language);
        if (ok) {
          success++;
        } else {
          failed++;
        }

        processed++;
        setProgress((p) => ({ ...p, processed, success, failed }));

        // Rate limiting
        await new Promise((r) => setTimeout(r, 200));
      }

      // Check if paused
      if (!isGenerating) break;
    }

    setIsGenerating(false);
    addLog(`Generation complete: ${success} success, ${failed} failed`);
  }, [texts, lang, isGenerating, generateAudio]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    addLog("Generation stopped by user");
  }, []);

  // Test a single entry
  const testSingle = useCallback(
    async (entry: TextEntry, language: string) => {
      addLog(`Testing ${entry.id}.${language}...`);
      await generateAudio(entry, language);
    },
    [generateAudio]
  );

  // Play audio for testing
  const playAudio = useCallback(async (entry: TextEntry, language: string) => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          text: entry[language as keyof TextEntry],
          lang: language,
          id: entry.id,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => URL.revokeObjectURL(audioUrl);
      audio.play();
    } catch (err) {
      addLog(`Play failed: ${(err as Error).message}`);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Audio Generator</h1>
        <p className="text-gray-400 mb-6">Generate Armenian audio using Supabase Edge Functions</p>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400">Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="w-full bg-gray-800 rounded p-2 mt-1"
              >
                <option value="hy">Armenian (hy)</option>
                <option value="en">English (en)</option>
                <option value="ru">Russian (ru)</option>
                <option value="all">All Languages</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Batch Size</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                className="w-full bg-gray-800 rounded p-2 mt-1"
                min="1"
                max="100"
              />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <button
                onClick={isGenerating ? stopGeneration : startGeneration}
                className={`flex-1 py-2 px-4 rounded font-bold ${
                  isGenerating
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isGenerating ? "Stop" : "Start Generation"}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {progress.processed}/{progress.total}</span>
              <span className="text-emerald-400">✅ {progress.success}</span>
              <span className="text-red-400">❌ {progress.failed}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              />
            </div>
            {progress.current && (
              <p className="text-xs text-gray-500 truncate">{progress.current}</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-2">How It Works</h2>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            <li>The Edge Function generates audio using Google Translate TTS (supports Armenian)</li>
            <li>Audio is streamed directly to the browser for playback</li>
            <li>To save files: The generate script in the repo can be run locally with proper network access</li>
            <li>The app will fallback to browser TTS if pre-generated MP3s are unavailable</li>
          </ol>
        </div>

        {/* Sample Texts */}
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <h2 className="font-bold">Sample Texts ({texts.length} entries)</h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0">
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Armenian</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {texts.slice(0, 20).map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-2 font-mono text-xs">{entry.id}</td>
                    <td className="p-2">{entry.hy}</td>
                    <td className="p-2">
                      <button
                        onClick={() => playAudio(entry, "hy")}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded mr-1"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => testSingle(entry, "hy")}
                        className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between">
            <h2 className="font-bold">Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-3 font-mono text-xs text-gray-400">
            {logs.length === 0 ? (
              <p className="text-gray-600">No logs yet...</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          NUR Lingo Audio Generator - Uses Supabase Edge Functions for TTS
        </p>
      </div>
    </main>
  );
}
