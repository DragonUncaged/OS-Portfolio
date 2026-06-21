"use client";

import { ArrowCounterClockwise, DownloadSimple, Eraser, PaintBrush, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Slider } from "@/components/kit";

const COLORS = ["#111827", "#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899", "#ffffff"];
const W = 1600;
const H = 1000;

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undo = useRef<ImageData[]>([]);
  const [color, setColor] = useState(COLORS[6]);
  const [size, setSize] = useState(8);
  const [erasing, setErasing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  const fill = () => {
    const g = ctx();
    if (!g) return;
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, H);
  };

  useEffect(fill, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, scale: number) => {
    const g = ctx();
    if (!g) return;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = erasing ? "#ffffff" : color;
    g.lineWidth = size * scale * (erasing ? 2.5 : 1);
    g.beginPath();
    g.moveTo(from.x, from.y);
    g.lineTo(to.x, to.y);
    g.stroke();
  };

  const snapshot = () => {
    const g = ctx();
    if (!g) return;
    undo.current = [...undo.current.slice(-9), g.getImageData(0, 0, W, H)];
    setCanUndo(true);
  };

  return (
    <AppFrame
      compact
      flush
      actions={[
        { id: "brush", label: "Brush", icon: PaintBrush, on: !erasing, onClick: () => setErasing(false) },
        { id: "eraser", label: "Eraser", icon: Eraser, on: erasing, onClick: () => setErasing(true) },
        {
          id: "undo",
          label: "Undo",
          icon: ArrowCounterClockwise,
          disabled: !canUndo,
          onClick: () => {
            const prev = undo.current.pop();
            if (prev) ctx()?.putImageData(prev, 0, 0);
            setCanUndo(undo.current.length > 0);
          },
        },
        {
          id: "clear",
          label: "Clear canvas",
          icon: Trash,
          onClick: () => {
            snapshot();
            fill();
          },
        },
        {
          id: "save",
          label: "Save as PNG",
          icon: DownloadSimple,
          onClick: () => {
            const a = document.createElement("a");
            a.href = canvasRef.current?.toDataURL("image/png") ?? "";
            a.download = "drawing.png";
            a.click();
          },
        },
      ]}
    >
      <div className="flex h-full flex-col">
        <div className="os-paint-stage grid min-h-0 flex-1 place-items-center overflow-hidden p-3">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="max-h-full max-w-full touch-none rounded-[4px] bg-white shadow-[0_2px_14px_rgb(0_0_0/0.25)]"
            style={{ aspectRatio: `${W} / ${H}`, cursor: "crosshair" }}
            aria-label="Drawing canvas"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              snapshot();
              const p = point(e);
              last.current = p;
              stroke(p, { x: p.x + 0.01, y: p.y }, W / e.currentTarget.getBoundingClientRect().width);
            }}
            onPointerMove={(e) => {
              if (!last.current) return;
              const p = point(e);
              stroke(last.current, p, W / e.currentTarget.getBoundingClientRect().width);
              last.current = p;
            }}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-3 py-2.5">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Colour">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c && !erasing}
                aria-label={`Colour ${c}`}
                className="size-6 rounded-full border border-line transition-transform hover:scale-110"
                style={{ background: c, boxShadow: color === c && !erasing ? `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)` : undefined }}
                onClick={() => {
                  setColor(c);
                  setErasing(false);
                }}
              />
            ))}
          </div>
          <div className="flex min-w-[140px] flex-1 items-center gap-2 text-[12px] text-fg2">
            <span className="shrink-0">Size</span>
            <Slider label="Brush size" value={size} min={2} max={40} step={1} onChange={setSize} />
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
