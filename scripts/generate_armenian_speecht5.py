#!/usr/bin/env python3
"""
NUR Lingo Armenian TTS Generator using SpeechT5

Uses Edmon02/speecht5_finetuned_voxpopuli_hy model for Eastern Armenian TTS.
This is the recommended free solution for high-quality Eastern Armenian synthesis.

Requirements:
    pip install torch transformers datasets soundfile

Usage:
    python scripts/generate_armenian_speecht5.py
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional

try:
    import torch
    import soundfile as sf
    from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
    from datasets import load_dataset
except ImportError as e:
    print(f"Error: Required packages not installed. Run: pip install torch transformers datasets soundfile")
    print(f"Missing: {e}")
    exit(1)

# Configuration
MODEL_ID = "Edmon02/speecht5_finetuned_voxpopuli_hy"
VOCODER_ID = "microsoft/speecht5_hifigan"
SPEAKER_DATASET = "Edmon02/hyvoxpopuli"
OUTPUT_DIR = Path("public/audio/hy")
DATABASE_PATH = Path("src/lib/content/database.ts")
MANIFEST_PATH = Path("public/audio/manifest.json")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")


def extract_armenian_texts(database_path: Path) -> List[Dict[str, str]]:
    """Extract Armenian texts from database.ts file."""
    with open(database_path, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []
    seen = set()

    # Pattern 1: v("id", "hy", "en", "ru") - vocabulary
    vocab_pattern = re.compile(r'v\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*\)')
    for match in vocab_pattern.finditer(content):
        item_id, hy, en, ru = match.groups()
        if hy and hy not in seen:
            seen.add(hy)
            texts.append({"id": item_id, "hy": hy, "en": en, "ru": ru, "type": "vocab"})

    # Pattern 2: p("id", "hy", "en", "ru", ...) - phrases
    phrase_pattern = re.compile(r'p\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']')
    for match in phrase_pattern.finditer(content):
        item_id, hy, en, ru = match.groups()
        if hy and hy not in seen:
            seen.add(hy)
            texts.append({"id": item_id, "hy": hy, "en": en, "ru": ru, "type": "phrase"})

    # Pattern 3: t("speaker", "hy", "en", "ru") - dialogue turns
    turn_pattern = re.compile(r't\s*\(\s*["\'](?:nurik|user)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*\)')
    for match in turn_pattern.finditer(content):
        hy, en, ru = match.groups()
        if hy and hy not in seen:
            seen.add(hy)
            texts.append({"id": f"dialogue_{len(texts)}", "hy": hy, "en": en, "ru": ru, "type": "dialogue"})

    return texts


def load_model():
    """Load SpeechT5 model, processor, and vocoder."""
    print(f"Loading model: {MODEL_ID}")
    processor = SpeechT5Processor.from_pretrained(MODEL_ID)
    model = SpeechT5ForTextToSpeech.from_pretrained(MODEL_ID).to(device)
    vocoder = SpeechT5HifiGan.from_pretrained(VOCODER_ID).to(device)
    return processor, model, vocoder


def load_speaker_embedding():
    """Load speaker embedding for Eastern Armenian voice."""
    print(f"Loading speaker embeddings from: {SPEAKER_DATASET}")
    try:
        ds = load_dataset(SPEAKER_DATASET, split="train", trust_remote_code=True)
        # Get the first speaker embedding
        speaker_embedding = torch.tensor(ds[0]["speaker_embeddings"]).unsqueeze(0).to(device)
        print(f"Speaker embedding shape: {speaker_embedding.shape}")
        return speaker_embedding
    except Exception as e:
        print(f"Warning: Could not load speaker embeddings: {e}")
        print("Using default embedding (may affect quality)")
        # Return a random but fixed embedding
        return torch.randn(1, 512).to(device)


def generate_audio(
    text: str,
    processor: SpeechT5Processor,
    model: SpeechT5ForTextToSpeech,
    vocoder: SpeechT5HifiGan,
    speaker_embedding: torch.Tensor,
    max_length: int = 200
) -> Optional[bytes]:
    """Generate audio for the given text."""
    # Truncate long texts
    if len(text) > max_length:
        text = text[:max_length - 3] + "..."

    try:
        inputs = processor(text=text, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            speech = model.generate_speech(
                inputs["input_ids"],
                speaker_embedding,
                vocoder=vocoder
            )

        # Convert to numpy array
        audio_array = speech.cpu().numpy()
        return audio_array
    except Exception as e:
        print(f"Error generating audio for '{text[:30]}...': {e}")
        return None


def save_audio(audio_array, output_path: Path, sample_rate: int = 16000):
    """Save audio array to WAV file."""
    sf.write(str(output_path), audio_array, samplerate=sample_rate)


def main():
    parser = argparse.ArgumentParser(description="Generate Armenian TTS audio")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of texts to process")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="Skip existing files")
    parser.add_argument("--output-dir", type=str, default=str(OUTPUT_DIR), help="Output directory")
    args = parser.parse_args()

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Extract texts
    print(f"Extracting Armenian texts from: {DATABASE_PATH}")
    texts = extract_armenian_texts(DATABASE_PATH)
    print(f"Found {len(texts)} unique Armenian texts")

    if args.limit:
        texts = texts[:args.limit]
        print(f"Limited to {len(texts)} texts")

    # Load model
    processor, model, vocoder = load_model()
    speaker_embedding = load_speaker_embedding()

    # Generate audio
    manifest = {}
    success_count = 0
    skip_count = 0
    error_count = 0

    # Load existing manifest if available
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

    for i, item in enumerate(texts, 1):
        item_id = f"{i:06d}"
        output_path = output_dir / f"{item_id}.wav"

        # Skip if exists
        if args.skip_existing and output_path.exists():
            skip_count += 1
            print(f"[{i}/{len(texts)}] Skipped (exists): {item_id}")
            continue

        print(f"[{i}/{len(texts)}] Generating: {item['hy'][:40]}...")

        audio = generate_audio(
            item["hy"],
            processor,
            model,
            vocoder,
            speaker_embedding
        )

        if audio is not None:
            save_audio(audio, output_path)
            manifest[item_id] = {
                "hy": f"/audio/hy/{item_id}.wav",
                "en": f"/audio/en/{item_id}.mp3",
                "ru": f"/audio/ru/{item_id}.mp3",
                "text": {
                    "hy": item["hy"],
                    "en": item["en"],
                    "ru": item["ru"]
                },
                "type": item["type"]
            }
            success_count += 1
            print(f"  ✓ Saved: {output_path}")
        else:
            error_count += 1
            print(f"  ✗ Failed: {item_id}")

    # Save manifest
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print(f"Generation complete!")
    print(f"  Success: {success_count}")
    print(f"  Skipped: {skip_count}")
    print(f"  Errors:  {error_count}")
    print(f"  Total:   {len(texts)}")
    print(f"  Output:  {output_dir}")
    print(f"  Manifest: {MANIFEST_PATH}")
    print("=" * 50)


if __name__ == "__main__":
    main()
