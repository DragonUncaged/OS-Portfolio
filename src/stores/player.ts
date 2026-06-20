"use client";

import { create } from "zustand";
import { TRACKS, TRACK_BARS, engine } from "@/lib/synth";
import { useSettings } from "./settings";

interface PlayerState {
  index: number;
  playing: boolean;
  step: number;
  play: (index?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
}

export const usePlayer = create<PlayerState>()((set, get) => ({
  index: 0,
  playing: false,
  step: 0,
  play: (index) => {
    const i = index ?? get().index;
    const resume = index === undefined || index === get().index;
    const from = resume ? get().step : 0;
    engine.start(TRACKS[i], from);
    set({ index: i, playing: true, step: from });
  },
  pause: () => {
    engine.stop();
    set({ playing: false });
  },
  toggle: () => (get().playing ? get().pause() : get().play()),
  next: () => {
    const i = (get().index + 1) % TRACKS.length;
    set({ index: i, step: 0 });
    if (get().playing) get().play(i);
  },
  prev: () => {
    const i = (get().index - 1 + TRACKS.length) % TRACKS.length;
    set({ index: i, step: 0 });
    if (get().playing) get().play(i);
  },
  seek: (fraction) => {
    // snap to a bar line so the pattern stays in phase
    const step = Math.min(TRACK_BARS - 1, Math.max(0, Math.floor(fraction * TRACK_BARS))) * 16;
    set({ step });
    if (get().playing) engine.start(TRACKS[get().index], step);
  },
}));

engine.onStep = (step) => {
  if (step % 4 === 0) usePlayer.setState({ step });
};
engine.onEnd = () => usePlayer.getState().next();

useSettings.subscribe((s, prev) => {
  if (s.volume !== prev.volume) engine.setVolume(s.volume);
});
