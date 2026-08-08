import os
import re
from gtts import gTTS
import time

# ─── Ճիշտ ուղի հաշվարկել ──────────────────────────────────────────
# Սկրիպտի գտնվելու վայրը
script_dir = os.path.dirname(os.path.abspath(__file__))
# Նախագծի արմատային պանակը (մեկ մակարդակ վեր)
project_root = os.path.dirname(script_dir)

db_path = os.path.join(project_root, 'src', 'lib', 'content', 'database.ts')
audio_dir = os.path.join(project_root, 'public', 'audio', 'hy')

# ─── Ստուգել, արդյոք database.ts-ը գոյություն ունի ──────────────
if not os.path.exists(db_path):
    print(f"❌ database.ts չի գտնվել: {db_path}")
    print("📋 Համոզվեք, որ գտնվում եք նախագծի արմատային պանակում:")
    exit(1)

print(f"📁 database.ts գտնվել է: {db_path}")

os.makedirs(audio_dir, exist_ok=True)

# ─── Կարդալ database.ts-ը ──────────────────────────────────────────
with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── Գտնել բոլոր vocabulary ID-ները ──────────────────────────────
pattern = r"v\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]"
items = re.findall(pattern, content)

print(f"📊 Գտնվել է {len(items)} բառ")

# ─── Ստուգել բացակայող ֆայլերը ──────────────────────────────────
needed = []
for id_val, hy_text in items:
    file_path = os.path.join(audio_dir, f"{id_val}.mp3")
    if not os.path.exists(file_path) or os.path.getsize(file_path) < 1000:
        needed.append((id_val, hy_text))

print(f"✅ Արդեն կա լավ ֆայլ: {len(items) - len(needed)}")
print(f"❌ Պետք է ներբեռնել: {len(needed)}")

if not needed:
    print("🎉 Բոլոր աուդիոֆայլերն արդեն կան:")
    exit(0)

# ─── Ներբեռնել gTTS-ով ────────────────────────────────────────────
print("📥 Սկսում ենք gTTS-ով ներբեռնում...")
count = 0
success = 0
for id_val, hy_text in needed:
    file_path = os.path.join(audio_dir, f"{id_val}.mp3")
    try:
        tts = gTTS(text=hy_text, lang='hy', slow=False)
        tts.save(file_path)
        if os.path.getsize(file_path) > 1000:
            print(f"✅ {id_val} ({hy_text}) – ներբեռնված")
            success += 1
        else:
            print(f"⚠️ {id_val} – չափը փոքր է, ջնջվում է")
            os.remove(file_path)
    except Exception as e:
        print(f"❌ {id_val} – սխալ: {e}")
    count += 1
    if count % 10 == 0:
        print(f"📊 Առաջընթաց: {count}/{len(needed)} ( {success} հաջող)")
    time.sleep(0.3)  # կարճ դադար

print(f"📊 Ընդհանուր հաջող: {success}/{len(needed)}")

# ─── Վերջնական ստուգում ──────────────────────────────────────────
final_missing = []
for id_val, hy_text in items:
    file_path = os.path.join(audio_dir, f"{id_val}.mp3")
    if not os.path.exists(file_path) or os.path.getsize(file_path) < 1000:
        final_missing.append((id_val, hy_text))

if not final_missing:
    print(f"🎉 Բոլոր {len(items)} աուդիոֆայլերը հաջողությամբ ստեղծվել են:")
else:
    print(f"⚠️ Մնացել է {len(final_missing)} ֆայլ, որոնք չհաջողվեց ստեղծել:")
    for id_val, hy_text in final_missing[:20]:
        print(f"  - {id_val} ({hy_text})")
    if len(final_missing) > 20:
        print(f"  ... և ևս {len(final_missing) - 20} ֆայլ")