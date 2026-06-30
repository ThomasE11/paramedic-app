# Auscultation recordings — sources & licences

Real recorded clinical sounds used in the patient examination. When a recording
exists for a sound type it plays instead of the WebAudio synthesis (see the
`*_RECORDINGS` registries in `src/data/clinicalSounds.ts`); any type without a
recording falls back to synthesis.

All files below are transcoded to mono 44.1 kHz MP3 from the original Ogg
Vorbis source. Transcoding is a format adaptation only; the original licence
and attribution carry over.

| File | Sound type | Source | Author | Licence |
| --- | --- | --- | --- | --- |
| `breath-wheeze.mp3` | breath: wheeze | [Wheeze2O.ogg](https://commons.wikimedia.org/wiki/File:Wheeze2O.ogg) | James Heilman, MD (Wikimedia: Jmh649) | CC BY-SA 3.0 |
| `breath-crackles-fine.mp3` | breath: fine crackles | [Crackles_pneumoniaO.ogg](https://commons.wikimedia.org/wiki/File:Crackles_pneumoniaO.ogg) | James Heilman, MD (Wikimedia: Jmh649) | CC BY-SA 3.0 |
| `breath-stridor.mp3` | breath: stridor | [Stridor_NP_OGG_2.ogg](https://commons.wikimedia.org/wiki/File:Stridor_NP_OGG_2.ogg) | James Heilman, MD (Wikimedia: Jmh649) | CC BY-SA 3.0 |
| `breath-snoring.mp3` | breath: snoring | [Freesound 114609](https://freesound.org/people/Daxter31/sounds/114609/) | Daxter31 (Freesound.org) | CC0 |
| `heart-normal.mp3` | heart: normal | [Human heart beating at 61 bpm (Cc-by-3.0).ogg](https://commons.wikimedia.org/wiki/File:Human_heart_beating_at_61_bpm_(Cc-by-3.0).ogg) | Benboncan (Freesound.org) | CC BY 3.0 |
| `heart-murmur.mp3` | heart: murmur (systolic) | [Mitral_Valve_Prolapse.wav](https://commons.wikimedia.org/wiki/File:Mitral_Valve_Prolapse.wav) | EmilyHopeS (Wikimedia) | CC BY-SA 4.0 |
| `heart-irregular.mp3` | heart: irregular (AF) | [AfibO.ogg](https://commons.wikimedia.org/wiki/File:AfibO.ogg) | James Heilman, MD (Wikimedia: Jmh649) | CC BY-SA 3.0 |
| `bowel-hyperactive.mp3` | bowel: hyperactive | [SBOOgg.ogg](https://commons.wikimedia.org/wiki/File:SBOOgg.ogg) | James Heilman, MD (Wikimedia: Jmh649) | CC BY-SA 3.0 |
| `breath-clear.mp3` | breath: normal vesicular | [SPRSound DB](https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound) | Song et al., Shanghai Children's Medical Center / SJTU (IEEE BioCAS 2022) | CC BY 4.0 |
| `breath-crackles-coarse.mp3` | breath: coarse crackles | [SPRSound DB](https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound) | Song et al., SJTU | CC BY 4.0 |
| `breath-rhonchi.mp3` | breath: rhonchi | [SPRSound DB](https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound) | Song et al., SJTU | CC BY 4.0 |
| `breath-diminished.mp3` | breath: diminished | SPRSound (real vesicular, −14 dB + low-pass) | Song et al., SJTU | CC BY 4.0 (derivative) |
| `bowel-normal.mp3` | bowel: normal (active) | [Figshare: Bowel sounds signal](https://figshare.com) | Zahra Mansour | CC BY 4.0 |
| `bowel-hypoactive.mp3` | bowel: hypoactive (reduced) | Figshare: Bowel sounds signal (sparse window of healthy recording) | Zahra Mansour | CC BY 4.0 |

## Attribution (display somewhere in-app, e.g. an About/Credits screen)

> Auscultation sounds — wheeze, fine crackles, stridor, atrial-fibrillation, and
> hyperactive bowel sounds © James Heilman, MD (CC BY-SA 3.0, via Wikimedia
> Commons); systolic murmur © EmilyHopeS (CC BY-SA 4.0, via Wikimedia Commons);
> normal heart sound © Benboncan / Freesound (CC BY 3.0); snoring © Daxter31 /
> Freesound (CC0).

**CC BY-SA 3.0 note:** the wheeze and crackles files are share-alike. Bundling
them as-is requires attribution (above). If you *edit the audio itself* (beyond
format transcoding), the edited audio must stay CC BY-SA 3.0 — this does not
affect the licence of the rest of the application.

## Still synthesised — EXHAUSTIVELY confirmed to have no commercially-licensed labelled recording

After a deep second sweep (Wikimedia, Freesound, Openverse, **PhysioNet CirCor /
CinC-2016 / EPHNOGRAM**, **SPRSound**, **ICBHI 2017**, **HF_Lung**, **Figshare**,
**Zenodo**, **archive.org**, **GitHub**, **Kaggle**, PMC open-access), these
remain synthesised because NO file clears BOTH the commercial-reuse bar AND an
explicit clinical label:

- **Heart: gallop (S3/S4)** and **muffled/distant** — open datasets only label
  normal/abnormal or valvular disease; S3/S4 and muffled are correctly labelled
  ONLY in copyrighted libraries (U-Michigan, EasyAuscultation, Thinklabs, etc.).
  To get these: licence a commercial library, or have a clinician record/verify.
- **Percussion: resonant, hyper-resonant, dull, tympanic** — genuinely do not
  exist as commercially-licensed clinical audio anywhere; literature confirms
  percussion notes are only synthesised or recorded in private lab rigs. Must be
  produced in-house. Synthesis (damped-resonance tones) is acoustically defensible.
- **Breath: absent** and **Bowel: absent** — silence by definition; synthesised
  (or render a labelled silent state).

A mislabelled recording is worse than synthesis, so nothing was substituted.

To add one: drop the file here, add its path to the matching registry in
`clinicalSounds.ts`, and add a row above. Good CC sources: Wikimedia Commons
(limited), R.A.L.E. repository, university open-courseware heart-sound libraries.
Verify each file's licence permits commercial reuse before bundling.
