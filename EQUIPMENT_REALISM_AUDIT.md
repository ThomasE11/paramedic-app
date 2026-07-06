# Equipment Realism Audit

Date: 2026-06-19

Scope: treatment jump bags, product tiles, and visible mannequin treatment overlays.

## Reference Standard

The student should see the same item family in three places:

1. Inside the open equipment bag.
2. In the selected/staged treatment panel.
3. Fitted to the patient/mannequin after application.

Assets should be product-like cutouts with transparent backgrounds, no embedded labels, no icon cards, and no white/black box backgrounds. Wearable equipment must use body-specific anchors so it does not hide assessment hotspots.

Reference examples used for this audit:

- Non-rebreather mask: clear mask, elastic strap, metal nose clip, side valve ports, green/white connector, oxygen tubing, and full reservoir bag.
- Nebulizer mask: clear mask, medication cup/chamber, oxygen/air tubing, visible aerosol/mist during use.
- BVM: face mask, one-way valve, self-inflating bag, oxygen tubing, reservoir bag.
- Splints: distinguish SAM splint, rigid/box splint, vacuum limb splint, air splint, and traction splint.

## Current Fixes Applied

- Mannequin oxygen overlays now use the realistic `/equipment-assets/*.webp` images rather than simplified `/treatment-assets/*.svg` icon cards.
- Face equipment now renders as compact wearable overlays with oxygen-flow/mist cues instead of large text cards.
- Oxygen cylinder in the airway bag no longer applies the non-rebreather treatment by itself.

## Bag Checklist

Status key:

- PASS: recognizable enough for current bag tile.
- TUNE: recognizable, but overlay size/fit or product accuracy needs refinement.
- REGEN: regenerate or replace asset before calling it premium.
- MAP: treatment ID or interaction mapping needs correction.

### Airway Bag

- [ ] Oxygen Cylinder - TUNE: asset exists; should stage oxygen source only, not apply an oxygen device.
- [ ] Bag-valve-mask - TUNE: recognizable, but mannequin overlay needs realistic face seal plus visible chest-rise rhythm.
- [ ] Portable Suction - PASS: product tile reads as suction; future mannequin state should show Yankauer/catheter when used.
- [ ] OPA Set - TUNE: asset exists; must only fit visually when patient is unconscious/no gag.
- [ ] Oxygen Mask - TUNE: asset exists; face overlay needs transparent mask contour and tubing that does not hide mouth exam.
- [ ] Non-rebreather - REGEN: current product tile is close, but needs higher-resolution NRB with valve discs, metal nose strip, elastic strap, tubing, and full reservoir bag.
- [ ] ET Tube - TUNE: asset exists; mannequin overlay should show tube at mouth plus securing tie/tape and capnography cue.
- [ ] RSI Airway Setup - MAP: currently reuses ET tube; should become a kit bundle with laryngoscope/video scope, syringe meds, ETT, bougie/stylet, suction, backup airway.

### Breathing Bag

- [ ] Nasal Cannula - TUNE: asset exists; mannequin overlay should route tubing around ears/cheeks and prongs into nares.
- [ ] Non-rebreather - REGEN: same NRB requirement as above.
- [ ] BVM - TUNE: asset exists; needs two-hand seal option, mask on face, bag offset to side, and assisted chest rise.
- [ ] Nebuliser Mask - TUNE: asset exists; overlay now shows mist, but asset should better show medicine cup and tubing.
- [ ] CPAP Circuit - TUNE: asset exists; needs tight strapped mask, pressure tubing, and tolerance/refusal behavior.
- [ ] Transport Ventilator - PASS: tile reads as ventilator; mannequin should show circuit only after ETT/advanced airway.
- [ ] Compact Ventilator - PASS: tile reads as compact device; should be selectable as alternate ventilator.
- [ ] Ventilator Circuit - TUNE: should show filter/catheter mount/tubing and be gated by secured airway.
- [ ] Needle Decompression - TUNE: asset exists; overlay should anchor to correct chest landmark and show catheter left in place.
- [ ] Three-Sided Dressing - REGEN: currently uses generic bandage; should be replaced with commercial vented chest seal plus fallback improvised dressing.

### Circulation Kit

