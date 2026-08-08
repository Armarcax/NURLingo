#!/usr/bin/env python3
"""
MVP Scanner - Դնել հենց պրոեկտի պանակում և աշխատեցնել
Օգտագործում: python scan.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime

def scan_current_directory():
    """Սկանի ընթացիկ պանակը (որտեղ գտնվում է սկրիպտը)"""
    
    # Ստանալ սկրիպտի գտնվելու վայրը
    script_dir = Path(__file__).parent.resolve()
    
    lines = []
    lines.append("=" * 80)
    lines.append("📁 ՄՎՊ ԿԱՌՈՒՑՎԱԾՔԻ ՔԱՐՏԵԶ")
    lines.append(f"🗂️  Պրոեկտ: {script_dir}")
    lines.append(f"📅 Սկանավորված: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("=" * 80)
    lines.append("")
    
    total_files = 0
    total_dirs = 0
    file_list = []  # Մանրամասն ցուցակ
    
    # Բաց թողնելու ցուցակ
    SKIP_DIRS = {'__pycache__', '.git', 'venv', '.venv', 'node_modules', 
                 '.idea', '.vscode', 'dist', 'build', '.pytest_cache'}
    SKIP_FILES = {'.pyc', '.log', '.tmp', '.swp', '.swo', '.DS_Store'}
    SKIP_NAMES = {'scan.py', 'mvp_structure.txt'}  # Սկրիպտն ու արտադրանքը
    
    for root, dirs, files in os.walk(script_dir):
        # Ֆիլտրել պանակները
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        
        rel_path = Path(root).relative_to(script_dir)
        level = len(rel_path.parts)
        indent = "    " * level
        
        # Պանակի անուն
        if level == 0:
            lines.append(f"📂 {script_dir.name}/ (ROOT)")
        else:
            lines.append(f"{indent}📂 {os.path.basename(root)}/")
        total_dirs += 1
        
        # Ֆայլերը
        for file in sorted(files):
            # Բաց թողնել անցանկալի ֆայլերը
            if (any(file.endswith(ext) for ext in SKIP_FILES) or 
                file in SKIP_NAMES or 
                file.startswith('.')):
                continue
            
            file_path = Path(root) / file
            file_indent = "    " * (level + 1)
            
            # Չափ և extension
            size = file_path.stat().st_size
            if size < 1024:
                size_str = f"{size} B"
            elif size < 1024 * 1024:
                size_str = f"{size/1024:.1f} KB"
            else:
                size_str = f"{size/(1024*1024):.1f} MB"
            
            ext = file_path.suffix or 'no_ext'
            
            lines.append(f"{file_indent}📄 {file} [{ext}] ({size_str})")
            total_files += 1
            
            # Պահպանել մանրամասն ցուցակում
            rel_file = str(rel_path / file) if str(rel_path) != '.' else file
            file_list.append(f"{rel_file} ({size_str})")
    
    # Ամփոփում
    lines.append("")
    lines.append("=" * 80)
    lines.append("📊 ՍՏԱՏԻՍՏԻԿԱ")
    lines.append("=" * 80)
    lines.append(f"📁 Պանակներ: {total_dirs}")
    lines.append(f"📄 Ֆայլեր: {total_files}")
    lines.append(f"📍 Ճանապարհ: {script_dir}")
    lines.append("")
    
    # Ֆայլերի ցուցակ (պարզ)
    lines.append("=" * 80)
    lines.append("📋 ՖԱՅԼԵՐԻ ՑՈՒՑԱԿ (հարաբերական ճանապարհներ)")
    lines.append("=" * 80)
    for f in file_list:
        lines.append(f"  • {f}")
    
    lines.append("")
    lines.append("=" * 80)
    lines.append("✅ Սկանավորում ավարտված")
    lines.append("=" * 80)
    
    # Արտահանել
    output_file = script_dir / "mvp_structure.txt"
    content = '\n'.join(lines)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Տպել էկրանին
    print(content)
    print(f"\n💾 Արտահանված: {output_file}")
    
    return output_file

if __name__ == "__main__":
    try:
        output = scan_current_directory()
        print(f"\n🎉 Պատրաստ է! Ֆայլը պահպանվել է: {output}")
    except Exception as e:
        print(f"❌ Սխալ: {e}")
        sys.exit(1)