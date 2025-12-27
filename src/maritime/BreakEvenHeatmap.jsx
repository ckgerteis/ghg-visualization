import React, { useEffect, useMemo, useRef } from "react";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorScale(v, vmin, vmax) {
  // Diverging: green (better than coal) -> white -> red (worse than coal)
  const t = (v - vmin) / (vmax - vmin || 1);
  const x = Math.max(0, Math.min(1, t));

  // center at 0
  const mid = (0 - vmin) / (vmax - vmin || 1);
  if (x < mid) {
    const tt = x / (mid || 1);
    // green to white
    const r = lerp(16, 255, tt);
    const g = lerp(185, 255, tt);
    const b = lerp(129, 255, tt);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  } else {
    const tt = (x - mid) / (1 - mid || 1);
    // white to red
    const r = lerp(255, 185, tt);
    const g = lerp(255, 28, tt);
    const b = lerp(255, 28, tt);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
}

export default function BreakEvenHeatmap({ grid, marker }) {
  const canvasRef = useRef(null);

  const stats = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const row of grid.values) {
      for (const v of row) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    // Clamp extremes so colors remain informative
    const span = Math.max(Math.abs(min), Math.abs(max));
    return { min: -span, max: span };
  }, [grid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = grid.values.length;
    const cols = grid.values[0]?.length ?? 0;

    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const j = Math.floor((y / h) * rows);
      for (let x = 0; x < w; x++) {
        const i = Math.floor((x / w) * cols);
        const v = grid.values[j][i];

        const c = colorScale(v, stats.min, stats.max);
        const m = c.match(/\d+/g).map(Number);
        const idx = (y * w + x) * 4;
        img.data[idx] = m[0];
        img.data[idx + 1] = m[1];
        img.data[idx + 2] = m[2];
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [grid, stats]);

  const markerPos = useMemo(() => {
    const lx = grid.leakage;
    const sy = grid.slip;

    const x =
      (marker.leakagePct - lx.min) / (lx.max - lx.min || 1);
    const y =
      (marker.slipPct - sy.min) / (sy.max - sy.min || 1);

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }, [grid, marker]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-md border overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={720}
          height={420}
          className="block w-full h-auto"
        />
        <div
          className="absolute"
          style={{
            left: `${markerPos.x * 100}%`,
            top: `${markerPos.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-slate-900 bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
        <div className="rounded-md border p-2">
          <div className="font-medium">X-axis</div>
          <div>Upstream leakage (%)</div>
          <div className="text-slate-600">
            Range: {grid.leakage.min}–{grid.leakage.max}
          </div>
        </div>
        <div className="rounded-md border p-2">
          <div className="font-medium">Y-axis</div>
          <div>Methane slip (%)</div>
          <div className="text-slate-600">
            Range: {grid.slip.min}–{grid.slip.max}
          </div>
        </div>
        <div className="rounded-md border p-2">
          <div className="font-medium">Color</div>
          <div>Δ vs coal (gCO₂e/kWh)</div>
          <div className="text-slate-600">
            Green = better than coal; red = worse than coal
          </div>
        </div>
      </div>
    </div>
  );
}
