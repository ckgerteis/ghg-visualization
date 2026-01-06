import { DEFAULTS } from "./data.js";

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v, fallback) {
  return typeof v === "string" && v.length ? v : fallback;
}

function setIfDefined(params, key, val) {
  if (val === null || val === undefined) return;
  params.set(key, String(val));
}

export function encodeScenario(prefix, s) {
  const p = new URLSearchParams();
  setIfDefined(p, `${prefix}b`, s.boundary);
  setIfDefined(p, `${prefix}g`, s.gwpHorizon);
  setIfDefined(p, `${prefix}c`, s.corridorId);
  setIfDefined(p, `${prefix}e`, s.engineId);

  // Keep URL minimal: encode only core scenario selectors and editable sliders
  setIfDefined(p, `${prefix}ms`, s.methaneSlipPct);
  setIfDefined(p, `${prefix}dt`, s.detourPct);
  setIfDefined(p, `${prefix}sr`, s.shippingRatePer1000nm);


  return p;
}

export function decodeScenario(prefix, params, defaults) {
  return {
    ...defaults,
    boundary: str(params.get(`${prefix}b`), defaults.boundary),
    gwpHorizon: str(params.get(`${prefix}g`), defaults.gwpHorizon),
    corridorId: str(params.get(`${prefix}c`), defaults.corridorId),
    engineId: str(params.get(`${prefix}e`), defaults.engineId),

    methaneSlipPct: num(params.get(`${prefix}ms`), defaults.methaneSlipPct),

    detourPct: num(params.get(`${prefix}dt`), defaults.detourPct),
    shippingRatePer1000nm: num(params.get(`${prefix}sr`), defaults.shippingRatePer1000nm),

    // process energy and leakage kept as defaults and not encoded in URL
  };
}

export function writeUrlState({ scenarioA, scenarioB, surfaceFrom, presetKeyA, presetValuesA, presetKeyB, presetValuesB }) {
  const pA = encodeScenario("a", scenarioA);
  const pB = encodeScenario("b", scenarioB);
  const out = new URLSearchParams();

  for (const [k, v] of pA.entries()) out.set(k, v);
  for (const [k, v] of pB.entries()) out.set(k, v);

  out.set("surf", surfaceFrom);
  out.set("preA", presetKeyA || "default");
  out.set("preB", presetKeyB || "default");

  // If custom per-scenario, encode the explicit preset values so the state is shareable
  if (presetKeyA === "custom" && presetValuesA) {
    setIfDefined(out, "ulA", presetValuesA.upstreamLeakPct);
    setIfDefined(out, "peA", presetValuesA.plantEfficiencyPct);
    setIfDefined(out, "cbA", presetValuesA.coalBaseline_gPerKWh);
    setIfDefined(out, "liqA", presetValuesA.liquefactionEnergyPct);
    setIfDefined(out, "proA", presetValuesA.processingEnergyPct);
    setIfDefined(out, "regA", presetValuesA.regasEnergyPct);
  }
  if (presetKeyB === "custom" && presetValuesB) {
    setIfDefined(out, "ulB", presetValuesB.upstreamLeakPct);
    setIfDefined(out, "peB", presetValuesB.plantEfficiencyPct);
    setIfDefined(out, "cbB", presetValuesB.coalBaseline_gPerKWh);
    setIfDefined(out, "liqB", presetValuesB.liquefactionEnergyPct);
    setIfDefined(out, "proB", presetValuesB.processingEnergyPct);
    setIfDefined(out, "regB", presetValuesB.regasEnergyPct);
  }

  const next = `${window.location.pathname}?${out.toString()}`;
  window.history.replaceState(null, "", next);
}

export function readUrlState(defaultA, defaultB, defaultSurfaceFrom = "A") {
  const params = new URLSearchParams(window.location.search);
  const surf = str(params.get("surf"), defaultSurfaceFrom);
  return {
    scenarioA: decodeScenario("a", params, defaultA),
    scenarioB: decodeScenario("b", params, defaultB),
    surfaceFrom: surf === "B" ? "B" : "A",
    presetKeyA: str(params.get("preA"), "default"),
    presetValuesA:
      str(params.get("preA"), "") === "custom"
        ? {
            upstreamLeakPct: num(params.get("ulA"), defaultA.upstreamLeakPct),
            plantEfficiencyPct: num(params.get("peA"), DEFAULTS.plantEfficiencyPct),
            coalBaseline_gPerKWh: num(params.get("cbA"), DEFAULTS.coalBaseline_gPerKWh),
            liquefactionEnergyPct: num(params.get("liqA"), DEFAULTS.liquefactionEnergyPct),
            processingEnergyPct: num(params.get("proA"), DEFAULTS.processingEnergyPct),
            regasEnergyPct: num(params.get("regA"), DEFAULTS.regasEnergyPct),
          }
        : null,
    presetKeyB: str(params.get("preB"), "default"),
    presetValuesB:
      str(params.get("preB"), "") === "custom"
        ? {
            upstreamLeakPct: num(params.get("ulB"), defaultB.upstreamLeakPct),
            plantEfficiencyPct: num(params.get("peB"), DEFAULTS.plantEfficiencyPct),
            coalBaseline_gPerKWh: num(params.get("cbB"), DEFAULTS.coalBaseline_gPerKWh),
            liquefactionEnergyPct: num(params.get("liqB"), DEFAULTS.liquefactionEnergyPct),
            processingEnergyPct: num(params.get("proB"), DEFAULTS.processingEnergyPct),
            regasEnergyPct: num(params.get("regB"), DEFAULTS.regasEnergyPct),
          }
        : null,
  };
}
