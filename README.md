# MTG2A01_L05_S01 — कहानी का सही संख्या वाक्य (Match statements with word problems)

**Grade:** G2 · **LO:** MTG2A01_L05 · **Attribute:** A01 (Numbers & Operations) · **Type:** CORE

**Skill description:**
> दो अंकों की संख्याओं वाली जोड़ और घटाव की कहानियों (शब्द समस्याओं) को उनके सही संख्या वाक्य से मिलाता है।

> Code resolved via `skill_lookup.py MTG2A01_L05_S01` (Green-Flagged Skills G2-G3) — GREEN-FLAGGED, not inferred.

**Revision:** implements the SME/LXD deck `MTG2A01_L05_S01_review_v2.pptx` (SME-revised flow).
**Slides:** 16 · Tutorial 2 / Guided 4 / Practice 10 (incl. the palace adventure and the celebration)

## Arc (deck page → slide)
- **Landing (P1):** title + the two sentence cards 23 + 12 = 35 (teal) and 23 − 12 = 11 (purple); new greeting VO.
- **Tutorial (watch), one screen per story — the story is read, then the worked example follows on the same screen, no आगे in between:** T1 marbles: the story read with word-by-word highlight, then the card moves up and the 7-step example builds 23 + 12 = 35 · T2 birds: the story read, then 23 birds on wires, 12 fly away, 11 glow → 23 − 12 = 11. (The P4 compare page was removed on request.)
- **Guided:** G1/G2 drag the right sign into the sentence — bus 24 + 16 = 40, bangles 60 − 36 = 24 (P5, P6) · G3/G4 pick 1 of 3 sentences — balloons 42 + 11 = 53, laddoos 35 − 15 = 20 (P7, P8).
- **Practice:** P1/P2 build the sentence from cards — bananas 27 − 14 = 13, class 30 + 40 = 70 with 40 + 30 accepted (P9, P10) · P3/P4 sentence → pick the story (P11, P12) · the "रहस्यमयी महल" adventure (P16 storyboard) wrapping the three complete-the-story puzzles: door 1 35 − 18 = 17 (tap, P13), door 2 26 + 13 = 39 (drag, any order, P14), door 3 57 − 17 = 40 (tap, P15) → treasure → celebration with no text (P19).
- **Removed per deck:** the two sort pages, the two sign-drag-onto-pictures pages, the sign-only pick (old P17/P18).

## Feedback (as specified per page)
- Sign drag: WA1 bounce back + hint VO + the story animation (overlay) · WA2 wiggle, right sign pulses, other fades; tap it → it moves into the box and the sentence is read.
- Pick sentence: WA1 wiggle + VO with the story's numbers lit in sync · WA2 wiggle + animation · WA3 reveal (correct glows, others fade).
- Build sentence: per box — sign in a number box / number in the sign box / wrong sign / wrong number, each with its 1st- and 2nd-attempt response; 3rd miss on a box ghost-drags the right card; idle 7 s pulses the next empty box.
- Pick story: each story reads itself (🔊 on the card replays it without answering) · WA1 hint VO with 32 → − → 17 lit · WA2 the right story pulses, the other fades.
- Complete the story: tapping an empty box speaks its question; wrong = wiggle + bounce back (3rd miss on a box lights the right card); CR reads the whole story lighting each sentence and its numbers in the story and the equation; then the door opens.

## Engine
New modules in `app.js` §12b (additive — the original modules are untouched): `STORY_READ`, `WORKED_EXAMPLE`, `COMPARE_STORIES`, `SIGN_DRAG`, `PICK_SENTENCE`, `BUILD_SENTENCE`, `PICK_STORY`, `STORY_FILL`, `PALACE_SCENE`. VO is word-timed: `assets.audio_words` holds each clip's word boundaries (ms, char span), which drive the karaoke and every "highlight … in sync with the VO". Correct-response lines finish before the slide advances; the 🔊 chip waits during a teaching sequence instead of breaking it; idle timers start after the instructions end.

## UI shell (2026-10-22)
The look and transitions follow the reference build `CodeWithPiyush0/MTG2A01_L04_S01-File6-` (the MTG2A01_L03/L04 shell); the
game logic (slide modules, feedback ladders, flow, signals) is unchanged.
- **First screen:** blue sky with drifting / tappable stars, the courtyard card (`bg_landing_soft2.webp`) with the title painted
  on its wall, Swiftee's wave (canvas-decoded `gif/new_landing_swiftee_anim.webp`), sunlit dust, Pari and Aaru gliding in
  with the two number-sentence pills; the round play button waits for the greeting, then pops and pulses.
- **Transitions:** the body-level peek gate (`gif/peeking.webp`, headline on her first word, duck-out); questions of one phase
  slide out / in; the FLN kit's confetti (whole window) and star burst; the end screen's still → celebration clip.
- **Chrome:** round Swiftee head avatar with animated moods (`sw_head_*`), SVG speaker chips with sound-wave arcs, the yellow
  arrow-only आगे (hidden until active, then pop + pulse), the nudge hand with its tap ripple, the reference's box styles
  (number box, dashed "?" box, panels, answer cards), Baloo 2 font files, standard SFX + background music (`assets/sfx/`),
  responsive fit with mirrored edge bands and a rotate-the-phone card.
- Not taken: the reference's `swiftpal-bridge.js` (it defines `window.SwiftPAL`, which is this engine's own signal bus).

## Assets
- **Art:** `assets/Images/*.webp` — 30 illustrations generated from `ASSETS_TO_GENERATE.md` (Codex): the counting objects (marble, sitting / flying bird, bangle, balloon, laddoo, banana, passenger, boy, girl), the hint-scene props (bus, bus stop, bangle stand, shopping bag, Dadi, plate, children eating, basket, monkey) and the palace (hall, three doors closed + open, portal, parchment, treasure chest, Swiftie from behind). Converted to WebP (13 MB → 1.25 MB). A missing counter file falls back to the old CSS / emoji drawing. Animation: marbles roll into the combined box; birds idle-peck, then flap away (grey copies stay); hint objects arc in / out of their props, which bounce as they give or receive; each palace door charges, its two painted leaves swing open onto a spinning portal and Swiftie walks in; the treasure chest drops in, glows and spills coins.
- **Audio:** all 87 lesson lines + the 3 phase-gate lines are the Microsoft neural voice **hi-IN-SwaraNeural** (rate −8%, pitch +2Hz,
  loudness-normalised to −17 LUFS / −1.5 dBTP), convention + = जोड़, − = घटा, = = बराबर. Word timings come from the voice's own
  word boundaries (`assets.audio_words`). Still a TTS voice: an ear-check or a human / ElevenLabs re-voice is advised before
  shipping; if a clip is replaced, regenerate its word timings (or remove its `audio_words` entry — the engine then estimates them).
- `sfx_celebrate.mp3` is a synthesized chime (it was referenced but missing before).

## Status: 🧪 for SME review.
