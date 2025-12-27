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

  setIfDefined(p, `${prefix}ul`, s.upstreamLeakPct);
  setIfDefined(p, `${prefix}ms`, s.methaneSlipPct);
  setIfDefined(p, `${prefix}pe`, s.plantEffPct);
  setIfDefined(p, `${prefix}cb`, s.coalBaseline_gPerKWh);

  setIfDefined(p, `${prefix}dt`, s.detourPct);
  setIfDefined(p, `${prefix}sr`, s.shippingRatePer1000nm);

  setIfDefined(p, `${prefix}liq`, s.liquefactionPct);
  setIfDefined(p, `${prefix}pro`, s.processingPct);
  setIfDefined(p, `${prefix}reg`, s.regasPct);

  return p;
}

export function decodeScenario(prefix, params, defaults) {
  return {
    ...defaults,
    boundary: str(params.get(`${prefix}b`), defaults.boundary),
    gwpHorizon: str(params.get(`${prefix}g`), defaults.gwpHorizon),
    corridorId: str(params.get(`${prefix}c`), defaults.corridorId),
    engineId: str(params.get(`${prefix}e`), defaults.engineId),

    upstreamLeakPct: num(params.get(`${prefix}ul`), defaults.upstreamLeakPct),
    methaneSlipPct: num(params.get(`${prefix}ms`), defaults.methaneSlipPct),
    plantEffPct: num(params.get(`${prefix}pe`), defaults.plantEffPct),
    coalBaseline_gPerKWh: num(params.get(`${prefix}cb`), defaults.coalBaseline_gPerKWh),

    detourPct: num(params.get(`${prefix}dt`), defaults.detourPct),
    shippingRatePer1000nm: num(params.get(`${prefix}sr`), defaults.shippingRatePer1000nm),

    liquefactionPct: num(params.get(`${prefix}liq`), defaults.liquefactionPct),
    processingPct: num(params.get(`${prefix}pro`), defaults.processingPct),
    regasPct: num(params.get(`${prefix}reg`), defaults.regasPct),
  };
}

export function writeUrlState({ scenarioA, scenarioB, surfaceFrom }) {
  const pA = encodeScenario("a", scenarioA);
  const pB = encodeScenario("b", scenarioB);
  const out = new URLSearchParams();

  for (const [k, v] of pA.entries()) out.set(k, v);
  for (const [k, v] of pB.entries()) out.set(k, v);

  out.set("surf", surfaceFrom);

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
  };
}
