#!/usr/bin/env python3
"""
NUR Lingo - Armenian Audio Generator (Python/gTTS version)

Uses gTTS (Google Text-to-Speech) which provides reliable Armenian TTS.
This is more robust than the direct HTTP approach.

Requirements:
    pip install gtts

Usage:
    python scripts/gtts_generator.py [--dry-run] [--limit N]
"""

import os
import re
import sys
import json
import time
import argparse
from pathlib import Path

try:
    from gtts import gTTS
    from gtts.lang import tts_langs
except ImportError:
    print("ERROR: gTTS not installed. Run: pip install gtts")
    sys.exit(1)

# Configuration
DATABASE_PATH = Path(__file__).parent.parent / "src/lib/content/database.ts"
AUDIO_DIR = {
    "hy": Path(__file__).parent.parent / "public/audio/hy",
    "en": Path(__file__).parent.parent / "public/audio/en",
    "ru": Path(__file__).parent.parent / "public/audio/ru",
}
MANIFEST_PATH = Path(__file__).parent.parent / "public/audio/manifest.json"
MAX_TEXT_LENGTH = 200
REQUEST_DELAY = 0.3  # seconds

# Ensure directories exist
for lang_dir in AUDIO_DIR.values():
    lang_dir.mkdir(parents=True, exist_ok=True)


def extract_texts_from_database():
    """Extract all trilingual texts from database.ts"""
    content = open(DATABASE_PATH, encoding='utf-8').read()
    texts = {}
    next_id = 1

    def format_id():
        return f"{next_id:06d}"

    # Pattern 1: v("id", "hy", "en", "ru") - vocabulary
    vocab_pattern = r'v\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*\)'
    for match in re.finditer(vocab_pattern, content):
        id_ = format_id()
        texts[id_] = {
            "type": "vocab",
            "orig_id": match.group(1),
            "hy": match.group(2),
            "en": match.group(3),
            "ru": match.group(4)
        }
        next_id += 1

    # Pattern 2: p("id", "hy", "en", "ru", ...) - phrases
    phrase_pattern = r'p\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']'
    for match in re.finditer(phrase_pattern, content):
        id_ = format_id()
        texts[id_] = {
            "type": "phrase",
            "orig_id": match.group(1),
            "hy": match.group(2),
            "en": match.group(3),
            "ru": match.group(4)
        }
        next_id += 1

    # Pattern 3: t("speaker", "hy", "en", "ru") - dialogue turns
    turn_pattern = r't\s*\(\s*["\'](?:nurik|user)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*\)'
    for match in re.finditer(turn_pattern, content):
        id_ = format_id()
        texts[id_] = {
            "type": "dialogue",
            "hy": match.group(1),
            "en": match.group(2),
            "ru": match.group(3)
        }
        next_id += 1

    # Pattern 4: World/lesson titles and descriptions
    trilingual_pattern = r'\{\s*en:\s*["\']([^"\']+)["\']\s*,\s*hy:\s*["\']([^"\']+)["\']\s*,\s*ru:\s*["\']([^"\']+)["\']\s*\}'
    for match in re.finditer(trilingual_pattern, content):
        id_ = format_id()
        texts[id_] = {
            "type": "trilingual",
            "en": match.group(1),
            "hy": match.group(2),
            "ru": match.group(3)
        }
        next_id += 1

    return texts


def generate_tts(text, lang, output_path, dry_run=False):
    """Generate TTS audio using gTTS"""
    if dry_run:
        return True

    try:
        # Truncate long texts
        if len(text) > MAX_TEXT_LENGTH:
            text = text[:MAX_TEXT_LENGTH] + "..."

        # Map language codes to gTTS codes
        lang_map = {
            "hy": "hy",  # Armenian
            "en": "en",  # English
            "ru": "ru",  # Russian
        }

        tts = gTTS(text=text, lang=lang_map.get(lang, lang), slow=False)
        tts.save(str(output_path))

        # Verify file was created
        if output_path.exists() and output_path.stat().st_size > 500:
            return True
        else:
            if output_path.exists():
                output_path.unlink()
            return False

    except Exception as e:
        print(f"    Error: {e}")
        if output_path.exists():
            output_path.unlink()
        return False


def load_manifest():
    """Load existing manifest"""
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text())
        except:
            return {}
    return {}


def save_manifest(manifest):
    """Save manifest with sorted keys"""
    sorted_manifest = dict(sorted(manifest.items(), key=lambda x: int(x[0])))
    MANIFEST_PATH.write_text(json.dumps(sorted_manifest, indent=2) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Generate Armenian audio for NUR Lingo")
    parser.add_argument("--dry-run", action="store_true", help="Extract texts but don't generate audio")
    parser.add_argument("--limit", type=int, help="Only process first N texts")
    parser.add_argument("--lang", choices=["hy", "en", "ru", "all"], default="all", help="Language to generate")
    args = parser.parse_args()

    print("\n🍎 NUR Lingo - Armenian Audio Generator (gTTS)")
    print("=" * 50)

    if args.dry_run:
        print("⚠️  DRY RUN MODE - No audio will be generated\n")

    # Extract texts
    print("\n📖 Extracting texts from database.ts...")
    texts = extract_texts_from_database()
    print(f"   Found {len(texts)} unique entries")

    if args.limit:
        texts = dict(list(texts.items())[:args.limit])
        print(f"   Processing {len(texts)} (limited)")

    # Load existing manifest
    manifest = load_manifest()

    # Generate audio
    stats = {"hy": 0, "en": 0, "ru": 0}
    failed = []
    langs_to_process = ["hy", "en", "ru"] if args.lang == "all" else [args.lang]

    print(f"\n🔊 Generating audio...")
    for idx, (id_, data) in enumerate(texts.items(), 1):
        manifest[id_] = manifest.get(id_, {})

        for lang in langs_to_process:
            text = data.get(lang)
            if not text:
                continue

            output_path = AUDIO_DIR[lang] / f"{id_}.mp3"

            # Skip if exists
            if output_path.exists() and output_path.stat().st_size > 500:
                manifest[id_][lang] = f"/audio/{lang}/{id_}.mp3"
                stats[lang] += 1
                continue

            ok = generate_tts(text, lang, output_path, args.dry_run)

            if ok:
                manifest[id_][lang] = f"/audio/{lang}/{id_}.mp3"
                stats[lang] += 1
                print(f"  ✅ {id_}.{lang}: {text[:40]}...")
            else:
                failed.append((id_, lang, text[:50]))
                print(f"  ❌ {id_}.{lang}: FAILED")

            if not args.dry_run:
                time.sleep(REQUEST_DELAY)

        # Progress
        if idx % 20 == 0:
            print(f"\n🔄 Progress: {idx}/{len(texts)}")
            print(f"   hy: {stats['hy']}, en: {stats['en']}, ru: {stats['ru']}\n")

    # Save manifest
    if not args.dry_run:
        save_manifest(manifest)
        print(f"\n📝 Updated manifest ({len(manifest)} entries)")

    # Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"Armenian (hy): {stats['hy']} generated")
    print(f"English (en):  {stats['en']} generated")
    print(f"Russian (ru):  {stats['ru']} generated")

    if failed:
        print(f"\n⚠️  {len(failed)} failures:")
        for id_, lang, text in failed[:10]:
            print(f"   {id_}.{lang}: {text}...")
        if len(failed) > 10:
            print(f"   ... and {len(failed) - 10} more")


if __name__ == "__main__":
    main()
