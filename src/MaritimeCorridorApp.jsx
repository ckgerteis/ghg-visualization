import React, { useEffect, useMemo, useState } from "react";
import {
  CORRIDORS,
  ENGINES,
  DEFAULTS,
  PRESETS,
  GWP_PRESETS,
  clamp,
  formatNumber,
export default function MaritimeCorridorApp() {
  const defaultA = useMemo(() => defaultScenarioState(), []);
  const defaultB = useMemo(() => {
    const s = defaultScenarioState();
    // Make B different by default so A/B comparison is immediately visible
    return { ...s, gwpHorizon: "20" };
  }, []);

  const [scenarioA, setScenarioA] = useState(defaultA);
  const [scenarioB, setScenarioB] = useState(defaultB);
  const [surfaceFrom, setSurfaceFrom] = useState("A"); // which scenario defines heatmap surface
  const [presetKeyA, setPresetKeyA] = useState("default");
  const [presetKeyB, setPresetKeyB] = useState("default");
  const [appliedPresetValuesA, setAppliedPresetValuesA] = useState(
    PRESETS["default"] || DEFAULTS
  );
  const [appliedPresetValuesB, setAppliedPresetValuesB] = useState(
    PRESETS["default"] || DEFAULTS
  );

  // Initialize from URL once
  useEffect(() => {
    const init = readUrlState(defaultA, defaultB, "A");
    setScenarioA(init.scenarioA);
    setScenarioB(init.scenarioB);
    setSurfaceFrom(init.surfaceFrom);
    setPresetKeyA(init.presetKeyA || "default");
    setPresetKeyB(init.presetKeyB || "default");
    if (init.presetKeyA === "custom" && init.presetValuesA) {
      setAppliedPresetValuesA(init.presetValuesA);
    } else {
      setAppliedPresetValuesA(PRESETS[init.presetKeyA] ?? PRESETS.default ?? DEFAULTS);
    }
    if (init.presetKeyB === "custom" && init.presetValuesB) {
      setAppliedPresetValuesB(init.presetValuesB);
    } else {
      setAppliedPresetValuesB(PRESETS[init.presetKeyB] ?? PRESETS.default ?? DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist URL on any change
  useEffect(() => {
    writeUrlState({
      scenarioA,
      scenarioB,
      surfaceFrom,
      presetKeyA,
      presetValuesA: presetKeyA === "custom" ? appliedPresetValuesA : null,
      presetKeyB,
      presetValuesB: presetKeyB === "custom" ? appliedPresetValuesB : null,
    });
  }, [
    scenarioA,
    scenarioB,
    surfaceFrom,
    presetKeyA,
    appliedPresetValuesA,
    presetKeyB,
    appliedPresetValuesB,
  ]);

  const appliedPresetA =
    presetKeyA === "custom"
      ? appliedPresetValuesA
      : PRESETS[presetKeyA] ?? PRESETS.default ?? DEFAULTS;
  const appliedPresetB =
    presetKeyB === "custom"
      ? appliedPresetValuesB
      : PRESETS[presetKeyB] ?? PRESETS.default ?? DEFAULTS;

  const derivedA = useMemo(() => deriveScenario(scenarioA, appliedPresetA), [scenarioA, appliedPresetA]);
  const derivedB = useMemo(() => deriveScenario(scenarioB, appliedPresetB), [scenarioB, appliedPresetB]);

  const surfaceScenario = surfaceFrom === "B" ? scenarioB : scenarioA;
  const surfaceDerived = surfaceFrom === "B" ? derivedB : derivedA;

  const appliedPreset = surfaceFrom === "B" ? appliedPresetB : appliedPresetA;

  const heatmap = useMemo(() => {
    return computeHeatmapGrid({
      gwp: surfaceDerived.gwp,
      corridorNm: surfaceDerived.effDistanceNm,
      engineDefaults: {
        shippingRatePer1000nm: surfaceScenario.shippingRatePer1000nm,
      },
      processEnergy: {
        liquefactionPct: appliedPreset.liquefactionEnergyPct,
        processingPct: appliedPreset.processingEnergyPct,
        regasPct: appliedPreset.regasEnergyPct,
      },
      plantEfficiencyPct: appliedPreset.plantEfficiencyPct,
      coalBaseline_gPerKWh: appliedPreset.coalBaseline_gPerKWh,
      ranges: DEFAULTS.heatmapRanges,
    });
  }, [surfaceScenario, surfaceDerived]);

  const markers = useMemo(() => {
    return [
      {
        id: "A",
        label: "Scenario A",
        leakagePct: appliedPresetA.upstreamLeakPct,
        slipPct: scenarioA.methaneSlipPct,
        ringClass: "border-slate-900",
        fillClass: "bg-white",
      },
      {
        id: "B",
        label: "Scenario B",
        leakagePct: appliedPresetB.upstreamLeakPct,
        slipPct: scenarioB.methaneSlipPct,
        ringClass: "border-amber-600",
        fillClass: "bg-white",
      },
    ];
  }, [
    scenarioA.methaneSlipPct,
    scenarioB.methaneSlipPct,
    appliedPresetA.upstreamLeakPct,
    appliedPresetB.upstreamLeakPct,
  ]);

  const diff = useMemo(() => {
    const a = derivedA.outputs;
    const b = derivedB.outputs;
    return {
      total_gCO2e: (a.total_gCO2e ?? 0) - (b.total_gCO2e ?? 0),
      shippingSharePct: (a.shippingSharePct ?? 0) - (b.shippingSharePct ?? 0),
      deltaVsCoal_gPerKWh:
        (a.deltaVsCoal_gPerKWh ?? 0) - (b.deltaVsCoal_gPerKWh ?? 0),
    };
  }, [derivedA, derivedB]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold">
                Maritime Corridors: WTW / WTW→Wire Scenario Explorer (A/B)
              </h1>

              <a
                href="index.html"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Main
              </a>
            </div>

            <p className="text-sm text-slate-600 max-w-5xl">
              Two complete scenarios rendered side-by-side. The URL encodes the full
              state for sharing, and each scenario can be exported (JSON + CSV).
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Preset documentation */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">About Assumption Presets</h3>
              <p className="text-xs text-blue-800 mb-2">
                Each scenario can use a different assumption preset. Presets control upstream leakage, process energy penalties (processing, liquefaction, regasification), power plant efficiency, and the coal baseline for comparison.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Default</div>
                  <div className="text-blue-700 mt-1">1.5% upstream leakage, 8% liquefaction penalty, 55% plant efficiency, 900 gCO₂e/kWh coal</div>
                </div>
                <div className="bg-white rounded p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Optimistic</div>
                  <div className="text-blue-700 mt-1">0.5% leakage, 6% liquefaction, 60% plant efficiency, 850 gCO₂e/kWh coal</div>
                </div>
                <div className="bg-white rounded p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Pessimistic</div>
                  <div className="text-blue-700 mt-1">3.0% leakage, 12% liquefaction, 40% plant efficiency, 1000 gCO₂e/kWh coal</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Scenario controls (A/B)</h2>
              <p className="text-sm text-slate-600 mt-1">
                Each scenario has its own assumption preset. Export parameters to preserve exact assumptions used.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Heatmap surface from</label>
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  value={surfaceFrom}
                  onChange={(e) =>
                    setSurfaceFrom(e.target.value === "B" ? "B" : "A")
                  }
                >
                  <option value="A">Scenario A</option>
                  <option value="B">Scenario B</option>
                </select>
              </div>

              {/* Per-scenario presets live inside each ScenarioPanel now. */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setScenarioB({ ...scenarioA })}
                  title="Copy Scenario A into Scenario B"
                >
                  Copy A → B
                </button>
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setScenarioA({ ...scenarioB })}
                  title="Copy Scenario B into Scenario A"
                >
                  Copy B → A
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
            <ScenarioPanel
              label="Scenario A"
              accent="slate"
              scenario={scenarioA}
              setScenario={setScenarioA}
              derived={derivedA}
              presetKey={presetKeyA}
              appliedPreset={appliedPresetA}
              onPresetChange={(k) => {
                setPresetKeyA(k);
                if (k !== "custom") setAppliedPresetValuesA(PRESETS[k] ?? PRESETS.default ?? DEFAULTS);
              }}
              appliedPresetValues={appliedPresetValuesA}
              setAppliedPresetValues={setAppliedPresetValuesA}
            />
            <ScenarioPanel
              label="Scenario B"
              accent="amber"
              scenario={scenarioB}
              setScenario={setScenarioB}
              derived={derivedB}
              presetKey={presetKeyB}
              appliedPreset={appliedPresetB}
              onPresetChange={(k) => {
                setPresetKeyB(k);
                if (k !== "custom") setAppliedPresetValuesB(PRESETS[k] ?? PRESETS.default ?? DEFAULTS);
              }}
              appliedPresetValues={appliedPresetValuesB}
              setAppliedPresetValues={setAppliedPresetValuesB}
            />
          </div>
        </section>

        {/* Outputs */}
        <section className="bg-white rounded-lg border p-4 space-y-5">
          <h2 className="text-lg font-semibold">Outputs (A vs B)</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MetricRow
              title="Total (gCO₂e per scenario unit)"
              a={derivedA.outputs.total_gCO2e}
              b={derivedB.outputs.total_gCO2e}
              d={diff.total_gCO2e}
              hintA={derivedA.outputs.unitHint}
              hintB={derivedB.outputs.unitHint}
            />
            <MetricRow
              title="Shipping share (% of total)"
              a={derivedA.outputs.shippingSharePct}
              b={derivedB.outputs.shippingSharePct}
              d={diff.shippingSharePct}
              isPercent
            />
            <MetricRow
              title={coalComparatorLabel(scenarioA.boundary)}
              a={derivedA.outputs.deltaVsCoal_gPerKWh}
              b={derivedB.outputs.deltaVsCoal_gPerKWh}
              d={diff.deltaVsCoal_gPerKWh}
              hint="Negative = better than coal; positive = worse than coal (meaningful only in WTW→Wire)."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium">Stage breakdown (A)</h3>
              <p className="text-sm text-slate-600 mt-1">
                CO₂ and CH₄ are separated so GWP changes are visible.
              </p>
              <div className="mt-3">
                <StageBreakdownBar breakdown={derivedA.outputs.breakdown} />
              </div>
            </div>

            <div>
              <h3 className="font-medium">Stage breakdown (B)</h3>
              <p className="text-sm text-slate-600 mt-1">
                CO₂ and CH₄ are separated so GWP changes are visible.
              </p>
              <div className="mt-3">
                <StageBreakdownBar breakdown={derivedB.outputs.breakdown} />
              </div>
            </div>
          </div>
        </section>

        {/* Heatmap */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold">
            Break-even surface (leakage × slip)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Heatmap is computed from{" "}
            {surfaceFrom === "B" ? "Scenario B" : "Scenario A"} settings for
            corridor/process/efficiency/baseline. Markers show A and B positions.
          </p>

          <div className="mt-4">
            <BreakEvenHeatmap grid={heatmap} markers={markers} />
          </div>

          <div className="mt-3 text-xs text-slate-700 flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-slate-900 bg-white inline-block" />
              A
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-amber-600 bg-white inline-block" />
              B
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

function ScenarioPanel({ label, accent, scenario, setScenario, derived, presetKey, appliedPreset, onPresetChange, appliedPresetValues, setAppliedPresetValues }) {
  
  const corridor = derived.corridor;
  const engine = derived.engine;

  const panelBorder =
    accent === "amber" ? "border-amber-200" : "border-slate-200";
  const titleText = accent === "amber" ? "text-amber-700" : "text-slate-800";

  function set(partial) {
    setScenario((prev) => ({ ...prev, ...partial }));
  }

  function onEngineChange(nextId) {
    const next = ENGINES.find((x) => x.id === nextId) ?? ENGINES[0];
    set({
      engineId: nextId,
      methaneSlipPct: next.defaultSlipPct,
      shippingRatePer1000nm: next.shippingEnergyPctPer1000nm,
    });
  }

  function exportJson() {
    const obj = buildScenarioExport(label, scenario, derived, presetKey, appliedPreset);
    downloadJson(
      `${label.replaceAll(" ", "_").toLowerCase()}.json`,
      obj
    );
  }

  function exportCsv() {
    const rows = breakdownCsvRows(label, derived, presetKey, appliedPreset);
    downloadCsv(
      `${label.replaceAll(" ", "_").toLowerCase()}_breakdown.csv`,
      rows
    );
  }

  return (
    <div className={`rounded-lg border ${panelBorder} p-4`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Assumption preset</label>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={presetKey}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {Object.entries(PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
            <option key="custom" value="custom">
              Custom
            </option>
          </select>
          <div className="text-xs text-slate-500 ml-2 max-w-xs">
            Presets set leakage, process energy, plant efficiency and coal baseline.
          </div>
        </div>

        {presetKey === "custom" ? (
          <div className="ml-4 w-full max-w-lg">
            <div className="text-sm font-medium mb-2">Custom assumptions</div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                title="Restore this scenario's preset values to Default"
                className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                onClick={() => setAppliedPresetValues(PRESETS.default)}
              >
                Reset to Default
              </button>
            </div>
            <Slider
              label="Upstream leakage (% of produced gas)"
              min={0}
              max={8}
              step={0.1}
              value={appliedPresetValues.upstreamLeakPct}
              onChange={(v) => setAppliedPresetValues((p) => ({ ...p, upstreamLeakPct: v }))}
              display={`${formatNumber(appliedPresetValues.upstreamLeakPct, 1)}%`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <Slider
                label="Processing (%)"
                min={0}
                max={8}
                step={0.1}
                value={appliedPresetValues.processingEnergyPct}
                onChange={(v) => setAppliedPresetValues((p) => ({ ...p, processingEnergyPct: v }))}
                display={`${formatNumber(appliedPresetValues.processingEnergyPct, 2)}%`}
              />
              <Slider
                label="Liquefaction (%)"
                min={0}
                max={15}
                step={0.1}
                value={appliedPresetValues.liquefactionEnergyPct}
                onChange={(v) => setAppliedPresetValues((p) => ({ ...p, liquefactionEnergyPct: v }))}
                display={`${formatNumber(appliedPresetValues.liquefactionEnergyPct, 2)}%`}
              />
              <Slider
                label="Regasification (%)"
                min={0}
                max={5}
                step={0.05}
                value={appliedPresetValues.regasEnergyPct}
                onChange={(v) => setAppliedPresetValues((p) => ({ ...p, regasEnergyPct: v }))}
                display={`${formatNumber(appliedPresetValues.regasEnergyPct, 2)}%`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <Slider
                label="Power plant efficiency (for WTW→Wire)"
                min={35}
                max={65}
                step={0.5}
                value={appliedPresetValues.plantEfficiencyPct}
                onChange={(v) => setAppliedPresetValues((p) => ({ ...p, plantEfficiencyPct: v }))}
                display={`${formatNumber(appliedPresetValues.plantEfficiencyPct, 1)}%`}
              />
              <Slider
                label="Coal baseline (gCO₂e/kWh)"
                min={650}
                max={1200}
                step={10}
                value={appliedPresetValues.coalBaseline_gPerKWh}
                onChange={(v) => setAppliedPresetValues((p) => ({ ...p, coalBaseline_gPerKWh: v }))}
                display={`${formatNumber(appliedPresetValues.coalBaseline_gPerKWh, 0)} gCO₂e/kWh`}
              />
            </div>
          </div>
        ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-sm font-semibold ${titleText}`}>{label}</div>
          <div className="text-xs text-slate-600 mt-1">
            Effective distance:{" "}
            <span className="font-medium">
              {formatNumber(derived.effDistanceNm)}
            </span>{" "}
            nm
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-xs hover:bg-slate-50"
            onClick={exportJson}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-xs hover:bg-slate-50"
            onClick={exportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <ControlButtons
          label="Boundary"
          options={[
            { key: "TTW", label: "TTW" },
            { key: "WTW", label: "WTW" },
            { key: "WTWIRE", label: "WTW→Wire" },
          ]}
          value={scenario.boundary}
          onChange={(v) => set({ boundary: v })}
        />

        <ControlButtons
          label="GWP horizon"
          options={[
            { key: "20", label: "GWP20" },
            { key: "100", label: "GWP100" },
          ]}
          value={scenario.gwpHorizon}
          onChange={(v) => set({ gwpHorizon: v })}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Corridor</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={scenario.corridorId}
            onChange={(e) => set({ corridorId: e.target.value })}
          >
            {CORRIDORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({formatNumber(c.distanceNm)} nm)
              </option>
            ))}
          </select>

          <Slider
            label="Distance detour (%)"
            min={0}
            max={75}
            step={1}
            value={scenario.detourPct}
            onChange={(v) => set({ detourPct: v })}
            display={`${formatNumber(scenario.detourPct, 0)}%`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Vessel / engine family</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={scenario.engineId}
            onChange={(e) => onEngineChange(e.target.value)}
          >
            {ENGINES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>

          <Slider
            label="Methane slip (% of ship fuel)"
            min={0}
            max={4}
            step={0.05}
            value={scenario.methaneSlipPct}
            onChange={(v) => set({ methaneSlipPct: v })}
            display={`${formatNumber(scenario.methaneSlipPct, 2)}%`}
          />

          <Slider
            label="Shipping energy penalty (% per 1000 nm)"
            min={0.1}
            max={3.5}
            step={0.05}
            value={scenario.shippingRatePer1000nm}
            onChange={(v) => set({ shippingRatePer1000nm: v })}
            display={`${formatNumber(scenario.shippingRatePer1000nm, 2)}%`}
          />
        </div>

        {/* Advanced energy/process controls hidden for simplified UI */}

        <div className="text-xs text-slate-600">
          Current corridor:{" "}
          <span className="font-medium">{corridor.label}</span>. Engine:{" "}
          <span className="font-medium">{engine.label}</span>.
        </div>
      </div>
    </div>
  );
}

function ControlButtons({ label, options, value, onChange }) {
  const colsClass =
    options.length === 2
      ? "grid-cols-2"
      : options.length === 3
      ? "grid-cols-3"
      : "grid-cols-1";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className={`grid ${colsClass} gap-2`}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`rounded-md border px-3 py-2 text-sm ${
              value === o.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white hover:bg-slate-50"
            }`}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange, display }) {
  return (
    <div className="pt-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="text-xs text-slate-600">{display}</div>
    </div>
  );
}

function MetricRow({ title, a, b, d, hintA, hintB, hint, isPercent }) {
  const fmt = (x) => {
    if (x === null || x === undefined) return "—";
    if (!Number.isFinite(Number(x))) return "—";
    return isPercent ? `${formatNumber(x, 1)}%` : formatNumber(x, 0);
  };

  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-600">
        {title}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <div className="text-xs text-slate-600">A</div>
          <div className="text-lg font-semibold">{fmt(a)}</div>
          {hintA ? (
            <div className="text-[11px] text-slate-500 mt-1">{hintA}</div>
          ) : null}
        </div>
        <div>
          <div className="text-xs text-slate-600">B</div>
          <div className="text-lg font-semibold">{fmt(b)}</div>
          {hintB ? (
            <div className="text-[11px] text-slate-500 mt-1">{hintB}</div>
          ) : null}
        </div>
        <div>
          <div className="text-xs text-slate-600">A − B</div>
          <div className="text-lg font-semibold">{fmt(d)}</div>
          {hint ? (
            <div className="text-[11px] text-slate-500 mt-1">{hint}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
