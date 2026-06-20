"use client";

import { Pause, Play, SkipBack, SkipForward, SpeakerHigh, Waveform } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { AppFrame } from "@/components/app-frame";
import { Slider } from "@/components/kit";
import { TOTAL_STEPS, TRACKS, engine, type Track } from "@/lib/synth";
import { usePlayer } from "@/stores/player";
import { useSettings } from "@/stores/settings";

const clock = (track: Track, step: number) => {
  const seconds = Math.floor((step * 60) / track.bpm / 4);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

function Visualizer({ track, playing }: { track: Track; playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    let raf = 0;
    const bins = new Uint8Array(64);
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (playing && engine.analyser) engine.analyser.getByteFrequencyData(bins);
      else bins.fill(0);
      g.clearRect(0, 0, w, h);
      const count = 28;
      const gap = 4 * dpr;
      const bw = (w - gap * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        const v = bins[Math.floor((i / count) * 44)] / 255;
        const bh = Math.max(3 * dpr, v * h * 0.92);
        g.fillStyle = `rgb(255 255 255 / ${0.35 + v * 0.6})`;
        g.beginPath();
        g.roundRect(i * (bw + gap), h - bh, bw, bh, bw / 2);
        g.fill();
      }
      if (playing) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, track]);
  return <canvas ref={ref} className="absolute inset-x-5 bottom-4 h-[46%] w-[calc(100%-2.5rem)]" aria-hidden="true" />;
}

export default function Music() {
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const step = usePlayer((s) => s.step);
  const volume = useSettings((s) => s.volume);
  const { play, toggle, next, prev, seek, pause } = usePlayer.getState();
  const track = TRACKS[index];

  useEffect(() => () => pause(), [pause]);

  return (
    <AppFrame compact flush>
      <div className="flex h-full flex-col @min-[620px]:flex-row">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-5">
          <div
            className="os-art relative aspect-square w-full max-w-[250px] shrink overflow-hidden rounded-card shadow-[0_12px_32px_rgb(0_0_0/0.3)]"
            style={{ background: `linear-gradient(140deg, ${track.color[0]}, ${track.color[1]})` }}
          >
            <Waveform size={56} weight="bold" className="absolute left-4 top-4 text-white/85" />
            <Visualizer track={track} playing={playing} />
          </div>
          <div className="w-full max-w-[320px] text-center">
            <div className="truncate text-[18px] font-semibold">{track.title}</div>
            <div className="truncate text-[13px] text-fg2">{track.mood} · synthesised live in your browser</div>
          </div>
          <div className="w-full max-w-[320px]">
            <Slider label="Position" value={step / TOTAL_STEPS} onChange={seek} />
            <div className="mt-1 flex justify-between text-[11.5px] tabular-nums text-fg3">
              <span>{clock(track, step)}</span>
              <span>{clock(track, TOTAL_STEPS)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="k-icon-btn !size-11" aria-label="Previous track" onClick={prev}>
              <SkipBack size={24} weight="fill" />
            </button>
            <button
              type="button"
              className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg transition-transform active:scale-95"
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
            >
              {playing ? <Pause size={26} weight="fill" /> : <Play size={26} weight="fill" />}
            </button>
            <button type="button" className="k-icon-btn !size-11" aria-label="Next track" onClick={next}>
              <SkipForward size={24} weight="fill" />
            </button>
          </div>
          <div className="flex w-full max-w-[240px] items-center gap-2.5 text-fg2">
            <SpeakerHigh size={16} className="shrink-0" />
            <Slider label="Volume" value={volume} onChange={useSettings.getState().setVolume} />
          </div>
        </div>
        <div className="os-tracklist shrink-0 overflow-y-auto border-t border-line @min-[620px]:w-[250px] @min-[620px]:border-l @min-[620px]:border-t-0">
          <div className="k-label px-4 pb-1.5 pt-3.5">Up next</div>
          {TRACKS.map((t, i) => (
            <button key={t.id} type="button" className="k-row !gap-3 !border-0 !py-2" data-on={i === index} onClick={() => play(i)}>
              <span
                className="grid size-10 shrink-0 place-items-center rounded-ctl text-white"
                style={{ background: `linear-gradient(140deg, ${t.color[0]}, ${t.color[1]})` }}
              >
                {i === index && playing ? <Waveform size={18} weight="bold" /> : <Play size={14} weight="fill" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[13.5px] font-semibold ${i === index ? "text-accent" : ""}`}>{t.title}</span>
                <span className="block truncate text-[12px] text-fg3">{t.mood}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