- [ ] IV Cannula - TUNE: asset exists; mannequin overlay should show cannula/tape at hand or forearm plus line.
- [ ] Fluid Bag - PASS: asset exists; overlay now indicates fluid line when fluids are applied.
- [ ] IO Drill - REGEN: currently reuses IV cannula; needs EZ-IO style drill and needle.
- [ ] AED / Defib - PASS: asset exists; should open pads/monitor workflow.
- [ ] Defib Pads - MAP: treatment ID should align with actual pad placement/defib action; current separate AED/pads items may confuse scoring.
- [ ] Tourniquet - TUNE: asset exists; overlay must anchor to bleeding limb and stop bleeding only if placed proximal/correctly.
- [ ] Vented Chest Seal - REGEN: currently generic bandages; needs HyFin/Russell/SAM-style vented seal.
- [ ] Mechanical CPR - TUNE: asset exists; overlay should align over sternum and not cover defib pads.

### Medication Pouch

- [ ] Adrenaline - PASS: vial asset exists; should branch IM vs IV/arrest use.
- [ ] Aspirin - PASS: tablet asset exists.
- [ ] GTN Spray - PASS: spray asset exists.
- [ ] Analgesia - TUNE: syringe asset exists; should distinguish fentanyl/morphine route.
- [ ] TXA - PASS: vial asset exists.
- [ ] Hydrocortisone - PASS: vial asset exists.
- [ ] Naloxone - PASS: vial asset exists; patient reaction already modeled.
- [ ] Antiemetic - PASS: vial asset exists.

### Neuro Kit

- [ ] Glucose Gel - PASS: asset exists; should be blocked if airway/mentation unsafe.
- [ ] Dextrose 10% - PASS: bag asset exists; requires IV/IO access.
- [ ] Midazolam - TUNE: syringe asset exists; should distinguish buccal/IN/IM/IV route.
- [ ] Naloxone - PASS: vial asset exists.
- [ ] Mannitol - PASS: bag asset exists.
- [ ] Antiemetic - PASS: vial asset exists.

### Exposure Pack

- [ ] Cervical Collar - TUNE: asset exists; overlay should fit neck without hiding airway landmarks.
- [ ] SAM Splint - PASS: orange/blue SAM style asset exists.
- [ ] Box Splint - PASS: asset exists and distinct from SAM.
- [ ] Vacuum Splint - PASS: asset exists and distinct.
- [ ] Air Splint - PASS: asset exists and distinct.
- [ ] Traction Splint - TUNE: asset exists; overlay should fit femur with ankle hitch/traction cue.
- [ ] Splint Roll - TUNE: generic roll; should avoid duplicating SAM splint.
- [ ] Bandages - PASS: asset exists; overlay should match wound site.
- [ ] Warming Blanket - PASS: asset exists; overlay should cover torso/limbs without hiding face/chest exam controls.
- [ ] Cooling Pack - PASS: asset exists; should anchor to neck/axilla/groin for heat illness.
- [ ] Positioning - TUNE: generic asset; should become body posture state rather than a loose equipment tile.

### Transport Kit

- [ ] Main Stretcher - PASS: asset exists; stretcher should appear under patient when selected.
- [ ] Long Spine Board - TUNE: asset exists; needs better board width/strap/head-block pairing.
- [ ] Scoop Stretcher - TUNE: asset exists; should show split scoop halves and locking ends.
- [ ] Head Blocks - PASS: asset exists; should pair with collar/board.
- [ ] Vacuum Mattress - PASS: asset exists; should envelop patient as transport surface.
- [ ] KED Vest - TUNE: asset exists; should be used for seated extrication only.
- [ ] Cervical Collar - TUNE: duplicate with exposure pack; shared visual rule needed.
- [ ] Transfer Blankets - PASS: asset exists.

## Next Implementation Pass

1. Regenerate the NRB asset at higher quality and transparency.
2. Replace generic chest seal/bandage placeholders with vented chest seal assets.
3. Add a route-aware mannequin overlay map: face, mouth, chest, arm, leg, neck, whole-body transport.
4. Add physiologic visual states:
   - oxygen flow dots for masks/cannulae,
   - nebulizer mist,
   - chest rise with BVM/ventilation,
   - anaphylaxis redness/urticaria/angioedema,
   - bleeding that stops only after correct source control,
   - IV line visible only after access is established.
5. Add a small automated asset audit that fails when a bag item has no asset, duplicate treatment mapping, or a non-transparent placeholder.
