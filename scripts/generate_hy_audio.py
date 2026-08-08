"""
NUR Lingo — Armenian Audio Generator
=====================================
Facebook MMS TTS (facebook/mms-tts-hyw) — Western Armenian
Generates MP3 files for all words in master-dictionary.json

SETUP:
    pip install transformers torch soundfile pydub

    For MP3 export also need ffmpeg:
    Windows:  choco install ffmpeg   OR  winget install ffmpeg
    Ubuntu:   sudo apt install ffmpeg

USAGE:
    python scripts/generate_hy_audio.py --dict data/dictionaries/master-dictionary.json
                                        --out  public/audio/hy
                                        --lang hy
                                        --skip-existing
"""

import argparse
import json
import sys
import os
from pathlib import Path

# ── Argument parsing ──────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo HY Audio Generator")
parser.add_argument("--dict",         default="data/dictionaries/master-dictionary.json")
parser.add_argument("--out",          default="public/audio/hy")
parser.add_argument("--lang",         default="hy",   help="Language key in dictionary (hy/en/ru)")
parser.add_argument("--model",        default="facebook/mms-tts-hyw",
                    help="HuggingFace model: hyw=Western Armenian, hye=Eastern Armenian")
parser.add_argument("--format",       default="mp3",  choices=["mp3", "wav"])
parser.add_argument("--skip-existing",action="store_true", help="Skip already generated files")
parser.add_argument("--dry-run",      action="store_true", help="Print words only, no generation")
parser.add_argument("--limit",        type=int, default=0, help="Generate only first N (for testing)")
parser.add_argument("--device",       default="auto", choices=["auto", "cuda", "cpu"],
                    help="Force device selection")
args = parser.parse_args()

# ── Imports (after argparse so --help works without torch) ────────────────────
print("⏳ Loading libraries...")
import torch
import soundfile as sf

try:
    from transformers import VitsModel, AutoTokenizer
except ImportError:
    print("❌ transformers not installed. Run: pip install transformers torch")
    sys.exit(1)

try:
    from pydub import AudioSegment
    HAS_PYDUB = True
except ImportError:
    HAS_PYDUB = False
    if args.format == "mp3":
        print("⚠️  pydub not found — saving as WAV instead. Install pydub+ffmpeg for MP3.")
        args.format = "wav"

# ── Load dictionary ───────────────────────────────────────────────────────────
dict_path = Path(args.dict)
if not dict_path.exists():
    print(f"❌ Dictionary not found: {dict_path}")
    sys.exit(1)

with open(dict_path, encoding="utf-8") as f:
    entries = json.load(f)

# Handle both object and array formats
if isinstance(entries, dict):
    entries = list(entries.values())

print(f"📚 Dictionary loaded: {len(entries)} entries")

# ── Output dir ────────────────────────────────────────────────────────────────
out_dir = Path(args.out)
out_dir.mkdir(parents=True, exist_ok=True)

# ── Load MMS model ────────────────────────────────────────────────────────────
if not args.dry_run:
    print(f"⏳ Loading model: {args.model}")
    print("   (First run downloads ~500MB — may take a few minutes)")

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = VitsModel.from_pretrained(args.model)

    if args.device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    else:
        device = args.device

    model.to(device)
    model.eval()
    print(f"✅ Model loaded on {device.upper()}")
    SAMPLE_RATE = model.config.sampling_rate
    print(f"   Sample rate: {SAMPLE_RATE} Hz")

# ── Helpers ───────────────────────────────────────────────────────────────────
def audio_id_from_entry(entry: dict) -> str | None:
    """Extract zero-padded ID from audio path or id field."""
    # Try direct id field first
    if "id" in entry:
        return str(entry["id"]).zfill(6)

    # Try audio_id field
    if "audio_id" in entry:
        return str(entry["audio_id"]).zfill(6)

    # Extract from audio path
    audio = entry.get("audio", {})
    for lang_key in ("hy", "en", "ru"):
        path = audio.get(lang_key, "")
        if path:
            stem = Path(path).stem
            if stem.isdigit():
                return stem.zfill(6)
    return None

