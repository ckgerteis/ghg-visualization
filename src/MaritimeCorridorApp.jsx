import React, { useMemo, useState } from "react";
import {
  CORRIDORS,
  ENGINES,
  DEFAULTS,
  GWP_PRESETS,
  clamp,
  formatNumber,
} from "./maritime/data.js";
import {
  computeScenario,
  computeHeatmapGrid,
  coalComparatorLabel,
} from "./maritime/calc.js";
import StageBreakdownBar from "./maritime/StageBreakdownBar.jsx";
import BreakEvenHeatmap from "./maritime/BreakEvenHeatmap.jsx";

export default function MaritimeCorridorApp() {
  const [boundary, setBoundary] = useState("WTW"); // TTW | WTW | WTWIRE
  const [gwpHorizon, setGwpHorizon] = useState("100"); // "20" | "100"
  const [corridorId, setCorridorId] = useState(CORRIDORS[0].id);
  const [engineId, setEngineId] = useState(ENGINES[0].id);

  const corridor = useMemo(
    () => CORRIDORS.find((c) => c.id === corridorId) ?? CORRIDORS[0],
    [corridorId]
  );
  const engine = useMemo(
    () => ENGINES.find((e) => e.id === engineId) ?? ENGINES[0],
    [engineId]
  );

  // Key tunables
  const [upstreamLeakPct, setUpstreamLeakPct] = useState(
    DEFAULTS.upstreamLeakPct
  ); // % of produced gas leaked as CH4 (upstream)
  const [methaneSlipPct, setMethaneSlipPct] = useState(engine.defaultSlipPct); // % of ship engine fuel that slips as CH4
  const [plantEffPct, setPlantEffPct] = useState(DEFAULTS.plantEfficiencyPct); // for WTWIRE
  const [coalBaseline_gPerKWh, setCoalBaseline_gPerKWh] = useState(
    DEFAULTS.coalBaseline_gPerKWh
  );

  // Corridor modifiers
  const [detourPct, setDetourPct] = useState(0); // adds % to corridor distance
  const [shippingRatePer1000nm, setShippingRatePer1000nm] = useState(
    engine.shippingEnergyPctPer1000nm
  );

  // Upstream process energy penalties (as % of delivered fuel energy)
  const [liquefactionPct, setLiquefactionPct] = useState(
    DEFAULTS.liquefactionEnergyPct
  );
  const [processingPct, setProcessingPct] = useState(
    DEFAULTS.processingEnergyPct
  );
  const [regasPct, setRegasPct] = useState(DEFAULTS.regasEnergyPct);

  const gwp = GWP_PRESETS[gwpHorizon];

  const scenario = useMemo(() => {
    const effectiveDistanceNm =
      corridor.distanceNm * (1 + clamp(detourPct, 0, 200) / 100);

    return computeScenario({
      boundary,
      gwp,
      corridor: { ...corridor, distanceNm: effectiveDistanceNm },
      engine: { ...engine, methaneSlipPct, shippingRatePer1000nm },
      upstreamLeakPct,
      processEnergy: {
        liquefactionPct,
        processingPct,
        regasPct,
      },
      plantEfficiencyPct: plantEffPct,
      coalBaseline_gPerKWh,
    });
  }, [
    boundary,
    gwp,
    corridor,
    engine,
    methaneSlipPct,
    upstreamLeakPct,
    detourPct,
    shippingRatePer1000nm,
    liquefactionPct,
    processingPct,
    regasPct,
    plantEffPct,
    coalBaseline_gPerKWh,
  ]);

  const heatmap = useMemo(() => {
    // Heatmap is meaningful for WTWIRE comparisons; still render in other modes but label changes.
    return computeHeatmapGrid({
      gwp,
      corridorNm: corridor.distanceNm * (1 + clamp(detourPct, 0, 200) / 100),
      engineDefaults: {
        shippingRatePer1000nm,
      },
      processEnergy: { liquefactionPct, processingPct, regasPct },
      plantEfficiencyPct: plantEffPct,
      coalBaseline_gPerKWh,
      ranges: DEFAULTS.heatmapRanges,
    });
  }, [
    gwp,
    corridor.distanceNm,
    detourPct,
    shippingRatePer1000nm,
    liquefactionPct,
    processingPct,
    regasPct,
    plantEffPct,
    coalBaseline_gPerKWh,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">
                Maritime Corridors: Well-to-Wake and Well-to-Wire Scenario Explorer
              </h1>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Main
              </a>
            </div>
            <p className="text-sm text-slate-600 max-w-4xl">
              This page is intentionally independent from the main visualization. It
              makes boundary choices explicit (TTW vs WTW vs WTWIRE) and exposes how
              corridor distance, methane slip, upstream leakage, and GWP horizon reshape
              outcomes.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-4">
            <div className="bg-white rounded-lg border p-4 space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Scenario controls</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Defaults are placeholders. Replace factor values as you finalize the
                  bibliography and preferred accounting conventions.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Boundary</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "TTW", label: "TTW" },
                    { key: "WTW", label: "WTW" },
                    { key: "WTWIRE", label: "WTW→Wire" },
                  ].map((b) => (
                    <button
                      key={b.key}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        boundary === b.key
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => setBoundary(b.key)}
                      type="button"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  TTW = end-use combustion only. WTW adds upstream + processing + liquefaction + shipping + regas.
                  WTW→Wire converts per-fuel totals into per-kWh using plant efficiency and compares to a coal baseline.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GWP horizon</label>
                <div className="grid grid-cols-2 gap-2">
                  {["20", "100"].map((h) => (
                    <button
                      key={h}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        gwpHorizon === h
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => setGwpHorizon(h)}
                      type="button"
                    >
                      GWP{h}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Methane is heavily reweighted under GWP20. This toggle changes CH4’s CO₂e contribution live.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Corridor</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                >
                  {CORRIDORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({formatNumber(c.distanceNm)} nm)
                    </option>
                  ))}
                </select>

                <div className="pt-2">
                  <label className="text-sm font-medium">
                    Distance detour (%)
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    min={0}
                    max={75}
                    step={1}
                    value={detourPct}
                    onChange={(e) => setDetourPct(Number(e.target.value))}
                  />
                  <div className="text-xs text-slate-600">
                    Effective distance:{" "}
                    <span className="font-medium">
                      {formatNumber(
                        corridor.distanceNm * (1 + detourPct / 100)
                      )}
                    </span>{" "}
                    nm
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vessel / engine family</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={engineId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setEngineId(nextId);
                    const next = ENGINES.find((x) => x.id === nextId);
                    if (next) {
                      setMethaneSlipPct(next.defaultSlipPct);
                      setShippingRatePer1000nm(next.shippingEnergyPctPer1000nm);
                    }
                  }}
                >
                  {ENGINES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>

                <div className="pt-2">
                  <label className="text-sm font-medium">
                    Methane slip (% of ship fuel)
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    min={0}
                    max={4}
                    step={0.05}
                    value={methaneSlipPct}
                    onChange={(e) => setMethaneSlipPct(Number(e.target.value))}
                  />
                  <div className="text-xs text-slate-600">
                    {formatNumber(methaneSlipPct, 2)}%
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-sm font-medium">
                    Shipping energy penalty (% per 1000 nm)
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    min={0.1}
                    max={3.5}
                    step={0.05}
                    value={shippingRatePer1000nm}
                    onChange={(e) =>
                      setShippingRatePer1000nm(Number(e.target.value))
                    }
                  />
                  <div className="text-xs text-slate-600">
                    {formatNumber(shippingRatePer1000nm, 2)}% per 1000 nm
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upstream leakage (% of produced gas)
                </label>
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={8}
                  step={0.1}
                  value={upstreamLeakPct}
                  onChange={(e) => setUpstreamLeakPct(Number(e.target.value))}
                />
                <div className="text-xs text-slate-600">
                  {formatNumber(upstreamLeakPct, 1)}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Process energy penalties</label>
                <div className="grid grid-cols-1 gap-3">
                  <SliderRow
                    label="Processing"
                    value={processingPct}
                    setValue={setProcessingPct}
                    min={0}
                    max={8}
                    step={0.1}
                    suffix="%"
                  />
                  <SliderRow
                    label="Liquefaction"
                    value={liquefactionPct}
                    setValue={setLiquefactionPct}
                    min={0}
                    max={15}
                    step={0.1}
                    suffix="%"
                  />
                  <SliderRow
                    label="Regasification"
                    value={regasPct}
                    setValue={setRegasPct}
                    min={0}
                    max={5}
                    step={0.05}
                    suffix="%"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">
                  Power plant efficiency (for WTW→Wire)
                </label>
                <input
                  className="w-full"
                  type="range"
                  min={35}
                  max={65}
                  step={0.5}
                  value={plantEffPct}
                  onChange={(e) => setPlantEffPct(Number(e.target.value))}
                />
                <div className="text-xs text-slate-600">
                  {formatNumber(plantEffPct, 1)}%
                </div>

                <label className="text-sm font-medium mt-2 block">
                  Coal baseline (gCO₂e/kWh)
                </label>
                <input
                  className="w-full"
                  type="range"
                  min={650}
                  max={1200}
                  step={10}
                  value={coalBaseline_gPerKWh}
                  onChange={(e) => setCoalBaseline_gPerKWh(Number(e.target.value))}
                />
                <div className="text-xs text-slate-600">
                  {formatNumber(coalBaseline_gPerKWh)} gCO₂e/kWh
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Outputs</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <MetricCard
                  label="Total (CO₂e)"
                  value={scenario.total_gCO2e}
                  unit="g per scenario unit"
                  hint={scenario.unitHint}
                />
                <MetricCard
                  label="Shipping share"
                  value={scenario.shippingSharePct}
                  unit="% of total"
                  isPercent
                />
                <MetricCard
                  label={coalComparatorLabel(boundary)}
                  value={scenario.deltaVsCoal_gPerKWh}
                  unit="gCO₂e/kWh"
                  hint="Negative = better than coal; positive = worse than coal (WTW→Wire mode)."
                />
              </div>

              <div className="mt-6">
                <h3 className="font-medium">Stage breakdown</h3>
                <p className="text-sm text-slate-600 mt-1">
                  CO₂ and CH₄ are separated to make methane’s GWP sensitivity visible.
                </p>
                <div className="mt-3">
                  <StageBreakdownBar breakdown={scenario.breakdown} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold">
                Break-even surface (leakage × slip)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Heatmap color encodes the modeled difference vs the coal baseline in gCO₂e/kWh
                (using the current corridor, process penalties, plant efficiency, and GWP horizon).
              </p>

              <div className="mt-4">
                <BreakEvenHeatmap
                  grid={heatmap}
                  marker={{
                    leakagePct: upstreamLeakPct,
                    slipPct: methaneSlipPct,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Notes for revision</h2>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2 mt-2">
                <li>
                  All defaults are exposed in <code className="px-1">src/maritime/data.js</code>.
                  Replace these with values and citations aligned to your chosen accounting framework.
                </li>
                <li>
                  This model is deliberately transparent rather than exhaustive: the point is to let users
                  see which assumptions must hold for outcomes to flip.
                </li>
                <li>
                  If you want corridor maps, we can add a GeoJSON layer next, but the current implementation
                  already captures the corridor-distance argument without adding mapping complexity.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SliderRow({ label, value, setValue, min, max, step, suffix }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className="text-xs text-slate-600">
        {formatNumber(value, 2)}
        {suffix}
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, hint, isPercent }) {
  const display =
    value === null || value === undefined
      ? "—"
      : isPercent
      ? `${formatNumber(value, 1)}%`
      : formatNumber(value, 0);

  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{display}</div>
      <div className="text-xs text-slate-600 mt-1">{unit}</div>
      {hint ? <div className="text-xs text-slate-500 mt-1">{hint}</div> : null}
    </div>
  );
}
