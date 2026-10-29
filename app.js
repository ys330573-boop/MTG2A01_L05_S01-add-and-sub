const CARD = JSON.parse(document.getElementById('cardData').textContent);
  const AUDIO_EXT = (CARD.assets && CARD.assets.audio_ext) || "mp3";  // .mp3 (maths) / .ogg (Hindi FLN)
  const IMG_EXT   = (CARD.assets && CARD.assets.img_ext)   || "png";  // .png (working) / .webp (delivered/FLN) — twin of AUDIO_EXT (fixes A3)
  const ENGINE_VERSION = "2026.07.16i-r4-unified";  // ENGINE STAMP — the receipt (verify_bundle.py) asserts a built game carries THIS exact string; a stale/divergent engine → hard FAIL, so the wrong engine can never silently ship. BUMP IN LOCKSTEP with engine_guard.py + swiftpal_build.py + unified_build.py + verify_bundle.py on EVERY engine change (r2: drag/pattern feedback standard + PHASE_TRANSITION; r3c: off-white toybox bg, dual-coded counting options numeral+hand, full-body landing mascot, true-corner square/rect; r3d: Swiftie mouth-stops-when-silent (still frame), Arabic display numerals 1/2/3, landing shows full 1..n hand row, volume-chip aligned in header pill); r4: additive number-sequence path modules MEET_SEQUENCE + SEQUENCE_COMPLETE + SEQUENCE_NEXT (MTKGA01_L02_S04 "completes a number sequence within 20") — purely additive, existing lessons untouched. r4-landing (16c): landing recomposed to match reference — small corner mascot (230px, was 300), content re-centered (dropped padding-left:300 right-shift hack), VO chip moved from top-right to the mascot's shoulder (left:150/bottom:34, 58px). CSS-only; supersedes the 16b right-shift overlap fix.; 16d: TRUNK MERGE — unified the two diverged engine lines at base 12d: the 15e mechanics trunk (CONSERVE_COUNT + COUNT_ACTION + COUNT_DRAG_MATCH + ORDER_BY_WEIGHT + PICK_SET_BY_NUMBER, per_row/dense count-set grouping, bigNumCell numeral-only test options, title_first landing order) + the 16c r4 design trunk (boot loader, peek phase-transition, concept-strip landing, DS header, flat CTAs, sunburst/star-burst celebration, recomposed corner-mascot landing). Nothing dropped from either line. 16e: landing count-hero hand sizing FIXED — the .sg-hero sizing selectors never matched (template uses .sg-art); hands rendered natural-size, overflowing the card (title pushed outside the box, numeral-1 hidden behind the mascot — user-visible on MTKGA01_L02_S01). Retargeted to .sg-art .sg-hand/.sg-hand-cell/.sg-hand-num (112px; image-hero landings untouched). CSS-only. 16f: INTRO strip fit-or-wrap — old sizing assumed 1220px + a -100px breakout and punched wide strips (10 numerals, 7+ letters) through the tut-frame borders; now sized to the frame (960) and wrapping into two balanced rows below the 110px touch floor. Fixes MTKGA01_L02_S01 s00 (user-caught live) AND the HIKGH04_P2 letter-row daylight item.
  try { window.SWIFTPAL_ENGINE = ENGINE_VERSION; } catch(e){}
const $ = id => document.getElementById(id);

/* ---------- 1. SCALE THE 1333x750 STAGE - ON EVERY SCREEN ----------
   [ui: reference shell] (MTG2A01_L04_S01 / HI01 parity). The lesson is ONE fixed 1333x750 stage, contain-fitted to
   the screen (scaling up as well as down) and never re-laid-out. Around it:
   - viewport-fit=cover: the page fills the whole screen; the STAGE is fitted inside the safe area (notch / home bar).
   - the bands a stage leaves (beside it on a wide phone, above/below on a 4:3 tablet) show the slide's own backdrop,
     mirrored at the stage's edge (bleed), so nothing reads as a letterbox.
   - a phone/tablet held upright: a "turn it" card (html.ask-rotate); a voice line that was speaking waits for it.
   - a phone/tablet browser goes full screen on the play tap and stays landscape where it can (Android).
   Pointer maths everywhere reads --scale at the moment it runs, so drags stay exact at every size. */
const Screen = (function(){
  const root = document.documentElement;
  let probe = null, asking = false, heldVO = null, bleedQueued = false;
  function safe(){
    if(!probe){ probe = document.createElement("div"); probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
        "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
      (document.body || root).appendChild(probe); }
    const cs = getComputedStyle(probe);
    return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  }
  function touch(){ try{ return matchMedia("(pointer: coarse)").matches; }catch(e){ return false; } }
  function fit(){
    const vw = (window.visualViewport ? window.visualViewport.width  : root.clientWidth)  || window.innerWidth;
    const vh = (window.visualViewport ? window.visualViewport.height : root.clientHeight) || window.innerHeight;
    const sa = safe(), aw = Math.max(1, vw - sa.l - sa.r), ah = Math.max(1, vh - sa.t - sa.b);
    const s = Math.min(aw / 1333, ah / 750);
    root.style.setProperty("--scale", s);
    root.style.setProperty("--safe-dx", (sa.l - sa.r) / 2 + "px");
    root.style.setProperty("--safe-dy", (sa.t - sa.b) / 2 + "px");
    root.classList.toggle("bands-x", vw - 1333 * s > 1);
    root.classList.toggle("bands-y", vh - 750 * s > 1);
    rotate(touch() && vh > vw * 1.1);
  }
  function rotate(on){
    if(on === asking) return;
    asking = on; root.classList.toggle("ask-rotate", on);
    try{                                                   // (currentAudio: the engine's live clip - not declared yet on the first fit)
      const a = currentAudio;
      if(on && a && !a.paused && !a.ended){ a.pause(); heldVO = a; }
      else if(!on && heldVO){ const h = heldVO; heldVO = null; h.play().catch(()=>{}); }
    }catch(e){}
  }
  function fullscreen(){
    try{
      if(!touch() || window.self !== window.top || /; wv\)/.test(navigator.userAgent)) return;
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if(!req || document.fullscreenElement || document.webkitFullscreenElement) return;
      const lock = ()=>{ try{ screen.orientation.lock("landscape").catch(()=>{}); }catch(e){} };
      const p = req.call(root, { navigationUI: "hide" });
      if(p && p.then) p.then(lock, ()=>{}); else lock();
    }catch(e){}
  }
  function bleed(){
    bleedQueued = false;
    const st = document.getElementById("stage"), b = document.getElementById("stageBleed");
    if(!st || !b) return;
    const wrap = st.parentElement; wrap.classList.remove("bg-under");
    const cs = getComputedStyle(st), color = cs.backgroundColor;
    const css = "background-color:" + color + ";background-image:" + cs.backgroundImage + ";background-size:" + cs.backgroundSize +
                ";background-position:" + cs.backgroundPosition + ";background-repeat:" + cs.backgroundRepeat;
    wrap.style.setProperty("--stage-bg", color); wrap.classList.add("bg-under");
    if(b._css === css) return;
    b._css = css; b.dataset.bg = st.dataset.bg || "";
    for(const i of b.children) i.style.cssText = css;
  }
  function queueBleed(){ if(!bleedQueued){ bleedQueued = true; requestAnimationFrame(bleed); } }
  function watch(){
    const st = document.getElementById("stage");
    if(!st || !window.MutationObserver) return;
    const mo = new MutationObserver(queueBleed);
    mo.observe(st, { attributes: true, attributeFilter: ["class", "style", "data-bg"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const ra = document.getElementById("rotateAsk"); if(ra) ra.addEventListener("click", fullscreen);
    queueBleed();
  }
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);
  if(window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit(); watch();
  return { fit: fit, fullscreen: fullscreen, bleed: queueBleed };
})();
function fit(){ Screen.fit(); }   // (kept: older helpers call fit())

/* ---------- 2. SIGNAL BUS + OFFLINE TELEMETRY ---------- */
/* TELEMETRY: offline self-capture. Every signal is buffered to localStorage so
   the run survives a reload / works with NO host app. A full results record can
   be pulled via SwiftPAL.downloadResults() (or the ?dev=1 button on the end
   screen). If `endpoint` is set AND the device is online, the final record is
   also POSTed — left null so the lesson is fully offline by default. */
const TELEMETRY = {
  endpoint: null,   // e.g. "https://lrs.example.com/swiftpal" — null = offline only
  storageKey: "swiftpal:run:" + CARD.skill_code + "_" + (CARD.part_label || "P1")
};
const SwiftPAL = window.SwiftPAL = {
  signals: [],
  validatorReport: { missing_signals: [], errors: [], passed: false },
  firedSet: new Set(),
  startedAt: Date.now(),
  emit(name, payload){
    const evt = Object.assign({
      ts: Date.now(),
      skill_code: CARD.skill_code,
      lo_code: CARD.lo_code,
      signal: name
    }, payload || {});
    this.signals.push(evt);
    this.firedSet.add(name);
    try{ console.log("[signal]", name, evt); }catch(e){}
    try{ window.parent?.postMessage({type:"swiftpal:signal", payload: evt}, "*"); }catch(e){}
    this.persist();
  },
  /* full results record (used for download / POST / end-of-lesson dump) */
  exportResults(){
    const ms = (typeof state!=="undefined") ? state.masteryAttempts : 0;
    const mh = (typeof state!=="undefined") ? state.masteryHits : 0;
    return {
      skill_code: CARD.skill_code, lo_code: CARD.lo_code, part: CARD.part_label || null,
      started_at: this.startedAt, exported_at: Date.now(),
      mastery: { hits: mh, attempts: ms, score: ms ? mh/ms : 0 },
      validatorReport: this.validatorReport,
      signals: this.signals
    };
  },
  /* silent: flush the running buffer to localStorage (survives reload / offline) */
  persist(){
    try{ localStorage.setItem(TELEMETRY.storageKey, JSON.stringify(this.exportResults())); }
    catch(e){ /* private mode / quota — non-fatal, postMessage + memory still work */ }
  },
  /* pull the run as a JSON file (teacher/dev; not in the child's flow) */
  downloadResults(){
    try{
      const blob = new Blob([JSON.stringify(this.exportResults(), null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = CARD.skill_code + "_" + (CARD.part_label||"P1") + "_results.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    }catch(e){ console.error("[telemetry] download failed", e); }
  }
};

/* ---------- 3. AUDIO ---------- */
let isPlaying=false, currentAudio=null;
let _smTok = 0;   // cue-clock token for word-timed VO (smPlay): bumped on every stop so stale cue loops die with their clip
function setPlaying(on){
  isPlaying=on;
  bgmDuck();   // [ui: reference shell] the background music dips under every voice line
  /* [ui: reference shell] only the chip the voice belongs to shows it (its sound-wave arcs, no throb): the landing's chip
     on the title screen, else the in-card chip on a tutorial page, else the header chip */
  let from = null;
  if(on){ const gate = document.getElementById("startGate");
    from = (gate && !gate.classList.contains("hidden")) ? document.getElementById("sgVo")
         : (document.querySelector("#slideHost .tut-audio") || document.getElementById("audioChip")); }
  document.querySelectorAll(".audio-chip, .tut-audio, .sg-vo").forEach(c => c.classList.toggle("playing", c === from));
}
function stopAudio(){
  _smTok++;
  if(currentAudio){ try{ currentAudio.pause(); }catch(e){} currentAudio=null; }
  setPlaying(false);
}
/* play(src, onEnd): real MP3 if path exists; silent 1.5s beat if missing/blocked. */
function play(src, onEnd){
  stopAudio(); setPlaying(true);
  let done=false; const fire=()=>{ if(done)return; done=true; setPlaying(false); if(onEnd) onEnd(); };
  if(src){
    const a=new Audio(src); currentAudio=a;
    a.onended=fire;
    a.onerror=()=>{ currentAudio=null; setTimeout(fire, 1200); };
    a.play().catch(()=>{ currentAudio=null; setTimeout(fire, 1200); });
  } else { setTimeout(fire, 800); }
}
/* playSfx(id, onEnd): fire-and-forget sound effect on its OWN Audio element so it can
   overlap the spoken VO (does NOT touch currentAudio / the play() chain).
   Silently no-ops if the file is missing or playback is blocked. onEnd (optional) fires when it finishes. */
function playSfx(id, onEnd){
  if(!id) return;
  try{
    const a = new Audio("assets/Audio/" + id + "." + AUDIO_EXT);
    a.volume = 0.7;
    if(onEnd) a.onended = ()=>{ a.onended = null; onEnd(); };
    a.play().catch(()=>{});
  }catch(e){}
}
/* ---------- game-feel: procedural SFX (no audio files) + success particle burst ----------
   WebAudio resumes on the first user tap (autoplay policy), so taps/answers always sound. */
let _juiceAC = null;
function _ac(){ if(!_juiceAC){ try{ _juiceAC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
  if(_juiceAC && _juiceAC.state === "suspended"){ try{ _juiceAC.resume(); }catch(e){} } return _juiceAC; }
function _tone(freqs, type, dur, vol){ const c = _ac(); if(!c) return; const t0 = c.currentTime;
  freqs.forEach((f, i)=>{ const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    const t = t0 + i*(dur/freqs.length); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur/freqs.length); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur/freqs.length); }); }
/* [ui: reference shell] the standard SFX + background music, as files in assets/sfx/ (the reference's set): correct /
   wrong (falling back to the procedural tones, so feedback is never mute), confetti, play, next, nudge, whoosh. Four
   pooled elements, reused - never one per sound. */
const SFX_DIR = "assets/sfx/", SFX_EXT = "ogg";
const _sfxPool = [new Audio(), new Audio(), new Audio(), new Audio()]; let _sfxNext = 0;
function playSfxFile(name, vol, fallback){
  try{
    const a = _sfxPool[_sfxNext++ % _sfxPool.length];
    a.pause(); a.volume = vol == null ? 0.8 : vol;
    a.onerror = ()=>{ a.onerror = null; if(fallback) fallback(); };
    a.src = SFX_DIR + name + "." + SFX_EXT;
    a.play().catch(()=>{});
  }catch(e){ if(fallback) fallback(); }
}
const sfxTap       = ()=> _tone([520], "sine", 0.09, 0.09);
const sfxCorrect   = ()=> playSfxFile("sfx_correct", 0.8, ()=> _tone([660, 880, 1180], "sine", 0.42, 0.13));
const sfxWrongSoft = ()=> playSfxFile("sfx_wrong", 0.6, ()=> _tone([300, 235], "triangle", 0.20, 0.08));   // gentle, never harsh
const sfxConfetti  = ()=> playSfxFile("sfx_confetti", 0.45);
const sfxPlay      = ()=> playSfxFile("sfx_play", 0.9);
const sfxNext      = ()=> playSfxFile("sfx_next", 0.9);
const sfxNudge     = ()=> playSfxFile("sfx_nudge", 0.45);
const sfxWhooshUI  = ()=> playSfxFile("sfx_whoosh", 0.75);
/* the soft swish as one question slides out and the next slides in (the reference's move sound, WebAudio) */
function sfxSwish(){ const c = _ac(); if(!c) return; try{ const t0 = c.currentTime, dur = .22, n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; f.type = "bandpass"; f.Q.value = 1.1;
  f.frequency.setValueAtTime(700, t0); f.frequency.exponentialRampToValueAtTime(2300, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(.09, t0 + dur * .25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(c.destination); s.start(t0); s.stop(t0 + dur + .02); }catch(e){} }
/* background music: one looping element, started by the play tap (never before it), ducked under every VO clip,
   paused while the app is in the background (the reference's "Standard Background Music", quiet in the file itself) */
var BGM = { el: null, VOL: 1, DUCK: 0.35, raf: 0 };
function bgmDuck(){
  if(!BGM || !BGM.el) return;
  const el = BGM.el, from = el.volume, to = isPlaying ? BGM.DUCK : BGM.VOL, ms = to < from ? 180 : 600, t0 = performance.now();
  cancelAnimationFrame(BGM.raf);
  const step = now =>{ if(BGM.el !== el) return; const k = Math.max(0, Math.min(1, (now - t0) / ms));
    el.volume = from + (to - from) * k; if(k < 1) BGM.raf = requestAnimationFrame(step); };
  BGM.raf = requestAnimationFrame(step);
}
function bgmStart(){
  if(BGM.el) return;
  try{ const a = new Audio(); a.loop = true; a.preload = "auto"; a.onerror = ()=>{ a.onerror = null; };
    a.src = SFX_DIR + "bgm." + SFX_EXT; a.volume = isPlaying ? BGM.DUCK : BGM.VOL; BGM.el = a; a.play().catch(()=>{}); }catch(e){}
}
document.addEventListener("visibilitychange", ()=>{ if(!BGM.el) return; if(document.hidden) BGM.el.pause(); else BGM.el.play().catch(()=>{}); });
/* a joyful star/confetti pop, centred on the play stage (upper-middle) */
function burstStars(){ const stage = document.querySelector(".slide-stage") || document.body;
  const cx = stage.offsetWidth/2, cy = stage.offsetHeight*0.38, emo = ["⭐","✨","🌟","💫","🎉"];
  for(let i=0;i<14;i++){ const s = document.createElement("span"); s.className = "spark"; s.textContent = emo[i % emo.length];
    const ang = (Math.PI*2)*(i/14) + Math.random()*0.5, dist = 70 + Math.random()*110;
    s.style.left = cx + "px"; s.style.top = cy + "px";
    s.style.setProperty("--dx", (Math.cos(ang)*dist).toFixed(0) + "px");
    s.style.setProperty("--dy", (Math.sin(ang)*dist).toFixed(0) + "px");
    s.style.animationDelay = (i*10) + "ms"; stage.appendChild(s); setTimeout(()=> s.remove(), 950); } }
/* dynamic Swiftie buddy - [ui: reference shell] the header's round avatar shows Swiftie's EXPRESSIONS (head art): the
   resting talking head, and animated heads for cheer / hint / try-again (assets/gif/sw_head_*_anim.webp). */
const SW_POSE = { talk:"talking", point:"talking", idle:"talking", happy:"celebrate", celebrate:"celebrate",
                  hint:"hint", teach:"hint", idea:"hint", tryagain:"tryagain" };
const SW_REST = "sw_anim_rest";   // (the engine's popup helper still names this still frame)
const SW_STILL = (() => { try { const q = new URLSearchParams(location.search);
  return q.has("still") || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch(e){ return false; } })();
let swMood = "point", _celebUrl = "", _celebKey = null;
function swApplyPose(){ /* retired: the heads follow setSwMood, not the playing clip */ }
function setSwMood(m){ swMood = m;
  const img = document.getElementById("swBuddyImg"), w = document.getElementById("swBuddy");
  if(!img) return;
  const expr = SW_POSE[m] || "talking";
  const animated = expr !== "talking" && !SW_STILL;
  img.onerror = () => { img.onerror = null; img.src = "assets/mascot.webp"; };
  const src = "assets/" + (animated ? "gif/" : "") + "sw_head_" + expr + (animated ? "_anim" : "") + ".webp";
  if(animated && expr === "celebrate"){                    // a slide's first cheer plays from frame 0
    if(_celebKey !== state.slideStart){ if(_celebUrl.indexOf("blob:") === 0) URL.revokeObjectURL(_celebUrl);
      _celebUrl = Assets.fresh(src); _celebKey = state.slideStart; }
    img.src = _celebUrl;
  } else img.src = src;
  if(w){ w.dataset.expr = expr; w.classList.toggle("anim", animated);
         w.classList.remove("react"); void w.offsetWidth; w.classList.add("react"); } }
/* the correct-answer confetti - [ui: reference shell] the FLN animation kit's recipe 7 (stars, rectangles, lines,
   squares, two-faced, fluttering), falling over the WHOLE window (#fxLayer), with the standard confetti SFX */
function confettiCannon(){
  const sl = CARD.slides[state.idx] || {};
  FLNMotion.confetti.burst({ host: "#fxLayer", phase: sl.phase, phases: [], count: 100, fall: [1.6, 2.6] });
  sfxConfetti();
}
/* ---------- Block Town helpers (flagship) ---------- */
const BT_COLORS = ["#F9695E","#FDC23C","#4EBE6A","#4EA3F0","#9B7BE8"];
function btBlock(i){ const b = document.createElement("div"); b.className = "blk"; b.style.background = BT_COLORS[i % BT_COLORS.length]; return b; }
function btThunk(n){ _tone([360 + n*46], "sine", 0.12, 0.10); }   // pitch climbs one step per block — HEAR the count
function btDust(plot){ const d = document.createElement("span"); d.className = "bt-dust"; d.textContent = "💨"; plot.appendChild(d); setTimeout(()=> d.remove(), 520); }
function btSkyline(done, total){ const s = document.createElement("div"); s.className = "bt-skyline";
  for(let i=0;i<total;i++){ const b = document.createElement("div"); b.className = "bt-bldg" + (i < done ? " done" : "");
    b.style.height = (26 + ((i*17) % 32)) + "px"; s.appendChild(b); } return s; }
/* the teach scene: the crane drops N blocks ONE AT A TIME (ascending thunk + spoken count) then a
   cardinality "freeze" (vo_total_N). Reached from MEET_NUMBER via data.present==='crane'. */
function btCraneMeet(host, slide){
  const d = slide.data, N = d.count;
  state.ownsAudio = true;   // the crane drops+counts blocks on its own timed VO — skip autoPlayChain
  const stage = document.createElement("div"); stage.className = "bt-stage";
  const board = document.createElement("div"); board.className = "bt-board";
  board.innerHTML = `<span class="bt-numeral">${N}</span>` + (d.word ? `<span class="bt-goallbl">${d.word}</span>` : "");   // Arabic numeral (from the integer, not card Devanagari)
  const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
  for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
  const yard = document.createElement("div"); yard.className = "bt-yard";
  const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/Images/obj_crane.png" alt="">`;
  const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
  const plot = document.createElement("div"); plot.className = "bt-plot ground";
  plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
  plotwrap.appendChild(plot); yard.appendChild(crane); yard.appendChild(plotwrap);
  stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
  host.appendChild(stage);
  state.gateNavUntilAudio = false; setNavActive(false);
  $("navBtn").onclick = ()=> completeSlide(true);
  let i = 0;
  const step = ()=>{
    if(i >= N){ if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/Images/${d.topper}.png" alt="">`; plot.appendChild(t); }
      burstStars(); play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)); return; }
    const b = btBlock(i); b.classList.add("drop"); plot.appendChild(b); i++;
    if(cells[i-1]){ cells[i-1].classList.add("lit"); cells[i-1].textContent = i; }
    btThunk(i); btDust(plot);
    play("assets/Audio/vo_num_" + i + "." + AUDIO_EXT, ()=> setTimeout(step, 340));
  };
  // play the slide prompt FIRST, then start the crane count sequence — so the count VO never cuts the
  // prompt off (we own the audio here; mountSlide's autoPlayChain is skipped via state.ownsAudio).
  play(audioFor(slide, "prompt") || null, ()=> setTimeout(step, 400));
}
/* slide audio path: per slide, we look at slide.audio.prompt / .phoneme / etc.
   In this v0.1 the embedded card holds short ids; the compiler would replace
   them with base64 data URIs. We resolve to assets/Audio/{id}.mp3 with fallback. */
function audioFor(slide, key){
  if(!slide.audio || !slide.audio[key]) return null;
  return "assets/Audio/" + slide.audio[key] + "." + AUDIO_EXT;
}
/* audioText(slide,key): the exact Hindi line the VO for this slot speaks, so a
   popup can SHOW what it SAYS (shown == spoken). Looks up the build-injected
   CARD.assets.audio_text map by the slot's audio_id. null if unknown. */
function audioText(slide, key){
  const id = slide.audio && slide.audio[key];
  if(!id) return null;
  return (CARD.assets && CARD.assets.audio_text && CARD.assets.audio_text[id]) || null;
}
/* Play a SEQUENCE of audio sources back-to-back. Each one finishes (or
   falls back to silent beat if missing) before the next starts. */
function playChain(srcs, i, onDone){
  i = i || 0;
  if(i >= srcs.length){ if(onDone) onDone(); return; }
  play(srcs[i], () => playChain(srcs, i+1, onDone));
}
/* On slide mount, play prompt → phoneme/word_name → instruction in order.
   KG learners can't read prompt_hi — the chain gives them both the
   instruction AND the cue (letter sound or picture name) audibly.
   onDone fires after the whole chain finishes (used to gate the नav button). */
function autoPlayChain(slide, onDone){
  const order = ["prompt","phoneme","shape_name","word_name","instruction"];
  const chain = [];
  for(const k of order){
    const src = audioFor(slide, k);
    if(src) chain.push(src);
  }
  if(chain.length) playChain(chain, 0, onDone);
  else if(onDone) onDone();
}

/* nav button: enable/disable the kit-style pill. [ui: reference shell] it stays invisible until it turns active, then
   pops and pulses (CSS); the idle hand never points at it (the reference's QA rule: the hand only ever points at
   interactive tiles/objects, never at आगे / the play button). */
function setNavActive(on){
  const btn = $("navBtn");
  btn.disabled = !on;
  btn.classList.toggle("active", on);
  clearTimeout(state.navNudgeTimer);
  if(on) state.navNudgeTimer = setTimeout(nudgeNavBtn, 4500);
}
function nudgeNavBtn(){ return; }   // (kept: setNavActive schedules it and modules clear its timer)

/* ---------- 4. STATE ---------- */
const state = {
  idx: 0,
  slideStart: Date.now(),
  attempts: 0,
  audioReplays: 0,
  hintUsed: false,
  nudgeUsed: false,
  scaffoldLevel: 0,   // 0 none, 1 nudge, 2 hint, 3 reveal
  selectedKey: null,
  locked: false,
  hintActive: false,
  masteryHits: 0,
  masteryAttempts: 0,
  nudgeTimer: null
};

/* ---------- 5. NUDGE ----------
   target may be a CSS selector OR an element. Used ONLY for flow guidance
   (e.g. the "listen" button / prompt) — never to point at the correct answer. */
function startNudge(slide, target){
  clearTimeout(state.nudgeTimer);
  if(!target) return;
  const ms = (CARD.scaffold_rules.nudge_timeout_ms || {})[slide.phase];
  if(!ms) return;
  state.nudgeTimer = setTimeout(()=>{
    if(state.locked || state.hintActive) return;
    const el = (typeof target === "string") ? document.querySelector(target) : target;
    if(!el) return;
    if(!placeNudge(el)) return;
    state.nudgeUsed = true;
    state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
    SwiftPAL.emit("nudge_invoked", { slide_id: slide.id, phase: slide.phase });
  }, ms);
}
function stopNudge(){
  clearTimeout(state.nudgeTimer);
  $("nudgeHand").classList.remove("show");
}
/* [ui: reference shell] the nudge hand = the FLN kit's hand (assets/nudge_hand_new.svg in an 86x108 box, fingertip at
   34.2,15.8) with its tap ripple. It TOUCHES what it points at: the fingertip lands on the target's lower part, where a
   finger would press it, clamped inside the stage; a soft encouraging chime plays as it appears. */
const NH = { W:86, H:108, TIP_X:34.2, TIP_Y:15.8, GAP:8 };
function placeNudge(el){
  const nh = $("nudgeHand"), host = document.querySelector(".slide-stage");
  if(!el || !nh || !host || !el.getBoundingClientRect) return false;
  const r = el.getBoundingClientRect(), sw = host.getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  const w = r.width / scale, h = r.height / scale, cx = (r.left - sw.left) / scale + w / 2;
  const tipY = (r.top - sw.top) / scale + h - Math.min(h * 0.35, 26);
  const stageW = sw.width / scale, stageH = sw.height / scale;
  nh.style.left = Math.max(0, Math.min(stageW - NH.W, cx - NH.TIP_X)) + "px";
  nh.style.top = Math.max(0, Math.min(stageH - NH.H, tipY - NH.TIP_Y)) + "px";
  nh.style.clipPath = "";
  if(!nh.classList.contains("show")) sfxNudge();
  nh.classList.add("show");
  return true;
}
/* Show the hand-nudge immediately on a specific element (INTRO uses it to guide tapping each letter). */
function pointNudgeAt(el){ if(el) placeNudge(el); }

/* ---------- 7. HINT / FEEDBACK BOX ----------
   No button: the popup plays its VO, then auto-dismisses. onEnd runs after it
   closes (callers add a short pause there so the revealed answer shows). */
function showBox(emoji, text, theme, audioSrc, onEnd){
  // CORRECT: no popup (lead review) — confetti cannons from both sides + Swiftie cheer, then onEnd.
  if(theme === "correct"){
    sfxCorrect(); confettiCannon(); setSwMood("celebrate");
    play(audioSrc || null, ()=> setTimeout(()=>{ if(onEnd) onEnd(); }, 300));
    return;
  }
  state.hintActive = true;
  // wrong/hint/reveal keep a light card (mechanics use it for a short cue); Swiftie reacts too.
  // one-Swiftie rule: the popup shows the reacting Swiftie (animated), so HIDE the header buddy
  // while it's open — never two Swifties on screen at once (MoM flag).
  const swMap = { wrong:"sw_anim_tryagain", hint:"sw_anim_teach", reveal:"sw_anim_teach" };
  const sw = $("hintMascot");
  if(sw){ sw.style.display=""; sw.src = "assets/UI/" + (swMap[theme] || "sw_anim_talk") + ".gif"; }
  const buddy = $("swBuddy"); if(buddy) buddy.style.visibility = "hidden";
  setSwMood(theme === "wrong" ? "tryagain" : "hint");
  $("hintBox").classList.remove("celebrate");
  sfxWrongSoft();
  const ht = $("hintText"); ht.textContent = text; ht.className = "hint-text " + theme;
  $("stage").classList.add("blurred");
  $("hintOverlay").classList.add("show");
  $("hintBtn").disabled = true;
  const hi = $("hintImg"); if(hi) hi.src = "assets/UI/hint_active.png";
  const close = ()=>{
    $("hintOverlay").classList.remove("show");
    $("stage").classList.remove("blurred");
    if(buddy) buddy.style.visibility = "";   // header Swiftie returns when the popup closes
    state.hintActive = false;
    if(hi) hi.src = "assets/UI/hint.png";
    if(!state.locked) $("hintBtn").disabled = false;
    if(onEnd) onEnd();
  };
  // auto-dismiss after the VO finishes (small buffer so it never just flashes); freeze the popup
  // Swiftie's mouth to the still frame the instant its line ends
  play(audioSrc, ()=>{ if(sw) sw.src = "assets/UI/" + SW_REST + ".png"; setTimeout(close, 300); });
}

/* ---------- 8. TAP-OPTION HELPER (shared by 5 slide types) ---------- */
function mountTapOptions({slide, host, signalName, stimulus, options, isCorrect, optionRenderer, columnsHint, mastery, hintAction, nudgeTarget, shuffle}){
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.audioReplays = 0; state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0;
  // idle hand-nudge target: defaults to the stimulus (re-listen), but a slide can pass
  // nudgeTarget:null to suppress it entirely (e.g. "how many?" — nothing to re-tap).
  const _nudge = (nudgeTarget !== undefined) ? nudgeTarget : (stimulus || null);
  // optional custom hint (runs on the live slide instead of a text popup), e.g. a
  // count-demonstration. Wrapped to block option taps while it plays.
  const runHint = hintAction ? (after)=>{ state.hintActive = true; hintAction(()=>{ state.hintActive = false; if(after) after(); }); } : null;

  // Shuffle options once so the correct answer isn't pinned to one position (engine-wide anti
  // positional-bias — otherwise "always tap the same spot" can pass mastery). Opt out with
  // shuffle:false for inherently-ordered options (e.g. a number line).
  const _opts = (shuffle === false) ? options.slice()
    : (function(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; })(options);

  const wrap = document.createElement("div"); wrap.className = "q-row";
  if(stimulus){ wrap.appendChild(stimulus); }
  const grid = document.createElement("div");
  const cols = columnsHint || (_opts.length <= 2 ? 2 : _opts.length <= 3 ? 3 : 4);
  grid.className = "opt-grid cols-" + cols;
  _opts.forEach((opt, i) => {
    const cell = optionRenderer(opt, i);
    cell.classList.add("opt-cell");
    cell.dataset.key = String(i);
    cell.onclick = ()=>{
      if(state.locked || state.hintActive || cell.classList.contains("crossed") || cell.classList.contains("correct")) return;
      stopNudge();
      // SME rule: SPEAK THE TAPPED WORD on EVERY tap (right or wrong), then the feedback — never two
      // voices at once (buzz/confetti are sfx, they ride alongside the word). opt.audio = word clip id.
      // Fallback wiring for LETTER options (SME: the tapped item's own sound speaks EVERYWHERE): options
      // authored as {letter:"आ"} carry no audio id, but the slide's data.phonemes map has each letter's
      // clip — derive it here centrally so every TAP_LETTER_* / mastery module inherits speak-on-tap
      // without per-module or per-card changes. Explicit opt.audio always wins.
      const _aid = opt.audio ||
                   (opt.letter && slide.data && slide.data.phonemes && slide.data.phonemes[opt.letter]) || null;
      const _word = _aid ? ("assets/Audio/" + _aid + "." + AUDIO_EXT) : null;
      const _afterWord = (cb)=>{ if(_word) play(_word, cb); else cb(); };
      if(isCorrect(opt, i)){
        state.locked = true; cell.classList.add("correct"); sfxCorrect(); confettiCannon(); setSwMood("happy");
        if(mastery){ state.masteryAttempts++; if(state.attempts === 0) state.masteryHits++; }
        SwiftPAL.emit(signalName, { slide_id: slide.id, phase: slide.phase, value: true,
          first_try: state.attempts === 0, attempts: state.attempts + 1,
          scaffold_level: state.scaffoldLevel, latency_ms: Date.now()-state.slideStart });
        _afterWord(()=> setTimeout(()=> completeSlide(true), 700));   // speak the word → then advance (confetti is the reward)
      } else {
        state.attempts++; cell.classList.add("crossed"); sfxWrongSoft(); setSwMood("tryagain");
        // (do NOT count masteryAttempts here — the correct branch counts one attempt PER ITEM.)
        SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
        // LAYERED SCAFFOLD (A1): L1 re-listen → L2 hint → L3 REVEAL at max_attempts (never stuck).
        const _maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show");
        _afterWord(()=>{   // speak the tapped word FIRST, then the layered feedback VO (no overlap)
          if(state.attempts >= _maxA){ revealAnswer("wrong"); }
          else if(state.attempts >= 2){ state.scaffoldLevel = Math.max(state.scaffoldLevel, 2);
            if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); }
          else { state.scaffoldLevel = Math.max(state.scaffoldLevel, 1); play(audioFor(slide, "try_again") || null, ()=>{}); }
        });
      }
    };
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  host.appendChild(wrap);

  // ---- layered-hint helpers (A1/B2): reveal-on-max + a wired manual hint button ----
  function _correctCell(){ return [...grid.querySelectorAll(".opt-cell")].find(c => isCorrect(_opts[+c.dataset.key], +c.dataset.key)); }
  function revealAnswer(reason){
    if(state.locked) return; state.locked = true; state.scaffoldLevel = 3; setSwMood("hint");
    const el = _correctCell();
    [...grid.querySelectorAll(".opt-cell")].forEach(c => { if(c !== el) c.classList.add("faded"); });
    if(el) el.classList.add("correct", "reveal-pulse");
    SwiftPAL.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, reason });
    play(audioFor(slide, "reveal") || audioFor(slide, "correct") || audioFor(slide, "try_again") || null,
      ()=> setTimeout(()=> completeSlide(false), 800));
  }
  $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
    state.hintUsed = true; if(state.attempts < 1) state.attempts = 1;
    SwiftPAL.emit("hint_shown", { slide_id: slide.id, manual: true });
    if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); };

  startNudge(slide, _nudge);
  // Tap-to-answer standard (lead review): a WRONG tap = soft buzz + ✕ + that card LOCKS (can't re-tap);
  // a RIGHT tap = confetti cannons + Swiftie cheer, then auto-advance. No select-then-आगे for pick questions.
  $("navBtn").style.display = "none"; setNavActive(false);
}

/* ---------- 10. RENDER HELPERS ---------- */
/* Render a picture as the real PNG (assets/Images/<key>.png); if the file is
   missing it falls back to the emoji. Pass the image id (e.g. "pic_anaar"). */
function imgOrEmoji(imgKey, emoji, imgClass, emojiClass){
  if(imgKey){
    const fb = String(emoji||"❓").replace(/'/g,"");
    return `<img class="${imgClass}" src="assets/Images/${imgKey}.${IMG_EXT}" alt="" `+
      `onerror="var s=document.createElement('span');s.className='${emojiClass}';s.textContent='${fb}';this.replaceWith(s);">`;
  }
  return `<span class="${emojiClass}">${emoji||"❓"}</span>`;
}
function letterCell(letter){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="big-glyph ink-glyph">${letter}</span>`;
  return cell;
}
/* ordering/seriation render (MTKGA02_L02_S02): an object at a given magnitude. by="size" scales the
   picture uniformly; by="length" draws a content-true rounded bar of width∝mag; by="weight" shows the
   picture at a uniform size (weight is not visual — the child uses known heaviness / the balance cue). */
function imgOrEmojiSized(img, emoji, px){
  const fb = String(emoji||"❓").replace(/'/g,"");
  if(img) return `<img class="ord-obj-img" style="width:${px}px;height:${px}px" src="assets/Images/${img}.${IMG_EXT}" alt="" `+
    `onerror="var s=document.createElement('span');s.className='ord-obj-emoji';s.style.fontSize='${Math.round(px*0.82)}px';s.textContent='${fb}';this.replaceWith(s);">`;
  return `<span class="ord-obj-emoji" style="font-size:${Math.round(px*0.82)}px">${emoji||"❓"}</span>`;
}
function renderOrdObj(o, by){
  if(by === "length"){ const w = {1:130,2:210,3:300}[o.mag] || 200;
    return `<div class="ord-bar" style="width:${w}px;background:${o.color||"#F5A623"}"></div>`; }
  // size AND weight scale the picture by visual magnitude — so a BIG-but-LIGHT balloon looks big and
  // tempts the child (bigger=heavier misconception), while the small stone is the correct heaviest pick.
  const px = {1:80, 2:116, 3:154}[o.mag] || 116;
  return imgOrEmojiSized(o.img, o.emoji, px);
}
function pictureCell(picture, emoji, imgKey){
  const cell = document.createElement("div");
  cell.innerHTML = imgOrEmoji(imgKey, emoji, "pic-img", "pic-emoji") + `<span class="lbl">${picture||""}</span>`;
  return cell;
}
function stimulusLetter(letter){
  const el = document.createElement("div"); el.className = "stimulus-letter";
  el.innerHTML = `<span class="ink-glyph">${letter}</span>`;
  return el;
}
function stimulusPic(picture, emoji, imgKey){
  const el = document.createElement("div"); el.className = "stimulus-pic";
  el.innerHTML = imgOrEmoji(imgKey, emoji, "img", "emoji") + `<span class="lbl">${picture||""}</span>`;
  return el;
}
/* gender helpers: an option card showing a gender label (पुल्लिंग/स्त्रीलिंग),
   and a stimulus card showing the target gender label. */
function genderLabelCell(label, gender){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="gender-label${gender==="F"?" fem":""}">${label}</span>`;
  return cell;
}
function stimulusGender(label, gender){
  const el = document.createElement("div");
  el.className = "stimulus-gender" + (gender==="F"?" fem":"");
  el.textContent = label;
  return el;
}

/* shape helpers (maths): render circle/square/triangle/rectangle as inline SVG in
   any colour / size / rotation (LO: recognise regardless of orientation or size).
   No image assets needed — shapes are pure geometry, so the sample renders offline. */
function shapeSVG(shape, opts){
  opts = opts || {};
  const color = opts.color || "#386AF6";
  const size  = opts.size  || 120;
  const rot   = opts.rotate || 0;
  let inner = "";
  if(shape === "circle")         inner = `<circle cx="50" cy="50" r="42" fill="${color}"/>`;
  else if(shape === "square")    inner = `<rect x="12" y="12" width="76" height="76" rx="0" fill="${color}"/>`;   // TRUE corners — teachable geometry is never rounded
  else if(shape === "triangle")  inner = `<polygon points="50,9 91,89 9,89" fill="${color}"/>`;
  else if(shape === "rectangle") inner = `<rect x="6" y="28" width="88" height="44" rx="0" fill="${color}"/>`;    // TRUE corners
  const g = rot ? `<g transform="rotate(${rot} 50 50)">${inner}</g>` : inner;
  return `<svg class="shape-svg" viewBox="0 0 100 100" width="${size}" height="${size}" `+
         `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
}
function shapeCell(o){
  const cell = document.createElement("div");
  cell.innerHTML = shapeSVG(o.shape, {color:o.color, size:130, rotate:o.rotate});
  return cell;
}
function stimulusShape(o){
  const el = document.createElement("div"); el.className = "stimulus-shape";
  el.innerHTML = shapeSVG(o.shape, {color:o.color, size:150, rotate:o.rotate});
  return el;
}

/* counting helpers (maths): a numeral option card (big numeral + small number word),
   and a stimulus box showing a set of `count` identical objects to be counted. */
function numberCell(numeral, word){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="num-glyph">${numeral}</span>` + (word ? `<span class="num-word">${word}</span>` : "");
  return cell;
}
/* VISUAL-FIRST quantity: a HAND showing n fingers up (assets/UI/hand_1..5) — pre-reader,
   NO number-word text. Falls back to the numeral only if n is outside 1..5 or the art is missing. */
function fingerCount(n, cls){ cls = cls || "finger-hand";
  if(!(n>=1 && n<=5)) return `<span class="num-glyph">${n}</span>`;
  return `<img class="${cls}" src="assets/UI/hand_${n}.png" alt="" ` +
    `onerror="var s=document.createElement('span');s.className='num-glyph';s.textContent='${n}';this.replaceWith(s);">`;
}
function fingerCell(n){ const c = document.createElement("div"); c.innerHTML = fingerCount(n, "opt-hand"); return c; }
/* DISPLAY numeral: ALWAYS Arabic (1 2 3) on screen — kids learn the universal digit.
   Spoken VO stays Hindi (एक/दो/तीन) via the separate vo_num_/vo_total_ audio files. */
function devNumeral(n){ return String(n); }
/* DUAL-CODED counting option: the Devanagari NUMERAL the child is learning, big and on top,
   with a smaller finger-hand beneath it as a visual anchor. The point of counting is to learn the
   NUMBER SYMBOL, not just read a hand-sign — so the numeral leads and the hand supports. Falls back
   to the numeral alone if the hand art (1..5) is missing. */
function numFingerCell(n){
  // outer div BECOMES the .opt-cell (mountTapOptions adds that class), so the stack lives in an
  // INNER .numfinger wrapper — otherwise ".opt-cell .numfinger x" selectors wouldn't match.
  const c = document.createElement("div");
  // hand art exists only for 1..5; beyond that fingerCount would fall back to a SECOND numeral
  // (numeral shown twice — hit when the counting range grew to 10), so skip the hand entirely.
  c.innerHTML = `<div class="numfinger"><span class="num-glyph">${devNumeral(n)}</span>${(n>=1&&n<=5) ? fingerCount(n, "nf-hand") : ""}</div>`;
  return c;
}
function stimulusCountSet(count, obj, scatter, perRow){
  // counts >10 render DENSE (smaller objects, wrapping); perRow groups the set in rows of exactly
  // N (the curriculum's "rows of 5/10" organisation for sets up to 20 — MTKGA01_L01_S04).
  const dense = count > 10 || !!perRow;
  const el = document.createElement("div"); el.className = "count-set" + (scatter ? " scattered" : "") + (dense ? " dense" : "");
  if(perRow && !scatter){ el.style.display = "grid"; el.style.gridTemplateColumns = `repeat(${perRow}, auto)`; }
  for(let i=0;i<count;i++){
    const c = document.createElement("span"); c.className = "cobj";
    // SCATTERED arrangement (SME/misconception: "total changes when objects are scattered") —
    // deterministic per-index jitter (stable across mounts/captures), never so large items overlap-hide.
    if(scatter) c.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
    c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
    el.appendChild(c);
  }
  return el;
}
/* SME (S01 review deck): outside the tutorial, numeral options show the NUMBER ONLY, larger —
   no finger-hand support (fingers are a TEACHING aid, not a test aid). */
function bigNumCell(n){
  const c = document.createElement("div");
  c.innerHTML = `<span class="bignum-glyph">${devNumeral(n)}</span>`;
  return c;
}
/* COMPARE_SETS helpers (one-to-one matching → ज़्यादा / कम / बराबर).
   Two left-aligned rows (columns line up), a dashed connector drawn top[i]↔bottom[i]
   for each matched pair, and the unmatched leftover item(s) in the longer row glow —
   that glow IS the "which has more" proof. Offsets (not getBoundingClientRect) so it
   works even when the preview tab is throttled. */
function cmpObj(obj){
  const c = document.createElement("span"); c.className = "cobj";
  c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
  return c;
}
function stimulusCompareSets(data){
  const nA = data.a_count, nB = data.b_count, A = data.a_object, B = data.b_object;
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.createElement("div"); stage.className = "compare-stage";
  const rowA = document.createElement("div"); rowA.className = "cmp-row top";
  const rowB = document.createElement("div"); rowB.className = "cmp-row bot";
  const svg  = document.createElementNS(NS, "svg"); svg.setAttribute("class", "cmp-lines");
  for(let i=0;i<nA;i++) rowA.appendChild(cmpObj(A));
  for(let i=0;i<nB;i++) rowB.appendChild(cmpObj(B));
  stage.appendChild(rowA); stage.appendChild(svg); stage.appendChild(rowB);
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "cmp-match-btn";
  btn.textContent = "🔗 मिलाओ"; stage.appendChild(btn);
  const min = Math.min(nA, nB);
  let drawn = false;
  function draw(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const IA = [...rowA.children], IB = [...rowB.children];
    const y1 = rowA.offsetTop + rowA.offsetHeight - 4;
    const y2 = rowB.offsetTop + 4;
    for(let i=0;i<min;i++){
      const x = IA[i].offsetLeft + IA[i].offsetWidth/2;
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", x); ln.setAttribute("y1", y1);
      ln.setAttribute("x2", x); ln.setAttribute("y2", y2);
      ln.setAttribute("class", "cmp-line"); svg.appendChild(ln);
      setTimeout(()=> ln.classList.add("show"), 130*i);
    }
    const longer = nA > nB ? IA : nB > nA ? IB : null;   // null when equal (nothing left over)
    if(longer) for(let i=min;i<longer.length;i++)
      setTimeout(()=> longer[i].classList.add("leftover"), 130*min + 160);
  }
  // reveal the matching (child taps मिलाओ, or the hint/tutorial calls this). cb fires after it settles.
  stage._revealMatches = (cb)=>{ if(!drawn){ drawn = true; btn.disabled = true; draw(); }
    if(cb) setTimeout(cb, 130*min + 800); };
  btn.onclick = ()=> stage._revealMatches();
  if(data.show_matches){ btn.style.display = "none"; setTimeout(()=> stage._revealMatches(), 420); }
  return stage;
}
/* HINT for "how many": instead of a text popup, COUNT the set FOR the child —
   highlight each object left→right, say एक/दो/तीन, show the numeral on top of it.
   The child sees + hears the count modelled, then answers from the options. */
function demoCount(items, numerals, onDone){
  numerals = numerals || [];
  const clear = ()=> items.forEach(o=>{ o.classList.remove("counting"); const c=o.querySelector(".count-callout"); if(c) c.remove(); });
  clear();
  let i = 0;
  (function step(){
    if(i >= items.length){                       // last count landed → clear, then continue
      setTimeout(()=>{ clear(); if(onDone) onDone(); }, 1000);
      return;
    }
    const o = items[i];
    o.classList.add("counting");
    let cal = o.querySelector(".count-callout");
    if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
    cal.textContent = String(i+1);   // Arabic count callout; Hindi number-word is spoken separately
    play("assets/Audio/vo_num_" + (i+1) + "." + AUDIO_EXT, ()=>{ i++; setTimeout(step, 320); });
  })();
}
function demoCountSet(setEl, count, numerals, onDone){   // count the "how many?" stimulus set
  demoCount([...setEl.querySelectorAll(".cobj")].slice(0, count), numerals, onDone);
}

/* ---------- 10b. DEVANAGARI GLYPH INK-CENTERING ----------
   Devanagari glyphs carry matras above (ओ, औ, अं) and below (ऋ) the shirorekha,
   so plain flex `align-items:center` leaves them sitting high with a gap below —
   and the offset differs per glyph. Measure each glyph's real ink box (canvas
   actualBoundingBox) + its baseline in the DOM, then translateY so the INK is
   truly centred in its tile/box. Font-agnostic; recomputed on mount + fonts.ready. */
let _inkCtx = null;
function centerInkGlyph(span){
  if(!span || !span.parentElement) return;
  const glyph = (span.textContent || "").trim();
  if(!glyph) return;
  const box = span.parentElement;
  const cs = getComputedStyle(span);
  const fpx = parseFloat(cs.fontSize);
  if(!fpx) return;
  _inkCtx = _inkCtx || document.createElement("canvas").getContext("2d");
  _inkCtx.font = `${cs.fontWeight} ${fpx}px ${cs.fontFamily}`;
  const m = _inkCtx.measureText(glyph);
  const a = m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
  if(!isFinite(a) || !isFinite(d)) return;
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  span.style.transform = "";   // reset before measuring baseline
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
  span.appendChild(probe);
  const baseScreen = probe.getBoundingClientRect().top;
  span.removeChild(probe);
  const br = box.getBoundingClientRect();
  if(br.height < 5) return;    // not laid out yet
  const boxCenter = br.top + br.height/2;
  const inkCenter = baseScreen + ((d - a)/2) * scale;   // screen px
  const dy = (boxCenter - inkCenter) / scale;           // css px to move glyph down
  span.style.transform = `translateY(${dy}px)`;
}
function centerAllGlyphs(root){
  (root || document).querySelectorAll(".ink-glyph").forEach(centerInkGlyph);
}

/* ---------- 11. DRAG-DROP PRIMITIVE ---------- */
function makeDraggable(tileEl, onDrop){
  let startX=0, startY=0, dx=0, dy=0, dragging=false;
  let scale = 1;
  const refScale = ()=> scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  function onDown(e){
    if(tileEl.classList.contains("snapped") || tileEl.classList.contains("matched")) return;
    refScale();
    dragging = true;
    // bind move/up on the document ONLY while dragging (removed in onUp) — otherwise every tile leaves
    // stale document listeners that pile up across the 11 drag slides.
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, {passive:false});
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    dx = 0; dy = 0;
    tileEl.classList.add("dragging");
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    dx = (p.clientX - startX) / scale; dy = (p.clientY - startY) / scale;
    tileEl.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
    // highlight zone under — hide the tile from hit-testing so the dragged tile
    // (z-index 50, now covering the zone) doesn't mask the zone beneath it.
    const cx = p.clientX, cy = p.clientY;
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(cx, cy);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    if(zone && !zone.classList.contains("filled")) zone.classList.add("hover");
    e.preventDefault();
  }
  function onUp(e){
    if(!dragging) return;
    dragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup", onUp);
    document.removeEventListener("touchend", onUp);
    tileEl.classList.remove("dragging");
    const p = e.changedTouches ? e.changedTouches[0] : e;
    // hide the tile from hit-testing so we detect the zone underneath it
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(p.clientX, p.clientY);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    if(zone && !zone.classList.contains("filled")){
      // snap
      tileEl.style.transform = "";
      onDrop(zone, tileEl);
    } else {
      tileEl.style.transform = "";
    }
  }
  tileEl.addEventListener("mousedown", onDown);
  tileEl.addEventListener("touchstart", onDown, {passive:false});
}
/* shared wrong-drop response for drag/sort/sequence modules: soft buzz + Swiftie try-again pose + the
   authored spoken "try_again". Pre-readers need the SPOKEN recovery, not just the visual spring-back. */
function dragWrong(slide){ sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide, "try_again") || null, ()=>{}); }

/* shared SUCCESS response — the engine-wide answer-feedback standard (lead-confirmed): side confetti
   cannons + rising sfx + Swiftie celebrates + the authored "correct" VO, then AUTO-ADVANCE. Never a
   celebration popup, never a "press आगे to continue" gate on a solved activity. `revealed` = the child
   got there via the reveal scaffold → quieter settle (no confetti/cheer) + completeSlide(false) so
   mastery telemetry stays honest. */
function celebrateThenAdvance(slide, revealed){
  if(revealed){ play(audioFor(slide, "reveal") || null, ()=>{}); setTimeout(()=> completeSlide(false), 1400); return; }
  sfxCorrect(); confettiCannon(); setSwMood("celebrate");
  play(audioFor(slide, "correct") || null, ()=>{});
  setTimeout(()=> completeSlide(true), 1400);
}

/* ---------- 12. SLIDE MODULES ---------- */
const SlideModules = {
  INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const letters = slide.data.letters;
      const tapped = new Set();
      const tiles = [];
      // [16f] Size tiles to the REAL container: the r4 tut-card frame is ~990px inside (the old
      // math assumed 1220 + a -100px breakout and punched 10-card strips through the frame borders
      // — user-caught live on MTKGA01_L02_S01 s00; same root as the HIKGH04_P2 letter row).
      // Fit one row at MAXW=960; if tiles would drop below the 110px touch floor, WRAP into two
      // balanced rows (numerals 0-9 → fives-structure 0-4 / 5-9) sized to the wider row.
      const GAP = 20, MAXW = 960, n = letters.length;
      let rowsOf;
      let tSize = Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n));
      if (tSize >= 110) { rowsOf = [n]; }
      else {
        const top = Math.ceil(n/2), bot = n - top;
        tSize = Math.min(184, Math.floor((MAXW - (top-1)*GAP) / top));
        rowsOf = [top, bot];
      }
      const tFont = Math.round(tSize * 0.565);
      const rowEls = rowsOf.map(() => {
        const r = document.createElement("div"); r.className = "intro-letters";
        r.style.gap = GAP + "px"; return r;
      });
      const rowFor = i => (rowsOf.length === 1 || i < rowsOf[0]) ? rowEls[0] : rowEls[1];
      // hand-nudge points at the first letter not yet tapped — guides every box
      function nudgeNext(){
        for(let i=0;i<letters.length;i++){
          if(!tapped.has(letters[i])){ pointNudgeAt(tiles[i]); return; }
        }
        stopNudge();
      }
      letters.forEach((L, i) => {
        const tile = document.createElement("div"); tile.className = "intro-letter";
        tile.style.width = tile.style.height = tSize + "px";
        tile.style.fontSize = tFont + "px";
        tile.innerHTML = `<span class="ink-glyph">${L}</span>`;
        tile.onclick = ()=>{
          if(slide.data.auto) return;   // [16h] Phase-1 autonomous mode: the demo plays itself
          tile.classList.add("played");
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          play(phon ? "assets/Audio/" + phon + "." + AUDIO_EXT : null);
          SwiftPAL.emit("intro_letter_tap", { slide_id: slide.id, letter: L });
          tapped.add(L);
          // नav unlocks only after EVERY letter has been heard
          if(tapped.size >= letters.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        rowFor(i).appendChild(tile); tiles.push(tile);
      });
      rowEls.forEach(r => wrap.appendChild(r));
      host.appendChild(wrap);

      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= letters.length) completeSlide(true); };
      nudgeNext();
      // [16h] Phase-1 autonomous mode (lead's 3-phase contract): tiles highlight + speak one by
      // one BY THEMSELVES; the child watches/listens. आगे unlocks after the last one.
      if(slide.data.auto){
        stopNudge(); state.ownsAudio = true;
        let ai = 0;
        const aStep = ()=>{
          if(CARD.slides[state.idx] !== slide) return;
          if(ai >= letters.length){ stopNudge(); $("navBtn").onclick = ()=> completeSlide(true); setNavActive(true); return; }
          const L = letters[ai], tile = tiles[ai];
          tile.classList.add("played"); pointNudgeAt(tile);
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          ai++;
          play(phon ? "assets/Audio/" + phon + "." + AUDIO_EXT : null, ()=> setTimeout(aStep, 380));
        };
        play(audioFor(slide, "prompt") || null, ()=> setTimeout(aStep, 500));
      }   // start by guiding the first letter
    }
  },

  MEET_LETTER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      if(slide.data.pair){
        const pair = document.createElement("div"); pair.className = "meet-pair";
        slide.data.pair.forEach(p => {
          const item = document.createElement("div"); item.className = "meet-pair-item";
          item.innerHTML = `
            <div class="meet-letter-box"><span class="glyph ink-glyph">${p.letter}</span></div>
            <div class="meet-arrow">→</div>
            <div class="meet-pic-box">
              ${imgOrEmoji(p.picture_img, p.picture_emoji, "pic-img", "pic-emoji")}
              <span class="pic-label">${p.word_hi}</span>
            </div>`;
          pair.appendChild(item);
        });
        wrap.appendChild(pair);
      } else {
        wrap.innerHTML = `
          <div class="meet-letter-box"><span class="glyph ink-glyph">${slide.data.letter}</span></div>
          <div class="meet-arrow">→</div>
          <div class="meet-pic-box">
            ${imgOrEmoji(slide.data.picture_img, slide.data.picture_emoji, "pic-img", "pic-emoji")}
            <span class="pic-label">${slide.data.word_hi}</span>
          </div>`;
      }
      host.appendChild(wrap);
      // नav unlocks only after the VO has played once (students can't skip the model)
      state.gateNavUntilAudio = true;
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  /* ===== SHAPES (maths) — reuse the same scaffold/nudge/feedback as letters ===== */
  SHAPE_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const row  = document.createElement("div"); row.className = "intro-shapes";
      const shapes = slide.data.shapes; const tapped = new Set(); const tiles = [];
      const GAP = 28, MAXW = 1220, n = shapes.length;
      const tSize = Math.max(120, Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n)));
      row.style.gap = GAP + "px";
      function nudgeNext(){
        for(let i=0;i<shapes.length;i++){ if(!tapped.has(i)){ pointNudgeAt(tiles[i]); return; } }
        stopNudge();
      }
      shapes.forEach((sh, i) => {
        const tile = document.createElement("div"); tile.className = "intro-shape";
        tile.style.width = tile.style.height = tSize + "px";
        // name label (revealed on tap — child hears the name AND sees it on top of the shape)
        tile.innerHTML = `<span class="shape-name">${sh.name || ""}</span>` +
                         shapeSVG(sh.shape, {color: sh.color, size: Math.round(tSize*0.62), rotate: sh.rotate});
        tile.onclick = ()=>{
          tile.classList.add("played");
          play(sh.name_audio ? "assets/Audio/" + sh.name_audio + "." + AUDIO_EXT : null);
          SwiftPAL.emit("intro_shape_tap", { slide_id: slide.id, shape: sh.shape });
          tapped.add(i);
          if(tapped.size >= shapes.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        row.appendChild(tile); tiles.push(tile);
      });
      wrap.appendChild(row); host.appendChild(wrap);
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= shapes.length) completeSlide(true); };
      nudgeNext();
    }
  },

  MEET_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      wrap.innerHTML = `
        <div class="meet-shape-box">
          ${shapeSVG(slide.data.shape, {color: slide.data.color, size: 190, rotate: slide.data.rotate})}
          <span class="label">${slide.data.name}</span>
        </div>
        <div class="meet-arrow">→</div>
        <div class="meet-pic-box">
          ${imgOrEmoji(slide.data.object_img, slide.data.object_emoji, "pic-img", "pic-emoji")}
          <span class="pic-label">${slide.data.object_hi}</span>
        </div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  TAP_SHAPE_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_name_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor = "pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_SHAPE_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_env_first_try",
        stimulus: stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_PICTURE_BY_SHAPE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_object_first_try",
        stimulus: stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate}),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img)
      });
    }
  },

  SORT_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage shape-sort";
      const binsRow = document.createElement("div");
      binsRow.className = "sort-bins" + (slide.data.bins.length >= 4 ? " many" : "");
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone";            // dd-zone → drop detection
        bin.dataset.shape = b.shape;
        // header (faint reference shape + label) INSIDE the box, then a clear drop area
        bin.innerHTML = `<div class="bin-head-row"><span class="bin-ref">${shapeSVG(b.shape, {color:"#AEB9CC", size:34})}</span><span class="bin-title">${b.label}</span></div>`+
          `<div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item"; t.dataset.shape = it.shape;
        t.innerHTML = shapeSVG(it.shape, {color: it.color, size: 70, rotate: it.rotate});
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.shape === t.dataset.shape){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            SwiftPAL.emit("shape_sort_item", { slide_id: slide.id, shape: t.dataset.shape, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              SwiftPAL.emit("shape_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  /* ===== COUNTING (maths) — OTO tap-count, cardinality, meet-number, make-set ===== */
  COUNT_TAP: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "count-stage";
      const row  = document.createElement("div"); row.className = "count-row";
      const N = slide.data.count, obj = slide.data.object, nums = slide.data.numerals || [];
      // large sets (S04, up to 20): smaller tiles + optional rows-of-N grouping (curriculum: rows of 5/10)
      if(N > 10 || slide.data.per_row) row.classList.add("dense");
      if(slide.data.per_row){ row.style.display = "grid"; row.style.gridTemplateColumns = `repeat(${slide.data.per_row}, auto)`; }
      const items = []; let c = 0;
      for(let i=0;i<N;i++){
        const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      wrap.appendChild(row); host.appendChild(wrap);

      function nudgeNext(){ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); }
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted")) return;   // one-to-one: never double-count
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);   // Arabic running count; Hindi word spoken separately
          SwiftPAL.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            SwiftPAL.emit("count_oto_complete", { slide_id: slide.id, phase: slide.phase,
              total: N, value: true, latency_ms: Date.now()-state.slideStart });
            // say the LAST number, then the total; enable आगे ONLY after "कुल N" finishes
            play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)), 300));
          } else {
            play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT);    // one number word per touch
            nudgeNext();
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(c >= N) completeSlide(true); };
      nudgeNext();
    }
  },

  CONSERVE_COUNT: {
    // MTKGA01_L01_S03 "the LAST counted number IS the total" + its core misconception ("the total
    // changes when objects move"). One slide, two beats: (A) the child tap-counts the set one-to-one
    // (badges + spoken एक/दो/…, ending "कुल N" — the freeze-the-final-number teach), then (B) the SAME
    // objects visibly MOVE to scattered spots (badges clear), the move line asks "अब कितनी हैं?" and
    // numeral options appear — correct is the SAME N; options include N±1 (the moved-so-changed error).
    // data:{count, object, numerals, options:[{value,audio}]} · audio:{prompt, move, try_again, hint, reveal}.
    // GENERALISED count-then-pick engine (S03 conservation + S02's tap-count items). One slide:
    // tap-count the set one-to-one (badges + spoken एक/दो/… → frozen "कुल N"), then numeral options.
    // data: {count, object, options, arrange?("row"|"scatter"|"circle"|"two_groups"), groups?[a,b],
    //        move?(default true = objects drift after counting; false = count-then-pick, no drift)}.
    // move:false emits cardinality_first_try; move:true emits conserve_count_first_try.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object;
      const arrange = d.arrange || "row";
      const doMove  = d.move !== false;
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage conserve";
      const row  = document.createElement("div"); row.className = "count-row arr-" + arrange + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      const mkItem = ()=>{ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        items.push(it); return it; };
      if(arrange === "two_groups"){
        const g = d.groups || [Math.ceil(N/2), Math.floor(N/2)];
        g.forEach((gn, gi)=>{ const cl = document.createElement("div"); cl.className = "count-cluster";
          for(let i=0;i<gn;i++) cl.appendChild(mkItem()); row.appendChild(cl);
          if(gi === 0){ const plus = document.createElement("div"); plus.className = "count-plus"; plus.textContent = "और"; row.appendChild(plus); } });
      } else if(arrange === "circle"){
        for(let i=0;i<N;i++){ const it = mkItem(); const a = -Math.PI/2 + i*2*Math.PI/N, R = N > 6 ? 176 : 140;
          it.style.position = "absolute";
          it.style.left = `calc(50% + ${Math.round(Math.cos(a)*R)}px)`;
          it.style.top  = `calc(50% + ${Math.round(Math.sin(a)*R)}px)`;
          it.style.marginLeft = "-48px"; it.style.marginTop = "-48px"; row.appendChild(it); }
      } else {
        for(let i=0;i<N;i++){ const it = mkItem();
          if(arrange === "scatter") it.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
          row.appendChild(it); }
      }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{
        mountTapOptions({
          slide, host, signalName: doMove ? "conserve_count_first_try" : "cardinality_first_try",
          stimulus: null, nudgeTarget: null,
          options: d.options,
          columnsHint: Math.min(d.options.length, 5),
          isCorrect: (opt) => opt.value === N,
          optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
          mastery: slide.phase === "mastery"
        });
      };
      const afterCount = ()=>{
        if(doMove){
          items.forEach((it,i)=>{ const keep = slide.phase === "tutorial" &&
              it.querySelector(".count-badge").textContent === String(N);
            if(!keep) it.querySelector(".count-badge").textContent = "";
            it.classList.add("moved");
            it.style.transform = `translate(${((i*53)%81)-40}px, ${((i*37)%61)-30}px) rotate(${((i*29)%25)-12}deg)`; });
          sfxTap();
          setTimeout(()=>{ play(audioFor(slide, "move") || null, ()=>{}); askOptions(); }, 950);
        } else {
          play(audioFor(slide, "ask") || null, ()=>{}); askOptions();
        }
      };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted") || it.classList.contains("moved")) return;   // one-to-one; inert once moved
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);
          SwiftPAL.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(afterCount, 450)), 300));
          } else {
            play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT);
            nudgeNext();
          }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? (doMove ? "move" : "ask") : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_ACTION: {
    // S02 themed tap-count: tap each object and it ENACTS to a target while counting — pop (balloon
    // vanishes), feed (flies to the monster's mouth), or basket (drops into the basket). After the last
    // one the frozen "कुल N" plays and numeral options appear. data:{count, object, options, theme
    // ("pop"|"feed"|"basket")}. audio:{prompt, ask, try_again, hint, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, theme = d.theme || "pop";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage act act-" + theme;
      let target = null;
      if(theme === "feed"){ target = document.createElement("div"); target.className = "act-target act-monster"; target.textContent = "👹"; wrap.appendChild(target); }
      if(theme === "basket"){ target = document.createElement("div"); target.className = "act-target act-basket";
        target.innerHTML = imgOrEmoji("obj_basket", "🧺", "act-basket-img", "act-basket-emoji"); wrap.appendChild(target); }
      const row = document.createElement("div"); row.className = "count-row act-row" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item act-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it); }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("done")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{ mountTapOptions({
        slide, host, signalName: "cardinality_first_try", stimulus: null, nudgeTarget: null,
        options: d.options, columnsHint: Math.min(d.options.length, 5),
        isCorrect: (opt) => opt.value === N,
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery" }); };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("done")) return;
          c++; it.classList.add("done", "act-go");   // act-go = fly/pop animation (theme-scoped CSS)
          it.querySelector(".count-badge").textContent = String(c);
          if(theme === "feed" && target) target.classList.add("chomp");
          sfxTap();
          SwiftPAL.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=>{
                play(audioFor(slide, "ask") || null, ()=>{}); askOptions(); }, 450)), 300));
          } else { play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT); nudgeNext(); }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_DRAG_MATCH: {
    // S02 drag items. mode "num_to_box": count the set, then DRAG the correct NUMBER CARD into the
    // answer box (#2, #9). mode "obj_to_num": count, then DRAG the object onto the correct NUMBER (#11).
    // data:{count, object, options:[{value}], mode}. audio:{prompt, ask, try_again, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, mode = d.mode || "num_to_box";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage dragmatch";
      const setRow = document.createElement("div"); setRow.className = "count-row show-set" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        setRow.appendChild(it); items.push(it); }
      wrap.appendChild(setRow);
      const dz = document.createElement("div"); dz.className = "cdm-zone";   // built after counting
      const tray = document.createElement("div"); tray.className = "cdm-tray";
      wrap.appendChild(dz); wrap.appendChild(tray); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const settleWin = (revealed)=>{ state.locked = true;
        SwiftPAL.emit("cardinality_first_try", { slide_id: slide.id, phase: slide.phase, value: !revealed, latency_ms: Date.now()-state.slideStart });
        celebrateThenAdvance(slide, revealed); };
      const buildDrag = ()=>{
        // shuffle the numeral options
        const opts = d.options.slice(); for(let i=opts.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]]; }
        if(mode === "obj_to_num"){
          // number cards are the DROP ZONES; a single draggable object-chip is the tile
          dz.className = "cdm-numrow";
          opts.forEach(o=>{ const z = document.createElement("div"); z.className = "cdm-numzone dd-zone"; z.dataset.val = String(o.value);
            z.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; dz.appendChild(z); });
          const tile = document.createElement("div"); tile.className = "cdm-objtile";
          tile.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(tile);
          makeDraggable(tile, (zone)=>{ if(state.locked || !zone) return;
            if(parseInt(zone.dataset.val,10) === N){ zone.classList.add("filled","correct"); tile.classList.add("snapped"); settleWin(false); }
            else { zone.classList.add("wrong"); setTimeout(()=>zone.classList.remove("wrong"),500); dragWrong(slide);
              state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ const zc=[...dz.children].find(z=>parseInt(z.dataset.val,10)===N); if(zc){zc.classList.add("filled","correct","reveal-glow"); tile.classList.add("snapped"); play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true);} } }
          });
        } else {
          // one BOX is the drop zone; number cards are the draggable tiles
          dz.className = "cdm-box dd-zone"; dz.innerHTML = `<span class="cdm-box-q">?</span>`;
          opts.forEach(o=>{ const tile = document.createElement("div"); tile.className = "cdm-card"; tile.dataset.val = String(o.value);
            tile.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; tray.appendChild(tile);
            makeDraggable(tile, (zone)=>{ if(state.locked || zone !== dz) return;
              if(o.value === N){ dz.classList.add("filled","correct"); dz.innerHTML = `<span class="bignum-glyph">${devNumeral(N)}</span>`; tile.classList.add("snapped"); settleWin(false); }
              else { dz.classList.add("wrong"); setTimeout(()=>dz.classList.remove("wrong"),500); dragWrong(slide);
                state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ dz.classList.add("filled","correct","reveal-glow"); dz.innerHTML=`<span class="bignum-glyph">${devNumeral(N)}</span>`; play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true); } }
            });
          });
        }
        play(audioFor(slide, "ask") || null, ()=>{});
      };
      items.forEach(it => { it.onclick = ()=>{ if(it.classList.contains("counted")) return;
        c++; it.classList.add("counted"); it.querySelector(".count-badge").textContent = String(c);
        SwiftPAL.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
        if(c >= N){ stopNudge(); play("assets/Audio/vo_num_"+c+"."+AUDIO_EXT, ()=> setTimeout(()=>
          play("assets/Audio/vo_total_"+N+"."+AUDIO_EXT, ()=> setTimeout(buildDrag, 450)), 300)); }
        else { play("assets/Audio/vo_num_"+c+"."+AUDIO_EXT); nudgeNext(); }
      }; });
      state.attempts = 0; state.locked = false;
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  DEMO_COUNT: {
    // [16h] PHASE-1 AUTONOMOUS TEACH (the lead's 3-phase contract, 2026-07-17): the game counts
    // BY ITSELF — KG children who cannot count yet WATCH the counting happen. All N objects are
    // visible; the demo hand moves to each in turn; a BIG running count above updates 1..N with
    // vo_num_N per touch; then the conclusion line plays ("ये पाँच सेब हैं!") and आगे unlocks.
    // NO required interaction, NO options — never a test. Zero (N=0): empty tray, straight to the
    // conclusion ("यहाँ कुछ नहीं — शून्य!"). data:{count, object} audio:{prompt?, conclude}
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const wrap = document.createElement("div"); wrap.className = "demo-stage";
      const counter = document.createElement("div"); counter.className = "demo-count";
      counter.textContent = N === 0 ? "0" : "";
      const row = document.createElement("div"); row.className = "count-row demo-row" + (N > 8 && !d.per_row ? " dense" : "");
      if(d.per_row){ row.classList.add("perrow"); row.style.gridTemplateColumns = `repeat(${d.per_row}, auto)`; }
      const items = [];
      for(let k = 0; k < N; k++){
        const it = document.createElement("div"); it.className = "count-item demo-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      if(N === 0){ row.classList.add("demo-empty"); }
      wrap.appendChild(counter); wrap.appendChild(row); host.appendChild(wrap);
      let i = 0;
      const conclude = ()=>{ stopNudge();
        play(audioFor(slide, "conclude") || null, ()=> setNavActive(true)); };
      const step = ()=>{
        if(state.idx !== undefined && CARD.slides[state.idx] !== slide) return;   // slide changed — stop
        if(i >= N){ setTimeout(conclude, 400); return; }
        const it = items[i];
        it.classList.add("counted", "demo-hit");
        it.querySelector(".count-badge").textContent = String(i + 1);
        counter.textContent = String(i + 1);
        counter.classList.remove("demo-pop"); void counter.offsetWidth; counter.classList.add("demo-pop");
        pointNudgeAt(it);
        i++;
        play("assets/Audio/vo_num_" + i + "." + AUDIO_EXT, ()=> setTimeout(step, 420));
      };
      play(audioFor(slide, "prompt") || null, ()=> setTimeout(step, 500));
      state.replayAudio = ()=> play(audioFor(slide, i >= N ? "conclude" : "prompt") || null, ()=>{});
    }
  },

  MEET_NUMBER: {
    mount(host, slide){
      if(slide.data && slide.data.present === "crane"){ return btCraneMeet(host, slide); }   // Block Town teach
      const wrap = document.createElement("div"); wrap.className = "meet-stage number-meet";
      const n = slide.data.count;
      // [16d] dual-code the numeral: hands for 1..5; for bigger numbers (teens) the Hindi number WORD.
      // Never the numeral twice — fingerCount's out-of-range fallback IS the numeral, which rendered
      // the "12 over 12" teach card the SME flagged on MTKGA01_L01_S04.
      const word = (slide.data.numerals || [])[n-1] || "";
      const second = (n>=1 && n<=5) ? fingerCount(n,'meet-hand') : (word ? `<span class="num-word">${word}</span>` : "");
      wrap.innerHTML = `
        <div class="meet-number-box"><span class="num-glyph">${n}</span>${second}</div>
        <div class="meet-arrow">→</div>`;
      // [16d] the teach set honors data.per_row (rows of 10 → a teen visibly reads as ten-and-ones)
      const setEl = stimulusCountSet(n, slide.data.object, false, slide.data.per_row);
      setEl.classList.add("meet-set");
      wrap.appendChild(setEl);
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  COUNT_HOW_MANY: {
    mount(host, slide){
      const setEl = stimulusCountSet(slide.data.count, slide.data.object, slide.data.scatter, slide.data.per_row);
      mountTapOptions({
        slide, host, signalName: "cardinality_first_try",
        stimulus: setEl,
        nudgeTarget: null,   // nothing to re-tap here → no idle hand
        options: slide.data.options,
        columnsHint: Math.min(slide.data.options.length, 5),
        isCorrect: (opt) => opt.value === slide.data.count,
        // SME (S01 review deck): finger-hands are a TUTORIAL teaching aid only — in guided/
        // independent/practice/mastery the options are the NUMBER ALONE, larger.
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery",
        // HINT = count the set FOR the child (highlight + say एक/दो/तीन + numeral on top)
        hintAction: (done) => demoCountSet(setEl, slide.data.count, slide.data.numerals, done)
      });
    }
  },

  PICK_SET_BY_NUMBER: {
    // SME-designed REVERSE how-many (S01 review deck, new pages): a big NUMBER is the stimulus;
    // the options are small OBJECT SETS — tap the set with that many. Speak-on-tap = each set's own
    // count line ("इसमें तीन चीज़ें हैं।"), which doubles as the SME's wrong-tap hint; the ladder then
    // runs try_again → hint → reveal-glow as everywhere. data:{target, options:[{count, object:{img,emoji},
    // audio, correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "psn-stimulus";
      stim.innerHTML = `<span class="psn-num">${devNumeral(d.target)}</span>`;
      mountTapOptions({
        slide, host, signalName: "pick_set_first_try",
        stimulus: stim,
        nudgeTarget: null,
        options: d.options,
        columnsHint: Math.min(d.options.length, 3),
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const c = document.createElement("div"); c.className = "psn-cell";
          let inner = "";
          for(let i=0;i<opt.count;i++) inner += `<span class="psn-obj">${imgOrEmoji(opt.object.img, opt.object.emoji, "psn-img", "psn-emoji")}</span>`;
          c.innerHTML = `<div class="psn-set">${inner}</div>`;
          return c;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MAKE_SET: {
    mount(host, slide){
      const N = slide.data.target, obj = slide.data.object;
      const wrap = document.createElement("div"); wrap.className = "makeset-stage";
      wrap.innerHTML = `
        <div class="makeset-target"><span class="ms-label">डालो</span><span class="num-glyph">${devNumeral(slide.data.target)}</span>${imgOrEmoji(obj.img, obj.emoji, "ms-goal-obj", "ms-goal-emoji")}</div>
        <div class="makeset-frame" id="msFrame"></div>
        <button class="makeset-add" id="msAdd"><span class="ms-add-plus">＋</span>${imgOrEmoji(obj.img, obj.emoji, "ms-add-obj", "ms-add-emoji")}</button>`;
      host.appendChild(wrap);
      const frame = wrap.querySelector("#msFrame"), addBtn = wrap.querySelector("#msAdd");
      const numerals = slide.data.numerals || [];
      const MAXITEMS = 5;                          // never allow more than 5
      let c = 0; state.attempts = 0; state.locked = false; state.hintActive = false;
      const refreshNav = ()=> setNavActive(!state.locked && !state.hintActive && c === N);  // आगे activates ONLY at exactly N — no premature/wrong submit; child self-corrects by adding more / removing (×). Nudge on the add-button guides an idle child.
      function makeItem(){
        const it = document.createElement("div"); it.className = "ms-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="ms-del" aria-label="हटाओ">×</span>`;
        const remove = (e)=>{ if(e) e.stopPropagation(); if(state.locked || state.hintActive) return; it.remove(); c--; refreshNav(); };
        // remove ONLY via the explicit × badge — tapping the object itself must NOT delete it
        // (the count tutorial teaches "tap the object to count it"; a placed apple that vanishes on tap
        //  would silently destroy the child's work)
        it.querySelector(".ms-del").onclick = remove;
        frame.appendChild(it); return it;
      }
      addBtn.onclick = ()=>{
        if(state.locked || state.hintActive) return;
        if(c >= MAXITEMS){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 420); return; }  // cap at 5
        c++; makeItem();
        play("assets/Audio/vo_num_" + c + "." + AUDIO_EXT);   // count up as you add
        SwiftPAL.emit("make_set_add", { slide_id: slide.id, count: c });
        refreshNav();
      };
      // HINT = count what the child actually placed (highlight + say the number)
      const runHint = (after)=>{
        state.hintActive = true; refreshNav();
        demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{ state.hintActive = false; refreshNav(); if(after) after(); });
      };
      $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
        SwiftPAL.emit("hint_shown", { slide_id: slide.id, manual: true }); runHint(); };
      // आगे = SUBMIT. correct → celebrate & advance. wrong → graduated scaffold, same as
      // everywhere: 1st = try again, 2nd = count-demo hint, 3rd = REVEAL (auto-fix to N,
      // count 1..N automatically, then move to the next slide).
      $("navBtn").onclick = ()=>{
        if(state.locked || state.hintActive || c !== N) return;   // gated to exactly N → only the correct-set path runs (self-correcting design)
        if(c === N){
          state.locked = true; refreshNav();
          SwiftPAL.emit("make_set_correct", { slide_id: slide.id, phase: slide.phase,
            value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=>
            celebrateThenAdvance(slide, false));   // standard: confetti + VO + auto-advance, no popup
          return;
        }
        state.attempts++;
        SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: c, target: N });
        const maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show");
        if(state.attempts >= maxA){
          // 3rd wrong → reveal: correct the set to exactly N, count it 1..N, then advance
          state.locked = true; state.scaffoldLevel = 3; refreshNav();
          while(frame.querySelectorAll(".ms-item").length > N) frame.querySelector(".ms-item:last-child").remove();
          while(frame.querySelectorAll(".ms-item").length < N) makeItem();
          c = N;
          SwiftPAL.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          state.hintActive = true;
          // count the (now-correct) set 1..N, then say the total "कुल N", then advance
          demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{
            state.hintActive = false;
            play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=> completeSlide(false), 500));
          });
        } else if(state.attempts === 2){
          runHint();                                                   // 2nd wrong → count what they made
        } else {
          // 1st wrong → try again, WITH the spoken VO (was silent)
          showBox("", audioText(slide,"try_again") || "फिर से कोशिश करो।", "wrong", audioFor(slide,"try_again"), ()=>{});
        }
      };
      setNavActive(false);
      pointNudgeAt(addBtn);
    }
  },

  COMPARE_SETS: {
    // Two visible groups, TWO picture options — the child taps the object that has MORE (or LESS).
    // No बराबर chip (lead review): equality is taught in MEET_COMPARE + produced on the see-saw, so
    // a judge question always has one clear answer between the two objects. Tap-to-answer: a wrong
    // tap buzzes + crosses + locks that card; the right one confetti-cheers + advances.
    mount(host, slide){
      const d = slide.data;
      const stage = stimulusCompareSets(d);
      // JUDGE (test): hide the "मिलाओ" reveal button — its one-to-one reveal + leftover glow gives the
      // answer away (and on a "less" question it glows the MORE set, pointing at the WRONG option).
      // The two rows stay visible so the child still compares by eye. (Reveal stays only on MEET_COMPARE.)
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const answer = (d.ask === "less") ? (d.a_count < d.b_count ? "a" : "b")
                                        : (d.a_count > d.b_count ? "a" : "b");
      const options = [ {kind:"a", obj:d.a_object}, {kind:"b", obj:d.b_object} ];
      // (option shuffle is now centralized in mountTapOptions — no per-module reverse needed)
      mountTapOptions({
        slide, host, signalName: "compare_first_try",
        stimulus: stage,
        nudgeTarget: null,
        options,
        columnsHint: 2,
        isCorrect: (opt)=> opt.kind === answer,
        optionRenderer: (opt)=>{
          const cell = document.createElement("div");
          cell.innerHTML = imgOrEmoji(opt.obj.img, opt.obj.emoji, "pic-img", "cmp-chip-emoji")
            + `<span class="cmp-chip-lbl">${opt.obj.word_hi || ""}</span>`;
          return cell;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MEET_COMPARE: {
    // TEACH BY DOING (lead review): the child COUNTS each group by tapping its objects one-by-one
    // (running numeral + spoken एक/दो/तीन), the top group then the bottom. Then the one-to-one
    // match reveals, the leftover glows, and Swiftie EXPLAINS the outcome by name — e.g.
    // "एक सेब बच गया, सेब ज़्यादा हैं, केले कम" / "कुछ नहीं बचा, दोनों बराबर". आगे appears after.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "meet-compare";
      const stage = stimulusCompareSets({a_object:d.a_object, a_count:d.a_count,
                                          b_object:d.b_object, b_count:d.b_count, show_matches:false});
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const verdict = document.createElement("div");
      verdict.className = "cmp-verdict " + (d.outcome || "more");
      verdict.textContent = d.label_hi || "";
      wrap.appendChild(stage); wrap.appendChild(verdict);
      host.appendChild(wrap);

      state.gateNavUntilAudio = false; state.locked = false; state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };

      // 🔊 replay: re-hear the teach line (and, once revealed, the explanation). autoPlayChain skips
      // count_intro/explain, so without this the header chip would be silent on teach slides.
      let revealed = false;
      state.replayAudio = ()=>{ const chain = [audioFor(slide, "count_intro")];
        if(revealed) chain.push(audioFor(slide, "explain"));
        playChain(chain.filter(Boolean), 0); };

      const rowA = [...stage.querySelectorAll(".cmp-row.top .cobj")];
      const rowB = [...stage.querySelectorAll(".cmp-row.bot .cobj")];

      // make one row countable-by-tapping; cb fires once every item in it is counted
      function countRow(items, cb){
        const nudgeNext = ()=>{ const nx = items.find(o=>!o.classList.contains("counted"));
          if(nx) pointNudgeAt(nx); else stopNudge(); };
        let n = 0;
        items.forEach(o=>{
          o.classList.add("tappable");
          o.onclick = ()=>{
            if(state.locked || o.classList.contains("counted")) return;
            o.classList.add("counted", "counting"); n++; sfxTap();
            let cal = o.querySelector(".count-callout");
            if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
            cal.textContent = n;
            play("assets/Audio/vo_num_" + n + "." + AUDIO_EXT, ()=>{});
            if(items.every(x=>x.classList.contains("counted"))){ stopNudge(); setTimeout(cb, 550); }
            else nudgeNext();
          };
        });
        nudgeNext();
        // [16h] Phase-1 autonomous mode (lead's 3-phase contract): the demo hand counts the row
        // BY ITSELF — drives the same handlers a child would, so behavior is identical.
        if(slide.data.auto){
          items.forEach(o=> o.classList.remove("tappable"));
          let ai = 0;
          (function autoTap(){
            if(CARD.slides[state.idx] !== slide || ai >= items.length) return;
            const o = items[ai++]; pointNudgeAt(o); if(o.onclick) o.onclick();
            setTimeout(autoTap, 950);
          })();
        }
      }

      // intro VO → count group A → count group B → reveal match + explain the outcome.
      // NB: uses non-autochain role names (count_intro / explain) so mountSlide's autoPlayChain
      // does NOT also fire the intro — this module owns its own audio sequence.
      play(audioFor(slide, "count_intro") || null, ()=>{
        countRow(rowA, ()=> countRow(rowB, ()=>{
          stage._revealMatches(()=>{
            verdict.classList.add("show"); setSwMood("point");
            state.locked = true; revealed = true; setNavActive(true);
            play(audioFor(slide, "explain") || null, ()=>{});
          });
        }));
      });
    }
  },

  MAKE_EQUAL: {
    // PRODUCE mechanic (see-saw): the left pan holds a fixed group; the child taps + जोड़ो to
    // add to the right pan (tap an added item to take it back). The beam tilts toward the heavier
    // side in real time; at equal it levels, locks, celebrates. Overshoot is enacted (invite to
    // remove), never a red ✗ — the KG "produce, don't pick" model.
    mount(host, slide){
      const d = slide.data, L = d.a_count, fixedObj = d.a_object, addObj = d.b_object;
      const MAXR = d.max || Math.max(L + 2, 6);
      const wrap = document.createElement("div"); wrap.className = "balance-stage";
      wrap.innerHTML = `
        <div class="balance">
          <div class="beam-wrap" id="beamWrap"><div class="beam"></div>
            <div class="pan pan-left"><div class="pan-grid" id="panL"></div></div>
            <div class="pan pan-right"><div class="pan-grid" id="panR"></div></div></div>
          <div class="fulcrum"></div>
        </div>
        <button class="balance-add" id="balAdd" type="button"></button>`;
      host.appendChild(wrap);
      const panL = wrap.querySelector("#panL"), panR = wrap.querySelector("#panR");
      const beam = wrap.querySelector("#beamWrap"), addBtn = wrap.querySelector("#balAdd");
      const balance = wrap.querySelector(".balance");
      addBtn.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji") + `<span>+ जोड़ो</span>`;
      for(let i=0;i<L;i++){ const c=document.createElement("span"); c.className="cobj";
        c.innerHTML = imgOrEmoji(fixedObj.img, fixedObj.emoji, "cobj-img", "cobj-emoji"); panL.appendChild(c); }
      let right = 0; state.locked = false; state.attempts = 0; let tipT = 0;
      const TILT = 6, TMAX = 15;
      const tilt = ()=>{ const diff = right - L; const deg = Math.max(-TMAX, Math.min(TMAX, diff*TILT));
        beam.style.transform = `translateX(-50%) rotate(${deg}deg)`; balance.classList.toggle("level", diff===0 && right>0); };
      const check = ()=>{ if(state.locked) return; const diff = right - L;
        if(diff===0 && right>0){ state.locked = true; setNavActive(true);
          SwiftPAL.emit("make_equal_correct", { slide_id: slide.id, phase: slide.phase, value: true,
            count: right, target: L, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          showBox("⚖️", audioText(slide,"balanced") || "बराबर! दोनों बराबर हैं।", "correct", audioFor(slide,"balanced") || null, ()=>{});
        } else if(diff > 0){ state.attempts++;
          SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, made: right, target: L });
          if(Date.now()-tipT > 1200){ tipT = Date.now();
            showBox("", audioText(slide,"too_many") || "बहुत ज़्यादा! एक हटाओ।", "hint", audioFor(slide,"too_many"), ()=>{}); } }
      };
      const addItem = ()=>{ const c=document.createElement("span"); c.className="cobj added";
        c.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji");
        c.onclick = ()=>{ if(state.locked) return; c.remove(); right = Math.max(0, right-1); tilt(); check(); };
        panR.appendChild(c); right++; };
      addBtn.onclick = ()=>{ if(state.locked) return;
        if(right >= MAXR){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 400); return; }
        addItem(); tilt(); sfxTap();
        // count EVERY added item aloud INCLUDING the final/target one (एक, दो, तीन) — then, on the
        // last count, the "बराबर" VO follows (check runs in the count's onEnd so the number isn't cut).
        if(right <= L) play("assets/Audio/vo_num_" + right + "." + AUDIO_EXT, right === L ? ()=> check() : ()=>{});
        else check();   // overshoot → "एक हटाओ" hint
      };
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      tilt();                 // START tilted toward the heavier (left) group — the see-saw is NOT level yet
      pointNudgeAt(addBtn);
    }
  },

  MEET_PATTERN: {
    // TEACH: show a repeating pattern and pulse the repeating UNIT (first data.unit_len cells) a few
    // times so the child sees "this part comes again". Nav gated on the VO, like MEET_NUMBER.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = "यह हिस्सा दोहराता है 🔁";
      const row = document.createElement("div"); row.className = "pattern-row";
      d.items.forEach(o=>{ const c = document.createElement("div"); c.className = "pat-cell";
        c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); row.appendChild(c); });
      wrap.appendChild(lbl); wrap.appendChild(row); host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const cells = [...row.children]; let rep = 0;
      const glow = ()=>{ cells.forEach((c,i)=> { if(i < d.unit_len) c.classList.add("unit-glow"); });
        setTimeout(()=> cells.forEach(c=> c.classList.remove("unit-glow")), 1100); };
      glow(); const t = setInterval(()=>{ if(rep++ >= 2){ clearInterval(t); return; } glow(); }, 1700);
    }
  },

  PATTERN_BUILD: {
    // PRODUCE: a pattern with empty ghost slot(s) — at the END (extend) or in the MIDDLE (fill the
    // gap). Tap a tray item to drop it into the active slot; the correct item = data.items[slot].
    // Wrong taps bounce (enacted, no ✗). Fill every blank → complete. data:{items[],blanks[],tray[]}.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const row = document.createElement("div"); row.className = "pattern-row";
      const cells = d.items.map((o,i)=>{
        const c = document.createElement("div");
        if(d.blanks.includes(i)){ c.className = "pat-ghost"; c.innerHTML = `<span class="qmark">?</span>`; }
        else { c.className = "pat-cell"; c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); }
        row.appendChild(c); return c;
      });
      const tray = document.createElement("div"); tray.className = "pattern-tray";
      d.tray.forEach(o=>{ const t = document.createElement("div"); t.className = "pat-tray-item"; t._obj = o;
        t.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(t); });
      wrap.appendChild(row); wrap.appendChild(tray); host.appendChild(wrap);
      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const key = (o)=> o.img || o.emoji;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        // idle nudge points at the ACTIVE BLANK ('?' slot = "put one here"), re-armed per blank —
        // NEVER at a tray answer; startNudge is phase-aware so it's silent in practice/mastery.
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const flashHint = ()=>{ const want = d.items[blanks[bi]], g = activeGhost(); const prev = g.innerHTML;
        g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji"); g.style.opacity = ".4";
        setTimeout(()=>{ if(g.classList.contains("pat-ghost")){ g.innerHTML = prev; g.style.opacity = ""; } }, 950); };
      const placeCorrect = ()=>{                      // one placement path (tap AND reveal)
        const want = d.items[blanks[bi]], g = activeGhost();
        g.className = "pat-cell"; g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji");
        g.classList.add("unit-glow"); setTimeout(()=> g.classList.remove("unit-glow"), 700); bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          SwiftPAL.emit("pattern_extend_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          // engine standard: confetti + cheer + correct VO + AUTO-advance — no popup, no आगे gate.
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".pat-tray-item").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length) return;
          stopNudge();
          const want = d.items[blanks[bi]];
          if(key(t._obj) === key(want)){
            wrongStreak = 0;
            placeCorrect();
          } else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show");
            // layered ladder, standard-aligned: L1 spoken try-again (buzz + Swiftie, no popup) →
            // L2 flash the answer ghost + spoken hint → L3 reveal ceiling: DEMONSTRATE the placement.
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide,"reveal") || audioFor(slide,"hint") || null, ()=>{});
              setTimeout(()=>{ placeCorrect(); }, 1000);
            }
            else if(state.attempts >= 2){ flashHint(); play(audioFor(slide,"hint") || null, ()=>{}); }
            else dragWrong(slide);
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{};   // completion is automatic now — आगे never gates a solved pattern
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length) flashHint(); };
      // NB: the idle nudge is armed by markActive() → startNudge(activeGhost) above — it points at the
      // BLANK, phase-aware. (Bug fix: was pointNudgeAt(first tray tile) = an immediate hand on the WRONG
      // answer on most slides, and it showed even in mastery.)
    }
  },

  /* ===== NUMBER-SEQUENCE PATH (MTKGA01_L02_S04 — "completes a number sequence within 20") =====
     Three additive modules that share the .seq-* number-path skin. Numerals are crisp text glyphs
     (Baloo), only the tile chrome is rounded — content-true geometry (never round the number). */

  MEET_SEQUENCE: {
    // TEACH BY DOING: a number path; a token sits on the first cell. The child taps the glowing NEXT
    // cell to hop the token forward, each number spoken (vo_num_N) with an ascending thunk — so the
    // child ENACTS "numbers move forward one step at a time" (curriculum teach spec). Nav gates until
    // the token reaches the end, then Swiftie's explain line plays. data:{path:[n…], token?}.
    mount(host, slide){
      const d = slide.data, nums = d.path;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = nums.length > 7 ? 74 : 90;
      const cells = nums.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div"); cell.className = "seq-cell";
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        cell.textContent = n; path.appendChild(cell); return cell;
      });
      stage.appendChild(path); host.appendChild(stage);
      const token = document.createElement("span"); token.className = "seq-token"; token.textContent = d.token || "🐤";
      let pos = 0;
      const place = ()=>{ cells.forEach((c,i)=> c.classList.toggle("lit", i <= pos));
        if(!cells[pos].contains(token)) cells[pos].appendChild(token); };
      const glowNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === pos+1));
        if(pos+1 < cells.length) startNudge(slide, cells[pos+1]); else stopNudge(); };
      place(); btThunk(1); play("assets/Audio/vo_num_" + nums[0] + "." + AUDIO_EXT, ()=>{}); glowNext();
      const advance = ()=>{
        if(pos >= cells.length-1) return;
        pos++; cells[pos].classList.remove("active"); place(); btThunk(pos+1);
        play("assets/Audio/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
        if(pos >= cells.length-1){ stopNudge();
          SwiftPAL.emit("meet_sequence_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 500);
        } else glowNext();
      };
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i === pos+1) advance(); }; });
      // 🔊 replay re-speaks the current number (module owns its audio; autoPlayChain is skipped)
      state.replayAudio = ()=> play("assets/Audio/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SEQUENCE_COMPLETE: {
    // PRODUCE test: a number path with blank(s); tap a tray numeral into the active blank. Correct =
    // path[blankIdx]. Wrong = shake + soft buzz + spoken try_again; reveal (demonstrate) after
    // max_attempts. Fills left→right. data:{path:[n… , with the blank positions still holding the true
    // number], blanks:[idx…], tray:[n…] (numerals incl. misconception distractors)}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      const cells = d.path.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(d.blanks.includes(i)){ cell.className = "seq-cell seq-ghost"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell); return cell;
      });
      const tray = document.createElement("div"); tray.className = "seq-tray";
      d.tray.forEach(n=>{ const t = document.createElement("div"); t.className = "seq-tile"; t._num = n; t.textContent = n; tray.appendChild(t); });
      stage.appendChild(path); stage.appendChild(tray); host.appendChild(stage);

      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const placeCorrect = ()=>{
        const want = d.path[blanks[bi]], g = activeGhost();
        g.className = "seq-cell filled unit-glow"; g.textContent = want; setTimeout(()=> g.classList.remove("unit-glow"), 700);
        const tile = [...tray.children].find(x=> x._num === want && !x.classList.contains("used")); if(tile) tile.classList.add("used");
        bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          SwiftPAL.emit("sequence_complete_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".seq-tile").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length || t.classList.contains("used")) return;
          stopNudge();
          if(t._num === d.path[blanks[bi]]){ wrongStreak = 0; placeCorrect(); }
          else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show");
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide, "reveal") || audioFor(slide, "hint") || null, ()=>{});
              setTimeout(()=> placeCorrect(), 1000);
            } else dragWrong(slide);
          }
        };
      });
      setNavActive(false); $("navBtn").onclick = ()=>{};   // completion is automatic — never gate a solved path
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length){ const g = activeGhost();
        g.classList.add("reveal-glow"); setTimeout(()=> g.classList.remove("reveal-glow"), 800); } };
    }
  },

  SEQUENCE_NEXT: {
    // PICK test (what comes next / before): a number path with ONE '?' cell (null in data.path) is the
    // stimulus; the child taps the correct numeral option. Reuses mountTapOptions → full tap-to-answer
    // contract (wrong=buzz+✗+lock+try_again, right=confetti+advance) + speak-the-number-on-tap +
    // mastery scoring. data:{path:[n…,null,…], options:[{num, audio:"vo_num_N", correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "seq-stage";
      const path = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      d.path.forEach((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(n === null){ cell.className = "seq-cell seq-ghost active"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell);
      });
      stim.appendChild(path);
      mountTapOptions({
        slide, host, signalName: "sequence_next_correct", stimulus: stim,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); const s = document.createElement("span");
          s.className = "seq-optnum"; s.textContent = o.num; cell.appendChild(s); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null
      });
    }
  },

  /* ===== ORDERING / SERIATION (MTKGA02_L02_S02 — "orders three objects by size, length, or weight") =====
     Additive modules sharing the .ord-* skin. Objects render at true magnitude (size scale / bar length);
     weight is assessed by 'pick the heaviest' (weight is not visual) — targeting the bigger=heavier
     misconception with a big-but-light distractor. */

  MEET_ORDER: {
    // TEACH BY DOING: the 3 objects are shown already in order (small→big / short→long / light→heavy);
    // the child taps each left→right to hear its rank name (सबसे छोटा / बीच का / सबसे बड़ा etc.), then an
    // explain line plays and नav unlocks. data:{by, items:[{mag,img/emoji/color}] (ascending), rank_audio:[id…],
    // arrow_lo, arrow_hi, hint_icon?}.
    mount(host, slide){
      const d = slide.data; state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const row = document.createElement("div"); row.className = "ord-tray";
      const cells = d.items.map((o,i)=>{ const el = document.createElement("div"); el.className = "ord-item";
        el.style.opacity = ".5"; el.innerHTML = renderOrdObj(o, d.by); row.appendChild(el); return el; });
      if(d.hint_icon){ const hi = document.createElement("div"); hi.className = "ord-hint-icon"; hi.textContent = d.hint_icon; stage.appendChild(hi); }
      stage.appendChild(arrow); stage.appendChild(row); host.appendChild(stage);
      let tapped = 0;
      const nudgeNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === tapped));
        if(tapped < cells.length) startNudge(slide, cells[tapped]); else stopNudge(); };
      nudgeNext();
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i !== tapped) return; stopNudge();
        c.classList.remove("active"); c.style.opacity = "1"; c.classList.add("reveal-glow");
        setTimeout(()=> c.classList.remove("reveal-glow"), 600);
        play("assets/Audio/" + (d.rank_audio[i]) + "." + AUDIO_EXT, ()=>{}); tapped++;
        if(tapped >= cells.length){ stopNudge();
          SwiftPAL.emit("meet_order_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 450);
        } else nudgeNext();
      }; });
      state.replayAudio = ()=> play(audioFor(slide, "explain") || null, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  ORDER_BY_ATTR: {
    // PRODUCE test: 3 scrambled objects + a left→right strip (arrow छोटा→बड़ा). Tap the smallest-remaining
    // → it fills the next slot. Wrong (not the current smallest) = shake + soft buzz + spoken try_again;
    // demonstrate after max_attempts. data:{by, items:[{mag,img/emoji/color}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedMags = d.items.map(o=>o.mag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._mag = o.mag;
        el.innerHTML = renderOrdObj(o, d.by); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(strip); stage.appendChild(tray); host.appendChild(stage);
      let placed = 0, wrongStreak = 0, revealed = false; state.locked = false; state.attempts = 0;
      const wantMag = ()=> sortedMags[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._mag === wantMag());
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n) startNudge(slide, nextTile()); else stopNudge(); };
      const placeInto = (tile)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = tile.innerHTML; tile.classList.add("used"); placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          SwiftPAL.emit("order_by_attr_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
      };
      markActive();
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || t.classList.contains("used")) return; stopNudge();
        if(t._mag === wantMag()){ wrongStreak = 0; placeInto(t); }
        else { state.attempts++; t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
          SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          $("hintBtn").classList.add("show");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0;
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide,"reveal")||null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); placeInto(c); }, 1000); }
          } else dragWrong(slide);
        }
      }; });
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked){ const t = nextTile(); if(t){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  PICK_EXTREME: {
    // PICK test: tap the object that is the MOST (सबसे बड़ा / सबसे लंबा / सबसे भारी). For weight, options
    // include a big-but-light distractor to break the bigger=heavier misconception. Reuses mountTapOptions
    // → tap-to-answer + speak-the-word-on-tap + mastery. data:{by, options:[{img/emoji/color,mag,label,audio,correct}]}.
    mount(host, slide){
      const d = slide.data;
      mountTapOptions({
        slide, host, signalName: "pick_extreme_correct", stimulus: null,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); cell.className = "ord-pick";
          cell.innerHTML = renderOrdObj(o, d.by) + (o.label ? `<span class="lbl">${o.label}</span>` : ""); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null
      });
    }
  },

  ORDER_BY_WEIGHT: {
    // PRODUCE test — WEIGHT seriation via A-vs-B COMPARISON (weight is not visual). Two pans: tap a tray
    // object → it loads the next empty pan; with BOTH loaded the beam tilts toward the heavier (it DROPS)
    // + thunk, and the lighter one RISES + pulses. Tap the lighter (risen) object to send it to the next
    // हल्का→भारी slot — accepted only if it is the lightest still unplaced; else it is the lighter of a
    // heavy pair (an even lighter one exists) → soft buzz + try_again, both return. The last object
    // auto-places (it is forced). Objects render at sizes that DON'T match weight (a big balloon can be
    // light) so the SCALE is the only cue. data:{items:[{wmag,dmag,img,emoji}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-weight";
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||"हल्का"}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||"भारी"}</span>`;
      const scale = document.createElement("div"); scale.className = "owt-scale";
      scale.innerHTML = `<div class="owt-foot"></div><div class="owt-post"></div>` +
        `<div class="owt-beamwrap"><div class="owt-beam"></div><div class="owt-cap"></div>` +
        `<div class="owt-arm l"></div><div class="owt-arm r"></div>` +
        `<div class="owt-pan l"><div class="owt-load"></div></div><div class="owt-pan r"><div class="owt-load"></div></div></div>`;
      const beamwrap = scale.querySelector(".owt-beamwrap");
      const panEl = { l: scale.querySelector(".owt-pan.l"), r: scale.querySelector(".owt-pan.r") };
      const loadEl = { l: panEl.l.querySelector(".owt-load"), r: panEl.r.querySelector(".owt-load") };
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedW = d.items.map(o=>o.wmag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._o = o; el._w = o.wmag; el._onpan = false;
        el.innerHTML = renderOrdObj({ mag: o.dmag, img: o.img, emoji: o.emoji }, "size"); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(scale); stage.appendChild(strip); stage.appendChild(tray);
      host.appendChild(stage);

      let placed = 0, wrongStreak = 0, revealed = false, busy = false; state.locked = false; state.attempts = 0;
      const pans = { l: null, r: null };
      const wantW = ()=> sortedW[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._w === wantW());
      const remaining = ()=> tiles.filter(x=> !x.classList.contains("used"));
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n && !pans.l && !pans.r){ const t = nextTile(); if(t && !t._onpan) startNudge(slide, t); } else stopNudge(); };
      const resetPans = ()=>{ ["l","r"].forEach(k=>{ const t = pans[k]; if(t){ t._onpan = false; t.style.visibility = ""; }
        loadEl[k].innerHTML = ""; loadEl[k].classList.remove("lighter"); pans[k] = null; }); beamwrap.style.transform = "rotate(0deg)"; };
      const loadPan = (k, t)=>{ pans[k] = t; t._onpan = true; t.style.visibility = "hidden"; loadEl[k].innerHTML = imgOrEmojiSized(t._o.img, t._o.emoji, 56); };
      const compare = ()=>{ beamwrap.style.transform = `rotate(${(pans.r._w - pans.l._w) * 7}deg)`;   // heavier side drops
        btThunk(Math.max(pans.l._w, pans.r._w)); const lightK = pans.l._w < pans.r._w ? "l" : "r";
        loadEl[lightK].classList.add("lighter"); loadEl[lightK === "l" ? "r" : "l"].classList.remove("lighter"); };
      const placeToSlot = (t, cb)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = renderOrdObj({ mag: t._o.dmag, img: t._o.img, emoji: t._o.emoji }, "size"); t.classList.add("used"); t._onpan = false; placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          SwiftPAL.emit("order_by_weight_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
        if(cb) cb();
      };
      // when only one object remains it is forced — weigh it alone briefly, then place it.
      const autoLast = ()=>{ if(state.locked) return; const rem = remaining(); if(rem.length !== 1){ markActive(); return; }
        busy = true; const t = rem[0]; loadPan("l", t); beamwrap.style.transform = "rotate(-9deg)"; btThunk(t._w);
        setTimeout(()=>{ loadEl.l.innerHTML = ""; beamwrap.style.transform = "rotate(0deg)"; placeToSlot(t, ()=>{ busy = false; }); }, 850); };
      // tray tap → load the next empty pan (compare once both are full)
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || busy || t.classList.contains("used") || t._onpan) return; stopNudge();
        if(!pans.l){ loadPan("l", t); }
        else if(!pans.r){ loadPan("r", t); compare(); }
      }; });
      // pan tap → try to place that pan's object (must be the LIGHTER of the two AND the lightest unplaced)
      ["l","r"].forEach(k=>{ panEl[k].onclick = ()=>{ if(state.locked || busy || !pans.l || !pans.r) return;
        const t = pans[k], other = pans[k === "l" ? "r" : "l"];
        if(t._w > other._w){ const lk = pans.l._w < pans.r._w ? "l" : "r";   // tapped the heavier one → re-pulse the lighter (hint), no penalty
          loadEl[lk].classList.remove("lighter"); void loadEl[lk].offsetWidth; loadEl[lk].classList.add("lighter"); return; }
        if(t._w === wantW()){ busy = true; wrongStreak = 0;   // correct: lighter AND globally lightest
          other._onpan = false; other.style.visibility = "";
          loadEl.l.innerHTML = ""; loadEl.r.innerHTML = ""; loadEl.l.classList.remove("lighter"); loadEl.r.classList.remove("lighter");
          pans.l = null; pans.r = null; beamwrap.style.transform = "rotate(0deg)";
          placeToSlot(t, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250));
        } else {   // lighter of the pair, but an even lighter one is still unplaced
          state.attempts++; SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts }); $("hintBtn").classList.add("show");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0; resetPans();
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide, "reveal") || null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); busy = true; placeToSlot(c, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250)); }, 900); } }
          else { dragWrong(slide); resetPans(); }
        }
      }; });
      markActive();
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked && !busy){ const t = nextTile(); if(t && !t._onpan){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  BUILD_TO_NUMBER: {
    // Signature produce module. data: {target, mode:'guided'|'independent', topper, friend, goal_hi,
    // skyline_done, skyline_total}. Guided = dashed blueprint, auto-completes on fill. Independent =
    // free stack + "बन गया!" serve with world-enacted feedback (short/teeter, never a ✗). Ascending-
    // pitch thunk + spoken एक/दो/… per block. Geometry via offsets (throttle-safe).
    mount(host, slide){
      const d = slide.data, N = d.target, mode = d.mode || "independent";
      const stage = document.createElement("div"); stage.className = "bt-stage";
      const board = document.createElement("div"); board.className = "bt-board";
      board.innerHTML = `<span class="bt-numeral">${N}</span>` +
        (d.topper ? `<img class="bt-goalpic" src="assets/Images/${d.topper}.png" alt="">` : "") +
        (d.goal_hi ? `<span class="bt-goallbl">${d.goal_hi}</span>` : "");
      const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
      for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/Images/obj_crane.png" alt="">`;
      const pile = document.createElement("div"); pile.className = "bt-pile";
      pile.innerHTML = `<div class="bt-pile-blocks"></div><span class="bt-pile-lbl">＋ ब्लॉक</span>`;
      const pb = pile.querySelector(".bt-pile-blocks");
      for(let i=0;i<3;i++){ const b = btBlock(i+1); b.style.left = (i*12) + "px"; b.style.bottom = (i*18) + "px"; pb.appendChild(b); }
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground " + mode;
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");   // tall towers auto-shrink to fit
      plotwrap.appendChild(plot);
      const friend = document.createElement("div"); friend.className = "bt-friend";
      if(d.friend) friend.innerHTML = `<img src="assets/Images/${d.friend}.png" alt="">`;
      yard.appendChild(crane); yard.appendChild(pile); yard.appendChild(plotwrap); if(d.friend) yard.appendChild(friend);
      stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
      if(d.skyline_total) stage.appendChild(btSkyline(d.skyline_done || 0, d.skyline_total));
      let serveBtn = null;
      if(mode === "independent"){ serveBtn = document.createElement("button"); serveBtn.type = "button"; serveBtn.className = "bt-serve"; serveBtn.textContent = "बन गया!"; stage.appendChild(serveBtn); }
      host.appendChild(stage);

      let count = 0; state.locked = false; state.attempts = 0;
      const lit = ()=> cells.forEach((c,i)=>{ const on = i < count; c.classList.toggle("lit", on); c.textContent = on ? (i+1) : ""; });
      const addSound = ()=>{ btThunk(count); btDust(plot); play("assets/Audio/vo_num_" + count + "." + AUDIO_EXT); };

      function success(){
        state.locked = true; if(serveBtn) serveBtn.disabled = true;
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/Images/${d.topper}.png" alt="">`; plot.appendChild(t);
          if(d.topper === "top_rocket") setTimeout(()=> t.classList.add("rocket-go"), 750); }
        if(d.friend) friend.classList.add("hop");
        sfxCorrect(); burstStars();
        const lots = [...stage.querySelectorAll(".bt-bldg")]; const nextLot = lots[d.skyline_done || 0];
        if(nextLot) setTimeout(()=> nextLot.classList.add("done"), 380);
        SwiftPAL.emit("build_to_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
        play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT); setNavActive(true);
      }

      if(mode === "guided"){
        const ghosts = [];
        for(let i=0;i<N;i++){ const g = document.createElement("div"); g.className = "bp-slot"; plot.appendChild(g); ghosts.push(g); }
        ghosts[0].classList.add("next");
        pile.onclick = ()=>{ if(state.locked) return;
          const g = ghosts.find(x=> x.classList.contains("bp-slot"));
          if(!g){ showBox("", "बस इतने ही चाहिए!", "hint", null, ()=>{}); return; }
          g.className = "blk drop"; g.style.background = BT_COLORS[count % 5];
          count++; lit(); addSound();
          const nx = ghosts.find(x=> x.classList.contains("bp-slot")); if(nx) nx.classList.add("next");
          if(count === N) setTimeout(success, 280);
        };
      } else {
        pile.onclick = ()=>{ if(state.locked) return;
          const b = btBlock(count); b.classList.add("drop");
          b.onclick = (e)=>{ e.stopPropagation(); if(state.locked) return; b.remove(); count--; lit(); };
          plot.appendChild(b); count++; lit(); addSound(); };
        serveBtn.onclick = ()=>{ if(state.locked) return;
          if(count === N){ success(); return; }
          state.attempts++;
          SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: count, target: N });
          if(count < N){ if(d.friend) friend.classList.add("peer");
            showBox("", "थोड़े और चाहिए!", "hint", null, ()=>{ if(d.friend) friend.classList.remove("peer"); }); }
          else { const bs = [...plot.querySelectorAll(".blk")]; const top = bs[bs.length-1];
            if(top){ top.classList.add("wobble"); setTimeout(()=> top.classList.remove("wobble"), 520); }
            showBox("", "अरे! एक ब्लॉक हटाओ।", "hint", null, ()=>{}); } };
      }
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      pointNudgeAt(pile);
    }
  },

  MAKE_NUMBER: {
    // produce-the-numeral dial (grafted from Firefly Valley). A set of N built blocks; ＋/− dials a
    // 1–10 numeral; wrong is inert (build dim), exact match ignites the build + snaps its topper.
    mount(host, slide){
      const d = slide.data, N = d.count;
      const stage = document.createElement("div"); stage.className = "bt-stage";
      if(d.prompt2_hi){ const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = d.prompt2_hi; stage.appendChild(lbl); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground"; plot.style.filter = "grayscale(.35) brightness(.95)";
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
      for(let i=0;i<N;i++){ plot.appendChild(btBlock(i)); }
      plotwrap.appendChild(plot); yard.appendChild(plotwrap);
      const dial = document.createElement("div"); dial.className = "bt-dial";
      dial.innerHTML = `<button class="bt-dial-btn" data-d="-1" type="button">−</button><div class="bt-dial-val">1</div><button class="bt-dial-btn" data-d="1" type="button">＋</button>`;
      stage.appendChild(yard); stage.appendChild(dial); host.appendChild(stage);
      let val = 1; state.locked = false; const valEl = dial.querySelector(".bt-dial-val");
      const check = ()=>{ if(val === N && !state.locked){ state.locked = true; valEl.classList.add("match"); plot.style.filter = "";
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/Images/${d.topper}.png" alt="">`; plot.appendChild(t); }
        sfxCorrect(); burstStars(); play("assets/Audio/vo_total_" + N + "." + AUDIO_EXT);
        SwiftPAL.emit("make_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, count: N, latency_ms: Date.now()-state.slideStart });
        setNavActive(true); } };
      dial.querySelectorAll(".bt-dial-btn").forEach(btn=> btn.onclick = ()=>{ if(state.locked) return;
        val = Math.max(1, Math.min(10, val + parseInt(btn.dataset.d, 10))); valEl.textContent = val; sfxTap(); check(); });
      setNavActive(false); $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
    }
  },

  TAP_LETTER_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_name_first_try",
        stimulus: null,
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_LETTER_BY_SOUND: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_sound_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.style.cursor = "pointer";
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_PICTURE_BY_LETTER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_image_match_first_try",
        stimulus: stimulusLetter(slide.data.target_letter),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.picture, opt.emoji, opt.img)
      });
    }
  },

  TAP_LETTER_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "image_letter_match_first_try",
        stimulus: stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  ODD_ONE_OUT: {
    mount(host, slide){
      const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "letter_recognise_first_try";
      const useShape = slide.data.options.some(o => o.shape);
      const usePic = slide.data.options.some(o => o.picture || o.word_hi || o.img);
      mountTapOptions({
        slide, host, signalName: sig,
        stimulus: null,
        options: slide.data.options,
        columnsHint: 4,
        isCorrect: (opt) => opt.is_odd === true,
        optionRenderer: (opt) => useShape
          ? shapeCell(opt)
          : usePic
            ? pictureCell(opt.word_hi || opt.picture, opt.emoji, opt.img)
            : letterCell(opt.letter),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusPic(slide.data.noun.word_hi, slide.data.noun.emoji, slide.data.noun.img),
        options: slide.data.options,
        columnsHint: 2,
        isCorrect: (opt) => opt.gender === slide.data.target_gender,
        optionRenderer: (opt) => genderLabelCell(opt.label, opt.gender),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_PICTURE_BY_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusGender(slide.data.label, slide.data.target_gender),
        options: slide.data.options,
        // tap-to-answer needs ONE unambiguous key — author marks the single intended picture
        // with correct:true (matches every other TAP_* module). The old `|| gender===target`
        // fallback silently accepted any same-gender distractor, defeating buzz+✗+lock.
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.word_hi, opt.emoji, opt.img),
        mastery: slide.phase === "mastery"
      });
    }
  },

  GENDER_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "gender-cats";
      const cats = slide.data.categories;
      const tapped = new Set();
      cats.forEach(cat => {
        const card = document.createElement("div");
        card.className = "gender-cat " + (cat.gender === "F" ? "fem" : "masc");
        card.innerHTML =
          `<div class="cat-title">${cat.label}</div>` +
          imgOrEmoji(cat.anchor.img, cat.anchor.emoji, "cat-pic", "cat-emoji") +
          `<div class="cat-word">${cat.anchor.word_hi}</div>`;
        card.onclick = ()=>{
          card.classList.add("played");
          playChain(["assets/Audio/" + cat.label_audio + "." + AUDIO_EXT, "assets/Audio/" + cat.name_audio + "." + AUDIO_EXT], 0);
          tapped.add(cat.gender);
          SwiftPAL.emit("gender_intro_tap", { slide_id: slide.id, gender: cat.gender });
          if(tapped.size >= cats.length){ stopNudge(); setNavActive(true); }
        };
        wrap.appendChild(card);
      });
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the concept VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  MEET_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-gender";
      const n = slide.data.noun;
      wrap.innerHTML =
        `<div class="meet-pic-box">${imgOrEmoji(n.img, n.emoji, "pic-img", "pic-emoji")}<span class="pic-label">${n.word_hi}</span></div>` +
        `<div class="meet-arrow">→</div>` +
        `<div class="gender-badge${slide.data.gender === "F" ? " fem" : ""}">${slide.data.label}</div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the model VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SORT_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage";
      const binsRow = document.createElement("div"); binsRow.className = "sort-bins";
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone" + (b.gender === "F" ? " fem" : "");   // dd-zone → drop detection
        bin.dataset.gender = b.gender;
        bin.innerHTML = `<div class="bin-title">${b.label}</div><div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item";
        t.dataset.gender = it.gender;
        t.innerHTML = imgOrEmoji(it.img, it.emoji, "img", "emoji") + `<span class="lbl">${it.word_hi}</span>`;
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.gender === t.dataset.gender){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            SwiftPAL.emit("gender_sort_item", { slide_id: slide.id, gender: t.dataset.gender, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              SwiftPAL.emit("gender_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  MATCH_GENDER_PAIRS: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zones = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone"; z.dataset.accept = p.id;
        z.innerHTML = imgOrEmoji(p.f.img, p.f.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.f.word_hi}</span>`;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "34px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile pic-tile"; t.dataset.pairId = p.id;
        t.innerHTML = imgOrEmoji(p.m.img, p.m.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.m.word_hi}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // the one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        // grey the matched masculine tile in place (pictures don't badge well)
        t.classList.add("matched"); t.style.transform = "";
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, DEMONSTRATE one pair (pulse + auto-settle) so
      // the child is guided forward instead of dead-ending; run counts success=false via `revealed`.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("matched") && x.dataset.pairId === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          if(zone.dataset.accept === t.dataset.pairId){
            wrongStreak = 0;
            SwiftPAL.emit("gender_pair_match", {
              slide_id: slide.id, phase: slide.phase, value: true,
              pair: t.dataset.pairId, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            dragWrong(slide);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MATCH_DRAG_1: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // zone (target picture)
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zone = document.createElement("div"); zone.className = "dd-zone";
      zone.innerHTML = imgOrEmoji(slide.data.target.img, slide.data.target.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${slide.data.target.picture||""}</span>`;
      zone.dataset.accept = slide.data.letter.letter;
      zoneRow.appendChild(zone);
      // tile
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tile = document.createElement("div"); tile.className = "dd-tile"; tile.innerHTML = `<span class="ink-glyph">${slide.data.letter.letter}</span>`;
      tileRow.appendChild(tile);
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      makeDraggable(tile, (zone, t) => {
        state.attempts++;
        const ok = (zone.dataset.accept === t.textContent.trim());
        if(ok){
          zone.classList.add("filled","correct");
          // snap tile into zone (badge is small — drop the ink-centering transform)
          t.classList.add("snapped");
          t.querySelector(".ink-glyph")?.style.removeProperty("transform");
          zone.appendChild(t);
          state.locked = true;
          SwiftPAL.emit("letter_image_match_first_try", {
            slide_id: slide.id, phase: slide.phase, value: true,
            first_try: state.attempts === 1, attempts: state.attempts,
            latency_ms: Date.now()-state.slideStart
          });
          celebrateThenAdvance(slide, false);
        } else {
          zone.classList.add("filled","wrong");
          setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
          dragWrong(slide);
          SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          if(state.attempts >= (CARD.scaffold_rules.max_attempts||3)){
            state.locked = true;
            // reveal = DEMONSTRATE, don't just tell: snap the letter into its picture (dimmed pulse)
            // with the spoken reveal line, then move on as success=false.
            showBox("", audioText(slide,"reveal") || "कोई बात नहीं! इसे यहाँ रखो।", "reveal", audioFor(slide,"reveal"), ()=>{});
            setTimeout(()=>{
              zone.classList.add("filled","correct","reveal-glow");
              t.classList.add("snapped");
              t.querySelector(".ink-glyph")?.style.removeProperty("transform");
              zone.appendChild(t);
              setTimeout(()=> completeSlide(false), 1300);
            }, 900);
          }
        }
      });
    }
  },

  MATCH_DRAG_N: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      // shuffle zones so order ≠ tile order
      const zones = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone";
        z.innerHTML = imgOrEmoji(p.img, p.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.picture||""}</span>`;
        z.dataset.accept = p.letter;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile"; t.innerHTML = `<span class="ink-glyph">${p.letter}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        t.classList.add("snapped"); t.querySelector(".ink-glyph")?.style.removeProperty("transform"); zone.appendChild(t);
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate one letter→picture match.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("snapped") && x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            SwiftPAL.emit("letter_image_match_first_try", {
              slide_id: slide.id, phase: slide.phase, value: true,
              letter: t.textContent, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            dragWrong(slide);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  SEQUENCE_DRAG: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // slots row
      const slots = document.createElement("div"); slots.className = "seq-slots";
      slide.data.correct_order.forEach((L,i) => {
        const sl = document.createElement("div"); sl.className = "seq-slot";
        sl.dataset.accept = L; sl.dataset.idx = String(i);
        sl.classList.add("dd-zone");      // reuse drop logic
        sl.innerHTML = `<span class="ordinal">${i+1}</span>`;
        slots.appendChild(sl);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "40px";
      slide.data.tiles.forEach(t => {
        const tl = document.createElement("div"); tl.className = "dd-tile"; tl.innerHTML = `<span class="ink-glyph">${t.letter}</span>`;
        tileRow.appendChild(tl);
      });
      wrap.appendChild(slots); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      let placed = 0, wrongStreak = 0, revealed = false; const need = slide.data.correct_order.length;
      state.attempts = 0; state.locked = false;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.remove("dd-zone");
        zone.classList.add("filled","correct");
        zone.innerHTML = `<span class="ordinal">${parseInt(zone.dataset.idx,10)+1}</span><span class="ink-glyph">${t.textContent.trim()}</span>`;
        centerInkGlyph(zone.querySelector(".ink-glyph"));
        t.remove();
        placed++;
        if(placed === need){
          state.locked = true;
          SwiftPAL.emit("letter_sequence_correct", {
            slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts, latency_ms: Date.now()-state.slideStart
          });
          setTimeout(()=> celebrateThenAdvance(slide, revealed), 250);
        }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate the NEXT slot in the order.
      const revealOne = ()=>{
        const zone = [...slots.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            settle(zone, t);
          } else {
            zone.classList.add("wrong");
            setTimeout(()=> zone.classList.remove("wrong"), 600);
            dragWrong(slide);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MASTERY_SILENT_PICK: {
    mount(host, slide){
      const mode = slide.data.mode;
      let stimulus = null, options = null, isCorrect = null, optionRenderer = null;
      if(mode === "sound_to_letter"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "picture_to_letter"){
        stimulus = stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img);
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "name_to_shape"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "object_to_shape"){
        stimulus = stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img);
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "shape_to_object"){
        stimulus = stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate});
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img);
      } else { // letter_to_picture
        stimulus = stimulusLetter(slide.data.letter);
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.picture, opt.emoji, opt.img);
      }
      // SAME scaffold as the rest of the lesson — hint button after 1st wrong,
      // correct/incorrect feedback popups, reveal-on-3rd-wrong. Not silent.
      // `mastery:true` keeps the mastery_score tracking (first-try = hit).
      mountTapOptions({
        slide, host, signalName: "mastery_item",
        stimulus, options, isCorrect, optionRenderer, mastery: true
      });
    }
  },

  STORY_SCENE: {
    // TEACH: one picture-story beat. Scene image fills the frame; narration VO plays on mount;
    // slow Ken-Burns pan keeps it alive for a pre-reader. Chain several in order for the story.
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "story-scene";
      const fb = String(d.emoji || "📖").replace(/'/g,"");
      wrap.innerHTML =
        '<div class="story-frame">' +
          '<img class="story-img" src="assets/Images/' + d.image_id + '.' + IMG_EXT + '" alt="' + (d.alt_hi||'') + '" ' +
            'onerror="var s=document.createElement(\'span\');s.className=\'story-fallback\';s.textContent=\'' + fb + '\';this.replaceWith(s);"/>' +
        '</div>' +
        (d.caption_hi ? '<div class="story-caption">' + d.caption_hi + '</div>' : '');
      host.appendChild(wrap);
      state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      state.replayAudio = ()=>{ play(audioFor(slide, "narration") || null, ()=>{}); };
      setSwMood("talk");
      let _armed = false;
      const _armNav = ()=>{ if(_armed) return; _armed = true; setNavActive(true); setSwMood("point"); };
      play(audioFor(slide, "narration") || null, _armNav);
      setTimeout(_armNav, 30000);   // watchdog: nav always eventually opens if VO buffers slowly
    }
  },

  STORY_QUESTION: {
    // TEST: a comprehension question after story beats. A recall thumb (visual anchor) + 🔊 chip
    // form the stimulus; options are 2–3 picture chips. Tap-to-answer feedback is inherited from
    // mountTapOptions. Recall thumb is a CUE, hidden at mastery / when data.hide_recall so the
    // answer isn't leaked by thumb-reading.
    mount(host, slide){
      const d = slide.data || {};
      const stim = document.createElement("div"); stim.className = "story-q-stim"; stim.style.cursor = "pointer";
      const hideRecall = slide.phase === "mastery" || d.hide_recall === true;
      const thumb = (!hideRecall && d.recall_image_id)
        ? '<img class="story-q-thumb" src="assets/Images/' + d.recall_image_id + '.' + IMG_EXT + '" alt="" ' +
          'onerror="this.style.display=\'none\';"/>'
        : '';
      stim.innerHTML = thumb +
        '<span class="story-q-listen"><span class="emoji">🔊</span>' +
        '<span class="lbl">' + (d.stim_hi || 'प्रश्न सुनो') + '</span></span>';
      stim.onclick = ()=>{ state.audioReplays++; play(audioFor(slide, "prompt") || null); };
      mountTapOptions({
        slide, host,
        signalName: d.signal_name || "story_question_first_try",
        stimulus: stim,
        options: d.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const cell = document.createElement("div");
          cell.innerHTML =
            imgOrEmoji(opt.img, opt.emoji, "story-q-opt-img", "story-q-opt-emoji") +
            (opt.label_hi ? '<span class="story-q-opt-label">' + opt.label_hi + '</span>' : '');
          return cell;
        },
        mastery: d.mastery === true,
        columnsHint: (d.options && d.options.length) <= 2 ? 2 : 3
      });
    }
  },

  TAP_IN_SCENE: {
    // "Tap the thing in the picture" — a PRODUCE-style comprehension mechanic (NOT an MCQ). A story
    // scene fills the frame; the child taps the target region(s) (e.g. the monkeys who took the caps).
    // A correct hotspot → confetti + advance; a miss → soft buzz + try_again VO; after a few idle
    // seconds the target gently pulses (hint). Data: {image_id, alt_hi, prompt, hotspots:[{x,y,w,h,
    // correct}] (as % of the frame), audio:{prompt,correct,try_again}}. Reusable for any "find X".
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "tis-scene";
      const frame = document.createElement("div"); frame.className = "tis-frame";
      const img = document.createElement("img"); img.className = "tis-img";
      img.src = "assets/Images/" + d.image_id + "." + IMG_EXT; img.alt = d.alt_hi || "";
      frame.appendChild(img);
      let done = false;
      const miss = ()=>{ if(done) return; sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide,"try_again")||null,()=>{}); };
      (d.hotspots || []).forEach(h => {
        const hs = document.createElement("button"); hs.className = "tis-hot" + (h.correct ? " correct-hot" : "");
        hs.style.left=h.x+"%"; hs.style.top=h.y+"%"; hs.style.width=h.w+"%"; hs.style.height=h.h+"%";
        hs.onclick = (e)=>{ e.stopPropagation(); if(done) return;
          if(h.correct){ done=true; hs.classList.add("hit"); sfxCorrect(); confettiCannon(); setSwMood("happy");
            SwiftPAL.emit(d.signal_name || "scene_tap_first_try", {slide_id:slide.id, phase:slide.phase, correct:true});
            play(audioFor(slide,"correct")||null, ()=> setTimeout(()=>completeSlide(true), 900)); }
          else { hs.classList.add("shake"); miss(); } };
        frame.appendChild(hs);
      });
      frame.onclick = miss;   // tapping empty scene = gentle try_again
      wrap.appendChild(frame); host.appendChild(wrap);
      $("navBtn").style.display = "none";   // advance on the correct tap — no आगे on a pick
      state.replayAudio = ()=> play(audioFor(slide,"prompt")||null, ()=>{});
      setSwMood("point");
      play(audioFor(slide,"prompt")||null, ()=>{});
      setTimeout(()=>{ if(!done) frame.querySelectorAll(".tis-hot.correct-hot").forEach(el=>el.classList.add("pulse")); }, 6000);
    }
  },

  PHASE_TRANSITION: {
    // Additive "learning journey" beat between arc phases (the MoM "no sense of progression" fix).
    // Full-screen friendly panel: badge + "अब हम ___ करेंगे" headline + a 5-dot journey map with the
    // current step lit. The header Swiftie presents it (ONE-Swiftie rule — no second mascot). Learner-
    // paced: no auto-advance timer; आगे unlocks when the beat's VO ends (immediately if silent).
    // data:{ headline_hi, icon?, step (1-based), total_steps?, to_phase? }. Build scripts weave one of
    // these before each phase change; older cards without it are untouched (purely additive).
    mount(host, slide){
      const d = slide.data || {};
      const panel = document.createElement("div"); panel.className = "phase-transition";
      const total = d.total_steps || 5, step = Math.min(d.step || 1, total);
      let map = '<div class="pt-map">';
      for(let i = 1; i <= total; i++){
        map += `<span class="pt-step ${i < step ? 'done' : i === step ? 'current' : ''}"></span>`;
        if(i < total) map += '<span class="pt-connector"></span>';
      }
      map += '</div>';
      panel.innerHTML =
        `<div class="pt-badge">${d.icon || '🎯'}</div>` +
        `<div class="pt-headline">${d.headline_hi || slide.prompt_hi || ''}</div>` + map;
      host.appendChild(panel);
      setSwMood("teach");
      SwiftPAL.emit("phase_transition_shown", { slide_id: slide.id, to_phase: d.to_phase || slide.phase, step });
      state.ownsAudio = true; state.locked = false; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const vo = audioFor(slide, "prompt");
      if(vo) play(vo, ()=> setNavActive(true)); else setNavActive(true);
    }
  },

  CELEBRATION: {
    /* [ui: reference shell] the end screen as the reference draws it: the sunburst, the gold star burst, Swiftie standing
       still while the celebration jingle plays; on its end (or 1.8s) Swiftie's celebration clip plays and the line is
       spoken; the gold → button arrives when the line has ended. Same signals, same proceed hand-off as before. */
    mount(host, slide){
      state.ownsAudio = true;   // the line is spoken here, after the jingle (not by the auto chain)
      const et = $("endTitle"); if(et) et.textContent = slide.prompt_hi || "";
      const st = $("endSubtitle"); if(st) st.textContent = (slide.data && slide.data.end_subtitle) || "";
      const es = $("endScreen"); es.classList.add("show");
      document.body.classList.add("is-end");   // r4: immersive sunburst backdrop (end_screen.webp)
      const em = es.querySelector(".end-mascot");
      const setSw = u =>{ try{ if(!em) return; em.removeAttribute("src"); void em.offsetWidth; em.setAttribute("src", u); }catch(e){} };
      setSw("assets/last_swifty_still.webp");
      let spoke = false;
      const speak = ()=>{
        if(spoke || !$("endScreen").classList.contains("show")) return; spoke = true;
        setSw(Assets.fresh("assets/last_swifty_end.webp"));
        play(audioFor(slide, "prompt") || null, ()=>{ if(state.endBtnPending){ $("endBtn").classList.add("show"); state.endBtnPending = false; } });
      };
      setTimeout(speak, 1800);
      // celebration SFX — own Audio element so it overlaps the spoken VO chain
      playSfx(slide.audio && slide.audio.sfx ? slide.audio.sfx : "sfx_celebrate", speak);
      const c = $("confetti"); c.innerHTML = "";
      starBurst();   // gold star burst from centre
      const masteryScore = state.masteryAttempts ? (state.masteryHits/state.masteryAttempts) : 0;
      SwiftPAL.emit("mastery_score", { value: masteryScore, hits: state.masteryHits, attempts: state.masteryAttempts });
      SwiftPAL.emit("lesson_completed", { skill_code: CARD.skill_code, total_signals: SwiftPAL.signals.length });
      runValidator();
      setNavActive(false);
      // "आगे बढ़ें" appears only AFTER the celebration VO finishes
      const eb = $("endBtn"); eb.classList.remove("show");
      state.endBtnPending = true;
      // dev-only: a small "download results" button (teacher/QA), never in child flow
      if(new URLSearchParams(location.search).has("dev") && !$("dlResults")){
        const dl = document.createElement("button"); dl.id = "dlResults"; dl.textContent = "⬇ results JSON";
        dl.style.cssText = "position:absolute;bottom:20px;left:20px;z-index:5;font-family:var(--font-hi);font-weight:700;font-size:16px;padding:8px 16px;border-radius:12px;border:2px solid #B7DCFB;background:#fff;color:var(--navy);cursor:pointer;";
        dl.onclick = ()=> SwiftPAL.downloadResults();
        es.appendChild(dl);
      }
      eb.onclick = ()=>{
        SwiftPAL.emit("proceed_next", { skill_code: CARD.skill_code, part: CARD.part_label });
        try{ window.parent?.postMessage({type:"swiftpal:proceed", skill_code:CARD.skill_code, part:CARD.part_label}, "*"); }catch(e){}
      };
    }
  }
};

/* VACHAN (एकवचन/बहुवचन) + any 2-category attribute reuse the GENERIC gender modules — identical
   mechanic, just different labels. A vachan game authors these types with the category in the
   "gender" field (e.g. "S"/"P"), the two labels, and (for pairs) f=singular / m=plural; it then
   inherits immediate tap-to-answer feedback, speak-word-on-tap, layered hints, and the engine
   guard for free. Named *_VACHAN (not *_NUMBER) to avoid colliding with MEET_NUMBER = counting. */
SlideModules.VACHAN_INTRO          = SlideModules.GENDER_INTRO;
SlideModules.MEET_VACHAN           = SlideModules.MEET_GENDER;
SlideModules.TAP_VACHAN            = SlideModules.TAP_GENDER;
SlideModules.TAP_PICTURE_BY_VACHAN = SlideModules.TAP_PICTURE_BY_GENDER;
SlideModules.SORT_VACHAN           = SlideModules.SORT_GENDER;
SlideModules.MATCH_VACHAN_PAIRS    = SlideModules.MATCH_GENDER_PAIRS;

/* =====================================================================================
   12b. STORY ↔ NUMBER-SENTENCE KIT — MTG2A01_L05_S01 (SME/LXD review_v2 deck)
   Additive modules (nothing above is changed by them):
     teach : STORY_READ · WORKED_EXAMPLE · COMPARE_STORIES
     test  : SIGN_DRAG · PICK_SENTENCE · BUILD_SENTENCE · PICK_STORY · STORY_FILL
     story : PALACE_SCENE (the "रहस्यमयी महल" adventure that wraps the STORY_FILL doors)
   Shared plumbing: word-timed VO (CARD.assets.audio_words → karaoke + "highlight X in sync
   with the VO"), an equation renderer, counted-object groups in rows of ten, a hint-animation
   overlay, and a pointer-event drag with a real animated bounce-back.
   ===================================================================================== */
const SM_SPOKEN = { "+":"जोड़", "−":"घटा", "=":"बराबर", "?":"कितना" };
function smEsc(s){ return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c])); }
function smNorm(w){ return String(w || "").replace(/[।?!,.—–"“”'’]/g, "").trim(); }
function smVO(id){ return id ? "assets/Audio/" + id + "." + AUDIO_EXT : null; }
function smText(id){ return (CARD.assets && CARD.assets.audio_text && CARD.assets.audio_text[id]) || ""; }
/* word table for a clip: [{ms, s, e, w}] from the build-injected word boundaries; if a clip has
   none (e.g. re-voiced later) we estimate ~420 ms/word so every cue still fires in order. */
function smWords(id){
  const t = smText(id), raw = CARD.assets && CARD.assets.audio_words && CARD.assets.audio_words[id];
  if(raw && raw.length) return raw.map(r => ({ ms:r[0], s:r[1], e:r[2], w:t.slice(r[1], r[2] + 1) }));
  const out = [], re = /[^\s।?!,]+/g; let m, i = 0;
  while((m = re.exec(t))) out.push({ ms:120 + 420 * (i++), s:m.index, e:m.index + m[0].length - 1, w:m[0] });
  return out;
}
function smDur(id){ const w = smWords(id); return w.length ? w[w.length - 1].ms + 900 : 900; }
function smFind(id, token, from){
  const ws = smWords(id), want = SM_SPOKEN[token] || String(token);
  for(let j = from || 0; j < ws.length; j++) if(smNorm(ws[j].w) === want) return j;
  return -1;
}
function smAt(id, token, from){ const j = smFind(id, token, from); return j < 0 ? null : smWords(id)[j].ms; }
/* times at which an equation's tokens are read in order: ["23","+","12","=","35"] → [ms…] */
function smSeqTimes(id, tokens, from){
  const ws = smWords(id); let j = from || 0;
  return tokens.map(t => { const k = smFind(id, t, j); if(k < 0) return null; j = k + 1; return ws[k].ms; });
}
/* start time of every sentence in a clip (a sentence ends at । ? !) */
function smSentenceStarts(id){
  const t = smText(id), ws = smWords(id), out = []; let fresh = true;
  ws.forEach((w, i) => {
    if(fresh){ out.push(w.ms); fresh = false; }
    const nx = i + 1 < ws.length ? ws[i + 1].s : t.length;
    if(/[।?!]/.test(t.slice(w.e + 1, nx))) fresh = true;
  });
  return out;
}

/* smPlay(id, cues, onEnd): play a VO clip and fire cues [{at:ms, fn}] against the clip's own clock
   (audio.currentTime). Missing/blocked audio → a simulated clock of the clip's length, so the
   choreography still runs. Any stopAudio()/play() supersedes it silently (no stale callbacks). */
function smPlay(id, cues, onEnd){
  stopAudio(); setPlaying(true);
  const tok = _smTok;
  const list = (cues || []).filter(c => c && c.at != null && c.fn).sort((a, b) => a.at - b.at);
  let k = 0, done = false, simT0 = null, iv = null;
  const fireTo = ms => { while(k < list.length && list[k].at <= ms){ const c = list[k++]; try{ c.fn(); }catch(e){ console.error(e); } } };
  const src = smVO(id), a = src ? new Audio(src) : null;
  const finish = () => {
    if(done) return; done = true; clearInterval(iv);
    if(tok !== _smTok) return;
    fireTo(Infinity);
    if(currentAudio === a) currentAudio = null;
    setPlaying(false);
    if(onEnd) onEnd();
  };
  const simulate = () => {
    if(simT0 !== null || done) return;
    simT0 = performance.now();
    if(a && currentAudio === a) currentAudio = null;
    setTimeout(finish, id ? smDur(id) : 300);
  };
  if(a){ currentAudio = a; a.onended = finish; a.onerror = simulate; const p = a.play(); if(p && p.catch) p.catch(simulate); }
  else simulate();
  iv = setInterval(() => {
    if(done || tok !== _smTok){ clearInterval(iv); return; }
    fireTo(simT0 !== null ? performance.now() - simT0 : (a ? a.currentTime * 1000 : 0));
  }, 30);
}
/* run steps in order: a step is a clip {id, cues:()=>[…], pre:()=>{}, gap}, a pause (number of ms),
   or a function(next). Stops as soon as the slide is left (alive() false). */
function smSteps(steps, alive, onDone){
  let i = 0;
  (function next(){
    if(!alive()) return;
    if(i >= steps.length){ if(onDone) onDone(); return; }
    const s = steps[i++];
    if(typeof s === "number"){ setTimeout(next, s); return; }
    if(typeof s === "function"){ s(next); return; }
    if(s.pre) s.pre();
    smPlay(s.id, s.cues ? s.cues() : [], () => { if(s.post) s.post(); setTimeout(next, s.gap != null ? s.gap : 280); });
  })();
}
function smAlive(){ const g = state.mountGen; return () => state.mountGen === g; }
function smLater(alive, ms, fn){ setTimeout(() => { if(alive()) fn(); }, ms); }
function smEl(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }

/* ---------- story text: one span per spoken word, wrapped in sentence spans ---------- */
function smStoryHTML(id){
  const t = smText(id), ws = smWords(id);
  let html = '<span class="sm-sent" data-s="0">', pos = 0, s = 0;
  ws.forEach((w, i) => {
    html += smEsc(t.slice(pos, w.s));
    const n = smNorm(w.w), isNum = /^\d+$/.test(n);
    html += `<span class="sm-w${isNum ? " sm-n" : ""}" data-w="${i}"${isNum ? ` data-n="${n}"` : ""}>${smEsc(w.w)}</span>`;
    pos = w.e + 1;
    const nx = i + 1 < ws.length ? ws[i + 1].s : t.length, gap = t.slice(pos, nx);
    if(i < ws.length - 1 && /[।?!]/.test(gap)){
      html += smEsc(gap.replace(/\s+$/, "")) + `</span> <span class="sm-sent" data-s="${++s}">`;
      pos = nx;
    }
  });
  html += smEsc(t.slice(pos)) + "</span>";
  // the story's question goes on its own line (as in the deck's mockups): tag a trailing "…?" sentence
  return /\?\s*$/.test(t) && s > 0 ? html.replace(new RegExp(`<span class="sm-sent" data-s="${s}">`), `<span class="sm-sent q" data-s="${s}">`) : html;
}
/* karaoke: light each word of `box` as clip `id` speaks it */
function smKaraoke(box, id){
  const spans = [...box.querySelectorAll(".sm-w")];
  return smWords(id).map((w, i) => ({ at:w.ms, fn:() => spans.forEach((sp, j) => { sp.classList.toggle("on", j === i); if(j < i) sp.classList.add("read"); }) }));
}
function smKaraokeClear(box){ box.querySelectorAll(".sm-w").forEach(sp => sp.classList.remove("on", "read")); }
/* light the story's numerals as a hint clip says them ("highlight the numbers in the story in sync") */
function smNumCues(box, id){
  return smWords(id).filter(w => /^\d+$/.test(smNorm(w.w))).map(w => ({ at:w.ms, fn:() => {
    box.querySelectorAll(`.sm-n[data-n="${smNorm(w.w)}"]`).forEach(sp => { sp.classList.remove("hl"); void sp.offsetWidth; sp.classList.add("hl"); });
  } }));
}

/* ---------- number sentences ---------- */
function smTokCls(t){ return t === "+" ? "op add" : t === "−" ? "op sub" : t === "=" ? "eqs" : t === "?" ? "q" : "num"; }
function smParseEq(s){ return String(s).trim().split(/\s+/); }
function smSign(tokens){ return tokens.indexOf("+") >= 0 ? "add" : tokens.indexOf("−") >= 0 ? "sub" : ""; }
function smEqHTML(tokens){ return tokens.map((t, i) => `<span class="sm-tok ${smTokCls(t)}" data-i="${i}">${smEsc(t)}</span>`).join(""); }
/* "highlight each number and symbol sequentially in sync with the VO" over token elements */
function smTokCues(id, els, tokens, from){
  const times = smSeqTimes(id, tokens, from || 0);
  return times.map((ms, i) => ms == null ? null : { at:ms, fn:() => els.forEach((e, j) => { if(e) e.classList.toggle("lit", j === i); }) }).filter(Boolean);
}
function smUnlit(root){ root.querySelectorAll(".lit").forEach(e => e.classList.remove("lit")); }

/* ---------- counted objects (rows of ten) ---------- */
const SM_COLORS = ["#4EA3F0", "#F9695E", "#4EBE6A", "#FDC23C", "#9B7BE8", "#FF8FB1"];
const SM_BANGLE = ["#E84393", "#F5A623", "#2DB36B", "#4E7CF0", "#D63031", "#9B59B6"];
const SM_EMO = { bird:"🐦", person:"🧑", banana:"🍌", boy:"👦", girl:"👧" };
/* [art] the generated illustrations (assets/Images/obj_*.webp). A missing file falls back to the old drawing. */
const SM_IMG = { marble:"obj_marble", bird:"obj_bird_sit", balloon:"obj_balloon", laddoo:"obj_laddoo",
                 banana:"obj_banana", person:"obj_passenger", boy:"obj_boy", girl:"obj_girl" };
const smArt = f => "assets/Images/" + f + ".webp";
function smImgFail(img, kind, i){ const t = document.createElement("template"); t.innerHTML = smItemDrawn(kind, +i || 0);
  const el = t.content.firstElementChild; el.className += " " + [...img.classList].filter(c => /^(hide|pop|in|ga|gb)$/.test(c)).join(" "); img.replaceWith(el); }
function smItem(kind, i){
  const f = SM_IMG[kind];
  if(f) return `<img class="sm-it sm-img sm-${kind}" src="${smArt(f)}" alt="" draggable="false" onerror="smImgFail(this,'${kind}',${i})">`;
  return smItemDrawn(kind, i);
}
function smItemDrawn(kind, i){
  if(kind === "marble")  return `<i class="sm-it sm-marble" style="--c:${SM_COLORS[i % 6]}"></i>`;
  if(kind === "bangle")  return smBangleSVG(i);
  if(kind === "balloon") return `<i class="sm-it sm-balloon" style="--c:${SM_COLORS[i % 6]}"></i>`;
  if(kind === "laddoo")  return `<i class="sm-it sm-laddoo"></i>`;
  return `<i class="sm-it sm-emo sm-${kind}">${SM_EMO[kind] || "●"}</i>`;
}
/* a bangle drawn in SVG, hanging on the stall's rod the way a real one does: tilted in perspective, the rod running through
   its upper part. Its back half (the darker inside of the band) passes BEHIND the rod and its front half (red lacquer, gold
   edges, little yellow flowers, a shine) crosses in front - the svg carries a piece of the rod between the two halves,
   cut to the stall picture's own rod (same rows, same wood shading), so the real rod and the piece read as one.
   Units are the stall picture's pixels (900 x 600); smBangleSpot places bangle i on its rod in % of the picture. */
const SM_ROD = [[112, 148], [214, 250], [318, 353]];          // rod rows (top, bottom) in prop_bangle_stand
function smBangleSpot(i){
  const r = Math.floor(i / 20) % 3, k = i % 20, cx = 145 + 15.2 + k * 30.4, cy = (SM_ROD[r][0] + SM_ROD[r][1]) / 2;
  return { left:(cx - 17) / 9, top:(cy - 40) / 6, width:34 / 9 };
}
function smBangleSVG(i){
  if(!document.getElementById("smBangleDefs")) document.body.insertAdjacentHTML("beforeend",
    `<svg id="smBangleDefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>` +
      `<linearGradient id="smBgBand" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#E3182F"/><stop offset=".5" stop-color="#FF5C61"/>` +
        `<stop offset="1" stop-color="#9C0A1E"/></linearGradient>` +
      `<linearGradient id="smBgGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFF2B8"/><stop offset=".5" stop-color="#E8B23A"/>` +
        `<stop offset="1" stop-color="#9C6A0E"/></linearGradient>` +
      `<linearGradient id="smBgRod" x1="0" x2="0" y1="0" y2="1"><stop offset="0.014" stop-color="#4E1C0A"/><stop offset="0.042" stop-color="#471400"/><stop offset="0.069" stop-color="#915620"/><stop offset="0.097" stop-color="#F6B66B"/><stop offset="0.125" stop-color="#F9B45A"/><stop offset="0.153" stop-color="#F6AC4D"/><stop offset="0.208" stop-color="#FBB053"/><stop offset="0.236" stop-color="#FCB358"/><stop offset="0.264" stop-color="#FBB156"/><stop offset="0.292" stop-color="#F5A74C"/><stop offset="0.319" stop-color="#EE9C42"/><stop offset="0.375" stop-color="#EC923E"/><stop offset="0.431" stop-color="#E48838"/><stop offset="0.486" stop-color="#DB7E32"/><stop offset="0.542" stop-color="#D47830"/><stop offset="0.569" stop-color="#CF7433"/><stop offset="0.597" stop-color="#C1682C"/><stop offset="0.625" stop-color="#B55D26"/><stop offset="0.681" stop-color="#AA5423"/><stop offset="0.736" stop-color="#A14E20"/><stop offset="0.819" stop-color="#A04E1F"/><stop offset="0.875" stop-color="#A35529"/><stop offset="0.903" stop-color="#944E2B"/><stop offset="0.931" stop-color="#5C1F02"/><stop offset="0.958" stop-color="#4A1602"/><stop offset="0.986" stop-color="#572006"/></linearGradient>` +
    `</defs></svg>`);
  // the ring: centre 13px below the rod's centre (the rod runs through its upper third), 19 x 92 band, tilted 6deg
  const r = Math.floor((+i || 0) / 20) % 3, rt = SM_ROD[r][0] - ((SM_ROD[r][0] + SM_ROD[r][1]) / 2 - 40), rh = SM_ROD[r][1] - SM_ROD[r][0];
  const CY = 53, RX = 8.6, RY = 45.5, W = 4.5, TILT = `rotate(6 17 ${CY})`;
  const half = (rx, ry, side) => `M17 ${CY - ry}A${rx} ${ry} 0 0 ${side} 17 ${CY + ry}`;    // side 0 = left (back), 1 = right (front)
  return `<svg class="sm-it sm-bngl" viewBox="0 0 34 106" aria-hidden="true">` +
    `<ellipse class="bg-glow" cx="17" cy="${CY}" rx="${RX}" ry="${RY}" transform="${TILT}" fill="none" stroke="#FFC800" stroke-width="15" stroke-opacity=".5"/>` +
    `<g transform="${TILT}" fill="none">` +
      `<path d="${half(RX, RY, 0)}" stroke="#8A0B1D" stroke-width="${2 * W}"/>` +
      `<path d="${half(RX + W, RY + W, 0)}" stroke="#B0801E" stroke-width="1.6"/><path d="${half(RX - W, RY - W, 0)}" stroke="#B0801E" stroke-width="1.4"/>` +
    `</g>` +
    `<rect class="bg-rod" x="2.5" y="${rt}" width="29" height="${rh}" fill="url(#smBgRod)"/>` +
    `<g transform="${TILT}" fill="none" stroke-linecap="round">` +
      `<path d="${half(RX, RY, 1)}" stroke="url(#smBgBand)" stroke-width="${2 * W}"/>` +
      `<path d="${half(RX + W, RY + W, 1)}" stroke="url(#smBgGold)" stroke-width="2"/><path d="${half(RX - W, RY - W, 1)}" stroke="url(#smBgGold)" stroke-width="1.7"/>` +
      `<path d="${half(RX, RY, 1)}" stroke="#FFE15A" stroke-width="3.8" stroke-dasharray=".01 9.5"/>` +
      `<path d="M20.5 13 Q26.5 19 27.4 34" stroke="#fff" stroke-opacity=".8" stroke-width="1.6"/>` +
    `</g>` +
  `</svg>`;
}
function smGroup(kind, n, opt){
  opt = opt || {};
  const cols = Math.min(opt.cols || 10, Math.max(n, 1));
  let h = `<div class="sm-grp sm-grp-${kind} ${opt.cls || ""}" style="--cols:${cols}">`;
  for(let i = 0; i < n; i++){ let it = smItem(kind, (opt.offset || 0) + i); if(opt.hide) it = it.replace('class="sm-it ', 'class="sm-it hide '); h += it; }
  return h + "</div>";
}
function smPopIn(items, stagger, sound){
  items.forEach((it, i) => {
    it.classList.add("hide");
    setTimeout(() => { it.classList.remove("hide"); it.classList.add("pop"); if(sound && i % 2 === 0) sound(i); }, i * stagger);
  });
  return items.length * stagger;
}
const sfxPop    = (i) => _tone([620 + (i % 10) * 34], "sine", 0.07, 0.05);
const sfxClink  = (i) => _tone([1500 + (i % 5) * 60, 2100], "triangle", 0.09, 0.035);
/* a glass marble set down (T1): a bright glassy "tik" - three inharmonic partials with a fast decay over a tiny noise
   click - its pitch a little different for every marble, so a group popping in sounds like marbles clattering into a pile */
function sfxMarble(i){ const c = _ac(); if(!c) return; try{
  const t0 = c.currentTime + Math.random() * .012, f = 1900 + ((i * 37) % 9) * 85 + Math.random() * 110;
  [[1, .15, .10], [2.32, .06, .055], [3.93, .03, .032]].forEach(([m, v, d]) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = f * m;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + .003); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + d + .02); });
  const n = Math.floor(c.sampleRate * .01), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
  for(let k = 0; k < n; k++) ch[k] = (Math.random() * 2 - 1) * (1 - k / n);
  const src = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; hp.type = "highpass"; hp.frequency.value = 3200; g.gain.value = .09;
  src.connect(hp).connect(g).connect(c.destination); src.start(t0); }catch(e){} }
const sfxFlap   = ()  => _tone([700, 980, 1250, 1500], "sine", 0.32, 0.05);
const sfxWhoosh = ()  => _tone([300, 420, 560, 760, 980], "triangle", 0.38, 0.05);
const sfxSparkle= ()  => _tone([1320, 1760, 2090, 2640], "sine", 0.6, 0.06);

/* stage-space geometry (the stage is CSS-scaled; work in its own 1333×750 pixels) */
function smScale(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1; }
function smRect(el){
  const s = smScale(), r = el.getBoundingClientRect(), st = $("stage").getBoundingClientRect();
  return { x:(r.left - st.left) / s, y:(r.top - st.top) / s, w:r.width / s, h:r.height / s };
}
function smDelta(from, to){ const a = smRect(from), b = smRect(to); return { dx:b.x + b.w / 2 - (a.x + a.w / 2), dy:b.y + b.h / 2 - (a.y + a.h / 2) }; }
/* fly a visual copy of `src` onto `dst`, then cb (used for tap-to-place + the ghost-drag hint) */
function smFly(src, dst, ms, cb, opt){
  opt = opt || {};
  const a = smRect(src), c = src.cloneNode(true), d = smDelta(src, dst);
  c.classList.add("sm-flyer"); if(opt.ghost) c.classList.add("ghost");
  c.style.cssText = `position:absolute;left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;margin:0;z-index:${opt.z || 76};` +
                    `transition:transform ${ms}ms cubic-bezier(.45,.05,.3,1),opacity ${ms}ms ease;`;
  $("stage").appendChild(c);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    c.style.transform = `translate(${d.dx}px,${d.dy}px) scale(${opt.scale || 1})`;
    if(opt.fade) c.style.opacity = "0";
  }));
  setTimeout(() => { c.remove(); if(cb) cb(); }, ms + 40);
}
/* move real items onto target slots (merge animations) */
function smMoveOnto(items, targets, ms, stagger, extra){
  const ds = items.map((it, i) => targets[i] ? smDelta(it, targets[i]) : null);
  items.forEach((it, i) => {
    if(!ds[i]) return;
    setTimeout(() => {
      it.style.transition = `transform ${ms}ms cubic-bezier(.45,.05,.3,1)`;
      it.style.transform = `translate(${ds[i].dx}px,${ds[i].dy}px)` + (extra || "");
    }, i * (stagger || 0));
  });
  return ms + items.length * (stagger || 0);
}

/* ---------- pointer drag with an animated bounce-back ----------
   h.can(el) → may it move · h.drop(zone, el) → true = placed (keep) · h.tap(el) → plain tap */
function smBounceBack(el){
  el.style.transition = "transform .42s cubic-bezier(.34,1.56,.64,1)";
  el.style.transform = "";
  setTimeout(() => { el.style.transition = ""; }, 460);
}
function smDraggable(el, h){
  let sx = 0, sy = 0, dx = 0, dy = 0, on = false, moved = false, pid = null, sc = 1;
  el.style.touchAction = "none";
  const zoneAt = (x, y) => {
    el.style.pointerEvents = "none";
    const under = document.elementFromPoint(x, y);
    el.style.pointerEvents = "";
    return under && under.closest ? under.closest(".sm-zone") : null;
  };
  el.addEventListener("pointerdown", e => {
    if(e.button > 0 || (h.can && !h.can(el))) return;
    on = true; moved = false; pid = e.pointerId; sc = smScale(); sx = e.clientX; sy = e.clientY; dx = dy = 0;
    try{ el.setPointerCapture(pid); }catch(_){}
    el.style.transition = "none";
    e.preventDefault();
  });
  el.addEventListener("pointermove", e => {
    if(!on || e.pointerId !== pid) return;
    dx = (e.clientX - sx) / sc; dy = (e.clientY - sy) / sc;
    if(!moved && Math.hypot(dx, dy) > 8){ moved = true; el.classList.add("sm-dragging"); if(h.start) h.start(el); }
    if(!moved) return;
    el.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
    const z = zoneAt(e.clientX, e.clientY);
    document.querySelectorAll(".sm-zone.hover").forEach(q => { if(q !== z) q.classList.remove("hover"); });
    if(z && !z.classList.contains("filled")) z.classList.add("hover");
  });
  const end = e => {
    if(!on || e.pointerId !== pid) return;
    on = false;
    try{ el.releasePointerCapture(pid); }catch(_){}
    el.classList.remove("sm-dragging");
    document.querySelectorAll(".sm-zone.hover").forEach(q => q.classList.remove("hover"));
    if(!moved){ el.style.transform = ""; if(h.tap) h.tap(el); return; }
    const z = zoneAt(e.clientX, e.clientY);
    const keep = (z && !z.classList.contains("filled") && h.drop) ? h.drop(z, el) : false;
    if(!keep) smBounceBack(el);
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}
function smWiggle(el, delay){
  if(!el) return;
  setTimeout(() => { el.classList.remove("sm-wiggle"); void el.offsetWidth; el.classList.add("sm-wiggle"); setTimeout(() => el.classList.remove("sm-wiggle"), 650); }, delay || 0);
}
/* birds sit on stacked wires, ten to a wire (23 = 10 + 10 + 3 — the deck's rows-of-ten brief). DOM order
   runs wire by wire, so "the last 12 fly away" leaves 10 + 1 on the wires. */
function smBirdsHTML(n, opt){
  opt = opt || {};
  let rows = "";
  for(let r = 0; r * 10 < n; r++){
    let birds = "";
    for(let i = r * 10; i < Math.min(n, r * 10 + 10); i++) birds += `<img class="sm-bird${opt.hide ? " hide" : ""}" src="${smArt("obj_bird_sit")}" alt="" draggable="false" style="--d:${((i * 0.37) % 3).toFixed(2)}s">`;
    rows += `<div class="sm-wire-row"><div class="sm-birds">${birds}</div></div>`;
  }
  return `<div class="sm-wire-scene${opt.mini ? " mini" : ""}"><i class="sm-pole l"></i><i class="sm-pole r"></i>${rows}</div>`;
}
/* birds leave the wire on staggered, slightly different flight paths */
function smFlyBirds(birds, stagger){
  sfxFlap();
  birds.forEach((el, i) => setTimeout(() => {
    /* [ui] as T1's marbles: a grey, faded bird stays on the wire in the spot this one leaves (laid down as it takes off) */
    if(el.parentElement && !el._ghost){
      const g = el.cloneNode(true); g.className = "sm-bird sm-bird-ghost"; g.removeAttribute("style"); g.setAttribute("aria-hidden", "true");
      g.style.left = el.offsetLeft + "px"; g.style.top = el.offsetTop + "px"; el.parentElement.insertBefore(g, el); el._ghost = g;
    }
    if(el.tagName === "IMG") el.src = smArt("obj_bird_fly");   // [art] wings out as it takes off
    el.style.setProperty("--fx", (140 + (i * 37) % 180) + "px");
    el.style.setProperty("--fy", -(170 + (i * 53) % 110) + "px");
    el.classList.add("fly");
  }, i * (stagger || 70)));
}

/* ---------- hint animation overlay (WA "play the animation of …") ----------
   cfg: {type:"add"|"remove"|"merge", kind, a, b, kindB?, from?, to?, wrap?, labelA?, labelB?} */
function smAnimate(cfg, alive, onDone){
  const stage = $("stage");
  const ov = smEl("div", "sm-anim-ov"), card = smEl("div", "sm-anim-card sm-wrap-" + (cfg.wrap || "plain"));
  const badge = smEl("div", "sm-anim-count", String(cfg.a));
  ov.appendChild(card); stage.appendChild(ov);
  stage.classList.add("blurred");
  const close = () => { ov.classList.add("out"); stage.classList.remove("blurred"); setTimeout(() => ov.remove(), 260); if(onDone) onDone(); };
  const total = cfg.type === "remove" ? cfg.a : cfg.a + cfg.b;
  if(cfg.type === "merge"){
    card.innerHTML =
      `<div class="sm-anim-row">` +
        `<div class="sm-anim-side"><div class="sm-anim-lbl">${cfg.labelA || cfg.a}</div>${smGroup(cfg.kind, cfg.a, { cols:10, cls:"ga" })}</div>` +
        `<div class="sm-anim-side"><div class="sm-anim-lbl">${cfg.labelB || cfg.b}</div>${smGroup(cfg.kindB || cfg.kind, cfg.b, { cols:10, cls:"gb" })}</div>` +
      `</div>` +
      `<div class="sm-anim-merge"><div class="sm-grp sm-grp-slots" style="--cols:10">${"<i class=\"sm-it sm-tgt\"></i>".repeat(total)}</div></div>`;
    const ga = [...card.querySelectorAll(".ga .sm-it")], gb = [...card.querySelectorAll(".gb .sm-it")];
    const slots = [...card.querySelectorAll(".sm-anim-merge .sm-tgt")];
    const t = smPopIn(ga, 22, sfxPop);
    smLater(alive, t + 200, () => {
      const t2 = smPopIn(gb, 22, sfxPop);
      smLater(alive, t2 + 900, () => {
        // the two groups travel into ONE group (rows of ten): the items themselves move, nothing is swapped
        sfxWhoosh(); card.querySelector(".sm-anim-row").classList.add("merging");
        const tm = smMoveOnto(ga.concat(gb), slots, 900, 12);
        smLater(alive, tm + 120, () => {
          badge.textContent = String(total); badge.classList.add("up"); card.appendChild(badge); sfxCorrect();
          smLater(alive, 2200, close);
        });
      });
    });
    return;
  }
  /* [art] each hint scene is staged with its props: the bus (passengers sit in its windows, the new ones walk in from
     the bus stop), the bangle stand (bangles hang on its rods; the sold ones fly into the shopping bag), Dadi handing
     balloons up into the sky, the plate (laddoos hop over to the children eating), the basket (bananas to the monkey). */
  const PROP = { "🚏":"prop_bus_stop", "🛍️":"prop_shopping_bag", "👵":"char_dadi", "😋":"char_kids_eating", "🐒":"char_monkey" };
  const WRAP = { bus:"prop_bus", shop:"prop_bangle_stand", plate:"prop_plate", basket:"prop_basket" };
  const COLS = { bus:20, shop:20 };
  const ends = (e, cls) => !e ? "" : `<div class="${cls}">` + (PROP[e] ? `<img src="${smArt(PROP[e])}" alt="" draggable="false" onerror="this.replaceWith('${e}')">` : e) + `</div>`;
  const n = cfg.type === "add" ? cfg.a + cfg.b : cfg.a;
  card.innerHTML =
    `<div class="sm-anim-scene">` + ends(cfg.from, "sm-anim-src") +
      `<div class="sm-anim-box${WRAP[cfg.wrap] ? " has-prop" : ""}">` +
        (WRAP[cfg.wrap] ? `<img class="sm-anim-prop" src="${smArt(WRAP[cfg.wrap])}" alt="" draggable="false" onerror="this.remove()">` : "") +
        `<div class="sm-anim-grid">${smGroup(cfg.kind, n, { cols:COLS[cfg.wrap] || 10 })}</div>` +
        (cfg.wrap === "bus" ? `<img class="sm-anim-front" src="${smArt("prop_bus_front")}" alt="" draggable="false" onerror="this.remove()">` : "") +
      `</div>` + ends(cfg.to, "sm-anim-dst") +
    `</div>`;
  card.appendChild(badge);
  const items = [...card.querySelectorAll(".sm-anim-grid .sm-it")];
  /* the bus: the passengers sit IN its five windows - two staggered rows of four per window, the back row a little smaller
     and higher, the front row's shoulders hidden by the window sill (the bus's front layer, with see-through glass, is drawn
     over them). The ones already aboard fill the rear windows; the new ones board into the front windows by the door. */
  if(cfg.wrap === "shop" && items.length <= 60 && items[0] && items[0].classList.contains("sm-bngl")){
    items[0].parentElement.classList.add("hung");
    items.forEach((it, i) => { const p = smBangleSpot(i); it.style.left = p.left.toFixed(3) + "%"; it.style.top = p.top.toFixed(3) + "%"; it.style.width = p.width.toFixed(3) + "%"; });
  }
  if(cfg.wrap === "bus" && items.length <= 40 && card.querySelector(".sm-anim-front")){
    const WIN = [[7.56, 20.22], [21.33, 34.22], [35.33, 48.44], [49.56, 62.67], [63.78, 77.56]], WT = 25.6, WB = 48.97, AR = 900 / 390;
    items[0].parentElement.classList.add("seated");
    items.forEach((it, i) => {
      const w = WIN[Math.floor(i / 8)], k = i % 8, front = k >= 4, s = k % 4, ww = w[1] - w[0];
      const size = front ? 5.4 : 4.8, hPct = size * AR;                      // width in % of the bus width, height in % of its height
      const cx = w[0] + ww * (front ? [0.14, 0.38, 0.62, 0.86] : [0.2, 0.43, 0.66, 0.89])[s] - (front ? 0 : ww * 0.04);
      const top = front ? WB - hPct * 0.62 : WT + (WB - WT) * 0.2;
      it.style.left = (cx - size / 2).toFixed(2) + "%"; it.style.top = top.toFixed(2) + "%"; it.style.width = size + "%";
    });
  }
  const endImg = sel => card.querySelector(sel + " img") || card.querySelector(sel);
  const bump = el => { if(el && el.animate) el.animate([{ scale:"1" }, { scale:"1.1 .92", offset:.35 }, { scale:".97 1.04", offset:.7 }, { scale:"1" }], { duration:320, easing:"ease-out" }); };
  /* an arc between two points (WAAPI): `lift` px up at the middle, landing with a little squash.
     An item turned with the CSS `rotate` property (the bangles stand upright) gets its path turned back, else it flies sideways. */
  const mv = (el, x, y) => { const a = -(parseFloat(getComputedStyle(el).rotate) || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return `translate(${x * c - y * s}px,${x * s + y * c}px)`; };
  const arcIn = (el, d, lift, ms) => el.animate([
      { transform:`${mv(el, d.dx, d.dy)} scale(.55)`, opacity:0 },
      { transform:`${mv(el, d.dx * .45, d.dy * .45 - lift)} scale(1)`, opacity:1, offset:.55 },
      { transform:"translate(0,0) scale(1.12,.88)", opacity:1, offset:.88 },
      { transform:"translate(0,0) scale(1)", opacity:1 }], { duration:ms, easing:"ease-out", fill:"both" });
  const arcOut = (el, d, lift, ms) => el.animate([
      { transform:"translate(0,0) scale(1)", opacity:1 },
      { transform:`${mv(el, d.dx * .5, d.dy * .5 - lift)} scale(.9) rotate(${d.dx > 0 ? 25 : -25}deg)`, opacity:1, offset:.5 },
      { transform:`${mv(el, d.dx, d.dy)} scale(.3) rotate(${d.dx > 0 ? 50 : -50}deg)`, opacity:0 }], { duration:ms, easing:"cubic-bezier(.4,0,.6,1)", fill:"forwards" });
  if(cfg.type === "add"){
    const base = items.slice(0, cfg.a), more = items.slice(cfg.a), src = endImg(".sm-anim-src");
    more.forEach(it => it.classList.add("hide"));
    const t = smPopIn(base, 20, sfxPop);
    smLater(alive, t + 700, () => {
      const ds = more.map(it => src ? smDelta(it, src) : { dx:260, dy:0 });
      more.forEach((it, i) => setTimeout(() => {
        if(!alive()) return;
        it.classList.remove("hide"); it.classList.add("sm-new");
        arcIn(it, ds[i], cfg.wrap === "sky" ? 40 : 70, 640);
        if(i % 3 === 0) bump(src);
        badge.textContent = String(cfg.a + i + 1); sfxPop(i);
      }, i * 150));
      smLater(alive, more.length * 150 + 750, () => { badge.classList.add("up"); sfxCorrect(); smLater(alive, 2000, close); });
    });
  } else {
    const keep = items.slice(0, cfg.a - cfg.b), gone = items.slice(cfg.a - cfg.b), dst = endImg(".sm-anim-dst");
    const t = smPopIn(items, 18, sfxPop);
    smLater(alive, t + 800, () => {
      gone.slice().reverse().forEach((it, i) => setTimeout(() => {
        if(!alive()) return;
        const d = dst ? smDelta(it, dst) : { dx:300, dy:-120 };
        it.classList.add("off-rod");                         // a bangle lifted off its rod leaves the rod piece behind
        arcOut(it, d, 80, 720);
        setTimeout(() => { if(alive()){ bump(dst); if(i % 2 === 0) sfxPop(i); } }, 600);
        badge.textContent = String(cfg.a - i - 1);
      }, i * 120));
      smLater(alive, gone.length * 120 + 900, () => {
        keep.forEach(it => it.classList.add("sm-keep"));
        badge.classList.add("down"); sfxCorrect();
        smLater(alive, 2200, close);
      });
    });
  }
}

/* ---------- shared slide chrome for the activity pages ---------- */
function smStoryCard(id, cls){ return smEl("div", "sm-story-card " + (cls || ""), smStoryHTML(id)); }
function smReady(slide){
  state.ownsAudio = true; state.locked = false; state.attempts = 0;
  $("navBtn").style.display = "none"; setNavActive(false);
  $("hintBtn").classList.remove("show");
}
function smEmitCorrect(slide, sig, extra){
  SwiftPAL.emit(sig, Object.assign({ slide_id:slide.id, phase:slide.phase, value:true, first_try:state.attempts === 0,
    attempts:state.attempts + 1, scaffold_level:state.scaffoldLevel, latency_ms:Date.now() - state.slideStart }, extra || {}));
}
function smWrong(slide){
  state.attempts++; sfxWrongSoft(); setSwMood("tryagain");
  SwiftPAL.emit("answer_wrong", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts });
}
/* the correct-response beat: confetti + Swiftie cheer + the CR line (with its sync highlights), and the
   slide advances only when the line has FINISHED (never cut at a fixed 1.4 s). */
function smCelebrate(slide, alive, id, cues, revealed, after){
  if(!revealed){ sfxCorrect(); confettiCannon(); setSwMood("celebrate"); } else setSwMood("happy");
  smPlay(id, cues, () => { if(after) after(); smLater(alive, 650, () => completeSlide(!revealed)); });
}
/* while an intro/teach sequence is talking the 🔊 chip waits (a replay mid-sequence would cut the chain);
   once the returned enable() is called, the chip replays `fn`. Every replay is a fresh smPlay, so a
   replay interrupted by feedback can never leave the chip stuck. */
function smReplay(fn){ let ready = false; state.replayAudio = () => { if(!ready || state.locked) return; fn(() => {}); }; return () => { ready = true; }; }
/* run `fn` once — the "intro is over" hook, reached either when the intro VO chain ends or when the
   child acts first (their action supersedes the intro audio, so the chain would never call back) */
function smOnce(fn){ let done = false; return function(){ if(done) return; done = true; fn.apply(this, arguments); }; }

/* ---------- palace backdrop (the "रहस्यमयी महल" storyboard) ---------- */
function smPalaceBG(){
  /* [art] the painted palace hall (assets/Images/bg_palace_hall.webp); a soft light breathes at the far arch, sparkles
     twinkle and a few golden motes drift up. Missing file: the older CSS-built corridor below the picture shows instead. */
  let stars = "", motes = "";
  for(let i = 0; i < 18; i++) stars += `<i class="sm-star" style="left:${(i * 53) % 100}%;top:${8 + (i * 29) % 70}%;animation-delay:${(i % 6) * .45}s"></i>`;
  for(let i = 0; i < 12; i++) motes += `<i class="sm-mote" style="left:${8 + (i * 71) % 86}%;animation-delay:${(i * 1.3) % 9}s;animation-duration:${9 + (i % 4) * 2}s"></i>`;
  return `<div class="sm-arch a1"></div><div class="sm-arch a2"></div><div class="sm-arch a3"></div><div class="sm-arch a4"></div>` +
         `<img class="sm-pal-bg" src="${smArt("bg_palace_hall")}" alt="" onerror="this.remove()">` +
         `<i class="sm-pal-light"></i>${stars}${motes}`;
}
function smDoorHTML(color){
  const f = n => smArt("door_" + color + "_" + n);
  return `<div class="sm-door2 c-${color}">` +
           `<img class="dr-open" src="${f("open")}" alt="" draggable="false">` +
           `<div class="dr-portal"><img src="${smArt("prop_portal_swirl")}" alt="" draggable="false"></div>` +
           `<img class="dr-closed" src="${f("closed")}" alt="" draggable="false">` +
           `<img class="dr-leaf l" src="${f("closed")}" alt="" draggable="false"><img class="dr-leaf r" src="${f("closed")}" alt="" draggable="false">` +
           `<i class="dr-glow"></i><i class="dr-flash"></i>` +
         `</div>`;
}

SlideModules.STORY_READ = {
  // TEACH (tutorial frame): the story card alone. VO1 introduces it, VO2 reads it with every word lit
  // in sync (karaoke). data:{lead_vo, story_vo}
  mount(host, slide){
    const d = slide.data, alive = smAlive();
    state.ownsAudio = true; setNavActive(false); $("navBtn").onclick = () => completeSlide(true);
    const wrap = smEl("div", "sm-read"), card = smStoryCard(d.story_vo, "sm-story-big");
    wrap.appendChild(card); host.appendChild(wrap);
    const read = (done) => smPlay(d.story_vo, smKaraoke(card, d.story_vo), () => { smKaraokeClear(card); if(done) done(); });
    const free = smReplay(read);
    setSwMood("talk");
    smSteps([{ id:d.lead_vo, gap:300 }, (next) => read(next)], alive, () => { free(); setNavActive(true); setSwMood("point"); });
  }
};

SlideModules.WORKED_EXAMPLE = {
  // TEACH (tutorial frame): the 7-step worked example of one story → its number sentence.
  // data:{scene:"marbles"|"birds", story_vo, a, b, op, result, op_word, who?:[{name,emoji}×2], steps:[vo×7]}
  mount(host, slide){
    const d = slide.data, alive = smAlive(), S = d.steps, a = d.a, b = d.b;
    state.ownsAudio = true; setNavActive(false); $("navBtn").onclick = () => completeSlide(true);
    const wrap = smEl("div", "sm-we sm-we-" + d.scene + " intro");
    const story = smStoryCard(d.story_vo, "sm-story-big");
    const scene = smEl("div", "sm-we-scene");
    if(d.scene === "marbles"){
      const who = d.who || [{ name:"", emoji:"👧" }, { name:"", emoji:"👦" }];
      scene.innerHTML =
        `<div class="sm-we-col ca"><div class="sm-photo off">${who[0].char ? `<img class="sm-av" src="assets/char_${who[0].char}.webp" alt="">` : `<span class="f">${who[0].emoji}</span>`}<span class="nm">${who[0].name}</span></div>` +
          `<div class="sm-we-box ba off">${smGroup("marble", a, { hide:true })}</div></div>` +
        `<div class="sm-we-col cb"><div class="sm-photo off">${who[1].char ? `<img class="sm-av" src="assets/char_${who[1].char}.webp" alt="">` : `<span class="f">${who[1].emoji}</span>`}<span class="nm">${who[1].name}</span></div>` +
          `<div class="sm-we-box bb off">${smGroup("marble", b, { offset:a, hide:true })}</div></div>` +
        `<div class="sm-we-arrow off">➜</div>` +
        `<div class="sm-we-col cc"><div class="sm-we-box bt off">${smGroup("marble", a + b, { cls:"slots" })}</div></div>`;
    } else {
      scene.innerHTML = smBirdsHTML(a, { hide:true });
    }
    const tokens = [String(a), d.op, String(b), "=", "?"];
    const eq = smEl("div", "sm-eq-cards", tokens.map((t, i) => `<span class="sm-card ${smTokCls(t)} off" data-i="${i}">${smEsc(t)}</span>`).join(""));
    wrap.appendChild(story); wrap.appendChild(scene); wrap.appendChild(eq); host.appendChild(wrap);
    const cards = [...eq.children], show = (el) => { if(!el) return; el.classList.remove("off"); el.classList.add("pop"); };
    const num = (n) => story.querySelector(`.sm-n[data-n="${n}"]`);
    const lastSent = () => { const ss = story.querySelectorAll(".sm-sent"); return ss[ss.length - 1]; };
    const photo = (k) => scene.querySelectorAll(".sm-photo")[k];
    const fullTok = [String(a), d.op, String(b), "=", String(d.result)];
    /* [ui] the number cards stand under their own columns: 23 under Pari's box, 12 under Aaru's, + between them,
       = and ? under the arrow and the combined box (marbles scene; the final step regroups them into one row) */
    const align = ()=>{
      if(d.scene !== "marbles" || wrap.classList.contains("final")) return;
      eq.classList.add("aligned");                       // full width FIRST, then measure against it
      // Pari's and Aaru's boxes are one size (the taller one's), so the two read as a matching pair
      const pair = [scene.querySelector(".ba"), scene.querySelector(".bb")], ph = Math.max(...pair.map(x => x.offsetHeight));
      pair.forEach(x => x.style.minHeight = ph + "px");
      const er = eq.getBoundingClientRect(), sc = smScale();
      const cx = el => { const r = el.getBoundingClientRect(); return (r.left + r.width / 2 - er.left) / sc; };
      const xs = [cx(scene.querySelector(".ca")), 0, cx(scene.querySelector(".cb")), cx(scene.querySelector(".sm-we-arrow")), cx(scene.querySelector(".cc"))];
      xs[1] = (xs[0] + xs[2]) / 2;
      cards.forEach((c, i)=>{ c.style.left = (xs[i] - c.offsetWidth / 2).toFixed(1) + "px"; });
    };
    const unalign = ()=>{ eq.classList.remove("aligned"); cards.forEach(c => c.style.left = ""); };

    /* step 1 — the story card glides up into its place under the frame's top edge, shrinking to the strip size as it goes.
       Only the position is FLIPped (a translate); the size is the card's real font/padding/width easing from the big card
       to the strip, so every frame is a true card. (A uniform scale taken from the height ratio made the first frame ~2x
       too wide - it burst out past the frame and zoomed back in.) The card's top is anchored in the final layout, so the
       translate stays right while its height shrinks. */
    const zoomOut = (next) => {
      const r0 = story.getBoundingClientRect(), sc = smScale();
      wrap.classList.add("settling");                       // the scene waits (hidden) until the card has arrived
      wrap.classList.remove("intro");                       // final layout, card still big
      const r1 = story.getBoundingClientRect();
      const dx = (r0.left + r0.width / 2) - (r1.left + r1.width / 2), dy = r0.top - r1.top;
      story.style.transition = "none";
      story.style.transform = `translate(${(dx / sc).toFixed(1)}px,${(dy / sc).toFixed(1)}px)`;
      void story.offsetWidth;
      const ease = ".8s cubic-bezier(.33,.9,.35,1)";
      story.style.transition = ["transform", "font-size", "line-height", "padding", "max-width"].map(p => p + " " + ease).join(",");
      story.classList.remove("sm-story-big"); story.classList.add("sm-story-top"); story.style.transform = "";
      smLater(alive, 820, ()=>{ story.style.transition = ""; wrap.classList.remove("settling"); align(); next(); });
    };
    const popGroup = (box) => smPopIn([...box.querySelectorAll(".sm-it, .sm-bird")], 45, d.scene === "marbles" ? sfxMarble : sfxClink);   // Pari's / Aaru's marbles clatter in
    /* data.lead_vo: the story is READ on this same screen first (the big card, each word lit as it is spoken),
       then the card zooms up and the worked example follows - story read + worked example in one slide */
    const readFirst = d.lead_vo ? [
      { id:d.lead_vo, gap:300 },
      { id:d.story_vo, cues:() => smKaraoke(story, d.story_vo), post:() => smKaraokeClear(story), gap:600 }
    ] : [];
    const steps = readFirst.concat([
      zoomOut,
      { id:S[0], gap:350 },
      { id:S[1], pre:() => {
          num(a) && num(a).classList.add("hl");
          if(d.scene === "marbles"){ show(photo(0)); show(scene.querySelector(".ba")); popGroup(scene.querySelector(".ba")); }
          else { sfxFlap(); popGroup(scene); }
        }, cues:() => [{ at:smAt(S[1], String(a)) || 400, fn:() => { show(cards[0]); sfxPop(3); } }], gap:400 },
      { id:S[2], pre:() => {
          num(b) && num(b).classList.add("hl");
          if(d.scene === "marbles"){ show(photo(1)); show(scene.querySelector(".bb")); popGroup(scene.querySelector(".bb")); }
        }, cues:() => {
          const c = [{ at:smAt(S[2], String(b)) || 400, fn:() => { show(cards[2]); sfxPop(5); } }];
          if(d.scene === "birds"){      // 12 birds fly away (SFX), 11 stay on the wire
            const birds = [...scene.querySelectorAll(".sm-bird")].slice(a - b);
            c.push({ at:(smAt(S[2], "उड़") || smAt(S[2], String(b)) || 600), fn:() => smFlyBirds(birds, 70) });
          }
          return c;
        }, gap:500 },
      { id:S[3], pre:() => { story.querySelectorAll(".sm-n.hl").forEach(x => x.classList.remove("hl")); lastSent() && lastSent().classList.add("hl-sent"); },
        cues:() => [{ at:smAt(S[3], d.op_word) || smDur(S[3]) - 900, fn:() => { show(cards[1]); cards[1].classList.add("pulse"); sfxPop(8); } }], gap:400 },
      { id:S[4], pre:() => { lastSent() && lastSent().classList.remove("hl-sent"); cards[1].classList.remove("pulse"); },
        cues:() => {
          const t = smSeqTimes(S[4], tokens);
          return t.map((ms, i) => ms == null ? null : { at:ms, fn:() => { if(i >= 3) show(cards[i]); cards.forEach((c, j) => c.classList.toggle("lit", j === i)); } }).filter(Boolean);
        }, post:() => smUnlit(eq), gap:400 },
      { id:S[5], pre:() => {
          if(d.scene === "marbles"){
            const bt = scene.querySelector(".bt"); show(scene.querySelector(".sm-we-arrow")); show(bt);
            const items = [...scene.querySelectorAll(".ba .sm-it, .bb .sm-it")], slots = [...bt.querySelectorAll(".sm-it")];
            sfxWhoosh();
            /* the marbles themselves travel into the combined box (as before). Pari's and Aaru's boxes keep a grey, faded
               copy of their marbles in the same places the whole time - laid down the moment the move starts, so the boxes
               are never empty and nothing pops back in */
            scene.querySelectorAll(".ba .sm-grp, .bb .sm-grp").forEach(g => {
              const ghost = g.cloneNode(true); ghost.classList.add("sm-ghost-grp"); ghost.setAttribute("aria-hidden", "true");
              ghost.querySelectorAll(".sm-it").forEach(it => { it.classList.remove("pop", "hide"); it.style.cssText = ""; });
              g.parentElement.appendChild(ghost);
            });
            const tm = smMoveOnto(items, slots, 1050, 14, " rotate(540deg)");   // [art] the marbles ROLL into the box
            smLater(alive, tm + 60, () => { slots.forEach(s => s.classList.add("in")); items.forEach(it => it.style.visibility = "hidden"); scene.classList.add("merged"); sfxClink(2); });
          } else {
            scene.querySelectorAll(".sm-bird:not(.fly):not(.sm-bird-ghost)").forEach(el => el.classList.add("sm-keep"));
          }
        }, cues:() => [{ at:smAt(S[5], String(d.result)) || smDur(S[5]) - 1000, fn:() => {
            cards[4].classList.add("flip"); smLater(alive, 220, () => { cards[4].textContent = String(d.result); cards[4].classList.add("ans"); }); sfxPop(9);
          } }], gap:500 },
      (next) => {
        /* [ui] ONE smooth move: while the pictures fade, every card travels straight from where it stands to its place in
           the finished row - centred in the open space under the story, 1.3x - and arrives there already centred
           (no snap into a row first, no second glide) */
        const sc = smScale(), host = wrap.getBoundingClientRect(), sb = story.getBoundingClientRect(), K = 1.3, GAP = 14 * K;
        const rs = cards.map(c => c.getBoundingClientRect());
        const ws = cards.map(c => c.offsetWidth * K), total = ws.reduce((x, y) => x + y, 0) + GAP * (cards.length - 1);
        let x = (host.left + host.width / 2) / sc - total / 2;
        wrap.classList.add("final");
        /* [ui] the title of what is left on the screen, in the space the pictures leave, just above the centred row
           (data.final_title, else "जोड़ / घटाव का संख्या वाक्य" from the sign) */
        const add = d.op === "+", ttl = smEl("div", "sm-we-title " + (add ? "add" : "sub"), smEsc(d.final_title || (add ? "जोड़ का संख्या वाक्य" : "घटाव का संख्या वाक्य")));
        wrap.appendChild(ttl);
        // the title and the row are centred together in the open space under the story
        const rowH = cards[0].offsetHeight * K, TG = 30, cy = (sb.bottom + host.bottom) / 2 / sc + (ttl.offsetHeight + TG) / 2;
        ttl.style.top = (cy - host.top / sc - rowH / 2 - TG).toFixed(1) + "px";
        cards.forEach((c, i) => {
          const tx = x + ws[i] / 2; x += ws[i] + GAP;
          const cx0 = (rs[i].left + rs[i].width / 2) / sc, cy0 = (rs[i].top + rs[i].height / 2) / sc;
          c.style.transition = "transform .9s cubic-bezier(.3,.8,.25,1)";
          c.style.transform = `translate(${(tx - cx0).toFixed(1)}px,${(cy - cy0).toFixed(1)}px) scale(${K})`;
        });
        smLater(alive, 950, next);
      },
      { id:S[6], cues:() => smTokCues(S[6], cards, fullTok), post:() => { smUnlit(eq); eq.classList.add("glow"); smLater(alive, 1300, () => eq.classList.remove("glow")); } }
    ]);
    const free = smReplay((done) => smPlay(S[6], smTokCues(S[6], cards, fullTok), () => { smUnlit(eq); done(); }));
    setSwMood("talk");
    smSteps(steps, alive, () => { free(); setNavActive(true); setSwMood("point"); });
  }
};

SlideModules.COMPARE_STORIES = {
  // TEACH (tutorial frame): "संख्याएँ वही, पर संख्या वाक्य अलग!" — both stories side by side.
  // data:{cards:[{scene, a, b, op, result, caption}×2], steps:[vo×4]}
  mount(host, slide){
    const d = slide.data, alive = smAlive(), S = d.steps;
    state.ownsAudio = true; setNavActive(false); $("navBtn").onclick = () => completeSlide(true);
    const row = smEl("div", "sm-cmp");
    d.cards.forEach((c) => {
      const sign = c.op === "+" ? "add" : "sub";
      let pic;
      if(c.scene === "marbles") pic = `<div class="sm-cmp-pic marbles">${smGroup("marble", c.a, { cls:"ga" })}${smGroup("marble", c.b, { cls:"gb", offset:c.a })}` +
                                     `<div class="sm-cmp-merged">${smGroup("marble", c.a + c.b, { cls:"slots" })}</div></div>`;
      else pic = `<div class="sm-cmp-pic birds">${smBirdsHTML(c.a, { mini:true })}</div>`;
      const tokens = [String(c.a), c.op, String(c.b), "=", String(c.result)];
      const card = smEl("div", "sm-cmp-card " + sign + " off",
        pic + `<div class="sm-cmp-cap">${smEsc(c.caption)}</div><div class="sm-eq-inline ${sign}">${smEqHTML(tokens)}</div>`);
      card._tokens = tokens; card._c = c;
      row.appendChild(card);
    });
    host.appendChild(row);
    const [L, R] = row.children, toks = (card) => [...card.querySelectorAll(".sm-tok")];
    const litNums = (on) => [L, R].forEach(c => toks(c).forEach((t, i) => { if(i === 0 || i === 2) t.classList.toggle("lit", on); }));
    const mergeMarbles = (card) => {
      const items = [...card.querySelectorAll(".ga .sm-it, .gb .sm-it")], slots = [...card.querySelectorAll(".sm-cmp-merged .sm-it")];
      sfxWhoosh();
      const tm = smMoveOnto(items, slots, 900, 10);
      smLater(alive, tm + 50, () => { card.querySelector(".sm-cmp-pic").classList.add("merged"); slots.forEach(s => s.classList.add("in")); });
    };
    const flyBirds = (card) => { const c = card._c, bs = [...card.querySelectorAll(".sm-bird")];
      smFlyBirds(bs.slice(c.a - c.b), 60);
      smLater(alive, 1300, () => bs.slice(0, c.a - c.b).forEach(el => el.classList.add("sm-keep"))); };
    const animate = (card) => card._c.scene === "marbles" ? mergeMarbles(card) : flyBirds(card);
    const opPulse = (card) => { const op = toks(card)[1]; op.classList.remove("pulse"); void op.offsetWidth; op.classList.add("pulse"); sfxPop(7); };
    const focus = (card) => [L, R].forEach(c => { c.classList.toggle("focus", c === card); c.classList.toggle("dim", card && c !== card); });
    const cardStep = (card, id) => ({ id, pre:() => { focus(card); animate(card); },
      cues:() => { const opWord = card._c.op === "+" ? "जोड़" : "घटाया"; const opAt = smAt(id, opWord);
        const startEq = smFind(id, String(card._c.a));
        return [{ at:opAt, fn:() => opPulse(card) }].concat(smTokCues(id, toks(card), card._tokens, Math.max(0, startEq))); },
      post:() => smUnlit(card), gap:500 });
    const steps = [
      (next) => { [L, R].forEach((c, i) => setTimeout(() => { c.classList.remove("off"); c.classList.add("pop"); sfxPop(i * 4); }, i * 260)); smLater(alive, 700, next); },
      { id:S[0], cues:() => [{ at:smAt(S[0], String(d.cards[0].a)), fn:() => [L, R].forEach(c => toks(c)[0].classList.add("lit")) },
                              { at:smAt(S[0], String(d.cards[0].b)), fn:() => [L, R].forEach(c => toks(c)[2].classList.add("lit")) }],
        post:() => litNums(false), gap:450 },
      cardStep(L, S[1]),
      cardStep(R, S[2]),
      { id:S[3], pre:() => focus(null), cues:() => [
          { at:smAt(S[3], "संख्याएँ") || 200, fn:() => litNums(true) },
          { at:smAt(S[3], "अलग") || smDur(S[3]) - 900, fn:() => { litNums(false); [L, R].forEach(c => { const op = toks(c)[1]; op.classList.add("lit"); op.classList.add("pulse"); }); } }
        ], post:() => [L, R].forEach(c => smUnlit(c)) }
    ];
    const free = smReplay((done) => smPlay(S[3], [], done));
    setSwMood("talk");
    smSteps(steps, alive, () => { free(); setNavActive(true); setSwMood("point"); });
  }
};

SlideModules.SIGN_DRAG = {
  // GUIDED: story → drag the right sign (+/−) into the number sentence's empty box.
  // WA1: bounce back + hint VO + the story animation · WA2: wiggle, pulse the right sign, fade the other;
  // the child taps it → it moves into the box + the sentence is read.
  // data:{story_vo, q_vo, eq:[a,null,b,"=",r], answer, tiles:[…], cr_vo, wa1_vo, eq_vo, anim}
  mount(host, slide){
    const d = slide.data, alive = smAlive(); smReady(slide);
    const story = smStoryCard(d.story_vo);
    const eq = smEl("div", "sm-eqbox");
    d.eq.forEach((t, i) => {
      if(t === null) eq.appendChild(smEl("div", "sm-zone sm-slot op", ""));
      else eq.appendChild(smEl("span", "sm-tok " + smTokCls(t) + (smTokCls(t) === "num" ? " sm-numcard" : ""), smEsc(t)));
    });
    const tray = smEl("div", "sm-tray sm-tray-signs");
    d.tiles.forEach(t => tray.appendChild(smEl("div", "sm-tile sign " + smTokCls(t), smEsc(t))));
    host.appendChild(story); host.appendChild(eq); host.appendChild(tray);
    const zone = eq.querySelector(".sm-zone"), tiles = [...tray.children], right = tiles.find(t => t.textContent === d.answer);
    const toks = [...eq.children], full = d.eq.map(t => t === null ? d.answer : t);
    let revealed = false, busyHint = false;
    const free = smReplay((done) => smPlay(d.story_vo, smKaraoke(story, d.story_vo), () => { smKaraokeClear(story); done(); }));
    const endIntro = smOnce(() => { free(); smKaraokeClear(story); setSwMood("point"); startNudge(slide, zone); });
    const place = (tile, viaReveal) => {
      endIntro(); state.locked = true; stopNudge();
      zone.classList.add("filled", smTokCls(d.answer).split(" ")[1]); zone.textContent = d.answer;
      tile.classList.add("used"); tile.classList.remove("pulse", "faded");
      /* the other sign leaves the tray: it eases down a little, shrinks and fades out from however it looks now (a faded one
         stays faded - no flash back to full colour), then stays hidden in its place so nothing in the layout moves */
      tiles.forEach(t => {
        if(t === tile) return;
        t.classList.remove("pulse"); t.style.pointerEvents = "none";
        const a = t.animate([{ opacity:getComputedStyle(t).opacity, transform:"none" }, { opacity:0, transform:"translateY(18px) scale(.86)" }],
          { duration:520, delay:220, easing:"cubic-bezier(.4,0,.2,1)", fill:"forwards" });
        a.onfinish = () => { t.style.visibility = "hidden"; };
      });
      smEmitCorrect(slide, "sign_drag_correct", { revealed:!!viaReveal });
      smCelebrate(slide, alive, viaReveal ? d.eq_vo : d.cr_vo, smTokCues(viaReveal ? d.eq_vo : d.cr_vo, toks, full), viaReveal,
        () => { smUnlit(eq); eq.classList.add("glow"); });
    };
    const wrong = (tile) => {
      endIntro(); stopNudge(); smWrong(slide);
      if(state.attempts === 1){
        state.scaffoldLevel = 2; busyHint = true;
        smAnimate(d.anim, alive, () => { busyHint = false; });
        smPlay(d.wa1_vo, smNumCues(story, d.wa1_vo), () => {});
      } else {
        revealed = true; state.scaffoldLevel = 3; stopAudio();
        smWiggle(tile, 430); tiles.forEach(t => { if(t !== right) t.classList.add("faded"); }); right.classList.add("pulse");
        SwiftPAL.emit("answer_revealed", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts });
      }
    };
    tiles.forEach(tile => smDraggable(tile, {
      can:() => !state.locked && !busyHint && !tile.classList.contains("faded"),
      drop:(z, t) => { if(z !== zone) return false; if(t === right){ place(t, revealed); return true; } wrong(t); return false; },
      tap:(t) => { if(state.locked || busyHint) return; if(revealed && t === right){ state.locked = true; t.style.visibility = "hidden"; smFly(t, zone, 520, () => { t.style.visibility = ""; place(t, true); }); } }
    }));
    setSwMood("talk");
    smSteps([{ id:d.story_vo, cues:() => smKaraoke(story, d.story_vo), post:() => smKaraokeClear(story), gap:350 }, { id:d.q_vo }],
      alive, endIntro);
  }
};

SlideModules.PICK_SENTENCE = {
  // GUIDED: story → tap 1 of 3 number sentences (correct · wrong sign · misread/reversed numbers).
  // WA1 wiggle + hint VO (story numerals light in sync) · WA2 wiggle + the story animation ·
  // WA3 wiggle + reveal (correct glows, others fade; tap it → the sentence is read).
  // data:{story_vo, q_vo, options:[{eq, correct?}], cr_vo, wa1_vo, eq_vo, anim}
  mount(host, slide){
    const d = slide.data, alive = smAlive(); smReady(slide);
    const story = smStoryCard(d.story_vo);
    const grid = smEl("div", "sm-pick3");
    const opts = d.options.slice(); for(let i = opts.length - 1; i > 0; i--){ const j = (Math.random() * (i + 1)) | 0; [opts[i], opts[j]] = [opts[j], opts[i]]; }
    opts.forEach(o => { const c = smEl("button", "sm-opt", `<span class="sm-eq-plain">${smEqHTML(smParseEq(o.eq))}</span>`); c.type = "button"; c._o = o; grid.appendChild(c); });
    host.appendChild(story); host.appendChild(grid);
    const cells = [...grid.children], right = cells.find(c => c._o.correct);
    let revealed = false, busy = false;
    const free = smReplay((done) => smPlay(d.story_vo, smKaraoke(story, d.story_vo), () => { smKaraokeClear(story); done(); }));
    const endIntro = smOnce(() => { free(); smKaraokeClear(story); setSwMood("point"); });
    const win = (cell) => {
      state.locked = true; stopNudge(); cell.classList.add("correct");
      cells.forEach(c => { if(c !== cell) c.classList.add("faded"); });
      smEmitCorrect(slide, "sentence_pick_correct", { revealed });
      const id = revealed ? d.eq_vo : d.cr_vo, tokEls = [...cell.querySelectorAll(".sm-tok")];
      smCelebrate(slide, alive, id, smTokCues(id, tokEls, smParseEq(cell._o.eq)), revealed, () => smUnlit(cell));
    };
    cells.forEach(cell => cell.onclick = () => {
      if(state.locked || busy) return;
      endIntro();
      if(cell === right){ win(cell); return; }
      if(revealed) return;
      smWrong(slide); smWiggle(cell); cell.classList.add("flash"); setTimeout(() => cell.classList.remove("flash"), 700);
      if(state.attempts === 1){ state.scaffoldLevel = 1; smPlay(d.wa1_vo, smNumCues(story, d.wa1_vo), () => {}); }
      else if(state.attempts === 2){ state.scaffoldLevel = 2; busy = true; stopAudio(); smAnimate(d.anim, alive, () => { busy = false; }); }
      else {
        revealed = true; state.scaffoldLevel = 3;
        cells.forEach(c => { if(c !== right) c.classList.add("faded"); }); right.classList.add("reveal");
        SwiftPAL.emit("answer_revealed", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts });
      }
    });
    setSwMood("talk");
    smSteps([{ id:d.story_vo, cues:() => smKaraoke(story, d.story_vo), post:() => smKaraokeClear(story), gap:350 }, { id:d.q_vo }],
      alive, endIntro);
  }
};

SlideModules.BUILD_SENTENCE = {
  // PRACTICE: story → build its number sentence from cards (drag into any box).
  // Per-box feedback ladder from the deck: sign-in-number-box / number-in-sign-box / wrong sign /
  // wrong number, each with a 1st- and 2nd-attempt response; the 3rd miss on a box ghost-drags the
  // right card to it. Idle 7 s → the next empty box pulses. commutative:[i,j] accepts a + b = b + a.
  // data:{story_vo, q_vo, eq:[{slot:"num"|"op", accept:[…]}|"tok"…], tray, cr_vo, cr_vo_rev?, commutative?,
  //       fb:{op_in_num, num_in_op, wrong_op_1, wrong_op_2_anim, wrong_num:{slotIndex: vo}}}
  mount(host, slide){
    const d = slide.data, alive = smAlive(); smReady(slide);
    const story = smStoryCard(d.story_vo);
    const eq = smEl("div", "sm-eqbox build"), slots = [];
    d.eq.forEach((t, i) => {
      if(typeof t === "object"){ const z = smEl("div", "sm-zone sm-slot " + t.slot, ""); z._i = i; z._spec = t; slots.push(z); eq.appendChild(z); }
      else eq.appendChild(smEl("span", "sm-tok " + smTokCls(t) + (smTokCls(t) === "num" ? " sm-numcard" : ""), smEsc(t)));
    });
    const tray = smEl("div", "sm-tray");
    d.tray.forEach(t => { const el = smEl("div", "sm-tile " + smTokCls(t), smEsc(t)); el._v = t; tray.appendChild(el); });
    host.appendChild(story); host.appendChild(eq); host.appendChild(tray);
    const tiles = [...tray.children], isOp = (v) => v === "+" || v === "−";
    const comm = d.commutative || [], wrongBy = new Map(), wrongKind = new Map();
    let revealedAny = false, idleT = null, busy = false;
    const accepts = (z) => {
      let acc = z._spec.accept.slice();
      if(comm.includes(z._i)) comm.forEach(j => { const o = slots.find(s => s._i === j); if(o && o !== z && o._val) acc = acc.filter(v => v !== o._val); });
      return acc;
    };
    const armIdle = () => {
      clearTimeout(idleT);
      idleT = setTimeout(() => {
        if(!alive() || state.locked) return;
        const z = slots.find(s => !s._val);
        if(z){ z.classList.remove("idle"); void z.offsetWidth; z.classList.add("idle"); }
        armIdle();
      }, 7000);
    };
    const fill = (z, tile) => {
      z._val = tile._v; z.textContent = tile._v; z.classList.add("filled", "pop");
      if(isOp(tile._v)) z.classList.add(tile._v === "+" ? "add" : "sub");
      tile.classList.add("used"); tiles.forEach(t => t.classList.remove("reveal"));
      slots.forEach(s => s.classList.remove("idle"));
      sfxPop(4);
      if(slots.every(s => s._val)){
        state.locked = true; clearTimeout(idleT);
        const full = d.eq.map(t => typeof t === "object" ? slots.find(s => s._i === d.eq.indexOf(t))._val : t);
        const rev = comm.length && full[comm[0]] !== slots.find(s => s._i === comm[0])._spec.accept[0];
        const id = (rev && d.cr_vo_rev) ? d.cr_vo_rev : d.cr_vo;
        smEmitCorrect(slide, "sentence_build_correct", { revealed:revealedAny, order:full.join(" ") });
        smCelebrate(slide, alive, id, smTokCues(id, [...eq.children], full), revealedAny, () => { smUnlit(eq); eq.classList.add("glow"); });
      } else armIdle();
    };
    const ghost = (z) => {
      const want = accepts(z)[0], tile = tiles.find(t => !t.classList.contains("used") && t._v === want);
      if(!tile) return;
      revealedAny = true; state.scaffoldLevel = 3;
      SwiftPAL.emit("answer_revealed", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts, box:z._i });
      tile.classList.add("reveal");
      smFly(tile, z, 900, () => { if(alive()) z.classList.add("idle"); }, { ghost:true, fade:true });
    };
    const wrong = (z, tile) => {
      smWrong(slide);
      const v = tile._v, spec = z._spec;
      const kind = spec.slot === "num" ? (isOp(v) ? "op_in_num" : "wrong_num") : (isOp(v) ? "wrong_op" : "num_in_op");
      const kk = z._i + ":" + kind, n = (wrongKind.get(kk) || 0) + 1, total = (wrongBy.get(z) || 0) + 1;
      wrongKind.set(kk, n); wrongBy.set(z, total);
      state.scaffoldLevel = Math.max(state.scaffoldLevel, Math.min(total, 2));
      z.classList.add("bad"); setTimeout(() => z.classList.remove("bad"), 500);
      if(total >= 3){ smLater(alive, 450, () => ghost(z)); return; }
      const fb = d.fb || {};
      if(kind === "op_in_num" && n >= 2) smPlay(fb.op_in_num, [], () => {});
      else if(kind === "num_in_op" && n >= 2) smPlay(fb.num_in_op, [], () => {});
      else if(kind === "wrong_op"){
        if(n === 1) smPlay(fb.wrong_op_1, smNumCues(story, fb.wrong_op_1), () => {});
        else { busy = true; stopAudio(); smAnimate(fb.wrong_op_2_anim, alive, () => { busy = false; }); }
      }
      else if(kind === "wrong_num" && n >= 2 && fb.wrong_num && fb.wrong_num[z._i]) smPlay(fb.wrong_num[z._i], [], () => {});
    };
    const free = smReplay((done) => smPlay(d.story_vo, smKaraoke(story, d.story_vo), () => { smKaraokeClear(story); done(); }));
    const endIntro = smOnce(() => { free(); smKaraokeClear(story); setSwMood("point"); armIdle(); });
    tiles.forEach(tile => smDraggable(tile, {
      can:() => !state.locked && !busy && !tile.classList.contains("used"),
      start:() => { clearTimeout(idleT); slots.forEach(s => s.classList.remove("idle")); },
      drop:(z, t) => {
        if(!slots.includes(z) || z._val){ armIdle(); return false; }
        endIntro();
        if(accepts(z).includes(t._v)){ fill(z, t); return true; }
        wrong(z, t); armIdle(); return false;
      },
      tap:() => armIdle()
    }));
    setSwMood("talk");
    smSteps([{ id:d.story_vo, cues:() => smKaraoke(story, d.story_vo), post:() => smKaraokeClear(story), gap:350 }, { id:d.q_vo }],
      alive, endIntro);
  }
};

SlideModules.PICK_STORY = {
  // PRACTICE: number sentence → tap the story it belongs to. Each story card reads itself (and has its
  // own 🔊 that replays it without answering). WA1: wiggle + hint VO (32 → − → 17 light in sync);
  // WA2: wiggle, the right story pulses, the other fades.
  // data:{eq, q_vo, stories:[{vo, correct?}], cr_vo, wa1_vo}
  mount(host, slide){
    const d = slide.data, alive = smAlive(); smReady(slide);
    const tokens = smParseEq(d.eq), sign = smSign(tokens);
    const eqc = smEl("div", "sm-eq-inline big " + sign, smEqHTML(tokens));
    const row = smEl("div", "sm-stories");
    const list = d.stories.slice(); if(Math.random() < 0.5) list.reverse();
    list.forEach(s => {
      const c = smEl("button", "sm-story-opt", `<span class="sm-story-txt">${smStoryHTML(s.vo)}</span><span class="sm-say" role="button" aria-label="सुनो">🔊</span>`);
      c.type = "button"; c._s = s; row.appendChild(c);
    });
    host.appendChild(eqc); host.appendChild(row);
    const cards = [...row.children], right = cards.find(c => c._s.correct), tokEls = [...eqc.querySelectorAll(".sm-tok")];
    let revealed = false;
    const readCard = (c, done) => { cards.forEach(x => x.classList.toggle("reading", x === c)); smPlay(c._s.vo, smKaraoke(c, c._s.vo), () => { c.classList.remove("reading"); smKaraokeClear(c); if(done) done(); }); };
    const free = smReplay((done) => smPlay(d.q_vo, [], done));
    const endIntro = smOnce(() => { free(); eqc.classList.remove("lit"); cards.forEach(x => { x.classList.remove("reading"); smKaraokeClear(x); }); setSwMood("point"); });
    cards.forEach(c => {
      c.querySelector(".sm-say").addEventListener("click", (e) => { e.stopPropagation(); if(state.locked) return; endIntro(); readCard(c); });
      c.onclick = () => {
        if(state.locked) return;
        endIntro();
        if(c === right){
          state.locked = true; c.classList.add("correct"); cards.forEach(x => { if(x !== c) x.classList.add("faded"); });
          smEmitCorrect(slide, "story_pick_correct", { revealed });
          smCelebrate(slide, alive, d.cr_vo, [], revealed);
          return;
        }
        if(revealed) return;
        smWrong(slide); smWiggle(c); c.classList.add("flash"); setTimeout(() => c.classList.remove("flash"), 700);
        if(state.attempts === 1){ state.scaffoldLevel = 1; smPlay(d.wa1_vo, smTokCues(d.wa1_vo, tokEls, tokens.slice(0, 3)), () => smUnlit(eqc)); }
        else {
          revealed = true; state.scaffoldLevel = 3; stopAudio();
          cards.forEach(x => { if(x !== right) x.classList.add("faded"); }); right.classList.add("reveal");
          SwiftPAL.emit("answer_revealed", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts });
        }
      };
    });
    setSwMood("talk");
    smSteps([
      { id:d.q_vo, pre:() => eqc.classList.add("lit"), post:() => eqc.classList.remove("lit"), gap:350 },
      (next) => readCard(cards[0], () => smLater(alive, 300, next)),
      (next) => readCard(cards[1], next)
    ], alive, endIntro);
  }
};

/* [cinematic] the palace camera: the hall painting and a stage-sized layer of the scene (the far gate, Swiftie) move
   together, so a push-in frames the gate big in the middle of the screen with Swiftie at its foot. */
const SM_CAM_GATE = { x:-219, y:-176, s:2 };
const SM_CARPET_X = 333;   // Swiftie on the carpet's middle, just in front of the camera (his translate from the gate scene's resting spot)
const SM_GATE_FOOT = { cx:443.5, bottom:397, h:74.88 };   // Swiftie at the gate's threshold (= the gate slides' .atgate spot)
function smCamTf(c){ c = c || { x:0, y:0, s:1 }; return `translate(${c.x}px,${c.y}px) scale(${c.s})`; }
// a 1333×750 layer at the stage's origin, inside `parent` (positioned and already in the page)
function smStageLayer(parent, cls){
  const L = smEl("div", cls); parent.appendChild(L);
  let x = 0, y = 0; for(let e = parent; e && e !== $("stage"); e = e.offsetParent){ x += e.offsetLeft; y += e.offsetTop; }
  L.style.left = -x + "px"; L.style.top = -y + "px"; return L;
}
// [gate to gate] a point of `el` in the hall painting (camera-free stage coordinates), seen through camera `c`
function smHallPt(el, c, fy){ const r = smRect(el); return { x:(r.x + r.w / 2 - c.x) / c.s, y:(r.y + r.h * (fy == null ? .5 : fy) - c.y) / c.s }; }
// the camera that shows hall point p at screen spot (sx, sy), zoomed s
function smCamOn(p, s, sx, sy){ return { x:+(sx - s * p.x).toFixed(1), y:+(sy - s * p.y).toFixed(1), s }; }
// through the open gate: the camera flies on into its portal (hall point p) while the portal light fills the screen.
// The next page comes in under that light and mountSlideNow fades it away, so the journey only ever moves forward.
function smThroughPortal(cam, p, door, ms, fn){
  const L = smEl("div", "sm-bloom c-" + door); L.id = "smBloom"; $("stage").querySelector(".stage-inner").appendChild(L);
  smCam(cam, smCamOn(p, 7, 666.5, 415), ms, "cubic-bezier(.5,0,.9,.4)");
  const a = L.animate([{ opacity:0 }, { opacity:0, offset:.25 }, { opacity:1 }], { duration:ms, easing:"ease-in", fill:"forwards" });
  a.onfinish = fn;
}
// move the camera (the hall + `layer`) to `to` (null = the whole hall); returns the running animations
function smCam(layer, to, ms, ease){
  const tf = smCamTf(to), out = [];
  [$("smPalaceBg"), layer].forEach(el => { if(!el) return;
    const run = el.getAnimations().filter(a => !(window.CSSTransition && a instanceof CSSTransition)), now = getComputedStyle(el).transform;
    const from = run.length && now && now !== "none" ? now : el.style.transform || smCamTf(null);   // a camera move cut short goes on from where it is
    run.forEach(a => a.cancel());
    el.style.transformOrigin = "0 0"; el.style.transform = tf;
    if(ms && from !== tf) out.push(el.animate([{ transform:from }, { transform:tf }], { duration:ms, easing:ease || "ease-in-out" }));
  });
  return out;
}
// walking away up the hall to (dx,dy), shrinking to s1: an even pace in depth (so it slows on screen as he gets
// smaller), a little bob and sway in every step. Uses translate/scale/rotate so CSS can hold the end pose.
function smWalkKf(dx, dy, s1, steps, ox, oy){
  const kf = [], n = steps * 2; ox = ox || 0; oy = oy || 0;
  for(let k = 0; k <= n; k++){
    const sc = 1 / (1 + (1 / s1 - 1) * k / n), p = (1 - sc) / (1 - s1), mid = k > 0 && k < n;
    kf.push({ translate:`${(ox + (dx - ox) * p).toFixed(1)}px ${(oy + (dy - oy) * p - (mid && k % 2 ? 7 * sc : 0)).toFixed(1)}px`, scale:sc.toFixed(4), rotate:`${mid ? (k % 2 ? -2.5 : 2.5) : 0}deg` });
  }
  return kf;
}

SlideModules.PALACE_SCENE = {
  // STORY BEAT for the "रहस्यमयी महल" adventure (storyboard panels 1 and 7–8): palace backdrop, Swiftie
  // with a speech bubble that matches the VO, आगे after the line. data:{kind:"intro"|"treasure", title?, vo}
  mount(host, slide){
    const d = slide.data, alive = smAlive();
    state.ownsAudio = true; setNavActive(false); $("navBtn").onclick = () => completeSlide(true);
    const sc = smEl("div", "sm-pal-scene " + d.kind);
    const pose = d.kind === "treasure" ? "sw_lg_celebrating" : "sw_lg_pointing";
    sc.innerHTML =
      (d.title ? `<div class="sm-ribbon">${smEsc(d.title)}</div>` : "") +
      (d.kind === "treasure"
        ? `<div class="sm-beam"></div><div class="sm-treasure"><i class="tr-glow"></i>` +
            `<img class="tr-chest" src="${smArt("prop_treasure_chest")}" alt="" draggable="false">` +
            [[18, 22], [72, 14], [40, 8], [86, 40], [10, 48], [58, 30]].map(([x, y], i) => `<i class="tr-spk" style="left:${x}%;top:${y}%;animation-delay:${i * .35}s"></i>`).join("") +
          `</div>`
        : "") +
      `<img class="sm-pal-sw" src="assets/UI/${pose}.png" alt="">` +
      `<div class="sm-bubble">${smEsc(smText(d.vo))}</div>`;
    host.appendChild(sc);
    if(d.kind === "treasure"){
      sfxSparkle();
      smLater(alive, 650, () => {                       // the chest lands: coins spill out in an arc, then the confetti
        _tone([196, 147], "triangle", .16, .1);
        const tr = sc.querySelector(".sm-treasure");
        if(tr) for(let i = 0; i < 16; i++){
          const c = smEl("i", "tr-coin"); tr.appendChild(c);
          const dir = i % 2 ? 1 : -1, dx = dir * (60 + Math.random() * 150), up = 120 + Math.random() * 90, land = 150 + Math.random() * 30;
          c.animate([{ transform:"translate(0,0) rotate(0)", opacity:1 }, { transform:`translate(${dx * .5}px,${-up}px) rotate(${dir * 200}deg)`, opacity:1, offset:.45 },
                     { transform:`translate(${dx}px,${land - 110}px) rotate(${dir * 420}deg)`, opacity:1, offset:.85 },
                     { transform:`translate(${dx}px,${land - 110}px) rotate(${dir * 420}deg)`, opacity:0 }],
                    { duration:1500 + i * 30, delay:i * 45, easing:"cubic-bezier(.3,.6,.5,1)", fill:"forwards" });
        }
        confettiCannon(); burstStars();
      });
    }
    /* [cinematic] the intro leads straight into the first gate: that gate already stands at the end of the carpet; when
       Swiftie has finished his line he turns round and walks up to it while the camera flies in after him, and the gate
       slide carries on from there (no आगे). */
    const nx = CARD.slides[state.idx + 1], toGate = d.kind === "intro" && nx && nx.type === "STORY_FILL" ? nx : null;
    let cam = null;
    if(toGate){ $("navBtn").style.display = "none"; sc.classList.add("to-gate"); cam = smStageLayer(sc, "sm-cam"); cam.innerHTML = smDoorHTML(toGate.data.door); }
    smCam(cam, null, 0);
    const walkToGate = () => {
      const rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), T = ms => rm ? 0 : ms;
      const front = sc.querySelector(".sm-pal-sw"), bub = sc.querySelector(".sm-bubble"), rib = sc.querySelector(".sm-ribbon");
      const fade = (el, ms) => el && el.animate([{ opacity:1 }, { opacity:0 }], { duration:T(ms), easing:"ease-in", fill:"forwards" });
      fade(bub, 320);
      front.getAnimations().forEach(a => a.cancel());   // stop the idle float where it is
      // the back view, the same size and spot as the front pose (pointing pose: figure .883 of the box tall, feet at .934,
      // mirrored centre .536 · back view: figure .846 tall, feet at .929, centre .58, box 3:4)
      const f = smRect(front), H = f.h * .883 / .846, W = H * .75, cx = f.x + f.w * .536, bottom = f.y + f.h * .934;
      const back = smEl("img", "sm-pal-swb"); back.src = smArt("sw_back"); back.alt = "";
      back.style.cssText = `left:${(cx - W * .58).toFixed(1)}px;top:${(bottom - H * .929).toFixed(1)}px;height:${H.toFixed(1)}px;scale:0 1;`;
      cam.appendChild(back);
      // 1 · he turns round: the front pose folds to its edge, the back view unfolds from it
      front.animate([{ scale:"-1 1" }, { scale:"0 1" }], { duration:T(190), easing:"ease-in", fill:"forwards" }).onfinish = () => {
        if(!alive()) return;
        front.style.visibility = "hidden";
        back.animate([{ scale:"0 1" }, { scale:"1 1" }], { duration:T(190), easing:"ease-out", fill:"forwards" }).onfinish = () => {
          if(!alive()) return;
          back.style.scale = "1 1";
          smLater(alive, T(300), () => {
            // 2 · he walks slowly up the carpet to the gate; the camera flies in after him until the gate fills the middle
            const ms = T(4800), top = parseFloat(back.style.top);
            const dx = SM_GATE_FOOT.cx - (parseFloat(back.style.left) + W / 2), dy = SM_GATE_FOOT.bottom - (top + H);
            fade(rib, 700);
            const a = back.animate(smWalkKf(dx, dy, SM_GATE_FOOT.h / H, 9), { duration:ms, easing:"cubic-bezier(.3,0,.7,1)", fill:"forwards" });
            smCam(cam, SM_CAM_GATE, ms, "cubic-bezier(.45,0,.35,1)");
            a.onfinish = () => { if(!alive()) return; window.__palArrive = toGate.id; completeSlide(true); };
          });
        };
      };
    };
    const free = smReplay((done) => smPlay(d.vo, [], done));
    setSwMood(d.kind === "treasure" ? "celebrate" : "talk");
    smSteps([500, { id:d.vo }], alive, () => { free(); if(toGate) walkToGate(); else setNavActive(true); });
  }
};

SlideModules.STORY_FILL = {
  // PRACTICE (palace door): number sentence → complete the story by putting its numbers in the blanks.
  // mode "tap": boxes light one by one, the child taps the number for the lit box · mode "drag": any
  // order. Tapping an empty box speaks that box's question. Wrong → wiggle + bounce back. CR reads the
  // whole story, lighting each sentence and its number in the story AND the equation. Solving opens
  // the door (portal), Swiftie walks through, the "पार हो गया" line plays, then on to the next door.
  // data:{door:"pink"|"blue"|"green", title, eq, story:[[text|{blank:i}]…], answers:[…], tray:[…], mode,
  //       vo1, vo2, box_vo:[…], cr_vo, pass_vo?}
  mount(host, slide){
    const d = slide.data, alive = smAlive(); smReady(slide);
    const tokens = smParseEq(d.eq);
    const wrap = smEl("div", "sm-doorwrap door-" + d.door);
    const left = smEl("div", "sm-door-side", `<div class="sm-ribbon small">${smEsc(d.title)}</div>` + smDoorHTML(d.door) +
      `<img class="sm-door-sw" src="${smArt("sw_back")}" alt="" onerror="this.src='assets/UI/sw_lg_happy.png'">`);
    const parch = smEl("div", "sm-parch");
    const eqc = smEl("div", "sm-eq-chip", smEqHTML(tokens));
    const story = smEl("div", "sm-fill-story");
    let bi = 0;
    d.story.forEach((sent, si) => {
      const s = smEl("span", "sm-sent", ""); s.dataset.s = si;
      sent.forEach(part => {
        if(typeof part === "string") s.appendChild(document.createTextNode(part));
        else { const z = smEl("span", "sm-zone sm-blank", ""); z._i = part.blank; z.dataset.b = part.blank; s.appendChild(z); bi++; }
      });
      story.appendChild(s); story.appendChild(document.createTextNode(" "));
    });
    const tray = smEl("div", "sm-tray parch");
    d.tray.forEach(v => { const t = smEl("div", "sm-tile num", smEsc(v)); t._v = v; tray.appendChild(t); });
    parch.appendChild(eqc); parch.appendChild(story); parch.appendChild(tray);
    wrap.appendChild(left); wrap.appendChild(parch); host.appendChild(wrap);
    /* [flow] the gate scene around the puzzle (the puzzle, its VO and its checks are unchanged): Swiftie walks up to the gate →
       its jewel glows and a rolled scroll floats out → the scroll glides to the middle and unrolls while the hall and the gate
       blur behind it → (the puzzle) → a wax seal stamps the solved scroll, it rolls up and flies back into the jewel, the hall
       comes back into focus → the gate opens. A tracker shows every gate of the palace (solved ✓ / this one / still to come).
       Gates after the first run a quicker version; a tap during the arrival skips straight to the puzzle. */
    const gates = CARD.slides.filter(s => s.type === "STORY_FILL"), gi = Math.max(0, gates.findIndex(s => s.id === slide.id));
    const track = smEl("div", "sm-gates", gates.map((g, i) => `<i class="sm-gate c-${g.data.door} ${i < gi ? "done" : i === gi ? "now" : "todo"}"></i>`).join(""));
    wrap.appendChild(track);
    const markGateDone = () => { const g = track.children[gi]; if(g){ g.classList.remove("now"); g.classList.add("done", "pop"); } if(gi === gates.length - 1) track.classList.add("all"); };
    // the gate side spans the whole stage (its ribbon, the far gate at the end of the carpet and Swiftie sit at stage spots); the scroll centres
    { let x = 0, y = 0; for(let e = wrap; e && e !== $("stage"); e = e.offsetParent){ x += e.offsetLeft; y += e.offsetTop; }
      left.style.left = -x + "px"; left.style.top = -y + "px"; wrap.classList.add("staged"); }
    parch.classList.add("rolled", "away");
    const sw = left.querySelector(".sm-door-sw"), door = left.querySelector(".sm-door2"), glow = left.querySelector(".dr-glow"), hall = () => document.getElementById("smPalaceBg");
    // [cinematic] the gate and Swiftie sit in the camera layer (the ribbon stays put); after the intro Swiftie is already
    // at the gate with the camera in close, else he starts at the near left with the whole hall in view
    const cam = smEl("div", "sm-cam"); left.appendChild(cam); cam.appendChild(door); cam.appendChild(sw);
    const arrived = window.__palArrive === slide.id; window.__palArrive = null;
    smCam(cam, arrived ? SM_CAM_GATE : null, 0); if(arrived) wrap.classList.add("atgate");
    const rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), quick = gi > 0;
    let staging = true, ff = rm, cur = null, pend = null;
    const dur = ms => ff ? 0 : Math.round(quick ? ms * .65 : ms);
    const run = (el, kf, ms, ease, fn) => { const a = el.animate(kf, { duration:dur(ms), easing:ease }); cur = a; a.onfinish = () => { if(cur === a) cur = null; if(alive() && fn) fn(); }; };
    const wait = (ms, fn) => { if(ff){ fn(); return; } const t = setTimeout(() => { pend = null; if(alive()) fn(); }, dur(ms)); pend = { t, fn }; };
    const skip = () => { if(!staging || ff) return; ff = true; if(cur) [].concat(cur).forEach(a => a.finish()); if(pend){ clearTimeout(pend.t); const f = pend.fn; pend = null; f(); } };
    const toGem = () => { const g = smRect(glow), p = smRect(parch); return { dx:(g.x + g.w / 2) - (p.x + p.w / 2), dy:(g.y + g.h / 2) - (p.y + p.h / 2) }; };
    const stageIn = (next) => {
      wrap.addEventListener("pointerdown", skip);
      const done = () => { staging = false; wrap.removeEventListener("pointerdown", skip); next(); };
      // 1 · Swiftie walks up the carpet to the gate while the camera flies in after him (after the intro he is there already)
      const walkUp = (fn) => {
        if(arrived){ wait(350, fn); return; }
        const ms = ff ? 0 : 3400, a = sw.animate(smWalkKf(333, -333, .48, 7, SM_CARPET_X, 12), { duration:ms, easing:"cubic-bezier(.3,0,.7,1)", fill:"forwards" });
        cur = [a, ...smCam(cam, SM_CAM_GATE, ms, "cubic-bezier(.45,0,.35,1)")];
        a.onfinish = () => { cur = null; wrap.classList.add("atgate"); a.cancel(); if(alive()) fn(); };
      };
      walkUp(() => {
        // 2 · the gate's jewel glows
        wrap.classList.add("summon"); if(!ff) sfxSparkle();
        wait(800, () => {
          // 3 · a rolled scroll floats out of the jewel, glides to the middle and unrolls; the hall blurs behind it
          parch.classList.remove("away"); const g = toGem();
          wrap.classList.add("focus"); const h = hall(); if(h) h.classList.add("sm-focus"); if(!ff) sfxWhoosh();
          run(parch, [
            { transform:`translate(${g.dx.toFixed(1)}px,${g.dy.toFixed(1)}px) scale(.035,.14)`, opacity:0 },
            { transform:`translate(${g.dx.toFixed(1)}px,${(g.dy - 34).toFixed(1)}px) scale(.06,.24)`, opacity:1, offset:.14 },
            { transform:"translate(0px,0px) scale(.085,1)", opacity:1, offset:.56 },
            { transform:"translate(0px,0px) scale(1,1)", opacity:1 }], 1350, "cubic-bezier(.45,.05,.3,1)", () => {
            wrap.classList.remove("summon"); parch.classList.remove("rolled"); done();
          });
        });
      });
    };
    // after the correct-response line: the seal, then the scroll rolls up and flies back into the jewel (the hall un-blurs)
    const sealAndReturn = (then) => {
      parch.appendChild(smEl("div", "sm-seal", "<i></i>")); sfxPop(9);
      smLater(alive, rm ? 0 : 800, () => {
        const g = toGem();
        parch.classList.add("rolled"); wrap.classList.remove("focus"); const h = hall(); if(h) h.classList.remove("sm-focus"); sfxWhoosh();
        const a = parch.animate([
          { transform:"translate(0px,0px) scale(1,1)", opacity:1 },
          { transform:"translate(0px,0px) scale(.085,1)", opacity:1, offset:.38 },
          { transform:`translate(${g.dx.toFixed(1)}px,${(g.dy - 34).toFixed(1)}px) scale(.06,.24)`, opacity:1, offset:.84 },
          { transform:`translate(${g.dx.toFixed(1)}px,${g.dy.toFixed(1)}px) scale(.03,.12)`, opacity:0 }], { duration:rm ? 0 : 1150, easing:"cubic-bezier(.55,0,.4,1)", fill:"forwards" });
        a.onfinish = () => { if(!alive()) return; parch.classList.add("away"); a.cancel(); then(); };
      });
    };
    const blanks = [...story.querySelectorAll(".sm-blank")].sort((x, y) => x._i - y._i);
    const tiles = [...tray.children], tokEls = [...eqc.querySelectorAll(".sm-tok")];
    let active = 0, wrongOn = new Map(), revealedAny = false;
    const nextEmpty = () => blanks.findIndex(b => !b._val);
    const markActive = () => { blanks.forEach((b, i) => b.classList.toggle("active", d.mode === "tap" && i === active && !b._val)); };
    const finish = () => {
      state.locked = true;
      smEmitCorrect(slide, "story_fill_correct", { revealed:revealedAny });
      sfxCorrect(); confettiCannon(); setSwMood("celebrate");
      // CR: light each sentence as it is read, and each number in the story + the equation as it is said
      const sents = [...story.querySelectorAll(".sm-sent")], starts = smSentenceStarts(d.cr_vo);
      const cues = [];
      sents.forEach((s, i) => { const at = starts[i + 1] != null ? starts[i + 1] : starts[i]; if(at != null) cues.push({ at, fn:() => sents.forEach((x, j) => x.classList.toggle("hl-sent", j === i)) }); });
      d.answers.forEach((v, i) => { const at = smAt(d.cr_vo, v); if(at != null) cues.push({ at, fn:() => {
        blanks.forEach((b, j) => b.classList.toggle("lit", j === i));
        tokEls.forEach(t => t.classList.toggle("lit", t.textContent === v));
      } }); });
      smPlay(d.cr_vo, cues, () => {
        sents.forEach(x => x.classList.remove("hl-sent")); smUnlit(wrap);
        if(!alive()) return;
        // the scroll is sealed and flies back into the gate → the door opens → portal → Swiftie walks through
        sealAndReturn(() => {
          wrap.classList.add("charge"); sfxSparkle();
          smLater(alive, 750, () => { wrap.classList.add("open"); sfxWhoosh(); markGateDone(); });
          smLater(alive, 1300, sfxSparkle);
          // [gate to gate] Swiftie has stepped into the portal: the camera never pulls back. It eases on towards the portal
          // while the "gate passed" line plays, then flies through it after him into the next hall (smThroughPortal).
          smLater(alive, 2950, () => {
            const p = smHallPt(door, SM_CAM_GATE, .56), P = { x:SM_CAM_GATE.x + 2 * p.x, y:SM_CAM_GATE.y + 2 * p.y };
            if(!rm) smCam(cam, smCamOn(p, 2.3, P.x + (666.5 - P.x) * .15, P.y + (415 - P.y) * .15), 7000, "cubic-bezier(.3,.1,.5,1)");
            const on = () => smThroughPortal(cam, p, d.door, rm ? 0 : 1100, () => {
              if(!alive()) return; const nx = CARD.slides[state.idx + 1];
              window.__palThrough = nx && nx.layout === "palace" ? nx.id : null; completeSlide(!revealedAny); });
            if(d.pass_vo){
              wrap.appendChild(smEl("div", "sm-pass", smEsc(smText(d.pass_vo))));   // along the bottom, under the open gate
              smPlay(d.pass_vo, [], () => smLater(alive, 300, on));
            } else smLater(alive, rm ? 0 : 900, on);
          });
        });
      });
    };
    const place = (b, tile) => {
      b._val = tile._v; b.textContent = tile._v; b.classList.add("filled", "pop"); b.classList.remove("active", "ask");
      tile.classList.add("used"); tiles.forEach(t => t.classList.remove("reveal")); sfxPop(6);
      const n = nextEmpty();
      if(n < 0){ blanks.forEach(x => x.classList.remove("active")); finish(); }
      else { active = n; markActive(); }
    };
    const miss = (b, tile, dragged) => {
      smWrong(slide); stopAudio(); smWiggle(tile, dragged ? 430 : 0);
      const k = (wrongOn.get(b) || 0) + 1; wrongOn.set(b, k);
      b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 500);
      // never stuck: the 3rd miss on the same box lights the card that belongs there
      if(k >= 3){ const want = d.answers[b._i], t = tiles.find(x => !x.classList.contains("used") && x._v === want);
        if(t){ t.classList.add("reveal"); revealedAny = true; state.scaffoldLevel = 3;
          SwiftPAL.emit("answer_revealed", { slide_id:slide.id, phase:slide.phase, attempts:state.attempts, box:b._i }); } }
    };
    // intro: VO1 (equation tokens light in sync) → VO2 (each sentence lights; its box pulses on "कुछ / कितनी")
    const sents = [...story.querySelectorAll(".sm-sent")];
    const free = smReplay((done) => smPlay(d.vo2, vo2Cues(), () => { sents.forEach(x => x.classList.remove("hl-sent")); done(); }));
    const endIntro = smOnce(() => { free(); sents.forEach(x => x.classList.remove("hl-sent")); blanks.forEach(b => b.classList.remove("pulse")); smUnlit(eqc); setSwMood("point"); markActive(); });
    let busyTap = false;
    blanks.forEach(b => b.addEventListener("click", () => {
      if(state.locked || staging || b._val) return;
      endIntro();
      if(d.mode === "tap"){ active = blanks.indexOf(b); markActive(); }
      b.classList.add("ask"); setTimeout(() => b.classList.remove("ask"), 900);
      smPlay(d.box_vo[b._i], [], () => {});
    }));
    tiles.forEach(tile => {
      if(d.mode === "drag") smDraggable(tile, {
        can:() => !state.locked && !staging && !tile.classList.contains("used"),
        drop:(z, t) => { if(!blanks.includes(z) || z._val) return false; endIntro();
          if(d.answers[z._i] === t._v){ place(z, t); return true; } miss(z, t, true); return false; }
      });
      tile.addEventListener("click", () => {
        if(state.locked || staging || busyTap || tile.classList.contains("used") || d.mode !== "tap") return;
        endIntro();
        const b = blanks[active]; if(!b || b._val) return;
        if(d.answers[b._i] === tile._v){ busyTap = true; tile.style.visibility = "hidden"; smFly(tile, b, 480, () => { busyTap = false; tile.style.visibility = ""; if(alive()) place(b, tile); }); }
        else miss(b, tile, false);
      });
    });
    const vo2Cues = () => {
      const starts = smSentenceStarts(d.vo2), cues = [];
      sents.forEach((s, i) => { if(starts[i] != null) cues.push({ at:starts[i], fn:() => sents.forEach((x, j) => x.classList.toggle("hl-sent", j === i)) }); });
      const ws = smWords(d.vo2); let bix = 0;
      ws.forEach(w => { const n = smNorm(w.w); if((n === "कुछ" || n === "कितनी" || n === "कितने") && bix < blanks.length){ const b = blanks[bix++];
        cues.push({ at:w.ms, fn:() => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); } }); } });
      return cues;
    };
    setSwMood("talk");
    smSteps([
      stageIn, 250,
      { id:d.vo1, cues:() => smTokCues(d.vo1, tokEls, tokens), post:() => smUnlit(eqc), gap:300 },
      { id:d.vo2, cues:vo2Cues, post:() => { sents.forEach(x => x.classList.remove("hl-sent")); blanks.forEach(b => b.classList.remove("pulse")); } }
    ], alive, endIntro);
  }
};

/* ---------- 13. CONTROLLER ---------- */
/* the celebration's gold star burst - [ui: reference shell] the FLN kit's recipe 8 (fewer, slower stars) */
function starBurst(){ FLNMotion.starBurst.fire({ host: "#confetti" }); }
function clearHost(){
  document.body.classList.remove("is-end");   // r4: clear immersive end state when leaving celebration
  $("slideHost").innerHTML = "";
  document.querySelectorAll(".sm-anim-ov, .sm-flyer").forEach(e => e.remove());   // story-kit overlays never outlive their slide
  const _hall = $("smPalaceBg"); if(_hall) _hall.classList.remove("sm-focus");      // the gate scene's blurred hall never outlives its slide
  $("hintBtn").classList.remove("show");
  $("hintBtn").disabled = false;
  setNavActive(false);
  stopNudge();
  stopAudio();
}

/* [ui: reference shell] from one question to the next in the same phase (guided / practice), the old screen slides
   out and the new one slides in (.q-out / .q-in), with a soft swish. Everything else mounts at once, as before. */
let _mountTok = 0;
function mountSlide(idx){
  const t = ++_mountTok;
  const cur = CARD.slides[state.idx], nx = CARD.slides[idx], host = $("slideHost");
  const q = s => s && (s.phase === "guided" || s.phase === "practice") && s.type !== "CELEBRATION";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // [cinematic] palace pages never slide sideways over the painted hall (its gate stays where it stands): the old scene
  // fades out and the new one fades in - or, when the intro has just walked Swiftie up to this gate, it simply carries on
  if(host && host.childElementCount && cur && nx && nx.layout === "palace" && idx === state.idx + 1){
    if(window.__palArrive === nx.id || window.__palThrough === nx.id){ window.__palCut = true; mountSlideNow(idx); return; }
    if(!reduce){
      host.classList.remove("q-in", "pal-in", "slide-in"); host.classList.add("pal-out");
      setTimeout(()=>{ if(t !== _mountTok) return; host.classList.remove("pal-out"); window.__palIn = true; mountSlideNow(idx); }, 320);
      return;
    }
  }
  if(host && host.childElementCount && cur && q(cur) && q(nx) && idx === state.idx + 1 && cur.phase === nx.phase && !reduce){
    host.classList.remove("q-in"); host.classList.add("q-out"); sfxSwish();
    setTimeout(()=>{ if(t !== _mountTok) return; host.classList.remove("q-out"); window.__qIn = true; mountSlideNow(idx); }, 340);
  } else mountSlideNow(idx);
}
function mountSlideNow(idx){
  state.mountGen = (state.mountGen || 0) + 1;   // story-kit timers/chains check this so nothing from a left slide fires later
  state.idx = idx;
  state.slideStart = Date.now();
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0; state.hintActive = false;
  state.audioReplays = 0; state.gateNavUntilAudio = false; state.endBtnPending = false;
  state.replayAudio = null;   // a module may set a slide-specific replay (e.g. teach slides whose
                              // audio roles aren't in the autoPlayChain order); else the chip replays the chain
  state.ownsAudio = false;    // a module that drives its OWN audio sequence sets this → skip autoPlayChain
                              // (else the auto prompt-chain stomps/truncates the module's timed VO)
  const slide = CARD.slides[idx];
  clearHost();

  // header prompt
  $("promptText").textContent = slide.prompt_hi || "";

  // Hint button stays HIDDEN until the learner makes a wrong attempt, then it is
  // exposed (graduated scaffold). Mastery uses the SAME scaffold — not excluded.
  $("hintBtn").classList.remove("show");
  $("hintBtn").style.display = "";
  $("navBtn").style.display = "";        // restored by default; tap-to-answer slides hide it themselves
  // [16i] DEFAULT nav wiring — a module that enables आगे without overriding onclick still advances.
  // (DEMO_COUNT shipped an enabled-but-dead button; auto-INTRO inherited an unfulfillable tap guard.)
  $("navBtn").onclick = ()=> completeSlide(true);
  setSwMood("point");                    // Swiftie turns to present each new slide

  SwiftPAL.emit("slide_entered", { slide_id: slide.id, phase: slide.phase, eis: slide.eis, type: slide.type, idx });

  // audio chip = replay the slide audio. Prefer a module-supplied replay (teach slides own their
  // count_intro/explain sequence, which autoPlayChain deliberately skips), else replay the chain.
  $("audioChip").onclick = ()=>{
    state.audioReplays++;
    SwiftPAL.emit("audio_replay", { slide_id: slide.id, phase: slide.phase, count: state.audioReplays });
    if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
  };

  // mount the type
  const mod = SlideModules[slide.type];
  if(!mod){ console.error("[engine] no module for", slide.type); return; }
  // [engine JS] r4/F1 TEACHING FRAME: tutorial slides mount inside a grid-paper .tut-card (header hidden,
  // prompt in-card, standing Swiftie bottom-left + shoulder audio chip). Type-agnostic — any tutorial-phase
  // module renders into the card. Non-tutorial slides mount bare into slideHost as before.
  const isTut = (slide.phase === "tutorial" && slide.type !== "PHASE_TRANSITION" && slide.type !== "CELEBRATION");
  $("stage").classList.toggle("tut", isTut);
  document.body.classList.toggle("tut-page", isTut);
  // story-kit layouts: activity pages use a roomier stage (no आगे strip); palace pages get the
  // full-bleed "रहस्यमयी महल" backdrop; header:false hides the prompt band for a story beat.
  const isPalace = slide.layout === "palace";
  $("stage").classList.toggle("sm-page", !isTut && /^(SIGN_DRAG|PICK_SENTENCE|BUILD_SENTENCE|PICK_STORY|STORY_FILL|PALACE_SCENE)$/.test(slide.type));
  $("stage").classList.toggle("sm-palace", isPalace);
  $("stage").classList.toggle("sm-noheader", slide.header === false);
  document.body.classList.toggle("sm-palace-page", isPalace);
  let _bg = $("smPalaceBg");
  if(isPalace && !_bg){ _bg = document.createElement("div"); _bg.id = "smPalaceBg"; _bg.className = "sm-palace-bg"; _bg.innerHTML = smPalaceBG(); $("stage").insertBefore(_bg, $("stage").firstChild); }
  else if(!isPalace && _bg) _bg.remove();
  let mountHost = $("slideHost");
  if(isTut){
    const card = document.createElement("div"); card.className = "tut-card";
    card.innerHTML = `<div class="tut-prompt">${slide.prompt_hi || ""}</div>` +
      `<img class="tut-mascot" src="assets/start_mascot.webp" alt="" onerror="this.style.display='none'">` +
      /* [ui: reference shell] the in-slide speaker chip is the inline SVG chip (gradient + white ring + wave arcs) */
      `<span class="tut-audio" role="button" aria-label="फिर से सुनो"><svg viewBox="0 0 62 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Audio"><g filter="url(#tutChipShadow)"><rect x="8" y="4" width="46" height="44" rx="22" fill="url(#tutChipGrad)"/><rect x="6" y="2" width="50" height="48" rx="24" stroke="white" stroke-width="4"/><path d="M29.8466 19.0574C29.8804 19.0524 29.9145 19.0496 29.9487 19.0488C30.6094 19.0317 31.0021 19.5124 31.0015 20.1414C31.0008 20.9661 31.0003 21.7911 31.0005 22.6158L31.001 27.7212L31.0009 30.5591C31.0009 31.0364 31.0122 31.5472 30.9863 32.0228C30.9662 32.2709 30.902 32.4608 30.7251 32.643C30.3831 32.9952 29.8337 33.0842 29.4386 32.7671C29.0784 32.4781 28.7473 32.1159 28.4181 31.7862L26.4414 29.8087C26.1771 29.5426 25.9071 29.2636 25.6339 29.0081C25.0227 28.9649 24.3645 29.017 23.7487 28.9979C23.445 28.9885 23.1625 29.0211 22.8589 28.9606C22.3751 28.8616 22.0618 28.4823 22.0642 27.9824C22.0706 26.5937 22.0287 25.1949 22.0828 23.8081C22.0884 23.6626 22.2302 23.4334 22.3309 23.3252C22.454 23.1907 22.6146 23.0963 22.792 23.0543C23.0567 22.9904 23.5328 23.016 23.8224 23.0128C24.4143 23.0063 25.0171 23.0277 25.609 23.0073C25.6794 22.9529 25.8505 22.7743 25.919 22.706L26.5305 22.0945L28.5396 20.0838C28.9157 19.7059 29.3217 19.1749 29.8466 19.0574Z" fill="white"/><path class="wv wv2" d="M36.2367 18.6905C36.8783 18.6449 37.3041 19.231 37.6725 19.6829C38.7675 21.0046 39.4982 22.5894 39.7923 24.2804C40.2503 26.8763 39.6548 29.5478 38.1378 31.7035C37.8393 32.1274 37.508 32.5324 37.149 32.9063C36.9404 33.1236 36.7646 33.2558 36.4622 33.3081C36.2013 33.3412 35.9378 33.2717 35.7272 33.1144C35.5185 32.9615 35.3816 32.7298 35.3483 32.4733C35.2786 31.9235 35.5696 31.6821 35.8914 31.3297C36.0448 31.1639 36.1901 30.9908 36.3269 30.811C38.3669 28.136 38.4986 24.4654 36.6555 21.6511C36.4826 21.3899 36.2966 21.1376 36.0984 20.8951C35.8252 20.5652 35.3947 20.2691 35.3472 19.8184C35.2845 19.2225 35.6439 18.768 36.2367 18.6905Z" fill="white"/><path class="wv wv1" d="M33.3868 21.5044C33.9769 21.4549 34.2563 21.7845 34.5981 22.1981C35.1982 22.924 35.6149 23.7691 35.8211 24.6886C36.171 26.2384 35.8867 27.8637 35.0314 29.2026C34.7421 29.6568 34.2333 30.3745 33.6937 30.4946C33.1633 30.5437 32.6759 30.2927 32.5495 29.7376C32.3921 29.0462 32.9849 28.6956 33.3274 28.1763C34.2088 26.833 34.1932 25.0908 33.288 23.7635C33.0747 23.4522 32.6159 23.0564 32.5518 22.7133C32.4377 22.1027 32.7745 21.619 33.3868 21.5044Z" fill="white"/></g><defs><filter id="tutChipShadow" x="0" y="0" width="62" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><linearGradient id="tutChipGrad" x1="8" y1="26" x2="54" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#1987FC"/><stop offset="1" stop-color="#1565F4"/></linearGradient></defs></svg></span>`;
    const inner = document.createElement("div"); inner.className = "tut-content";
    card.insertBefore(inner, card.querySelector(".tut-mascot"));
    card.querySelector(".tut-audio").onclick = ()=>{
      state.audioReplays++;
      SwiftPAL.emit("audio_replay", { slide_id: slide.id, phase: slide.phase, count: state.audioReplays, src: "tut_chip" });
      if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
    };
    $("slideHost").appendChild(card);
    mountHost = inner;
  }
  mod.mount(mountHost, slide);
  // game-feel: animate the slide content in on every mount (a question that follows a question slides in: .q-in)
  { const _bl = $("smBloom"); window.__palThrough = null;   // [gate to gate] the portal light fades off the new page
    if(_bl){ _bl.removeAttribute("id"); const a = _bl.animate([{ opacity:1 }, { opacity:0 }], { duration:matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900, easing:"ease-out", fill:"forwards" }); a.onfinish = () => _bl.remove(); } }
  { const _sh = $("slideHost"), qi = !!window.__qIn, pi = !!window.__palIn, pc = !!window.__palCut; window.__qIn = window.__palIn = window.__palCut = false;
    _sh.classList.remove("slide-in", "q-in", "pal-in"); void _sh.offsetWidth; if(!pc) _sh.classList.add(qi ? "q-in" : pi || slide.layout === "palace" ? "pal-in" : "slide-in"); }

  // vertically ink-centre every Devanagari glyph once the slide has laid out
  requestAnimationFrame(()=> centerAllGlyphs($("slideHost")));

  // play the full VO chain automatically (prompt → phoneme/word_name → instruction).
  // If the slide gated its nav button on audio, enable it once the chain finishes
  // (so students can't skip before hearing it). SKIP when the module owns its audio
  // (state.ownsAudio) — else this chain stomps/truncates the module's own timed VO.
  if(!state.ownsAudio){
    autoPlayChain(slide, ()=>{
      if(state.gateNavUntilAudio) setNavActive(true);
      if(state.endBtnPending){ $("endBtn").classList.add("show"); state.endBtnPending = false; }
    });
  }
}

/* ---------- [engine JS] r4/P1 PHASE-TRANSITION PEEK GATE ----------
   An automatic interstitial fired ON A PHASE BOUNDARY (not a slide type). [ui: reference shell] the gate covers the
   WHOLE window (body-level): a frosted veil, Swiftie peeks up from the bottom (assets/gif/peeking.webp, drawn on a
   canvas where the browser can decode it - no frame blinks), the headline pops in on her first open-mouth frame as the
   line starts, and she ducks back down before the next slide mounts. */
function afterConfetti(fn){ FLNMotion.confetti.after(fn); }   // let the correct-answer confetti land first (8s cap)
/* onscreen headline per gate (display only; distinct from any narration). Eligibility = phase IN this map. */
const PHASE_GATE_TITLE = { tutorial:"चलिए, शुरू करें!", guided:"चलिए, साथ में करें!", practice:"अब आपकी बारी!" };   // [16h] the lead’s official transition lines (VO = full sentences in the card manifest; NOTE aap-register — flagged)
const PHASE_GATE_VO    = { tutorial:"vo_pt_tutorial", guided:"vo_pt_guided", practice:"vo_pt_practice" };
const PG_CLIP_MS = 8304;      // peeking.webp: rise, peek, blink, come out, talk, duck - plays once
const PG_EXIT_MS = 520;       // the duck-down (CSS pgDuck) - a fallback bound only; animationend closes the gate
const PG_TALK_MS = 2724;      // the clip's first open-mouth frame: the headline + line start here
const PG_TAIL_MS = 450;       // a line that ends while she is still talking: hold this long, then duck
const PG_LOAD_CAP_MS = 2500;  // never wait longer than this for the clip to decode
let _peekUrl = "";
function restartPeek(img){
  const old = _peekUrl;
  img.src = _peekUrl = Assets.fresh("assets/gif/peeking.webp");
  if(old && old.indexOf("blob:") === 0) URL.revokeObjectURL(old);
}
const PeekPlayer = (()=>{
  const SRC = "assets/gif/peeking.webp", TYPE = "image/webp";
  let run = 0;
  function stop(){ run++; }
  function play(cv, img){
    const my = ++run, blob = Assets.blob(SRC);
    if(!cv || !blob || typeof ImageDecoder === "undefined") return Promise.resolve(false);
    if(img) img.style.display = "none";
    cv.style.display = "";
    cv.width = cv.height = 900;                  // the clip's 1:1 shape, so the CSS height + width:auto lays it out
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    cv.width = W; cv.height = H;                 // (this also wipes the last gate's parked smile)
    const ctx = cv.getContext("2d"); ctx.imageSmoothingQuality = "high";
    const draw = f =>{ ctx.clearRect(0, 0, W, H); ctx.drawImage(f, 0, 0, W, H); };
    return (async ()=>{
      if(ImageDecoder.isTypeSupported && !(await ImageDecoder.isTypeSupported(TYPE))) return false;
      const dec = new ImageDecoder({ data: await blob.arrayBuffer(), type: TYPE });
      await dec.tracks.ready;
      const count = dec.tracks.selectedTrack.frameCount;
      const first = count > 0 ? (await dec.decode({ frameIndex: 0 })).image : null;
      if(!first || my !== run){ if(first) first.close(); dec.close(); return false; }
      draw(first);
      let i = 0, cur = first, due = performance.now() + (cur.duration || 90000) / 1000;   // VideoFrame.duration: us
      let next = count > 1 ? dec.decode({ frameIndex: 1 }) : null;
      (async ()=>{
        while(next){
          let n; try { n = (await next).image; } catch(e){ break; }   // a failed decode: the frame on show stays
          const wait = due - performance.now();
          if(wait > 1) await new Promise(res => setTimeout(res, wait));
          if(my !== run){ n.close(); break; }                        // a newer gate, or this one closed
          draw(n); cur.close(); cur = n; i++;
          due = Math.max(due, performance.now() - 30) + (n.duration || 90000) / 1000;
          next = i + 1 < count ? dec.decode({ frameIndex: i + 1 }) : null;   // decoded while this one is on show
        }
        cur.close(); dec.close();                                    // plays once: the last frame stays drawn
      })();
      return true;
    })().catch(()=> false);
  }
  return { play, stop };
})();
const _gatedPhases = new Set();   // each phase gate plays ONCE (Start→tutorial, →guided, →practice)
let _gateToken = 0;
function phaseBlurTransition(cb, toPhase){
  const tok = ++_gateToken;
  stopNudge(); stopAudio();
  const gate = $("phaseGate"), img = $("phaseGateImg"), cv = $("phaseGateCv");
  gate.classList.remove("talking");
  const title = $("phaseGateTitle"); if(title) title.textContent = PHASE_GATE_TITLE[toPhase] || "";
  $("stage").classList.add("blurred", "gating");
  document.body.classList.add("gating");
  gate.classList.remove("leaving");
  gate.classList.add("show");
  SwiftPAL.emit("phase_transition", { to: toPhase });
  const closeGate = ()=>{ gate.classList.remove("show", "leaving", "talking"); $("stage").classList.remove("blurred", "gating"); document.body.classList.remove("gating"); };
  // VO only if the card actually ships it; else a silent beat — the clip keeps the peek visible.
  const voId = PHASE_GATE_VO[toPhase];
  const voSrc = (voId && CARD.assets && CARD.assets.audio && CARD.assets.audio[voId]) || null;
  let clipAt = 0;
  const startClock = ()=>{
    if(clipAt || tok !== _gateToken) return;
    clipAt = Date.now();
    setTimeout(talk, PG_TALK_MS);
  };
  const useImg = ()=>{
    if(tok !== _gateToken) return;
    if(cv) cv.style.display = "none";
    if(!img){ startClock(); return; }
    img.style.display = "";
    restartPeek(img);
    if(img.decode) img.decode().then(startClock, startClock); else startClock();
  };
  PeekPlayer.play(cv, img).then(ok =>{ if(tok !== _gateToken) return; if(ok) startClock(); else useImg(); }, useImg);
  setTimeout(startClock, PG_LOAD_CAP_MS);
  function talk(){
    if(tok !== _gateToken) return;
    gate.classList.add("talking");          // headline pops in (CSS) on the same tick the VO starts
    play(voSrc, afterVo);
  }
  function afterVo(){
    if(tok !== _gateToken){ closeGate(); return; }
    const clipLeft = Math.max(0, PG_CLIP_MS - (Date.now() - clipAt));
    const hold = voSrc ? Math.min(clipLeft, PG_TAIL_MS) : clipLeft;
    const finish = ()=>{
      PeekPlayer.stop();
      gate.classList.remove("show", "leaving", "talking");
      $("stage").classList.remove("blurred");
      if(cb) cb();                              // mounts the next slide
      $("stage").classList.remove("gating");    // header returns once the slide is in
      document.body.classList.remove("gating");
    };
    setTimeout(()=>{
      if(tok !== _gateToken){ closeGate(); return; }
      let done = false, fallback = 0;
      const once = ()=>{
        if(done) return; done = true;
        clearTimeout(fallback);
        if(img) img.removeEventListener("animationend", once);
        if(cv) cv.removeEventListener("animationend", once);
        if(tok !== _gateToken){ closeGate(); return; }
        finish();
      };
      if(img) img.addEventListener("animationend", once);
      if(cv) cv.addEventListener("animationend", once);
      gate.classList.add("leaving");
      fallback = setTimeout(once, PG_EXIT_MS + 500);
    }, hold);
  }
}

function completeSlide(success){
  const slide = CARD.slides[state.idx];
  SwiftPAL.emit("slide_completed", {
    slide_id: slide.id, phase: slide.phase, success: !!success,
    attempts: state.attempts, latency_ms: Date.now()-state.slideStart,
    scaffold_level: state.scaffoldLevel, hint_used: state.hintUsed,
    nudge_used: state.nudgeUsed, audio_replays: state.audioReplays
  });
  if(state.idx >= CARD.slides.length - 1){
    // last slide is CELEBRATION; nothing more
    return;
  }
  // advance only AFTER the correct-answer confetti has landed (to the gate AND to the next slide alike).
  const fromIdx = state.idx, nextIdx = state.idx + 1;
  const next = CARD.slides[nextIdx];
  if(next && next.phase !== slide.phase && next.type !== "CELEBRATION" && next.type !== "PHASE_TRANSITION"
     && PHASE_GATE_TITLE[next.phase] && !_gatedPhases.has(next.phase)){
    _gatedPhases.add(next.phase);
    afterConfetti(()=>{ if(state.idx === fromIdx) phaseBlurTransition(()=> mountSlide(nextIdx), next.phase); });
    return;
  }
  afterConfetti(()=>{ if(state.idx === fromIdx) mountSlide(nextIdx); });
}

/* ---------- 14. VALIDATOR (runtime self-check) ---------- */
function runValidator(){
  const missing = (CARD.signals_expected || []).filter(s => !SwiftPAL.firedSet.has(s));
  SwiftPAL.validatorReport.missing_signals = missing;
  SwiftPAL.validatorReport.passed = missing.length === 0;
  console.log("[validator]", SwiftPAL.validatorReport);
  try{ window.parent?.postMessage({type:"swiftpal:lesson_complete", signals: SwiftPAL.signals, validatorReport: SwiftPAL.validatorReport}, "*"); }catch(e){}
  // offline self-capture: write the final record to localStorage; optionally POST
  // it to a learning-record endpoint if one is configured AND the device is online.
  SwiftPAL.persist();
  if(TELEMETRY.endpoint && navigator.onLine){
    try{ fetch(TELEMETRY.endpoint, {method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(SwiftPAL.exportResults()), keepalive:true}).catch(()=>{}); }catch(e){}
  }
  // dev banner
  if(new URLSearchParams(location.search).has("dev")){
    const b = $("devBanner");
    if(missing.length === 0){ b.textContent = "✓ all expected signals fired"; b.className = "dev-banner show ok"; }
    else { b.textContent = "✗ missing signals: " + missing.join(", "); b.className = "dev-banner show"; }
  }
}

/* ---------- 14b. [ui: reference shell] ASSETS - a small shim for the reference's animation players ----------
   The landing Swiftee, the gate's peeking Swiftee and the celebration clips play from frame 0 every time: each gets a
   fresh blob: URL of ONE download (fetched once, http(s) only; on file:// a cache-busted file URL instead). */
const Assets = (function(){
  const http = /^https?:$/.test(location.protocol), pend = {}, got = {};
  function blobOf(f){
    if(!http) return Promise.resolve(null);
    if(!pend[f]) pend[f] = fetch(f).then(r => r.ok ? r.blob() : null).then(b => { if(b) got[f] = b; return b; }).catch(()=> null);
    return pend[f];
  }
  return {
    url: f => f,
    blobOf: blobOf,
    blob: f => got[f] || null,
    fresh: f => got[f] ? URL.createObjectURL(got[f]) : f + (f.indexOf("?") < 0 ? "?r=" : "&r=") + Date.now(),
    prefetch: list => list.forEach(f => { blobOf(f); })
  };
})();

/* ---------- [ui: reference shell] blinks: every character picture on screen that has an eyes-shut copy
   (char_<...>_blink.webp - only the eyes differ) shows it for a moment every 2.5-6s, each on its own clock ---------- */
const CharBlink = (function(){
  const HAS = { "assets/char_aman_full.webp":1, "assets/char_meera_full.webp":1, "assets/char_meera_cheer.webp":1, "assets/char_aman.webp":1, "assets/char_meera.webp":1 };
  const ready = {}, SEL = ".sgp-fw .sgp-pose, .sm-photo .sm-av";
  const shut = src =>{ const f = (src || "").split("?")[0]; return HAS[f] ? f.replace(/\.webp$/, "_blink.webp") : null; };
  const load = f =>{ if(!ready[f]){ const im = new Image(); ready[f] = "loading"; im.src = f;
    (im.decode ? im.decode() : Promise.resolve()).then(()=>{ ready[f] = true; }, ()=>{ delete ready[f]; }); } return ready[f] === true; };
  const shown = im => im.isConnected && im.getClientRects().length && getComputedStyle(im).opacity !== "0";
  const blink = (im, f, open)=>{ im.dataset.blinking = 1; im.src = f; setTimeout(()=>{ if(im.getAttribute("src") === f) im.src = open; delete im.dataset.blinking; }, 130); };
  setInterval(()=>{
    if(document.hidden || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const now = Date.now();
    document.querySelectorAll(SEL).forEach(im =>{
      if(im.dataset.blinking) return;
      const open = im.getAttribute("src"), f = shut(open); if(!f) return;
      if(!im.dataset.next){ im.dataset.next = now + 1200 + Math.random() * 3500; load(f); return; }
      if(now < +im.dataset.next || !shown(im) || !load(f)) return;
      im.dataset.next = now + 2500 + Math.random() * 3500;
      blink(im, f, open); if(Math.random() < .18) setTimeout(()=>{ if(!im.dataset.blinking) blink(im, f, open); }, 300);
    });
  }, 100);
  return { shut };
})();

/* ---------- [ui: reference shell] the first screen's picture: the courtyard (CSS, inside the card), the title painted
   on its wall, and the lesson's two children gliding in from either side - each brings one of the deck's two number
   sentences (23 + 12 = 35, 23 − 12 = 11), then they cheer; then the play button arrives ("sg-intro-done").
   landing_hero { kind:"sm_story", people:[left, right], cells:[{type:"sentence", text}], title_look:"wall", start_at } */
const LandingPic = {
  KID_X: [150, 622], FEET: 168, FIG_H: 224, FILE_H: 640, MID: 386,
  file(w, pose){ return "assets/char_" + w + (pose === "cheer" ? "_cheer" : "_full") + ".webp"; },
  pill(text){
    const t = String(text || "").trim().split(/\s+/), sign = t.indexOf("+") >= 0 ? "add" : t.indexOf("−") >= 0 ? "sub" : "";
    return t.map(x => /^[+−=]$/.test(x) ? `<span class="sgq-op${x === "=" ? "" : " " + sign}">${x}</span>` : `<span class="sgq-n">${x}</span>`).join("");
  },
  html(h){
    const L = this;
    const kid = (w, s)=>{
      const imgs = `<img class="sgp-pose" alt="" data-for="idle" src="${L.file(w, "idle")}"><img class="sgp-pose" alt="" data-for="cheer" src="${L.file(w, "cheer")}">`;
      return `<div class="sgp-kid sgp-${s ? "r" : "l"}" data-who="${w}" style="left:${L.KID_X[s]}px;top:${L.FEET}px"><div class="sgp-move">` +
        `<div class="sgp-cast">${imgs}</div><i class="sgp-shd"></i><i class="sgp-lines"><b></b><b></b><b></b></i>` +
        `<div class="sgp-fw"><div class="sgp-tilt">${imgs}</div></div></div></div>`;
    };
    const pills = (h.cells || []).map((c, i)=> `<div class="sgq sgq-sm sgq-${i}" role="img" aria-label="${c.label || c.text}">${L.pill(c.text)}</div>`).join("");
    return `<div class="sgp sgp-sm" id="sgp">${pills}${kid(h.people[0], 0)}${kid(h.people[1], 1)}</div>`;
  },
  intro(){
    const L = this, root = document.getElementById("sgp"), hero = CARD.landing_hero || {};
    const done = ()=>{ if(!window.__sgIntroDone){ window.__sgIntroDone = true; document.dispatchEvent(new Event("sg-intro-done")); } };
    if(!root){ done(); return; }
    /* title_look "wall": the title painted on the courtyard wall - terracotta brush paint on a gentle arc (an SVG
       textPath, so Devanagari stays shaped), a white ring and a dark one dropped under it (the reference's sticker) */
    const ttl = document.getElementById("sgTitle");
    if(ttl && hero.title_look === "wall"){ ttl.classList.add("sg-wall");
      const txt = ttl.textContent.trim(), NS = "http://www.w3.org/2000/svg";
      ttl.innerHTML = '<svg class="sgw-arc" xmlns="' + NS + '" aria-hidden="true"><defs>' +
        '<pattern id="sgPaint" patternUnits="userSpaceOnUse" width="21" height="80" patternTransform="rotate(7)">' +
        '<rect width="7" height="80" fill="#A93816"/><rect x="7" width="3" height="80" fill="#932C10"/>' +
        '<rect x="10" width="7" height="80" fill="#B4421C"/><rect x="17" width="4" height="80" fill="#9E3214"/></pattern>' +
        '<path id="sgArc"/></defs>' +
        '<text class="sgw-b" transform="translate(0 4.8)"><textPath href="#sgArc" startOffset="50%" text-anchor="middle"></textPath></text>' +
        '<text class="sgw-t"><textPath href="#sgArc" startOffset="50%" text-anchor="middle"></textPath></text></svg>' +
        '<span class="sr-only"></span>';
      ttl.querySelectorAll("textPath").forEach(p => p.textContent = txt); ttl.lastChild.textContent = txt;
      const fitArc = ()=>{ const svg = ttl.firstChild, t = svg.querySelector("text"), fs = parseFloat(getComputedStyle(ttl).fontSize) || 60;
        const len = t.getComputedTextLength() || txt.length * fs * .45, pad = 14, W = len + 2 * pad + 8, sag = Math.round(W * .045);
        const base = fs * 1.05 + sag + pad;
        svg.setAttribute("width", W.toFixed(0)); svg.setAttribute("height", (base + fs * .38 + pad).toFixed(0));
        svg.querySelector("#sgArc").setAttribute("d", "M " + pad + " " + base + " Q " + (W / 2) + " " + (base - 2 * sag) + " " + (W - pad) + " " + base); };
      fitArc(); if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitArc); }
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const kids = [...root.querySelectorAll(".sgp-kid")], pills = [...root.querySelectorAll(".sgq")];
    const T = 2.2;   // the reference's tempo for every move of the children
    const q = (e, s)=> e.querySelector(s), wait = ms => new Promise(r => setTimeout(r, ms));
    const dir = s => s ? -1 : 1;
    const layout = k =>{
      const ims = [...k.querySelectorAll(".sgp-pose")];
      ims.forEach(im =>{ const H = L.FIG_H * (im.naturalHeight || L.FILE_H) / L.FILE_H;
        im.style.height = H.toFixed(1) + "px"; im.dataset.w = ((im.naturalWidth || 120) * H / (im.naturalHeight || 224)).toFixed(1); });
      const idle = ims.find(im => im.dataset.for === "idle"), sh = q(k, ".sgp-shd"), iw = +(idle ? idle.dataset.w : 120) * .92;
      sh.style.width = iw.toFixed(0) + "px"; sh.style.left = (-iw / 2).toFixed(0) + "px"; };
    const pose = (k, n, pop)=>{ k.querySelectorAll(".sgp-pose").forEach(im => im.classList.toggle("on", im.dataset.for === n));
      if(pop) q(k, ".sgp-fw").animate([{ scale: "1.07 .93" }, { scale: ".98 1.03", offset: .55 }, { scale: "1 1" }], { duration: 220, easing: "ease-out" }); };
    const ready = Promise.all([...root.querySelectorAll(".sgp-pose")].map(im => (im.decode ? im.decode() : Promise.resolve()).catch(()=>{})))
      .then(()=>{ kids.forEach(k =>{ layout(k); pose(k, "idle"); }); });
    const tilt = k => q(k, ".sgp-tilt"), fw = k => q(k, ".sgp-fw"), move = k => q(k, ".sgp-move"), cast = k => q(k, ".sgp-cast"), contact = k => q(k, ".sgp-shd");
    const lean = (s, deg, ms)=>{ const d = dir(s) * deg, o = { duration: ms * T, easing: "ease-in-out" };
      cast(kids[s]).animate([{ rotate: "0deg" }, { rotate: -d * 1.6 + "deg", offset: .4 }, { rotate: -d * 1.6 + "deg", offset: .6 }, { rotate: "0deg" }], o);
      return tilt(kids[s]).animate([{ rotate: "0deg" }, { rotate: d + "deg", offset: .4 }, { rotate: d + "deg", offset: .6 }, { rotate: "0deg" }], o); };
    const hop = (s, n, hgt)=>{ const k = kids[s], h = hgt || 18, o = { duration: 560 * T, iterations: n, easing: "ease-out" };
      const up = (el, sc, f)=>{ const b = parseFloat(getComputedStyle(el).opacity) || 1;
        el.animate([{ scale: "1", opacity: b }, { scale: sc, opacity: b * f, offset: .4, easing: "ease-in" }, { scale: "1", opacity: b, offset: .62 }, { scale: "1", opacity: b }], o); };
      up(cast(k), (1 - h / 90).toFixed(2), .55); up(contact(k), (1 - h / 45).toFixed(2), .35);
      return fw(k).animate([{ translate: "0 0" }, { translate: "0 " + -h + "px", offset: .4, easing: "ease-in" }, { translate: "0 0", offset: .62 },
        { translate: "0 2px", offset: .74 }, { translate: "0 0" }], o); };
    const fx = (cls, x, y, frames, ms)=>{ const e = document.createElement("i"); e.className = cls; e.style.left = x + "px"; e.style.top = y + "px"; root.appendChild(e);
      e.animate(frames, { duration: ms, easing: "cubic-bezier(.2,.8,.4,1)" }).onfinish = ()=> e.remove(); };
    const sparkle = (x, y, big)=> fx("sgp-spk" + (big ? " big" : ""), x, y,
      [{ scale: "0", rotate: "0deg", opacity: 1 }, { scale: "1", rotate: "45deg", opacity: 1, offset: .45 }, { scale: "0", rotate: "90deg", opacity: 0 }], big ? 900 : 760);
    const dust = s =>{ const x0 = L.KID_X[s] - dir(s) * 26;
      for(let i = 0; i < 7; i++){ const dx = -dir(s) * (14 + Math.random() * 44), dy = -(6 + Math.random() * 22);
        fx("sgp-dust", x0 + (Math.random() - .5) * 24, L.FEET - 6, [{ translate: "0 0", scale: ".4", opacity: .85 }, { translate: dx + "px " + dy + "px", scale: (1.2 + Math.random() * .8).toFixed(2), opacity: 0 }],
           520 + Math.random() * 260); } };
    const zoom = s =>{ const k = kids[s], d = dir(s), far = 200;
      sfxWhooshUI();
      move(k).animate([{ translate: -d * far + "px 0", opacity: 0 }, { translate: -d * far * .8 + "px 0", opacity: 1, offset: .15 },
        { translate: d * 6 + "px 0", opacity: 1, offset: .75, easing: "ease-in-out" }, { translate: "0 0", opacity: 1 }],
        { duration: 680 * T, easing: "cubic-bezier(.12,.62,.3,1)", fill: "both" });
      tilt(k).animate([{ rotate: d * 5 + "deg", filter: "blur(2px)" }, { rotate: d * 4 + "deg", filter: "blur(1px)", offset: .45 },
        { rotate: -d * 3 + "deg", filter: "blur(0px)", offset: .7 }, { rotate: "0deg", filter: "blur(0px)" }], { duration: 680 * T, easing: "ease-out" });
      q(k, ".sgp-lines").animate([{ opacity: 0, scale: ".3 1" }, { opacity: .5, scale: "1 1", offset: .3 }, { opacity: 0, scale: "1.2 1", offset: .65 }, { opacity: 0 }],
        { duration: 680 * T, easing: "ease-out" });
      setTimeout(()=> dust(s), 400 * T); };
    let started = false;
    const go = async ()=>{ if(started) return; started = true;
      await ready;
      if(reduce){ root.classList.add("go", "still"); pills.forEach(p => p.classList.add("on")); done(); return; }
      root.classList.add("go");
      await wait(380);
      zoom(0); await wait(240 * T); zoom(1); await wait(860 * T);
      /* each child leans toward the middle and its number sentence pops up there (teal +, purple −), with a sparkle */
      for(let i = 0; i < pills.length; i++){
        lean(i % 2, 7, 620); await wait(150 * T);
        pills[i].classList.add("on"); _tone([470, 700], "triangle", .1, .07);
        const r = pills[i].offsetLeft, y = pills[i].offsetTop;
        sparkle(L.MID + (i ? 120 : -120), y + 10, true);
        await wait(420 * T);
      }
      await wait(260);
      _tone([660, 880, 1180], "sine", .5, .1);
      kids.forEach(kd => pose(kd, "cheer", true)); hop(0, 2, 14); setTimeout(()=> hop(1, 2, 16), 110 * T);
      sparkle(L.MID - 150, -30, true); sparkle(L.MID + 150, -10, true);
      await wait(1300 * T);
      kids.forEach(kd => pose(kd, "idle", true));
      await wait(250);
      done(); };
    /* the picture comes in on the greeting's "आज हम ..." (landing_hero.start_at, s): it waits for the clip itself to
       reach that word, so a slow start never puts it early; 2.5s past that time it comes in anyway */
    const AT = +hero.start_at || 0;
    let greeted = false;
    document.addEventListener("sg-greeting-start", ()=>{ greeted = true;
      if(!AT){ go(); return; }
      const t0 = Date.now(), tick = ()=>{ if(started) return;
        const a = currentAudio;
        if((a && !a.paused && a.currentTime >= AT) || Date.now() - t0 > AT * 1000 + 2500){ go(); return; }
        setTimeout(tick, 40); };
      tick(); });
    setTimeout(()=>{ if(!greeted) go(); }, 6000);
  }
};

/* ---------- [engine JS] r4/#2 DATA-DRIVEN LANDING CONCEPT STRIP ----------
   A landing_hero of kind "concept_strip" renders N visual-example tiles from card data, so any game
   declares its landing preview in card.json instead of hand-editing HTML. Tile types: discs (size),
   bars (length), balance (weight — equal-size objects, heavier lower, never a size cue), image. */
const SG_BALANCE_SVG =
  '<svg viewBox="0 0 124 112" xmlns="http://www.w3.org/2000/svg">' +
  '<line x1="62" y1="30" x2="62" y2="86" stroke="#8AA0C8" stroke-width="6" stroke-linecap="round"/>' +
  '<polygon points="62,60 44,100 80,100" fill="#8AA0C8"/>' +
  '<g transform="rotate(-13 62 34)">' +
  '<rect x="14" y="30" width="96" height="11" rx="5.5" fill="#4EA3F0"/>' +
  '<circle cx="22" cy="20" r="14" fill="#FBD24B" stroke="#D9A21A" stroke-width="2.5"/>' +
  '<circle cx="102" cy="20" r="14" fill="#98A2B3" stroke="#5B6577" stroke-width="2.5"/>' +
  '</g></svg>';
function conceptTileHTML(c){
  const lbl = c && c.label ? ` aria-label="${c.label}"` : "";   // a11y only; not shown (pre-reader → visual+VO)
  switch(c && c.type){
    case "discs": {
      const sizes = c.sizes || [34, 54, 76];
      return `<div class="sg-ex sg-ex-size" role="img"${lbl}>` +
        sizes.map(s => `<span class="sg-disc" style="width:${s}px;height:${s}px"></span>`).join("") + `</div>`;
    }
    case "bars": {
      const widths = c.widths || [42, 72, 102];
      return `<div class="sg-ex sg-ex-len" role="img"${lbl}>` +
        widths.map(w => `<span class="sg-bar" style="width:${w}px"></span>`).join("") + `</div>`;
    }
    case "balance":
      return `<div class="sg-ex sg-ex-wt" role="img"${lbl}>` + SG_BALANCE_SVG + `</div>`;
    case "image":
      return `<div class="sg-ex" role="img"${lbl}><img src="${c.src}" alt="${c.label || ''}"></div>`;
    case "sentence": {   // a number-sentence card in its sign colour (teal +, purple −) — MTG2A01_L05_S01
      const toks = String(c.text || "").trim().split(/\s+/);
      const sign = toks.indexOf("+") >= 0 ? "add" : toks.indexOf("−") >= 0 ? "sub" : "";
      return `<div class="sg-sentence ${sign}" role="img"${lbl}>` + toks.map(t => `<span>${t}</span>`).join("") + `</div>`;
    }
    default:
      return "";
  }
}


/* ---------- 15. BOOT ---------- */
function boot(){
  // god-mode visual theme (opt-in via CARD.theme) — warms the whole stage; scoped CSS under .thm-*
  if(CARD.theme) $("stage").classList.add("thm-" + CARD.theme);
  // banner title = skill name only (strip "(भाग…)" and the ": letters" list)
  $("sgTitle").textContent = CARD.landing_title || (CARD.title.hi || "").split(/[:：(]/)[0].trim();   // the cover's own title, when the card gives one
  // VISUAL-FIRST landing hero: SHOW the concept, not just the title text
  (function(){ const hero = CARD.landing_hero, el = $("sgHero"); if(!hero || !el) return;
    if(hero.kind === "concept_strip") el.innerHTML = (hero.cells || []).map(c => `<div class="sg-acell">${conceptTileHTML(c)}</div>`).join("");
    else if(hero.kind === "sm_story") el.innerHTML = LandingPic.html(hero);   // [ui: reference shell] the courtyard picture
    else if(hero.kind === "shapes" && typeof shapeSVG === "function")
      el.innerHTML = (hero.shapes||[]).map(s=> shapeSVG(s.shape, {color:s.color, size:104, rotate:s.rotate||0})).join("");
    else if(hero.kind === "count"){
      const hi = Math.min(Math.max(parseInt(hero.n,10)||3, 1), 5);
      let cells = "";
      for(let i=1;i<=hi;i++) cells += `<div class="sg-hand-cell">${fingerCount(i, "sg-hand")}<span class="sg-hand-num">${devNumeral(i)}</span></div>`;
      el.innerHTML = cells;
    }
    else if(hero.kind === "image") el.innerHTML = `<img src="${hero.src}" alt="">`;
    if(el.innerHTML){ el.classList.add("show"); $("sgTitle").classList.add("compact");
      const c = el.closest && el.closest(".sg-content"); if(c){ c.classList.add("has-hero");
        if(hero.title_first) c.classList.add("title-first"); } }
  })();
  // the clips that must play from frame 0 (gate, celebration): one download each, under the landing
  Assets.prefetch(["assets/gif/peeking.webp", "assets/gif/sw_head_celebrate_anim.webp", "assets/last_swifty_end.webp"]);

  // ----- landing-screen welcome VO -----
  const landSrc = (CARD.assets && CARD.assets.audio && CARD.assets.audio["vo_landing"]) || ("assets/Audio/vo_landing." + AUDIO_EXT);
  /* ---- [ui: reference shell] PLAY BUTTON WAITS FOR THE GREETING, THEN POPS ----
     While the greeting speaks (and the picture plays) the round play button is hidden in its waiting state; when both
     are done it arrives with a one-shot pop and then pulses. A blocked autoplay: the child's first tap anywhere starts
     the greeting. Never strands the child: an 18s watchdog releases the button whatever happens. */
  let _greetingHeard = false, _startIdleT = 0, _startWatchT = 0, _starting = false;
  const onLandingNow = ()=> { const g = $("startGate"); return g && !g.classList.contains("hidden"); };
  const startWaiting = ()=>{ const b = $("sgBtn"); return !b || b.classList.contains("sg-waiting"); };
  const disarmStartPulse = ()=>{ clearTimeout(_startIdleT); _startIdleT = 0; const b = $("sgBtn"); if(b) b.classList.remove("idle-pulse"); };
  const armStartPulse = ()=>{
    disarmStartPulse();
    _startIdleT = setTimeout(()=>{ const b = $("sgBtn"); if(b && !startWaiting() && onLandingNow()) b.classList.add("idle-pulse"); }, 600);
  };
  const setStartBtnReady = (ready)=>{
    const b = $("sgBtn"); if(!b) return;
    const img = b.querySelector("img");
    const was = !startWaiting();
    b.disabled = false;
    b.classList.toggle("sg-waiting", !ready);
    b.setAttribute("aria-disabled", ready ? "false" : "true");
    if(img) img.src = ready ? "assets/btn-play-round.svg" : "assets/btn-play-round-waiting.svg";
    if(!ready){ disarmStartPulse(); b.classList.remove("sg-pop"); return; }
    if(!was){ b.classList.remove("sg-pop"); void b.offsetWidth; b.classList.add("sg-pop");
      setTimeout(()=> b.classList.remove("sg-pop"), 900); }
    armStartPulse();
  };
  setStartBtnReady(false);
  let _releasePending = false;
  const releaseStart = (force)=>{ if(!force && !window.__sgIntroDone){ _releasePending = true; return; }
    clearTimeout(_startWatchT); _releasePending = false; if(onLandingNow()) setStartBtnReady(true); };
  document.addEventListener("sg-intro-done", ()=>{ if(_releasePending) releaseStart(); });
  const playLanding = ()=>{
    if(!onLandingNow()) return;
    document.dispatchEvent(new Event("sg-greeting-start"));
    clearTimeout(_startWatchT); _startWatchT = setTimeout(()=> releaseStart(true), 18000);
    play(landSrc, ()=>{});
    const el = currentAudio;
    if(el) el.addEventListener("ended", ()=>{ _greetingHeard = true; releaseStart(); }, { once:true });
    else { _greetingHeard = true; releaseStart(); }
  };
  window.addEventListener("pointerdown", ()=>{ if(onLandingNow() && !startWaiting()) armStartPulse(); }, true);
  const sgVo = $("sgVo"); if(sgVo) sgVo.onclick = (e)=>{ e.stopPropagation(); if(!isPlaying) playLanding(); };
  /* ---- [landing mascot player] the waving Swiftee drawn on a canvas where the browser can decode the clip itself (no
     frame blinks); the plain <img> otherwise. Verbatim from the reference shell. ---- */
  const sgMascotPlayer = (()=>{
    const img = document.querySelector(".sg-mascot");
    if(!img) return null;
    const url = img.getAttribute("data-src") || (img.getAttribute("src") || "").split("?")[0], TYPE = "image/webp";
    let dec = null, count = 0, first = null, ok = false, dead = false, blob = null, blobUrl = "", pending = true;
    const shown = ()=> new Promise(res =>{
      if(img.complete && img.naturalWidth) return res();
      img.onload = ()=> res(); img.onerror = ()=>{ img.style.display = "none"; res(); };
    });
    const show = src =>{ img.removeAttribute("data-src"); img.src = src; return shown(); };
    const ready = (async ()=>{                                     // fetch + decode start at once, under the loader
      let buf = null;
      try{ const b = await Assets.blobOf(url); if(b){ blob = new Blob([b], { type: TYPE }); buf = await blob.arrayBuffer(); } }catch(e){}   // the loader's one download (Assets, CRIT)
      if(!buf){ pending = false; return show(url); }
      try{
        if(typeof ImageDecoder !== "undefined" && !(ImageDecoder.isTypeSupported && !(await ImageDecoder.isTypeSupported(TYPE)))){
          dec = new ImageDecoder({ data: buf, type: TYPE });
          await dec.tracks.ready; count = dec.tracks.selectedTrack.frameCount;
          first = (await dec.decode({ frameIndex: 0 })).image;
          ok = count > 0 && !dead;
        }
      }catch(e){ ok = false; }
      pending = false;
      if(!ok) return show(blobUrl = URL.createObjectURL(blob));
    })().catch(()=>{ ok = false; pending = false; });
    function start(){                                              // the loader lifting; false = keep the <img>
      if(!ok || !img.isConnected){ dead = true; return false; }
      try {
        const r = img.getBoundingClientRect(), W = Math.max(1, Math.round(r.width * (window.devicePixelRatio || 1)));
        const H = Math.max(1, Math.round(W * first.displayHeight / first.displayWidth));
        const cv = document.createElement("canvas"); cv.className = img.className; cv.width = W; cv.height = H;
        cv.setAttribute("role", "img"); cv.setAttribute("aria-label", img.getAttribute("alt") || "");
        const ctx = cv.getContext("2d"); ctx.imageSmoothingQuality = "high";
        const draw = f => { ctx.clearRect(0, 0, W, H); ctx.drawImage(f, 0, 0, W, H); };   // one task: never shown half-drawn
        draw(first); img.replaceWith(cv);
        let i = 0, cur = first, due = performance.now() + (cur.duration || 90000) / 1000;   // VideoFrame.duration is in us
        let next = count > 1 ? dec.decode({ frameIndex: 1 }) : null;
        const step = async ()=>{
          if(!next){ cur.close(); dec.close(); return; }             // plays once: the last frame stays drawn
          let n; try { n = (await next).image; } catch(e){ return; }  // a failed decode: the frame on show simply stays
          const wait = due - performance.now();
          if(wait > 1) await new Promise(res => setTimeout(res, wait));
          draw(n); cur.close(); cur = n; i++;
          due = Math.max(due, performance.now() - 30) + (n.duration || 90000) / 1000;
          next = i + 1 < count ? dec.decode({ frameIndex: i + 1 }) : null;   // decoded while this one is on show
          step();
        };
        step();
        return true;
      } catch(e){ dead = true; return false; }
    }
    /* the plain <img>: the wave from frame 0 again - a fresh blob: URL of the same bytes (file://: a cache-bust of the
       local file). Still downloading (the watchdog lifted the loader first): it shows from frame 0 when it lands. */
    function restart(){
      if(!img.isConnected || pending) return;
      const old = blobUrl;
      if(blob){ img.src = blobUrl = URL.createObjectURL(blob); if(old) URL.revokeObjectURL(old); }
      else img.src = url + "?r=" + Date.now();
    }
    return { start, restart, ready };
  })();
  // ---- boot loader: the loader until the landing's own files are in, then it dismisses ITSELF into the landing (no tap
  // gate). A 10s watchdog never strands the child; .done dedups the two. ----
  (function(){
    const bl = $("bootLoader");
    if(!bl){ document.body.classList.add("loaded"); playLanding(); return; }
    const ready = ()=>{
      if(bl.classList.contains("done")) return;
      bl.classList.add("done");
      document.body.classList.add("loaded");
      if(sgMascotPlayer && !sgMascotPlayer.start()) sgMascotPlayer.restart();
      playLanding();
      setTimeout(()=> bl.remove(), 450);
    };
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise(r => window.addEventListener("load", r, { once:true }));
    Promise.all([loaded, sgMascotPlayer ? sgMascotPlayer.ready : null]).then(ready, ready);
    setTimeout(ready, 10000);
  })();
  // landing VO best-effort on the first interaction too (some browsers block autoplay pre-gesture) - never on the button
  window.addEventListener("pointerdown", function once(ev){ window.removeEventListener("pointerdown", once);
    if(ev && ev.target && ev.target.closest && ev.target.closest("#sgBtn")) return;
    if(!_greetingHeard && !isPlaying) playLanding(); }, { once:true });

  $("sgBtn").onclick = ()=>{
    if(startWaiting()){ if(!_greetingHeard && !isPlaying) playLanding(); return; }
    if(_starting) return;
    _starting = true;
    disarmStartPulse(); clearTimeout(_startWatchT);
    stopAudio();          // silence the landing greeting BEFORE slide 0 speaks (no VO overlap)
    sfxPlay();            // the standard play-button SFX
    bgmStart();           // ...and the background music starts on this tap (never before it)
    _ac();                // unlock/resume WebAudio on the start gesture so the first clip never clips
    Screen.fullscreen();  // a phone/tablet browser: the whole screen, held in landscape (Android)
    // peek gate into the tutorial. The landing stays visible-and-BLURRED behind the peeking Swiftie.
    _gatedPhases.add("tutorial");
    phaseBlurTransition(()=>{
      $("startGate").classList.add("hidden");
      document.body.classList.remove("is-start");   // the sky only on the title screen
      mountSlide(0);
    }, "tutorial");
  };
  // tapping आगे clears any pending nav-nudge, and sounds the standard next-button SFX
  $("navBtn").addEventListener("click", ()=>{ clearTimeout(state.navNudgeTimer); stopNudge(); sfxNext(); });
  // [engine JS] r4 dev jump: ?slide=N skips the loader+gate and mounts slide N directly (QA/capture only)
  (function(){
    const j = parseInt(new URLSearchParams(location.search).get("slide"), 10);
    if(isNaN(j)) return;
    const bl = $("bootLoader"); if(bl) bl.remove();
    document.body.classList.add("loaded");
    $("startGate").classList.add("hidden");
    document.body.classList.remove("is-start");
    mountSlide(Math.max(0, Math.min(j, CARD.slides.length - 1)));
  })();
  // when the web font finishes loading, re-centre glyphs (metrics change vs fallback)
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=> centerAllGlyphs()); }
  // ?dev=1 (or ?nav=1): the dev banner + the slide navigator (QA only, never in the child's flow)
  if(new URLSearchParams(location.search).has("dev") || new URLSearchParams(location.search).has("nav")){
    $("devBanner").textContent = "engine ready · slides=" + CARD.slides.length;
    $("devBanner").className = "dev-banner show";
    buildDevNav();
  }
}

/* ===== FLN ANIMATION KIT: core BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion = window.FLNMotion || {};
  M.still = function(){
    try{ return document.documentElement.classList.contains("no-anim") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch(_){ return false; }
  };
  M.scale = function(){
    try{ return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--scale")) || 1; }catch(_){ return 1; }
  };
  M.rect = function(r, sw){                    // screen rect -> stage coords (R1/R2)
    var s = M.scale();
    if(document.documentElement.classList.contains("rotated")){
      return { left:(r.top - sw.top)/s, top:(sw.right - r.right)/s, w:r.height/s, h:r.width/s };
    }
    return { left:(r.left - sw.left)/s, top:(r.top - sw.top)/s, w:r.width/s, h:r.height/s };
  };
  M.guard = function(fn){                      // R4
    try{ fn(); }catch(e){ try{ console.warn("[animation-kit]", e && e.message); }catch(_){} }
  };
  var _actx = null;
  M.audio = function(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      _actx = _actx || new AC();
      if(_actx.state === "suspended") _actx.resume();
      return _actx;
    }catch(_){ return null; }
  };
  M.ready = function(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };
})();
/* ===== FLN ANIMATION KIT: core END ===== */

/* ===== FLN ANIMATION KIT: sky-drift BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function build(o){
    var sky = typeof o.container === "string" ? document.querySelector(o.container) : o.container;
    if(!sky) return null;
    sky.textContent = "";
    var maxSize = 0, frag = document.createDocumentFragment();

    /* [landing card clear] every lane STARTS just outside the centre card, never behind it.
       The sky and the card share the viewport centre (body flex-centres the stage, the gate
       flex-centres the card), so per lane: distance from centre to where the ray leaves the
       card box (1114x456 design px x --scale) + the element's half-size + a gap, in vmax.
       Before this every star launched at a flat r0 = 22vmax - well inside the card - and slid
       out from under it. */
    var clear = null;
    if(o.avoid && document.querySelector(o.avoid)){
      var sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      var vmaxPx = Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / 100 || 1;
      clear = { hw:(o.avoidBox[0] / 2) * sc / vmaxPx, hh:(o.avoidBox[1] / 2) * sc / vmaxPx, gap:o.avoidGap * sc / vmaxPx };
    }
    function startR(cos, sin, size){
      if(!clear) return o.r0;
      var t = Math.min(Math.abs(cos) > 1e-6 ? clear.hw / Math.abs(cos) : Infinity,
                       Math.abs(sin) > 1e-6 ? clear.hh / Math.abs(sin) : Infinity);
      return Math.max(o.r0, t + size * 0.75 + clear.gap);   // 0.75: half-size + the glow halo
    }

    o.layers.forEach(function(L, li){
      for(var i = 0; i < o.lanes; i++){
        var a = ((360 / o.lanes) * i + L.rot) * Math.PI / 180;
        var cos = Math.cos(a), sin = Math.sin(a);
        var size = +((o.size[0] + Math.random() * (o.size[1] - o.size[0])) * L.scale).toFixed(2);
        if(size > maxSize) maxSize = size;
        var dur = +(o.dur[0] + Math.random() * (o.dur[1] - o.dur[0])).toFixed(1);
        var el = document.createElement("i"), r0 = startR(cos, sin, size);
        el.className = o.shapes[(i + li) % o.shapes.length];
        el.style.cssText =
          "--s:"  + size + "vmax;" +
          "--x1:" + (r0 * cos).toFixed(2) + "vmax;--y1:" + (r0 * sin).toFixed(2) + "vmax;" +
          "--x2:" + (o.r1 * cos).toFixed(2) + "vmax;--y2:" + (o.r1 * sin).toFixed(2) + "vmax;" +
          "--t:"  + dur + "s;" +
          "--d:-" + (Math.random() * dur).toFixed(1) + "s;" +     // negative = de-sync
          "--g:"  + (o.glow[0] + Math.random() * (o.glow[1] - o.glow[0])).toFixed(1) + "s;" +
          "--gd:-" + (Math.random() * 4).toFixed(1) + "s;" +
          "--o:"  + (o.opacity[0] + Math.random() * (o.opacity[1] - o.opacity[0])).toFixed(2) + ";";
        frag.appendChild(el);
      }
    });
    sky.appendChild(frag);

    // collision proof: lane arc at the tightest radius must be >= 1.5x the largest element
    var arc = (2 * Math.PI * o.r0) / o.lanes, ok = arc >= maxSize * 1.5;
    if(!ok && o.warn !== false){
      console.warn("[animation-kit] sky lanes too tight: arc " + arc.toFixed(2) +
        "vmax vs element " + maxSize.toFixed(2) + "vmax. Reduce lanes or size.");
    }
    return { arc:arc, maxSize:maxSize, safe:ok, count:sky.children.length };
  }

  M.sky = {
    defaults: {
      container:".sg-sky", lanes:29,
      layers:[{rot:0,scale:1},{rot:6.2,scale:0.62},{rot:-6.2,scale:0.55}],
      r0:22, r1:72, size:[0.8,2.6], dur:[18,34], glow:[3.0,4.8],
      opacity:[0.62,0.92], shapes:["s1","s2","s3","s4","s5"], warn:true,
      avoid:".sg-card", avoidBox:[1114,456], avoidGap:24   // [landing card clear] design px
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {}), res = null;
      this._last = opts;
      M.guard(function(){ res = build(o); });
      return res;
    }
  };
  M.ready(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(); }); });
  /* the card's size in vmax changes with aspect ratio (rotation, split-screen), so re-plan the
     lanes after a resize settles - otherwise start points drift back inside the card. */
  var skyRz = 0;
  window.addEventListener("resize", function(){
    clearTimeout(skyRz);
    skyRz = setTimeout(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(M.sky._last); }); }, 250);
  });
})();
/* ===== FLN ANIMATION KIT: sky-drift END ===== */

/* ===== FLN ANIMATION KIT: sky-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function boom(o){                      // sine thud + noise tail + square crackles
    var actx = M.audio(); if(!actx) return;
    try{
      var t = actx.currentTime, out = actx.createGain();
      out.gain.value = o.volume; out.connect(actx.destination);

      var tg = actx.createGain();
      tg.gain.setValueAtTime(0.9, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      tg.connect(out);
      var osc = actx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);
      osc.connect(tg); osc.start(t); osc.stop(t + 0.18);

      var n = actx.sampleRate * 0.45;
      var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
      var src = actx.createBufferSource(); src.buffer = buf;

      for(var c = 0; c < o.crackles; c++){
        var cg = actx.createGain(), ct = t + 0.10 + Math.random() * 0.30;
        cg.gain.setValueAtTime(0.0001, ct);
        cg.gain.exponentialRampToValueAtTime(0.18, ct + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.07);
        cg.connect(out);
        var co = actx.createOscillator();
        co.type = "square";
        co.frequency.setValueAtTime(1500 + Math.random() * 2200, ct);
        co.connect(cg); co.start(ct); co.stop(ct + 0.08);
      }
      var bp = actx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 3400; bp.Q.value = 0.8;
      var ng = actx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(bp); bp.connect(ng); ng.connect(out); src.start(t + 0.02);
    }catch(_){}
  }

  function pop(el, r, o){
    el.classList.add("popped");
    // respawn on the next FLIGHT lap - the glow cycle is much shorter, so filter by name
    el.addEventListener("animationiteration", function back(e){
      if(e.animationName !== "sgFly") return;
      el.classList.remove("popped");
      el.removeEventListener("animationiteration", back);
    });

    var kind = "k-dot", cls = el.classList;
    for(var ci = 0; ci < cls.length; ci++){ if(o.kind[cls[ci]]) kind = o.kind[cls[ci]]; }

    var bs = Math.max(11, r.width);
    var b = document.createElement("div");
    b.className = "sg-burst " + kind;
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top  + r.height / 2) + "px";
    b.style.setProperty("--bs", bs + "px");
    b.appendChild(document.createElement("div")).className = "fl";

    var k = 0;
    for(var g = 0; g < o.rings.length; g++){
      var R = o.rings[g], off = Math.random() * Math.PI * 2;
      for(var i = 0; i < R.n; i++, k++){
        var a = off + i / R.n * Math.PI * 2;
        var dist = bs * R.rad * (0.78 + Math.random() * 0.44);
        var p = document.createElement("i");
        p.style.cssText =
          "--ps:"  + (bs * R.size * (0.8 + Math.random() * 0.5)).toFixed(1) + "px;" +
          "--dx:"  + (Math.cos(a) * dist).toFixed(1) + "px;" +
          "--dy:"  + (Math.sin(a) * dist).toFixed(1) + "px;" +
          "--gy:"  + (dist * o.gravity).toFixed(1) + "px;" +
          "--sd:"  + (R.dur + Math.random() * 0.22).toFixed(2) + "s;" +
          "--sdl:" + (Math.random() * 0.06).toFixed(3) + "s;" +
          "color:" + o.hues[k % o.hues.length];
        b.appendChild(p);
      }
    }
    document.body.appendChild(b);
    if(o.sound) boom(o);
    setTimeout(function(){ b.remove(); }, o.life);
  }

  M.skyBurst = {
    defaults: {
      container:".sg-sky", when:["is-start","is-end"],
      rings:[{n:9,rad:3.1,size:.58,dur:.80},{n:7,rad:1.8,size:.78,dur:.62}],
      hues:["#FCB717","#3B7DD8","#21A74A","#E5484D","#7048D6","#F1781D"],
      kind:{s1:"k-star",s2:"k-star",s3:"k-spark",s4:"k-dot",s5:"k-dot"},
      gravity:0.42, pad:12, padRatio:0.7, minAlpha:0.08, life:1200,
      sound:true, volume:0.22, crackles:4
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        var sky = typeof o.container === "string"
          ? document.querySelector(o.container) : o.container;
        if(!sky) return;
        // capture phase: .sg-sky is pointer-events:none, so hit-test by rect (R6)
        document.addEventListener("pointerdown", function(e){
          if(M.still()) return;
          if(!o.when.some(function(c){ return document.body.classList.contains(c); })) return;
          var els = sky.querySelectorAll("i:not(.popped)");
          for(var i = 0; i < els.length; i++){
            var el = els[i], r = el.getBoundingClientRect();
            if(r.width < 2) continue;
            var pad = Math.max(o.pad, r.width * o.padRatio);   // ~4px targets need slack
            if(e.clientX < r.left - pad || e.clientX > r.right  + pad ||
               e.clientY < r.top  - pad || e.clientY > r.bottom + pad) continue;
            if(parseFloat(getComputedStyle(el).opacity) < o.minAlpha) continue;
            // claim the tap, or it also fires the button under the star
            e.stopPropagation(); e.preventDefault();
            pop(el, r, o);
            return;
          }
        }, true);
      });
    }
  };
  M.ready(function(){ M.guard(function(){ M.skyBurst.init(); }); });
})();
/* ===== FLN ANIMATION KIT: sky-burst END ===== */

/* ===== FLN ANIMATION KIT: still-switch BEGIN ===== */
/* R5, second half. The kit's M.still() and the shipped starBurst both READ
   html.no-anim, but nothing in this activity ever SET it and there was no
   ?still=1 handler at all - so the kill-switch was unreachable. */
(function(){ "use strict";
  try{
    var q = new URLSearchParams(location.search);
    if(q.has("still") || (window.matchMedia &&
       matchMedia("(prefers-reduced-motion: reduce)").matches)){
      document.documentElement.classList.add("no-anim");
    }
  }catch(_){}
})();
/* ===== FLN ANIMATION KIT: still-switch END ===== */

/* ===== FLN ANIMATION KIT: nudge BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function place(el, o){
    var nh = document.getElementById(o.hand); if(!nh || !el) return;
    var host = document.querySelector(o.host); if(!host) return;
    var r = el.getBoundingClientRect(), sw = host.getBoundingClientRect(), s = M.scale();
    nh.style.left = ((r.left - sw.left)/s + r.width/s/2 + o.dx) + "px";
    nh.style.top  = ((r.top  - sw.top )/s + r.height/s   + o.dy) + "px";
    nh.classList.add("show");
  }
  M.nudge = {
    defaults:{ hand:"nudgeHand", host:".slide-stage", dx:-34.2, dy:-7.8, oneHand:true },   /* [QA 12] fingertip 8px below target */
    pointAt: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        if(o.oneHand) document.querySelectorAll(".demo-hand").forEach(function(h){ h.remove(); });
        place(el, o);
      });
    },
    after: function(target, ms, opts){            // returns cancel()
      var o = Object.assign({}, this.defaults, opts || {}), t = null;
      M.guard(function(){
        if(!ms || M.still()) return;
        t = setTimeout(function(){
          var el = (typeof target === "string") ? document.querySelector(target) : target;
          if(el) place(el, o);
        }, ms);
      });
      return function(){ clearTimeout(t); };
    },
    hide: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      var nh = document.getElementById(o.hand); if(nh) nh.classList.remove("show");
    }
  };
})();
/* ===== FLN ANIMATION KIT: nudge END ===== */

/* ===== FLN ANIMATION KIT: confetti BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }

  M.confetti = {
    defaults: {
      host:".stage-inner", count:80, stagger:0.35,
      fall:[1.1,1.8], drift:45, sway:[10,34], bob:[3,7],
      rockT:[0.6,1.2], tumbleT:[0.75,1.5], tumbleShare:0.22,
      amp:[28,52], yaw:30, depth:[0.75,1.15], tilt:25,
      /* weighted: star 40%, rectangle 20%, line 20%, square 20%.
         Repeat an entry to weight it - the array is sampled uniformly. */
      shapes:["st","st","st","st","rc","rc","ln","ln","sq","sq"],
      /* VIBGYOR. Front/back pairs - the back is the SAME hue darkened, never a
         different hue, or it reads as two pieces flickering instead of one turning. */
      colors:[["#8B2FC9","#5E1C8C"],   /* violet */
              ["#3F51B5","#27358A"],   /* indigo */
              ["#1E88E5","#135FA6"],   /* blue   */
              ["#22B24C","#157A34"],   /* green  */
              ["#FFD21E","#D9A800"],   /* yellow */
              ["#FF8A1E","#C75F00"],   /* orange */
              ["#E5322D","#A81F1B"]],  /* red    */
      phases:["guided","practice","mastery"]   /* [] disables phase gating */
    },
    burst: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        /* confetti ONLY on activity phases - never tutorials, demos, landing, transitions */
        if(o.phases.length && o.phase && o.phases.indexOf(o.phase) < 0) return;
        var host = document.querySelector(o.host); if(!host) return;

        var dist = host.clientHeight + 60, maxLife = 0;
        var wrap = document.createElement("div");
        wrap.className = "fx-confetti";

        for(var i = 0; i < o.count; i++){
          var z     = rnd(o.depth[0], o.depth[1]);        /* depth */
          var fall  = rnd(o.fall[0], o.fall[1]) / z;      /* nearer = bigger = faster */
          var delay = rnd(0, o.stagger);
          if(fall + delay > maxLife) maxLife = fall + delay;
          var pair = o.colors[i % o.colors.length];
          /* most pieces flutter (face stays visible); a minority go end-over-end */
          /* Two regimes, and a real plate moves DIFFERENTLY in each:
             flutter = zigzags hard, almost no net sideways drift;
             tumble  = autorotation gives a steady lateral force, so it barely
                       zigzags but drifts consistently to one side. */
          var flutter = Math.random() > o.tumbleShare;
          var rockT   = flutter ? rnd(o.rockT[0], o.rockT[1])
                                : rnd(o.tumbleT[0], o.tumbleT[1]);
          var sway    = flutter ? rnd(o.sway[0], o.sway[1]) : rnd(2, 8);
          var drift   = flutter ? rnd(-o.drift/2.5, o.drift/2.5) : rnd(-o.drift, o.drift);
          var bob     = flutter ? rnd(o.bob[0], o.bob[1]) : rnd(2, 4);

          /* set every property once - they inherit down to .w and .f */
          var p = document.createElement("i"); p.className = "p";
          p.style.cssText =
            "--x:"     + rnd(-2, 98).toFixed(1) + "%;" +
            "--dist:"  + dist + "px;" +
            "--fall:"  + fall.toFixed(2) + "s;" +
            "--delay:" + delay.toFixed(2) + "s;" +
            "--drift:" + drift.toFixed(0) + "px;" +
            "--sway:"  + sway.toFixed(0) + "px;" +
            "--bob:"   + bob.toFixed(1) + "px;" +
            "--rockT:" + rockT.toFixed(2) + "s;" +
            /* capped short of 90deg: even at max tilt the face still reads */
            "--amp:"   + Math.round(rnd(o.amp[0], o.amp[1])) + "deg;" +
            "--yaw:"   + Math.round(rnd(-o.yaw, o.yaw)) + "deg;" +
            "--tilt:"  + Math.round(rnd(-o.tilt, o.tilt)) + "deg;" +
            "--z:"     + z.toFixed(2) + ";" +
            "--dim:"   + (0.72 + (z - o.depth[0]) /
                          (o.depth[1] - o.depth[0]) * 0.28).toFixed(2) + ";" +
            /* shapes stay legible by ASPECT RATIO, not size - see the shape table */
            "--c:"     + pair[0] + ";--c2:" + pair[1] + ";";

          var w = document.createElement("i"); w.className = "w";
          var f = document.createElement("i");
          f.className = "f " + o.shapes[Math.floor(Math.random() * o.shapes.length)] +
                        (flutter ? "" : " tum");
          w.appendChild(f); p.appendChild(w); wrap.appendChild(p);
        }
        host.appendChild(wrap);
        /* lifetime is computed, not hard-coded - a longer fall cannot be cut off */
        setTimeout(function(){ wrap.remove(); }, (maxLife + 0.3) * 1000);
      });
    },
    /* stops a slide advancing mid-celebration. 8s safety cap. */
    after: function(fn){
      var started = Date.now();
      (function check(){
        if(!document.querySelector(".fx-confetti") || Date.now() - started > 8000){ fn(); return; }
        setTimeout(check, 200);
      })();
    }
  };
})();
/* ===== FLN ANIMATION KIT: confetti END ===== */

/* ===== FLN ANIMATION KIT: star-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  M.starBurst = {
    defaults:{ host:"#confetti", w:1333, h:750,
      colors:["#FFE400","#FFBD00","#E89400","#FFCA6C","#FDFFB8"],
      /* retuned: fewer, slower, longer. Travel distance is held at ~547px so the
         burst still fills the same area - only the density and pace changed. */
      ticks:150, decay:0.975, startV:14, shots:[0,220,440], spin:0.18,
      stars:32, starScale:1.8, circles:8, circleScale:1.0 },
    fire: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        var host = document.querySelector(o.host); if(!host) return;
        var cv = document.createElement("canvas");
        cv.width = o.w; cv.height = o.h;                 // design grid, scaled by CSS
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        host.appendChild(cv);
        var ctx = cv.getContext("2d"), parts = [];

        function starPath(r){
          ctx.beginPath();
          for(var i = 0; i < 10; i++){
            var rad = (i % 2 === 0) ? r : r/2, a = Math.PI/5*i - Math.PI/2;
            ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a)*rad, Math.sin(a)*rad);
          }
          ctx.closePath();
        }
        function add(n, scalar, shape){
          for(var i = 0; i < n; i++){
            var a = Math.random()*Math.PI*2;
            parts.push({ x:cv.width/2, y:cv.height/2, ax:Math.cos(a), ay:Math.sin(a),
              vel:o.startV*(0.5 + Math.random()), tick:0, scalar:scalar, shape:shape,
              color:o.colors[Math.floor(Math.random()*o.colors.length)],
              rot:Math.random()*Math.PI*2, spin:(Math.random()-.5)*o.spin });
          }
        }
        function shoot(){ add(o.stars, o.starScale, "star"); add(o.circles, o.circleScale, "circle"); }
        o.shots.forEach(function(ms){ ms ? setTimeout(shoot, ms) : shoot(); });

        /* derived from the LAST shot, so retiming the shots cannot end the loop
           before they have all fired. A hard-coded 30 breaks if shots move later. */
        var minFrames = Math.max.apply(null, o.shots) / 16 + 20;
        var frames = 0;
        (function frame(){
          ctx.clearRect(0, 0, cv.width, cv.height);
          var alive = false;
          for(var i = 0; i < parts.length; i++){
            var p = parts[i];
            if(p.tick >= o.ticks) continue;
            alive = true;
            p.x += p.ax*p.vel; p.y += p.ay*p.vel; p.vel *= o.decay;
            p.rot += p.spin; p.tick++;
            ctx.globalAlpha = 1 - p.tick/o.ticks;
            ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            if(p.shape === "star"){ starPath(8*p.scalar); ctx.fill(); }
            else { ctx.beginPath(); ctx.arc(0, 0, 6*p.scalar, 0, Math.PI*2); ctx.fill(); }
            ctx.restore();
          }
          frames++;
          if(alive || frames < minFrames) requestAnimationFrame(frame);  // survive delayed shots
          else setTimeout(function(){ cv.remove(); }, 300);
        })();
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: star-burst END ===== */

/* ===== FLN ANIMATION KIT: correct-select BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }

  /* Every deferred step is parked ON THE TILE so clear() can cancel it. Without this
     a second play inherits the FIRST play's pending timers and they strip the state
     off the new beat part-way through. Owning the timers is what makes these safely
     re-fireable, which the 2-attempt ladder needs. */
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }

  /* Tempo lives in CSS (--fx-beat / --fx-reward) so the two effects cannot drift
     apart. JS reads it rather than keeping a second copy, and only writes --ckT or
     --wgT when a caller explicitly passes `dur`. Custom properties do not resolve
     calc(), so the two numbers are read and multiplied here rather than reading
     the composed value. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.answer = {
    clear: function(el){
      if(!el) return;
      if(el._selT){ for(var j = 0; j < el._selT.length; j++) clearTimeout(el._selT[j]); }
      el._selT = [];
      el.classList.remove("ck-correct", "wg-wrong", "wg-out", "wg-rel");
      var fx = el.querySelectorAll(".ck-fx,.wg-fx");
      for(var i = 0; i < fx.length; i++) fx[i].remove();
    }
  };

  M.correctSelect = {
    defaults:{ crown:5 },      /* dur comes from CSS unless you pass one */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;                 /* forced reflow - restarts the pop */
        var dur = o.dur || tempo(el).reward;            /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--ckT", dur + "s");

        var fx = mk("ck-fx");

        if(o.crown && !M.still()){
          var cr = mk("ck-crown");
          /* clientWidth is layout px INSIDE the scaled stage - design px already.
             getBoundingClientRect() would come back multiplied by --scale (R1). */
          var w = el.clientWidth || 96, h = el.clientHeight || 96;
          var rx = w * 0.46, ry = h * 0.46;               /* the tile's own edge */
          for(var i = 0; i < o.crown; i++){
            var t  = (o.crown === 1) ? 0.5 : i / (o.crown - 1);
            var a  = (-158 + t * 136 + rnd(-7, 7)) * Math.PI / 180;   /* TOP arc */
            var x0 = Math.cos(a) * rx, y0 = Math.sin(a) * ry;
            var out = rnd(.20, .34);
            var s = mk("");
            s.style.cssText =
              "--ss:" + rnd(7, 12).toFixed(1) + "px;" +
              "--x0:" + x0.toFixed(1) + "px;" +
              "--y0:" + y0.toFixed(1) + "px;" +
              "--sx:" + (x0 + Math.cos(a) * w * out).toFixed(1) + "px;" +
              "--sy:" + (y0 + Math.sin(a) * h * out).toFixed(1) + "px;" +
              "--sr:" + Math.round(rnd(-140, 140)) + "deg;";
            cr.appendChild(s);
          }
          fx.appendChild(cr);
        }

        /* class FIRST: the border and the pop are the feedback, and they must not
           wait on ~9 nodes of decoration being built. Measured 45ms of dead time
           before any pixel moved when this ran the other way round. */
        el.classList.add("ck-correct");
        el.appendChild(fx);
        /* Only the TRANSIENT layers are swept. .ck-correct stays: the green outline
           is the correct-mark and it belongs to the tile until the slide advances. */
        later(el, function(){
          var t = fx.querySelectorAll(".ck-crown");
          for(var i = 0; i < t.length; i++) t[i].remove();
        }, dur * 1050);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: correct-select END ===== */

/* ===== FLN ANIMATION KIT: wrong-select BEGIN ===== */
/* needs the `later`, `tempo` and `M.answer.clear` helpers from recipe 19 */
(function(){ "use strict";
  var M = window.FLNMotion;
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }
  /* ---- KIT PATCH (install-time), not part of the published block ----------
     Recipe 20's header says it "needs the `later`, `tempo` and `M.answer.clear`
     helpers from recipe 19". It re-declares `mk` and `later` in this IIFE but not
     `tempo`, which is local to recipe 19's IIFE - so both play() and out() threw
     `ReferenceError: tempo is not defined`. M.guard swallows it, so the wrong
     answer beat was silently DEAD rather than visibly broken. Verified with node
     before patching. Remove this once the kit block carries the helper itself. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.wrongSelect = {
    defaults:{},               /* dur comes from CSS unless you pass one */

    /* transient: shakes, holds red, then RELEASES */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;              /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-wrong");          /* class first - see recipe 19 */
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
        /* RELEASE on a timeout, never on animationend: under the reduced-motion kill
           switch animationend never fires and the tile would stay red forever - on
           exactly the devices least able to recover from it. (R5, second half.)
           .wg-rel goes on BEFORE .wg-wrong comes off so the border has something to
           transition with. */
        later(el, function(){
          el.classList.add("wg-rel");
          el.classList.remove("wg-wrong");
          var f = el.querySelector(".wg-fx"); if(f) f.remove();
          later(el, function(){
            el.classList.remove("wg-rel");
            if(o.then) o.then();
          }, 260);
        }, dur * 1500 + 40);
      });
    },

    /* elimination: shakes once, recedes, and STAYS recessed. No auto-clear. */
    out: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-out");
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: wrong-select END ===== */

/* ===== FLN ANIMATION KIT: object-outline BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  var ST = ["is-correct", "is-wrong", "is-muted"];

  M.objectOutline = {
    /* state is just a class - both engines read the same ones */
    set: function(el, state){
      M.guard(function(){
        if(!el) return;
        for(var i = 0; i < ST.length; i++) el.classList.remove(ST[i]);
        void el.offsetWidth;                  /* restart - as in recipe 19 */
        if(state) el.classList.add("is-" + state);
      });
    },
    correct: function(el){ this.set(el, "correct"); },
    muted:   function(el){ this.set(el, "muted"); },
    reset:   function(el){ if(el && el._olT) clearTimeout(el._olT); this.set(el, ""); },

    /* wrong RELEASES back to idle white - the child has another attempt, exactly
       as the tile does in recipe 20. Timeout, never animationend: under the
       reduced-motion kill-switch animationend never fires. */
    wrong: function(el, opts){
      var o = opts || {}, self = this;
      M.guard(function(){
        if(!el) return;
        self.set(el, "wrong");
        var v = parseFloat(getComputedStyle(el).getPropertyValue("--olT")) || 0.4;
        if(v > 20) v = v / 1000;
        if(el._olT) clearTimeout(el._olT);
        el._olT = setTimeout(function(){
          el.classList.remove("is-wrong");
          if(o.then) o.then();
        }, v * 1500 + 40);
      });
    },

    /* OPTIONAL, and read the caveat. A rectangular hit box over an irregular sprite
       steals taps meant for whatever is behind it - two overlapping characters and
       the child taps the wrong one. This tests the tap against the sprite's ALPHA.
       It FAILS OPEN: reading pixels back taints the canvas on file://, which is how
       the activities ship, so there it always returns true and you are back to the
       bounding box. Treat it as a dev-server nicety, not a guarantee - the reliable
       fix is z-order and not overlapping the tappable parts in the first place. */
    alphaHit: function(img, clientX, clientY){
      var r = img.getBoundingClientRect();
      if(clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom)
        return false;
      if(img._olA === undefined){
        try{
          var w = Math.min(img.naturalWidth, 256);
          var h = Math.round(img.naturalHeight * w / img.naturalWidth);
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
          img._olA = x.getImageData(0, 0, w, h);
        }catch(e){ img._olA = null; }         /* tainted - fail OPEN */
      }
      if(!img._olA) return true;
      var d = img._olA;
      var px = Math.floor((clientX - r.left) / r.width  * d.width);
      var py = Math.floor((clientY - r.top)  / r.height * d.height);
      return d.data[(py * d.width + px) * 4 + 3] > 24;
    }
  };
})();
/* ===== FLN ANIMATION KIT: object-outline END ===== */

/* [engine JS] DEV NAV — a review/QA slide navigator. Shows ONLY with ?dev=1 or ?nav=1 (children never
   see it). Jump to any slide by dropdown, step ◀▶, first/last, or back to the landing. Uses the
   engine's own mountSlide + state.idx; a light poll keeps the label synced when the game self-advances. */
function buildDevNav(){
  if(document.getElementById("devNav")) return;
  const bar = document.createElement("div"); bar.id = "devNav"; bar.className = "dev-nav";
  const mk = (txt, title)=>{ const b = document.createElement("button"); b.className = "dev-nav-btn"; b.textContent = txt; if(title) b.title = title; return b; };
  const land = mk("⌂", "landing"), first = mk("⏮", "first"), prev = mk("◀", "prev"), next = mk("▶", "next"), last = mk("⏭", "last");
  const sel = document.createElement("select"); sel.className = "dev-nav-sel"; sel.title = "jump to slide";
  CARD.slides.forEach((s, i)=>{ const o = document.createElement("option"); o.value = i; o.textContent = (i+1) + ". " + s.id + " · " + s.type; sel.appendChild(o); });
  const lbl = document.createElement("span"); lbl.className = "dev-nav-lbl";
  const cur = ()=> (state && typeof state.idx === "number") ? state.idx : 0;
  const leaveStart = ()=>{ const sg = $("startGate"); if(sg) sg.classList.add("hidden"); document.body.classList.remove("is-start"); document.body.classList.add("loaded"); const bl = $("bootLoader"); if(bl) bl.remove(); };
  const sync = ()=>{ const i = cur(); const s = CARD.slides[i]; if(document.activeElement !== sel) sel.value = i;
    lbl.textContent = (i+1) + "/" + CARD.slides.length + (s ? " · " + s.id : ""); };
  const go = (i)=>{ i = Math.max(0, Math.min(i, CARD.slides.length - 1)); leaveStart(); mountSlide(i); sync(); };
  land.onclick = ()=>{ const sg = $("startGate"); if(sg){ sg.classList.remove("hidden"); document.body.classList.add("is-start"); } };
  first.onclick = ()=> go(0); prev.onclick = ()=> go(cur() - 1); next.onclick = ()=> go(cur() + 1); last.onclick = ()=> go(CARD.slides.length - 1);
  sel.onchange = ()=> go(parseInt(sel.value, 10));
  bar.append(land, first, prev, sel, lbl, next, last);
  document.body.appendChild(bar);
  setInterval(sync, 300); sync();
}


boot();

/* ---------- [landing dust] sunlit dust motes on the first screen ----------
   Real dust in a sunbeam, not sprites on rails:
   - VISIBLE ONLY WHERE LIT. Each speck's brightness = the sunlight at its position:
     a falloff spilling down-right from the sun (.sg-sun, read live), so motes
     glint near the window and fade out toward the shaded right side.
   - DRIFTS ON AIR, NOT ON THE LIGHT. Light does not push dust: motion = a slow room
     draught from the window (down-right) + smooth per-particle turbulence + a tiny
     gravity settle + damping (dust is light, drag dominates). No straight paths.
   - TUMBLES. Flakes glint as they rotate to face the sun: brightness pulses ^3.
   - DEPTH. z 0..1: far = tiny, sharp, slow, dim; near = larger, softer (out of
     focus), faster across the screen (parallax). Most dust is far.
   - COMES FROM THE WINDOW (review 2026-09-29: "the particles coming from the direction of
     sunlight?" - 80 dim specks drifting ~5px/s were too faint to see): the draught blows ALONG the
     light (26deg, down-right), most specks re-enter in the sunlit window and fade in there, and
     there are more, slightly larger, brighter specks.
   Pauses off the landing and when the tab is hidden; one static frame under
   prefers-reduced-motion. Coordinates are .sg-fx-local design px (1096x438). */
(function(){
  const cv = document.getElementById("sgDust"); if(!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d"), W = 1096, H = 438, N = 120;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // soft round sprite (one draw per mote); small sizes read as crisp points
  const spr = document.createElement("canvas"); spr.width = spr.height = 32;
  (function(){ const g = spr.getContext("2d"), r = g.createRadialGradient(16,16,0,16,16,16);
    r.addColorStop(0, "rgba(255,251,236,1)"); r.addColorStop(.45, "rgba(255,244,215,.75)");
    r.addColorStop(1, "rgba(255,236,196,0)"); g.fillStyle = r; g.fillRect(0,0,32,32); })();

  /* light field = the sun (the .sg-sun anchor, read live) spilling into the room: an
     elongated falloff pointing down-right from the window (~26deg, the angle of the
     painted wall streak) - bright near the window, gone by the shaded right side. */
  let sun = { x:170, y:70 };
  const LA = 26 * Math.PI / 180, LC = Math.cos(LA), LS = Math.sin(LA);
  function readSun(){
    const f = document.querySelector(".sg-fx .sg-sun");
    if(f) sun = { x:f.offsetLeft, y:f.offsetTop };            // .sg-sun is a 0x0 anchor AT the sun
  }
  function light(x, y){
    const dx = x - sun.x, dy = y - sun.y;
    const s = dx * LC + dy * LS, c = -dx * LS + dy * LC;       // along / across the spill
    const sa = s >= 0 ? s / 520 : s / 150;                     // reaches far into the room, little behind the sun
    return Math.exp(-(sa * sa + (c / 230) * (c / 230)));
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  function spawn(p, fresh){
    p.z = Math.pow(Math.random(), 1.8);                        // bias far
    // start anywhere on screen the first time; later mostly re-enter IN the sunlit window (fading in there,
    // so they visibly come out of the light), the rest from the window-side edges
    const r0 = Math.random();
    if(fresh){ p.x = rnd(-20, W * .75); p.y = rnd(-10, H); }
    else if(r0 < .7){ p.x = sun.x + rnd(-130, 70); p.y = sun.y + rnd(-60, 90); }
    else if(r0 < .85){ p.x = rnd(-30, -5); p.y = rnd(0, H * .6); }
    else { p.x = rnd(0, W * .4); p.y = rnd(-30, -5); }
    p.vx = rnd(-2, 2); p.vy = rnd(-2, 2);
    p.r  = 1.1 + p.z * 3.4;                                    // radius px
    p.f1 = rnd(.07, .19); p.f2 = rnd(.11, .27); p.ph1 = rnd(0, 6.3); p.ph2 = rnd(0, 6.3);
    p.spin = rnd(.6, 2.2); p.sph = rnd(0, 6.3);
    p.fade = fresh ? 1 : 0;                                    // ease in after respawn
    return p;
  }
  const P = Array.from({length:N}, () => spawn({}, true));

  function fit(){
    const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
    const k = Math.min(sc * (window.devicePixelRatio || 1), 2);  // cap backing store for low-end GPUs
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    readSun();
    if(reduce) draw(8);                                        // resizing clears the canvas
  }

  function step(p, t, dt){
    const par = .45 + p.z * .9;                                // parallax: near crosses faster
    // room draught from the window, ALONG the light (LA) + slow global gusts
    const ws = 13 + 4 * Math.sin(t * .09);
    const wx = ws * LC, wy = ws * LS + 1.2 * Math.sin(t * .07 + 1.3);
    // smooth turbulence (two incommensurate sines per axis = no visible loop)
    const tx = 7 * Math.sin(t * p.f1 + p.ph1) + 4 * Math.sin(t * p.f2 * 1.7 + p.ph2);
    const ty = 6 * Math.cos(t * p.f2 + p.ph2) + 3 * Math.sin(t * p.f1 * 2.3 + p.ph1);
    const g  = .8 + p.z * .9;                                  // settling: heavier near flakes sink a touch faster
    // drag toward the local air velocity (dust has almost no inertia) + Brownian jitter
    const k = 1 - Math.exp(-1.6 * dt);
    p.vx += ((wx + tx) - p.vx) * k + rnd(-1, 1) * 6 * dt;
    p.vy += ((wy + ty + g) - p.vy) * k + rnd(-1, 1) * 6 * dt;
    p.x += p.vx * par * dt; p.y += p.vy * par * dt;
    if(p.fade < 1) p.fade = Math.min(1, p.fade + dt / 1.5);
    if(p.x > W + 20 || p.y > H + 20 || p.x < -40 || p.y < -40) spawn(p, false);
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for(const p of P){
      const L = light(p.x, p.y);
      if(L < .02) continue;                                    // in shade: invisible, like real dust
      const glint = .5 + .5 * Math.pow(Math.max(0, Math.sin(t * p.spin + p.sph)), 3);
      const depth = .45 + .55 * (1 - Math.abs(p.z - .35));     // far dim, very near slightly defocused
      const a = Math.min(1, L * 1.7) * glint * depth * p.fade;
      if(a < .02) continue;
      const d = p.r * 2 * (p.z > .7 ? 1.35 : 1);               // near = out-of-focus blur disc
      ctx.globalAlpha = p.z > .7 ? a * .6 : a;
      ctx.drawImage(spr, p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  let last = 0, t = 0;
  function frame(now){
    requestAnimationFrame(frame);
    if(!document.body.classList.contains("is-start")){ last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; t += dt;
    for(const p of P) step(p, t, dt);
    draw(t);
  }

  fit();
  window.addEventListener("resize", () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 200); });
  window.addEventListener("load", fit);
  if(reduce){ for(let i = 0; i < 240; i++) for(const p of P) step(p, i / 30, 1 / 30); draw(8); }
  else requestAnimationFrame(frame);
})();


LandingPic.intro();   // [ui: reference shell] the first screen's picture comes in with the greeting
