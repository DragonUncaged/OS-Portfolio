"use client";

import { useSettings } from "@/stores/settings";

export interface Track {
  id: string;
  title: string;
  mood: string;
  bpm: number;
  root: number;
  scale: number[];
  chords: number[][];
  lead: (number | null)[];
  bass: number[];
  leadWave: OscillatorType;
  drums: boolean;
  color: [string, string];
}

const MINOR = [0, 2, 3, 5, 7, 8, 10];

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

const DORIAN = [0, 2, 3, 5, 7, 9, 10];

export const TRACKS: Track[] = [
  {
    id: "night-drive",
    title: "Night Drive",
    mood: "Synthwave · 96 bpm",
    bpm: 96,
    root: 57,
    scale: MINOR,
    chords: [[0, 2, 4], [5, 7, 9], [2, 4, 6], [6, 8, 10]],
    lead: [0, null, 1, null, 2, null, 1, 3, null, 2, null, 1, 0, null, 2, null],
    bass: [0, 3, 6, 8, 11, 14],
    leadWave: "sawtooth",
    drums: true,
    color: ["#ff5fa2", "#5b3df5"],
  },
  {
    id: "first-light",
    title: "First Light",
    mood: "Ambient · 80 bpm",
    bpm: 80,
    root: 60,
    scale: MAJOR,
    chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [3, 5, 7]],
    lead: [0, null, null, 2, null, null, 1, null, 3, null, null, 2, null, 1, null, null],
    bass: [0, 8],
    leadWave: "sine",
    drums: false,
    color: ["#ffd36b", "#ff7a59"],
  },
  {
    id: "low-tide",
    title: "Low Tide",
    mood: "Downtempo · 72 bpm",
    bpm: 72,
    root: 62,
    scale: DORIAN,
    chords: [[0, 2, 4], [3, 5, 7], [0, 2, 4], [6, 8, 10]],
    lead: [2, null, null, null, 1, null, 0, null, null, null, 3, null, 2, null, null, null],
    bass: [0, 6, 10],
    leadWave: "triangle",
    drums: true,
    color: ["#4fd1c5", "#2563eb"],
  },
  {
    id: "arcade",
    title: "Arcade",
    mood: "Chiptune · 124 bpm",
    bpm: 124,
    root: 64,
    scale: MINOR,
    chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4]],
    lead: [0, 1, 2, 3, 2, 1, 0, null, 2, 3, 4, 3, 2, null, 1, null],
    bass: [0, 2, 4, 6, 8, 10, 12, 14],
    leadWave: "square",
    drums: true,
    color: ["#a3e635", "#16a34a"],
  },
];

export const TRACK_BARS = 32;
export const TOTAL_STEPS = TRACK_BARS * 16;

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function degree(track: Track, deg: number): number {
  const n = track.scale.length;
  return track.root + track.scale[((deg % n) + n) % n] + 12 * Math.floor(deg / n);
}

class Engine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  private delay: DelayNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private nextTime = 0;
  step = 0;
  track: Track = TRACKS[0];
  onStep: (step: number) => void = () => {};
  onEnd: () => void = () => {};

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = useSettings.getState().volume * 0.8;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.82;
    const delay = ctx.createDelay(1);
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    delay.connect(feedback).connect(delay);
    delay.connect(master);
    master.connect(analyser).connect(ctx.destination);
    const noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    Object.assign(this, { ctx, master, analyser, delay, noise });
    return ctx;
  }

  setVolume(v: number) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v * 0.8, this.ctx.currentTime, 0.03);
  }

  private voice(type: OscillatorType, f: number, t: number, dur: number, peak: number, attack: number, cutoff: number | null, wet: boolean) {
    const ctx = this.ctx as AudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node: AudioNode = osc;
    if (cutoff) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = cutoff;
      node = osc.connect(filter);
    }
    node.connect(gain);
    gain.connect(this.master as GainNode);
    if (wet) gain.connect(this.delay as DelayNode);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private kick(t: number) {
    const ctx = this.ctx as AudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(gain).connect(this.master as GainNode);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  private hat(t: number, level: number) {
    const ctx = this.ctx as AudioContext;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(filter).connect(gain).connect(this.master as GainNode);
    src.start(t);
    src.stop(t + 0.06);
  }

  private schedule(step: number, t: number) {
    const tr = this.track;
    const sixteenth = 60 / tr.bpm / 4;
    const s = step % 16;
    const chord = tr.chords[Math.floor(step / 16) % tr.chords.length];
    if (this.delay) this.delay.delayTime.value = sixteenth * 3;
    if (s === 0) {
      for (const d of chord) this.voice("triangle", freq(degree(tr, d)), t, sixteenth * 16, 0.05, sixteenth * 3, 1400, false);
    }
    if (tr.bass.includes(s)) this.voice("sawtooth", freq(degree(tr, chord[0]) - 24), t, sixteenth * 2.2, 0.2, 0.01, 420, false);
    const tone = tr.lead[s];
    if (tone !== null) {
      const d = chord[tone % chord.length] + 7 * Math.floor(tone / chord.length);
      this.voice(tr.leadWave, freq(degree(tr, d) + 12), t, sixteenth * 1.8, tr.leadWave === "sine" ? 0.14 : 0.06, 0.008, tr.leadWave === "sine" ? null : 2600, true);
    }
    if (tr.drums) {
      if (s === 0 || s === 8 || (s === 11 && Math.floor(step / 16) % 2 === 1)) this.kick(t);
      if (s % 4 === 2) this.hat(t, 0.11);
      else if (s % 2 === 1) this.hat(t, 0.035);
    }
  }

  start(track: Track, fromStep = 0) {
    const ctx = this.ensure();
    void ctx.resume();
    this.track = track;
    this.step = fromStep;
    this.nextTime = ctx.currentTime + 0.06;
    clearInterval(this.timer);
    // setInterval drifts, so each tick queues the steps due in the next 120 ms on the audio clock
    this.timer = setInterval(() => {
      const sixteenth = 60 / this.track.bpm / 4;
      while (this.nextTime < ctx.currentTime + 0.12) {
        if (this.step >= TOTAL_STEPS) {
          this.onEnd();
          return;
        }
        this.schedule(this.step, this.nextTime);
        this.onStep(this.step);
        this.step += 1;
        this.nextTime += sixteenth;
      }
    }, 30);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    void this.ctx?.suspend();
  }
}

export const engine = new Engine();