def clean_text(text: str) -> str:
    """
    MMS chokes on special chars, slashes, parentheses.
    Keep only Armenian letters + spaces + basic punctuation.
    """
    import re
    # Remove content in parens (grammatical notes)
    text = re.sub(r'\(.*?\)', '', text)
    # Replace slashes / dashes with space
    text = re.sub(r'[/\-–—]', ' ', text)
    # Keep Armenian Unicode block (U+0531–U+058F), spaces, basic punct
    text = re.sub(r'[^\u0531-\u058F\s,.]', '', text)
    return text.strip()

def generate_wav(text: str):
    inputs = tokenizer(text, return_tensors="pt").to(device)
    with torch.no_grad():
        waveform = model(**inputs).waveform
    return waveform.squeeze().cpu().numpy()

def save_audio(waveform, path: Path, sample_rate: int, fmt: str):
    if fmt == "wav" or not HAS_PYDUB:
        sf.write(str(path.with_suffix(".wav")), waveform, sample_rate)
    else:
        # WAV → MP3 via pydub
        tmp_wav = path.with_suffix(".wav")
        sf.write(str(tmp_wav), waveform, sample_rate)
        audio = AudioSegment.from_wav(str(tmp_wav))
        audio.export(str(path.with_suffix(".mp3")), format="mp3", bitrate="128k")
        tmp_wav.unlink()

# ── Main loop ─────────────────────────────────────────────────────────────────
ok = skip = fail = 0
limit = args.limit or len(entries)

print(f"\n🚀 Starting generation ({min(limit, len(entries))} words)...\n")

for i, entry in enumerate(entries[:limit]):
    audio_id = audio_id_from_entry(entry)
    hy_text = entry.get(args.lang, "").strip()

    # Try alternative text fields
    if not hy_text:
        hy_text = entry.get("hy", "").strip()
    if not hy_text:
        hy_text = entry.get("word", {}).get("hy", "").strip() if isinstance(entry.get("word"), dict) else ""

    if not audio_id or not hy_text:
        print(f"  [{i+1:04d}] ⚠️  Skipped — missing id or text")
        fail += 1
        continue

    out_path = out_dir / f"{audio_id}.{args.format}"

    if args.skip_existing and out_path.exists() and out_path.stat().st_size > 500:
        print(f"  [{audio_id}] ⏭  Already exists: {hy_text[:30]}")
        skip += 1
        continue

    clean = clean_text(hy_text)
    if not clean:
        print(f"  [{audio_id}] ⚠️  Text empty after cleaning: '{hy_text}'")
        fail += 1
        continue

    if args.dry_run:
        print(f"  [{audio_id}] DRY  '{hy_text}' → '{clean}'")
        ok += 1
        continue

    try:
        waveform = generate_wav(clean)
        save_audio(waveform, out_path, SAMPLE_RATE, args.format)
        size_kb = out_path.stat().st_size // 1024
        print(f"  [{audio_id}] ✅  '{hy_text[:25]:<25}' → {size_kb}KB")
        ok += 1
    except Exception as e:
        print(f"  [{audio_id}] ❌  Error: {e}")
        fail += 1

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
{'='*50}
📊 DONE
   ✅ Generated : {ok}
   ⏭  Skipped   : {skip}
   ❌ Failed    : {fail}
   📁 Output    : {out_dir.resolve()}
{'='*50}
""")

# ── Update manifest ──────────────────────────────────────────────────────────
manifest_path = Path("public/audio/manifest.json")
if not args.dry_run:
    # Load or create manifest
    if manifest_path.exists():
        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = {}

    updated = 0
    ext = args.format
    for entry in entries:
        aid = audio_id_from_entry(entry)
        if not aid:
            continue
        generated_path = out_dir / f"{aid}.{ext}"
        if generated_path.exists() and generated_path.stat().st_size > 500:
            if aid not in manifest:
                manifest[aid] = {}
            manifest[aid]["hy"] = f"/audio/hy/{aid}.{ext}"
            manifest[aid]["text"] = entry.get(args.lang, entry.get("hy", ""))
            updated += 1

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"📄 Manifest updated: {updated} entries → {manifest_path}")
