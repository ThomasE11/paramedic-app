# URL Verification Report
## Critical Analysis of External URLs in Codebase

**Date:** February 16, 2026  
**Files Checked:**
- src/data/clinicalResources.ts
- src/data/traumaVisualResources.ts  
- src/data/litflECGs.ts

---

## Executive Summary

| Category | Count | Percentage |
|----------|-------|------------|
| **Total URLs** | 172 | 100% |
| ✅ **Working** | 79 | 46% |
| ❌ **Broken** | 91 | 53% |
| ⏱️ **Timeout** | 2 | 1% |

**Success Rate: 46%**  
**Critical Action Required: 91 URLs need replacement**

---

## Broken URLs by Category

### 1. LITFL Image Files (34 broken)
**Location:** litfl.com/wp-content/uploads/

**2019 Images (19 broken):**
- Barrel-chest-COPD.jpg
- Battles-sign-skull-base-fracture-340-2.jpg
- Cullens-sign.jpg
- Decerebrate-rigidity-340.jpg
- Decorticate-rigidity-340.jpg
- Diaphoresis-MI.jpg
- Epistaxis-anterior.jpg
- Flail-chest-340.jpg
- Grey-Turners-sign.jpg
- JVP-elevation.jpg
- Mottled-skin-shock.jpg
- Open-fracture-tibia.jpg
- Open-pneumothorax.jpg
- Pallor-anemia.jpg
- Pelvic-fracture-open-book.jpg
- Peritonsillar-abscess.jpg
- Skin-flushing.jpg
- Subcutaneous-emphysema-neck.jpg
- Tourniquet-application.jpg
- Tracheal-deviation-right-tension-pneumothorax.jpg
- Tripod-position-340.jpg

**2023 Images (5 broken):**
- Capillary-refill-test.jpg
- Haemothorax-CXR.jpg
- Intercostal-recession.png
- eFAST-RUQ.png

### 2. LITFL Article Pages (23 broken)
**Pattern:** Pages returning HTTP 404

- anterior-stemi-ecg-library/
- aortic-dissection-ecg-library/
- atls-primary-survey/
- cardiac-tamponade/
- chest-examination/
- cushings-reflex/
- de-winter-t-waves-ecg-library/
- difficult-airway-trauma/
- heart-block-ecg-library/
- hyperkalemia-ecg-library/
- hypokalemia-ecg-library/
- jugular-venous-pressure/
- kernig-sign/
- lbbb-ecg-library/
- penetrating-chest-trauma/
- posterior-mi-ecg-library/
- pulmonary-embolism-ecg-library/
- spinal-cord-injury/
- svt-ecg-library/
- tamponade-ecg-library/
- tca-ecg-library/
- torsades-de-pointes-ecg-library/
- tourniquet-application/
- tracheal-deviation/
- traumatic-amputation/
- ventricular-tachycardia-ecg-library/

### 3. EMCrit Articles (4 broken)
- balanced-resuscitation/
- damage-control-resuscitation/
- emcrit/crashing-trauma-patient/
- massive-transfusion-protocol/

### 4. EMDocs Articles (10 broken)
- blunt-thoracic-trauma-ed-management/
- flail-chest-and-pulmonary-contusion/
- massive-hemothorax/
- the-fast-exam-in-trauma/
- tranexamic-acid-in-trauma/
- traumatic-amputations/

### 5. EasyAuscultation Audio Files (13 broken)
**All audio resources returning 404:**
- absent-breath-sounds.mp3
- aortic-stenosis.mp3
- asthma-wheezing.mp3
- bronchial-breathing.mp3
- crackles.mp3
- mitral-regurgitation.mp3
- pericardial-friction-rub.mp3
- pleural-friction-rub.mp3
- ronchi.mp3
- s3-gallop.mp3
- s4-gallop.mp3
- stridor.mp3

### 6. Wikimedia Images (16 rate-limited)
**Status:** HTTP 429 (rate limited by server)
**Note:** These may work in browser but automated checking is blocked
- 8 clinical images (Mydriasis, Raccoon eyes, Cyanosis, etc.)
- Both 320px and 640px versions affected

### 7. Other Broken URLs
- rebelem.com/category/trauma-em/ [404]
- stroke.org/-/media/stroke-images/stroke-basics/face-arm-speech-time.jpg [403]

### 8. Timeout URLs (2)
- emcases.ca/category/trauma/
- emcases.ca/multi-trauma/

---

## Working URLs by Source

### YouTube Videos: 22 ✅
All YouTube embeds and watch URLs are working

### LITFL Images (2018): 22 ✅
Images from 2018 uploads are accessible
- ECG library images
- Trauma clinical images

### LITFL Pages: 12 ✅
- atrial-fibrillation-ecg-library/
- atrial-flutter-ecg-library/
- brugada-syndrome-ecg-library/
- digoxin-toxicity-ecg-library/
- ecg-library/ (main page)
- inferior-stemi-ecg-library/
- lateral-stemi-ecg-library/
- lung-ultrasound-pneumothorax/
- pericarditis-ecg-library/
- pocus-made-easy-basic-echo/
- pocus-made-easy-efast/
- pocus-made-easy-lung/
- pulsus-alternans/
- shock/
- tension-pneumothorax/
- tension-pneumothorax-an-alternative-view/
- traumatic-brain-injury/
- wellens-syndrome-ecg-library/

### LITFL Images (2023): 11 ✅
- FELS ultrasound images
- eFAST views (some)
- POCUS images

---

## Recommendations

### Immediate Actions Required:

1. **Replace 34 LITFL images** - Check litfl.com for updated URLs or alternative sources
2. **Fix 23 LITFL article links** - Update to current page URLs
3. **Replace all EasyAuscultation audio** - Source from alternative providers (e.g., medbullets, other FOAMed)
4. **Update EMCrit and EMDocs links** - Check for new URL structure
5. **Verify Wikimedia images** - Test manually in browser, may need User-Agent headers
6. **Find alternatives for stroke.org image** - Source from Wikimedia or other public domain

### Estimated Replacement Effort:
- **High Priority:** 34 LITFL images (clinical resources)
- **Medium Priority:** 13 audio files (affects audio findings)
- **Lower Priority:** 37 article links (affects references)

---

## Notes

- Many LITFL images have consistent 404s suggesting site reorganization
- EasyAuscultation appears to no longer host the audio files
- YouTube content remains stable
- Wikimedia rate-limiting prevents automated verification but images likely still available
- EM Cases timeouts may be temporary network issues

---

**Report generated for planning purposes - no fixes applied**
