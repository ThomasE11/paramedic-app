#!/usr/bin/env python3
"""Read-only summary of AUDITS/_med-ed-extract.json for the med-ed audit."""
import json
from pathlib import Path

p = Path("/Users/eliastlcthomas/Projects/app/AUDITS/_med-ed-extract.json")
data = json.loads(p.read_text())

print("=== TOP LEVEL KEYS ===")
print(list(data.keys()))
print()
print("totalCases", data["totalCases"])
print("traumaCount", data["traumaCount"])
print("burnsCount", data["burnsCount"])
print("byCategory", json.dumps(data["byCategory"], indent=2))
print("byYearTag", json.dumps(data["byYearTag"], indent=2))
print("unknownYear", data["unknownYear"])
print("invalidYear", data["invalidYear"])
print("cohortExact", data["cohortExactCounts"])
print("cohortProgressive", data["cohortProgressiveCounts"])
print("year3Count", data["year3Count"])
print("year4Count", data["year4Count"])
print("year1Only", len(data["year1OnlyIds"]))
print("year2Only", len(data["year2OnlyIds"]))
print("diplomaTagged", len(data["diplomaTagged"]))
print("tooHardForY1", len(data["tooHardForY1"]))
print("diplomaOnly", len(data["diplomaOnly"]))
print("basicButNotY1", len(data["basicButNotY1"]))
print("categoryByYearExact", json.dumps(data["categoryByYearExact"], indent=2))
print()
print("=== TRAUMA CASES ===")
for t in data["trauma"]:
    print(json.dumps({
        "id": t["id"],
        "title": t["title"],
        "subcategory": t["subcategory"],
        "yearLevels": t["yearLevels"],
        "complexity": t["complexity"],
        "priority": t["priority"],
        "duration": t["estimatedDuration"],
        "source": t["sourceGuess"],
        "location": t["location"],
        "callReason": t["callReason"],
        "position": t["position"],
        "consciousness": t["consciousness"],
        "woundCount": t["woundCount"],
        "woundIds": t["woundIds"],
        "sceneImage": bool(t["sceneImagePath"]),
        "sceneImagePath": t["sceneImagePath"],
        "environment": t["environment"],
        "hazards": t["hazards"],
        "extrication": t["extricationNeeded"],
        "checklist": t["checklistCount"],
        "interventions": t["interventionCount"],
        "abcdeItems": t["abcdeChecklistCount"],
        "teaching": t["teachingPointCount"],
        "pitfalls": t["pitfallCount"],
        "equipmentNeeded": t["equipmentNeededCount"],
        "hasMci": t["hasMci"],
        "dx": t["mostLikelyDiagnosis"],
        "gcs": t["abcdeGcs"],
        "avpu": t["abcdeAvpu"],
        "hr": t["abcdeHr"],
        "bp": t["abcdeBp"],
        "rr": t["abcdeRr"],
        "spo2": t["abcdeSpo2"],
        "airwayPatent": t["abcdeAirwayPatent"],
        "immediate": t["managementImmediate"],
        "keyObs": t["keyObservations"],
        "redFlags": t["redFlags"],
        "hasSecondary": t["hasSecondarySurvey"],
        "hasHistory": t["hasHistory"],
        "hasUae": t["hasUaeProtocols"],
        "impression": (t["generalImpression"] or "")[:180],
    }, indent=2))
    print("---")

print("=== BURNS ===")
for t in data["burns"]:
    keys = ["id","title","yearLevels","complexity","priority","position","woundCount","sceneImagePath","sourceGuess","mostLikelyDiagnosis"]
    print(json.dumps({k: t[k] for k in keys}, indent=2))

print("=== MULTI CAT ===")
print(json.dumps([{k: t.get(k) for k in ["id","title","yearLevels","complexity","hasMci","mciPatientCount","checklistCount","callReason","woundCount"]} for t in data["multiCat"]], indent=2))
print("=== MCI FLAGGED ===")
for t in data["mciFlagged"]:
    print(json.dumps({k: t[k] for k in ["id","title","category","yearLevels","complexity","hasMci","mciPatientCount","callReason","checklistCount"]}, indent=2))

print("=== TOO HARD Y1 ===")
print(json.dumps(data["tooHardForY1"], indent=2))
print("=== DIPLOMA ONLY ===")
print(json.dumps(data["diplomaOnly"], indent=2))
print("=== BASIC NOT Y1 (first 40) ===")
print(json.dumps(data["basicButNotY1"][:40], indent=2))
print("count", len(data["basicButNotY1"]))
print("=== YEAR1 ONLY ===")
print(json.dumps(data["year1OnlyIds"], indent=2))
print("=== YEAR2 ONLY ===")
print(json.dumps(data["year2OnlyIds"], indent=2))
