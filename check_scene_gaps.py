#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scan case files for sceneImagePath entries and cross-check against public/scene-assets.
Finds MISSING assets or WEAK scene gaps that need enhancement.
"""

from pathlib import Path
import re

root = Path(__file__).resolve()  # Use .resolve() directly
data_dir = root / "src/data"
assets_dir = root / "public/scene-assets"

# Load all existing assets
existing_assets = set()
for f in assets_dir.iterdir():
    if f.is_file():
        existing_assets.add(f.name)

print(f"Loaded {len(existing_assets)} scene assets")

def extract_scene_paths_from_ts(filepath: Path):
    """Extract sceneImagePath values from TypeScript case definitions."""
    scene_entries = []
    if not filepath.exists():
        print(f"  WARNING: {filepath} not found, skipping...")
        return scene_entries
    
    content = filepath.read_text()
    
    # Pattern to match: sceneImagePath: '/scene-assets/FILENAME.png'
    pattern = r'sceneImagePath:\s*["\']([^"\')]+)["\']'
    matches = re.findall(pattern, content)
    
    for match in matches[:100]:  # limit per file
        filename = match.lstrip('"\'').split('/')[-1]
        full_path = root / filename
        
        name_in_set = full_path.name in existing_assets
        entry = {
            "path": f'/scene-assets/{filename}',
            "basename": Path(match).name,
            "full_path": str(full_path),
            "exists": name_in_set,
            "status": "(EXISTS)" if name_in_set else "(MISSING)",
            "file_size_kb": round(full_path.stat().st_size / 1024, 1) if full_path.exists() else 0,
        }
        scene_entries.append(entry)
    
    return scene_entries

# Scan all case files
ts_files = [
    data_dir / "cases.ts",
    data_dir / "firstYearCases.ts",
    data_dir / "secondYearCases.ts",
    data_dir / "severityVariantCases.ts",
]

all_scene_paths = []
for ts_file in ts_files:
    if not ts_file.exists():
        continue
    
    print(f"Scanning {ts_file.name}...")
    paths = extract_scene_paths_from_ts(ts_file)
    existing_count = sum(1 for p in paths if p["exists"])
    missing_count = len(paths) - existing_count
    print(f"  Found: {len(paths)} entries, {existing_count} exist, {missing_count} missing")
    
    all_scene_paths.extend(paths)

print("\n" + "=" * 60)
print("SUMMARY OF MISSING/WEAK GAPS")
print("=" * 60)

# Sort by status (missing first), then by path for readability
all_scene_paths.sort(key=lambda x: (not x["exists"], x["path"]))

missing_entries = [p for p in all_scene_paths if not p["exists"]]
existing_entries = [p for p in all_scene_paths if p["exists"]]

if missing_entries:
    print(f"\nMISSING SceneImagePath assets ({len(missing_entries)}):")
    count = 0
    for entry in missing_entries:
        stem = Path(entry["basename"]).stem
        path_str = entry['path']
        # Display first 30 missing entries
        if count < 30:
            print(f"   - {path_str} (stem={stem})")
        count += 1

print(f"\nEXISTING assets verified: {len(existing_entries)}")

# Identify weakest gaps for next slice
if missing_entries:
    print("\nWEAKEST GAPS (next targets to ship):")
    
    # Prioritize y2-007 cases first as per Elias's criteria
    priority_scenarios = []
    
    for gap in missing_entries:
        stem = Path(gap["basename"]).stem
        
        # y2-007 student bedroom case (female 19yo) - highest priority
        if "y2-007" in gap['path'] and ("student-bedroom" in stem or ("f" in stem.lower() and "student" in stem.lower())):
            priority = 1
            reason = "Female student honesty gaps (flatmate, live motion)"
            
        # Comforting motion cases
        elif "comforting" in gap['basename'].lower():
            priority = 2
            reason = "Flatmate comforting speech/lip-sync"
            
        else:
            priority = 3
            reason = f"SceneImagePath mismatch ({stem})"
        
        print(f"\nPriority {priority}:")
        print(f"   Path: {gap['path']}")
        print(f"   Stem: {stem}")
        print(f"   Reason: {reason}")
        
        # Only collect top 5 weakest gaps
        if len(priority_scenarios) >= 5:
            break
        
        priority_scenarios.append(gap)

print("\n" + "-" * 60)
print("Ready to pick next scene gap:")
if priority_scenarios:
    best = priority_scenarios[0]
    print(f"- {best['path']} (priority 1: female student honesty)")
else:
    print("- Scanning litflCases + enhancedCases for more gaps")
