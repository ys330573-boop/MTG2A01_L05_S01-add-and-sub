# MTG2A01_L05_S01 — Image assets to generate

**Game:** कहानी का सही संख्या वाक्य (Grade 2: match a story with its number sentence)
**Purpose:** replace the emoji and CSS-drawn placeholders with real illustrations that match the game's existing art.
**Generator:** Codex image generation. Each asset below has a ready-to-paste prompt.

> **Status (2026-10-26):** A1–A10, B1–B9 and C1–C8 are generated and IN THE GAME (`assets/Images/*.webp`). Only the optional D1–D2 are not made.
>
> *(Original note:)* the game does not load these files yet. It still draws emoji / CSS shapes. After you generate the files and save
> them under the names below, the code needs a small change to swap each placeholder for its picture (see
> [After generating](#after-generating)).

---

## 1. Style guide — paste this before every prompt

```
STYLE: children's educational game illustration for Indian Grade-2 kids. Soft 2D cartoon with gentle cel shading,
clean dark-brown outlines (2-3px), rounded friendly shapes, warm saturated but not neon colours, soft top-left light,
no harsh shadows. Same style as the attached reference images (Indian cartoon children "Pari" in a pink-and-gold
lehenga, "Aaru" in a red waistcoat and white kurta; a white eagle-chick mascot "Swiftie" in a yellow hoodie with a brown
satchel). Indian everyday setting. No text, no letters, no numbers, no watermark, no border.
```

**Attach these reference images to Codex every time** (they are in the game folder, so the style stays consistent):

| Reference | File |
|---|---|
| Girl character (Pari) | `assets/char_meera_full.webp` |
| Boy character (Aaru) | `assets/char_aman_full.webp` |
| Mascot Swiftie | `assets/UI/sw_lg_happy.png` |
| Background style | `assets/bg_landing_soft2.webp` |

## 2. Technical rules (all assets)

| Rule | Value |
|---|---|
| Folder | `assets/Images/` (create it) |
| Format | **PNG with transparent background** for objects and characters; PNG/WebP (opaque) for full backgrounds |
| Objects (counters) | **256 × 256 px**, object centred, ~10% empty margin, transparent background. Shown small (20–40 px) and repeated up to 60×, so keep the silhouette simple and readable when tiny |
| Props / characters | sizes given per asset below, transparent background |
| Backgrounds | **2666 × 1500 px** (16:9, 2× the game's 1333 × 750 stage) |
| Naming | exactly the file names below (lower case, underscores) |
| Count consistency | every counter must look **identical** each time, so do NOT draw several in one image. One object per file |

---

## 3. Asset list (by priority)

### Priority A — counting objects (seen most often)

These are repeated in groups of ten in the worked examples, the hint animations and the build pages.

| # | File | Size | Where it is used | Replaces |
|---|---|---|---|---|
| A1 | `obj_marble.png` | 256² | T1: Pari's 23 + Aaru's 12 marbles → 35 | CSS circle |
| A2 | `obj_bird_sit.png` | 256² | T2: 23 birds sitting on wires | 🐦 emoji |
| A3 | `obj_bird_fly.png` | 256² | T2: the 12 birds flying away | 🐦 emoji |
| A4 | `obj_bangle.png` | 256² | G2 hint: 60 bangles, 36 sold | CSS ring |
| A5 | `obj_balloon.png` | 256² | G3 hint: 42 balloons + 11 more | CSS balloon |
| A6 | `obj_laddoo.png` | 256² | G4 hint: 35 laddoos, 15 eaten | CSS ball |
| A7 | `obj_banana.png` | 256² | P1 hint: 27 bananas, monkey takes 14 | 🍌 emoji |
| A8 | `obj_passenger.png` | 256² | G1 hint: 24 passengers + 16 board the bus | 🧑 emoji |
| A9 | `obj_boy.png` | 256² | P2 hint: 30 boys | 👦 emoji |
| A10 | `obj_girl.png` | 256² | P2 hint: 40 girls | 👧 emoji |

**A1 `obj_marble.png`**
```
A single glass marble (kancha) seen from the front, glossy round glass ball with a swirl of colour inside, bright
highlight at top-left, soft shadow underneath on the transparent background. One marble only, centred, 256x256,
transparent PNG.
```
> Optional: also make `obj_marble_blue.png`, `obj_marble_red.png`, `obj_marble_green.png`, `obj_marble_yellow.png` and
> `obj_marble_purple.png` (same prompt, swirl in that colour). The game currently mixes six colours.

**A2 `obj_bird_sit.png`**
```
A small cute cartoon sparrow (chidiya) sitting, side view facing right, perched pose with tiny feet curled as if on a
wire, round body, brown and cream feathers, small dark eye, friendly. One bird only, centred, 256x256, transparent PNG.
```

**A3 `obj_bird_fly.png`**
```
The same cartoon sparrow as obj_bird_sit, now flying up and to the right with both wings spread, feet tucked in.
Same colours and proportions. One bird only, centred, 256x256, transparent PNG.
```

**A4 `obj_bangle.png`**
```
A single Indian glass bangle (choodi) seen slightly from above as a thin shiny ring, bright red with small gold dots,
glossy highlight. One bangle only, centred, 256x256, transparent PNG.
```
> Optional colour set: `obj_bangle_green.png`, `obj_bangle_blue.png`, `obj_bangle_yellow.png`, `obj_bangle_pink.png`.

**A5 `obj_balloon.png`**
```
A single round party balloon with a small knot and a short curly string hanging down, glossy highlight top-left,
bright red. One balloon only, centred, 256x256, transparent PNG.
```
> Optional colour set: `obj_balloon_blue.png`, `obj_balloon_yellow.png`, `obj_balloon_green.png`, `obj_balloon_pink.png`.

**A6 `obj_laddoo.png`**
```
A single Indian sweet laddoo (boondi laddoo), round golden-orange ball with a bumpy grainy texture and a few visible
boondi pearls, soft highlight, small shadow. One laddoo only, centred, 256x256, transparent PNG.
```

**A7 `obj_banana.png`**
```
A single ripe yellow banana, slightly curved, small brown tip, soft highlight. One banana only, centred, 256x256,
transparent PNG.
```

**A8 `obj_passenger.png`**
```
Head-and-shoulders of a smiling Indian adult bus passenger seen through a bus window, simple friendly face, neat hair,
plain shirt, front view. Must stay readable at 28px. One person only, centred, 256x256, transparent PNG.
```

**A9 `obj_boy.png` / A10 `obj_girl.png`**
```
Head-and-shoulders of a smiling Indian school boy, short black hair, white school shirt with a navy collar, front view,
simple and readable at 28px. One child only, centred, 256x256, transparent PNG.
```
```
Head-and-shoulders of a smiling Indian school girl, two black braids with red ribbons, white school shirt with a navy
collar, front view, simple and readable at 28px. One child only, centred, 256x256, transparent PNG.
```

### Priority B — props in the hint animations

| # | File | Size | Where it is used | Replaces |
|---|---|---|---|---|
| B1 | `prop_bus.png` | 1200 × 520 | G1 hint: the bus the passengers board (seen from the side, windows empty so passengers can show) | CSS bus |
| B2 | `prop_bus_stop.png` | 400 × 520 | G1 hint: where the 16 new passengers come from | 🚏 emoji |
| B3 | `prop_bangle_stand.png` | 900 × 600 | G2 hint: the bangle seller's display stand | CSS panel |
| B4 | `prop_shopping_bag.png` | 400 × 400 | G2 hint: where the 36 sold bangles go | 🛍️ emoji |
| B5 | `char_dadi.png` | 500 × 700 | G3 hint: Dadi (grandmother) who gives 11 balloons | 👵 emoji |
| B6 | `prop_plate.png` | 900 × 600 | G4 hint: the plate the laddoos sit on | CSS plate |
| B7 | `char_kids_eating.png` | 600 × 600 | G4 hint: the children who eat 15 laddoos | 😋 emoji |
| B8 | `prop_basket.png` | 900 × 600 | P1 hint: the fruit basket holding 27 bananas | CSS basket |
| B9 | `char_monkey.png` | 500 × 600 | P1 hint: the monkey who takes 14 bananas | 🐒 emoji |

**B1 `prop_bus.png`**
```
A bright yellow Indian city bus seen exactly from the side, facing right, long row of large EMPTY windows (light blue
glass, nothing inside), open door at the front right, two black wheels, friendly rounded shape. 1200x520, transparent PNG.
```

**B2 `prop_bus_stop.png`**
```
A small Indian roadside bus stop: a pole with a round blue bus-sign (a simple bus icon, no text) and a small shelter
roof, front view. 400x520, transparent PNG.
```

**B3 `prop_bangle_stand.png`**
```
A wooden bangle seller's display stand from a village market, a flat tray with three horizontal wooden rods, EMPTY (no
bangles on it), warm wood colour, front view. 900x600, transparent PNG.
```

**B4 `prop_shopping_bag.png`**
```
A small cloth jhola shopping bag with two handles, pink with a simple flower print, slightly open at the top,
front view. 400x400, transparent PNG.
```

**B5 `char_dadi.png`**
```
A kind smiling Indian grandmother (dadi), grey hair in a bun, round glasses, cream saree with a maroon border, holding
out one hand as if giving something, full body, standing, front three-quarter view. Same style as the reference children.
500x700, transparent PNG.
```

**B6 `prop_plate.png`**
```
A large round steel thali plate seen from slightly above, shiny silver with a raised rim, EMPTY. 900x600, transparent PNG.
```

**B7 `char_kids_eating.png`**
```
Two happy Indian children (a boy and a girl, same style as the reference characters) eating laddoos, one holding a
laddoo near the mouth, cheeks puffed and smiling, half-body. 600x600, transparent PNG.
```

**B8 `prop_basket.png`**
```
A woven bamboo fruit basket (tokri) seen from the front, wide and shallow, EMPTY, warm tan colour with a visible weave
pattern. 900x600, transparent PNG.
```

**B9 `char_monkey.png`**
```
A cheeky but cute cartoon monkey (bandar), brown fur, pale face, sitting, holding one banana and reaching out with the
other hand, full body. 500x600, transparent PNG.
```

### Priority C — the palace adventure ("रहस्यमयी महल की खोज", doors D1–D3 and the treasure)

| # | File | Size | Where it is used | Replaces |
|---|---|---|---|---|
| C1 | `bg_palace_hall.png` | 2666 × 1500 | The palace backdrop on the intro, all three doors and the treasure | CSS arches / pillars / carpet |
| C2 | `door_pink_closed.png` / `door_pink_open.png` | 600 × 860 | Door 1 (35 − 18 = 17) | CSS door |
| C3 | `door_blue_closed.png` / `door_blue_open.png` | 600 × 860 | Door 2 (26 + 13 = 39) | CSS door |
| C4 | `door_green_closed.png` / `door_green_open.png` | 600 × 860 | Door 3 (57 − 17 = 40) | CSS door |
| C5 | `prop_portal_swirl.png` | 800 × 800 | The glowing portal behind an opened door | CSS gradient |
| C6 | `prop_treasure_chest.png` | 900 × 760 | The treasure at the end | CSS chest |
| C7 | `prop_parchment.png` | 1400 × 1000 | The puzzle card on each door (story + blanks sit on top of it) | CSS parchment |
| C8 | `sw_back.png` | 600 × 800 | Swiftie seen from BEHIND, facing the door (the storyboard shows him from the back) | front pose |

**C1 `bg_palace_hall.png`**
```
Inside a mysterious magical Indian palace corridor at night: tall carved stone arches receding to a glowing golden
light at the centre, purple-and-indigo stone walls, two pillars at the left and right edges, hanging maroon and royal-blue
banners, wall torches with warm flames, a long red carpet running from the bottom centre to the far arch, tiny floating
sparkles. Leave the centre and right half fairly uncluttered (doors and a puzzle card are placed there). No characters.
2666x1500.
```

**C2–C4 doors** (generate `_closed` and `_open` for each colour; same framing so they swap exactly)
```
A tall ornate magical palace door with a pointed arch top, carved golden frame, two door leaves decorated with golden
swirls, a large glowing PINK diamond-shaped gem in the centre and a small gem on the top keystone, magical pink glow
around the frame. Front view, centred, 600x860, transparent PNG.
```
```
The same door, OPEN: both leaves swung inward and seen edge-on at the sides, revealing a bright swirling pink-and-white
magical portal of light inside the arch. Same frame and framing as the closed door. 600x860, transparent PNG.
```
> Repeat with **BLUE** (`door_blue_*`) and **GREEN** (`door_green_*`) in place of PINK.

**C5 `prop_portal_swirl.png`**
```
A round magical portal: a spiral swirl of white, gold and soft pastel light with sparkles, glowing brightest at the
centre and fading at the edges. 800x800, transparent PNG.
```

**C6 `prop_treasure_chest.png`**
```
An open wooden treasure chest with gold bands and a gold lock, overflowing with gold coins, colourful gems and a small
crown, a soft golden glow rising from inside, a few coins scattered in front. Front three-quarter view. 900x760,
transparent PNG.
```

**C7 `prop_parchment.png`**
```
A blank old parchment scroll card, cream-gold paper with soft burnt edges and a thin ornate gold border, slightly curled
corners, completely EMPTY (no writing). Front view. 1400x1000, transparent PNG.
```

**C8 `sw_back.png`**
```
The mascot Swiftie (the white eagle-chick from the reference image, yellow hoodie, brown satchel) seen from BEHIND,
standing and looking up at a tall door in front of him, back of the hood visible, satchel strap across the back.
Full body. Same character design as the reference. 600x800, transparent PNG.
```

### Priority D — optional story pictures for the worked examples

The SME deck asks for "Pari's photo" and "Aaru's photo". Those already exist (`char_meera.webp`, `char_aman.webp`). Only
generate these if you want richer scenes:

| # | File | Size | Use |
|---|---|---|---|
| D1 | `prop_wire_poles.png` | 1100 × 260 | T2: a wooden electric-pole pair with three horizontal wires (birds sit on it) |
| D2 | `prop_marble_bowl.png` | 500 × 300 | T1: an empty clay bowl the combined 35 marbles go into |

```
D1: Two wooden electricity poles on the left and right with three straight black wires stretched between them,
evenly spaced, nothing on the wires, simple flat side view. 1100x260, transparent PNG.
```
```
D2: A wide shallow terracotta clay bowl, EMPTY, seen slightly from above, warm orange-brown. 500x300, transparent PNG.
```

---

## 4. Checklist before handing back

- [ ] Every file is in `assets/Images/` with the exact name above.
- [ ] Objects and props have a **transparent** background (no white box).
- [ ] No text, letters or numbers anywhere in any image.
- [ ] Counters (A1–A10) are readable when shrunk to 28 px.
- [ ] The closed and open versions of each door line up exactly (same frame position).
- [ ] The art style matches the reference images.

## After generating

Tell me (Claude) which files are ready. I will:
1. Swap each emoji / CSS placeholder in `app.js` / `style.css` for its picture, keeping a fallback to the current drawing
   if a file is missing (so a half-finished set never breaks the game).
2. Re-test every screen (worked examples, hint animations, palace doors) and check sizes and alignment.

The game logic and timings stay the same: only the pictures change.
