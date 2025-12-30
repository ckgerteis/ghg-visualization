import React, { useEffect, useMemo, useRef } from "react";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorScale(v, vmin, vmax) {
  // Diverging: green (better than coal) -> white -> red (worse than coal)
  const t = (v - vmin) / (vmax - vmin || 1);
  const x = Math.max(0, Math.min(1, t));

  // Center at 0
  const mid = (0 - vmin) / (vmax - vmin || 1);

  if (x < mid) {
    const tt = x / (mid || 1);
    // green -> white
    const r = lerp(16, 255, tt);
    const g = lerp(185, 255, tt);
    const b = lerp(129, 255, tt);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  } else {
    const tt = (x - mid) / (1 - mid || 1);
    // white -> red
    const r = lerp(255, 185, tt);
    const g = lerp(255, 28, tt);
    const b = lerp(255, 28, tt);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function normMarker(grid, m) {
  const lx = grid.leakage;
  const sy = grid.slip;

  const x = (m.leakagePct - lx.min) / (lx.max - lx.min || 1);
  const y = (m.slipPct - sy.min) / (sy.max - sy.min || 1);

  return { x: clamp01(x), y: clamp01(y) };
}

/**
 * Props:
 * - grid: { leakage:{min,max,steps}, slip:{min,max,steps}, values:number[][], ... }
 * - markers: [{ id, label, leakagePct, slipPct, ringClass, fillClass }]
 */
export default function BreakEvenHeatmap({ grid, markers = [] }) {
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
    // Use a tighter symmetric range around zero for better contrast
    // This makes the color gradient more sensitive to actual differences
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    // Reduce the range slightly to enhance color variation
    const scale = Math.min(absMax, absMax * 0.9);
    return { min: -scale, max: scale };
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

  const markerPositions = useMemo(() => {
    return markers.map((m) => ({ ...m, pos: normMarker(grid, m) }));
  }, [grid, markers]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-md border overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={720}
          height={420}
          className="block w-full h-auto"
        />

        {markerPositions.map((m) => (
          <div
            key={m.id}
            className="absolute"
            style={{
              left: `${m.pos.x * 100}%`,
              top: `${m.pos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={`${m.label}: leakage ${m.leakagePct}%, slip ${m.slipPct}%`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 ${m.ringClass} ${m.fillClass}`}
            />
          </div>
        ))}
      </div>

      {/* Color scale legend */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <span className="text-slate-600">Better than coal</span>
        <div className="flex h-6 rounded overflow-hidden border" style={{ width: "200px" }}>
          {[...Array(50)].map((_, i) => {
            const t = i / 49;
            const v = stats.min + t * (stats.max - stats.min);
            const color = colorScale(v, stats.min, stats.max);
            return <div key={i} style={{ flex: 1, backgroundColor: color }} />;
          })}
        </div>
        <span className="text-slate-600">Worse than coal</span>
        <span className="text-slate-500 ml-2">
          ({Math.round(stats.min)} to +{Math.round(stats.max)} gCO₂e/kWh)
        </span>
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
