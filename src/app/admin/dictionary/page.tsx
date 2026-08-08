// src/app/admin/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface DictEntry {
  id?: string;
  word_id: string;
  hy: string;
  en: string;
  ru: string;
  category: string;
  part_of_speech: string;
  difficulty: number;
  notes: string;
  tags: string[];
  audio_id: string;
  image_url: string;
  source: string;
}

const BLANK: DictEntry = {
  word_id: "", hy: "", en: "", ru: "",
  category: "", part_of_speech: "noun",
  difficulty: 1, notes: "", tags: [],
  audio_id: "", image_url: "", source: "custom",
};

const POS_OPTIONS = ["noun","verb","adjective","adverb","pronoun","numeral","interjection","particle","phrase"];
const CATEGORY_OPTIONS = [
  "greetings_politeness","family_relationships","food_drink","home_living",
  "daily_routine","education_learning","work_profession","city_transport",
  "nature_environment","colors_appearance","numbers_math","health_body",
  "emotions_feelings","technology","shopping","adjectives_basic",
];

type SortField = "word_id" | "hy" | "en" | "ru" | "difficulty";
type SortDir = "asc" | "desc";

export default function DictionaryAdminPage() {
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("word_id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterPos, setFilterPos] = useState("");
  const [editEntry, setEditEntry] = useState<DictEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load from Supabase ──────────────────────────────────────────────────────

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dictionary_entries" as any)
      .select("*")
      .eq("is_active", true)
      .order("word_id");
    if (!error && data) setEntries(data as DictEntry[]);
    setLoading(false);
  };

  useEffect(() => { loadEntries(); }, []);

  // ── Filtered + sorted view ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter((e) =>
        (!q || e.hy.includes(q) || e.en.toLowerCase().includes(q) || e.ru.includes(q) || e.word_id.includes(q)) &&
        (!filterPos || e.part_of_speech === filterPos)
      )
      .sort((a, b) => {
        const av = String(a[sortField as keyof DictEntry] ?? "");
        const bv = String(b[sortField as keyof DictEntry] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [entries, search, sortField, sortDir, filterPos]);

  // ── Save (create or update) ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editEntry) return;
    if (!editEntry.hy || !editEntry.en || !editEntry.ru) {
      showToast("Armenian, English, Russian are required", false);
      return;
    }

    setSaving(true);
    const wordId = editEntry.word_id || `custom_${Date.now()}`;
    const payload = { ...editEntry, word_id: wordId };

    const { error } = isNew
      ? await supabase.from("dictionary_entries" as any).insert(payload)
      : await supabase.from("dictionary_entries" as any).update(payload).eq("word_id", editEntry.word_id);

    setSaving(false);
    if (error) {
      showToast(`Error: ${error.message}`, false);
    } else {
      showToast(isNew ? "Word added!" : "Word updated!");
      setEditEntry(null);
      loadEntries();
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (wordId: string) => {
    await supabase.from("dictionary_entries" as any).update({ is_active: false }).eq("word_id", wordId);
    setEntries((prev) => prev.filter((e) => e.word_id !== wordId));
    setConfirmDelete(null);
    showToast("Word deleted");
  };

  // ── Bulk delete ─────────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await supabase.from("dictionary_entries" as any).update({ is_active: false }).eq("word_id", id);
    }
    setEntries((prev) => prev.filter((e) => !selected.has(e.word_id)));
    setSelected(new Set());
    showToast(`${selected.size} entries deleted`);
  };

  // ── Duplicate ───────────────────────────────────────────────────────────────

  const handleDuplicate = (entry: DictEntry) => {
    setEditEntry({ ...entry, id: undefined, word_id: `copy_${entry.word_id}` });
    setIsNew(true);
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nurlingo_dictionary_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import JSON ─────────────────────────────────────────────────────────────

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const imported: DictEntry[] = JSON.parse(text);
      let count = 0;
      for (const entry of imported) {
        if (!entry.hy || !entry.en || !entry.ru) continue;
        await supabase.from("dictionary_entries" as any).upsert(
          { ...entry, word_id: entry.word_id || `import_${Date.now()}_${count}`, source: "imported" },
          { onConflict: "word_id" }
        );
        count++;
      }
      showToast(`Imported ${count} entries`);
      loadEntries();
    } catch {
      showToast("Invalid JSON file", false);
    }
    e.target.value = "";
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/dictionary" className="text-white/40 hover:text-white text-xl">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-black">✏️ Dictionary Editor</h1>
          <p className="text-xs text-white/30">{entries.length} entries in database</p>
        </div>
        <div className="flex gap-2">
          {/* Import */}
          <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition">
            📥 Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          {/* Export */}
          <button onClick={handleExport} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition">
            📤 Export
          </button>
          {/* Add new */}
          <button
            onClick={() => { setEditEntry({ ...BLANK }); setIsNew(true); }}
            className="px-4 py-2 bg-[#D90012] hover:bg-[#b8000f] rounded-lg text-sm font-black transition"
          >
            + Add Word
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="">All POS</option>
            {POS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-bold transition"
            >
              🗑️ Delete {selected.size} selected
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-white/40">Loading dictionary...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-3 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelected(e.target.checked ? new Set(filtered.map((f) => f.word_id)) : new Set())
                      }
                      checked={selected.size === filtered.length && filtered.length > 0}
                    />
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-white/80" onClick={() => toggleSort("word_id")}>
                    ID{sortIndicator("word_id")}
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-white/80" onClick={() => toggleSort("hy")}>
                    🇦🇲 Armenian{sortIndicator("hy")}
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-white/80" onClick={() => toggleSort("en")}>
                    🇬🇧 English{sortIndicator("en")}
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-white/80" onClick={() => toggleSort("ru")}>
                    🇷🇺 Russian{sortIndicator("ru")}
                  </th>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-white/80" onClick={() => toggleSort("difficulty")}>
                    Diff{sortIndicator("difficulty")}
                  </th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-white/30">
                      {entries.length === 0
                        ? "No custom entries yet. Click \"+ Add Word\" to get started."
                        : "No entries match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => (
                    <tr
                      key={entry.word_id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected.has(entry.word_id)}
                          onChange={(e) => {
                            const s = new Set(selected);
                            e.target.checked ? s.add(entry.word_id) : s.delete(entry.word_id);
                            setSelected(s);
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-white/40">{entry.word_id}</td>
                      <td className="px-3 py-2 font-bold text-red-300">{entry.hy}</td>
                      <td className="px-3 py-2">{entry.en}</td>
                      <td className="px-3 py-2 text-white/70">{entry.ru}</td>
                      <td className="px-3 py-2 text-white/40 text-xs">{entry.category || "—"}</td>
                      <td className="px-3 py-2">
                        <span className="text-yellow-400">{"★".repeat(entry.difficulty)}{"☆".repeat(5 - entry.difficulty)}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditEntry({ ...entry }); setIsNew(false); }}
                            className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/60 rounded text-xs transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDuplicate(entry)}
                            className="px-2 py-1 bg-green-600/30 hover:bg-green-600/60 rounded text-xs transition"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => setConfirmDelete(entry.word_id)}
                            className="px-2 py-1 bg-red-600/30 hover:bg-red-600/60 rounded text-xs transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-white/20 mt-4 text-center">
          Showing {filtered.length} of {entries.length} custom entries
        </p>
      </div>

      {/* ── Edit/Add Modal ─────────────────────────────────────────────────── */}
      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-black">{isNew ? "➕ Add Word" : "✏️ Edit Word"}</h2>
              <button onClick={() => setEditEntry(null)} className="text-white/40 hover:text-white text-2xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Word ID */}
              <div>
                <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Word ID</label>
                <input
                  value={editEntry.word_id}
                  onChange={(e) => setEditEntry({ ...editEntry, word_id: e.target.value })}
                  placeholder="e.g. custom_001 (auto-generated if blank)"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Three languages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { field: "hy" as const, label: "🇦🇲 Armenian *", color: "focus:ring-red-500" },
                  { field: "en" as const, label: "🇬🇧 English *",  color: "focus:ring-blue-500" },
                  { field: "ru" as const, label: "🇷🇺 Russian *",  color: "focus:ring-green-500" },
                ].map(({ field, label, color }) => (
                  <div key={field}>
                    <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">{label}</label>
                    <input
                      value={editEntry[field]}
                      onChange={(e) => setEditEntry({ ...editEntry, [field]: e.target.value })}
                      className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${color}`}
                    />
                  </div>
                ))}
              </div>

              {/* Category + POS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Category</label>
                  <select
                    value={editEntry.category}
                    onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— select —</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Part of Speech</label>
                  <select
                    value={editEntry.part_of_speech}
                    onChange={(e) => setEditEntry({ ...editEntry, part_of_speech: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {POS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs text-white/40 mb-2 uppercase tracking-wide">
                  Difficulty: {editEntry.difficulty}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setEditEntry({ ...editEntry, difficulty: n })}
                      className={`w-10 h-10 rounded-lg text-xl transition ${
                        n <= editEntry.difficulty ? "bg-yellow-500/30 text-yellow-400" : "bg-white/5 text-white/20"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Notes</label>
                <textarea
                  value={editEntry.notes}
                  onChange={(e) => setEditEntry({ ...editEntry, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Grammar notes, cultural context..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Tags (comma-separated)</label>
                <input
                  value={editEntry.tags.join(", ")}
                  onChange={(e) => setEditEntry({
                    ...editEntry,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="lesson_1, greeting, basic"
                />
              </div>

              {/* Audio ID + Image URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Audio ID</label>
                  <input
                    value={editEntry.audio_id}
                    onChange={(e) => setEditEntry({ ...editEntry, audio_id: e.target.value })}
                    placeholder="000001"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Image URL</label>
                  <input
                    value={editEntry.image_url}
                    onChange={(e) => setEditEntry({ ...editEntry, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#D90012] hover:bg-[#b8000f] disabled:opacity-50 rounded-xl font-black transition"
                >
                  {saving ? "Saving..." : isNew ? "➕ Add to Dictionary" : "✅ Save Changes"}
                </button>
                <button
                  onClick={() => setEditEntry(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ──────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#1a1a2e] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-xl font-bold mb-2">Delete this word?</p>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-black transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all ${
          toast.ok ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}>
          {toast.ok ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}
