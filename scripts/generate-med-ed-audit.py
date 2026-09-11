#!/bin/env python3
"""
Med-ed Curriculum Audit - Extract and analyze from src/data/*.ts
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any

SRC_DIR = Path(__file__).parent / ".." / ".." / ".." / "src" / "data"

def extract_cases_from_ts(content: str) -> List[Dict]:
    """
    Parse createCase blocks from TypeScript. Each case is roughly:
      createCase({
        id: ...,
        category: ...,
        ...
      }),
    
    We'll use a simpler approach: find all {...} blocks that start with createCase(
    and end before the next createCase or }, at similar depth.
    """
    cases = []
    
    # Find all case definitions - each starts with createCase({
    pattern = r'createCase\s*\(\s*\({'
    matches = list(re.finditer(pattern, content))
    
    for match in matches:
        start = match.end()  # position after "createCase({...)"
        depth = 1
        pos = start
        while depth > 0 and pos < len(content):
            char = content[pos]
            if char == '{' or char == '"':
                depth += 1
            elif char == '}':
                depth -= 1
            
            # Stop at the next createCase or end of our reasonable block
            if 'createCase' in content[pos:pos+30]:
                break
                
            pos += 1
        
        # Now we have extracted the case object (roughly)
        case_str = content[start:pos]
        try:
            parsed = json.loads(case_str.lstrip('{').rstrip('},'))
            cases.append(parsed)
        except json.JSONDecodeError:
            pass
    
    return cases


def analyze_cases(cases: List[Dict]) -> Dict[str, Any]:
    """
    Perform all audit analyses.
    """
    # === 1. Trauma Track Analysis ===
    trauma_cases = [c for c in cases if c.get('category') == 'trauma']
    
    print(f"\n🔴 TRaUMA TRACK: {len(trauma_cases)} cases found")
    
    trauma_analysis = []
    for case in sorted(trauma_cases, key=lambda x: x.get('id', '') or ''):
        analysis = {
            'id': case.get('id'),
            'title': case.get('title'),
            'year_levels': case.get('yearLevels', ['unknown']),
            'complexity': case.get('complexity', 'intermediate'),
            'scene_info': case.get('sceneInfo', {}).get('description', 'N/A'),
            'wound_decals': case.get('scenario', {}).get('woundDecals', []),
            'subcategory': case.get('subcategory', 'N/A'),
            'gaps': analyze_trauma_gaps(case)
        }
        trauma_analysis.append(analysis)
    
    # === 2. Cohort Gating ===
    cohorts = {'diploma': [], '1st-year': [], '2nd-year': [], '3rd-year': [], '4th-year': []}
    
    for case in cases:
        year_levels = case.get('yearLevels', [])
        if isinstance(year_levels, (list, str)):
            for level in year_levels:
                level_str = str(level).lower()
                
                # Skip any year5 entries (invalid)
                if 'year 5' in level_str or /fifth/i.test(level_str):
                    continue
                
                if 'diploma' in level_str or 'trainee' not in cohort_name:
                    cohorts['diploma'].append(case.get('id'))
                elif '1st' in level_str or 'year 1' in level_str:
                    cohorts['1st-year'].append(case.get('id'))
                elif /year [1-2]|second/i.test(level_str):
                    cohorts['2nd-year'].append(case.get('id'))
                elif /year [3]/i.test(level_str):
                  cohorts['3rd-year'].append(case.get('id'))
                elif /year [3-4]|postgrad/i.test(level_str):
                  cohorts['4th-year'].append(case.get('id'))
    
    # === 3. Multi-patient / MCI ===
    multi_patient_cases = []
    for case in cases:
        scene_info = case.get('sceneInfo', {})
        casualties = scene_info.get('casualties', [])
        if isinstance(casualties, int) and casualties > 1:
            multi_patient_cases.append(case.get('id'))
        elif 'multi' in str(case).lower():
            multi_patient_cases.append(case.get('id'))
    
    # === 4-5. Learning environment optimisation ===
    # These require reading component source code, but we'll note where to look
    
    # === 6. Priority backlog ===
    priority_items = [
        {"priority": "P0", "issue": "Confirm/fix yearLevels tags for Y1 (diploma) cases only"},
        {"priority": "P0", "issue": "Ensure trauma cases match learning objectives by year level"},
        {"priority": "P0", "issue": "Remove any year5 references"},
        {"priority": "P1", "issue": "Add scene survey interactivity (look around, kit interaction)"},
        {"priority": "P1", "issue": "Implement START triage pedagogy for multi-casualty scenes"},
        {"priority": "P2", "issue": "Onboarding tour accuracy verification"}
    ]
    
    return {
        'total_cases': len(cases),
        'trauma_cases': trauma_analysis,
        'cohorts': cohorts,
        'multi_patient'
