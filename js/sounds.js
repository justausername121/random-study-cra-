// Small synthesized UI sound effects via Web Audio API - no audio files
// needed. Browsers require a user gesture before audio can play, which is
// fine here since every call happens inside a click handler.

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function soundEnabled() {
  return !!(typeof S !== "undefined" && S.soundOn);
}

function tone(freq, startTime, duration, type, gain) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + startTime;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain != null ? gain : 0.2, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

function playCorrect() {
  if (!soundEnabled()) return;
  tone(880, 0, 0.13, "sine", 0.22);
  tone(1318.5, 0.08, 0.2, "sine", 0.2);
}

function playIncorrect() {
  if (!soundEnabled()) return;
  tone(233, 0, 0.16, "sawtooth", 0.12);
  tone(196, 0.1, 0.24, "sawtooth", 0.12);
}

function playFail() {
  if (!soundEnabled()) return;
  [392, 349.2, 293.7, 246.9].forEach((f, i) => tone(f, i * 0.13, 0.28, "sawtooth", 0.16));
}

function playComplete() {
  if (!soundEnabled()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.1, 0.22, "sine", 0.2));
}

function playCoin() {
  if (!soundEnabled()) return;
  tone(1400, 0, 0.05, "square", 0.1);
  tone(1866, 0.05, 0.12, "square", 0.1);
}

function playClick() {
  if (!soundEnabled()) return;
  tone(500, 0, 0.045, "square", 0.06);
}
