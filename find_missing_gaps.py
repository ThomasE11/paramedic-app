#!/usr/bin/env python3
from pathlib import Path
import re

# Fixed paths  
ROOT = Path('/Users/eliastlcthomas/Projects/app')
data_dir = ROOT / "src/data"
assets_dir = ROOT / "public/scene-assets"

# Load all existing assets
existing_assets = set()
for f in assets_dir.iterdir():
    if f.is_file():
        existing_assets.add(f.name)

print(f"Loaded {len(existing_assets)} scene assets\n")

# Scan 4 case source files
ts_files = [
    data_dir / "cases.ts",
    data_dir / "firstYearCases.ts", 
    data_dir / "secondYearCases.ts",
    data_dir / "severityVariantCases.ts",
]

total_entries = 0
missing_count = 0
existing_in_use = 0

for ts_file in ts_files:
    if not ts_file.exists():
        continue
    
    print(f"📄 {ts_file.name}:")
    content = ts_file.read_text()
    
    pattern = r'sceneImagePath:\s*["\'](/scene-assets/[^"\')]+)["\']'
    matches = re.findall(pattern, content)
    
    file_missing = 0
    for match in matches:
        total_entries += 1
        filename = Path(match).name
        full_path = ROOT / filename
        
        if full_path.name not in existing_assets:
            missing_count += 1
            file_missing += 1
        else:
            existing_in_use += 1
            
    num_matches = len(matches)
    file_missing_total = sum(1 for m in matches if (ROOT / Path(m).name).name not in existing_assets)
    
    print(f"   ├─ total sceneImagePath refs: {num_matches}")
    print(f"   └─ missing assets in this file: {file_missing_total}/{num_matches}")

print("\n" + "=" * 60)
print("OVERALL MISSING ASSETS COUNT:", missing_count)  
print("=" * 60)

# Show the first few MISSING entries for next target priority
if missing_count > 0:
    print("\n🔴 FIRST FEW MISSING TARGETS:")
    
    # Re-scan in detail to get filenames 
    targets = []
    for ts_file in ts_files:
        if not ts_file.exists():
            continue  
        content = ts_file.read_text()
        pattern = r'sceneImagePath:\s*["\'](/scene-assets/[^"'\')]+)["\']'
        matches = re.findall(pattern, content)
        
        for match in matches:
            filename = Path(match).name
            full_path = ROOT / filename
            
            if full_path.name not in existing_assets:
                targets.append({
                    "basename": str(full_path),
                    "stem": Path(filename).stem,
                    "path": match
                })
    
    # Sort and show first 5 missing
    targets.sort(key=lambda x: x["stem"])  # group by stem for now
    
    print("\nPriority list (next targets):")
    for i, t in enumerate(targets[:8], 1):  
        print(f" {i}. {t['basename']} (stem: {t['stem']})")
