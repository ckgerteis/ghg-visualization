export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const formatNumber = (n, digits = 0) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

// GWP presets (placeholders; set to your preferred conventions)
export const GWP_PRESETS = {
  "20": { ch4: 80, label: "GWP20" },
  "100": { ch4: 28, label: "GWP100" },
};

// Corridor library (placeholders; replace with your corridor set)
export const CORRIDORS = [
  { id: "gulf_japan_panama", label: "U.S. Gulf → Japan (via Panama)", distanceNm: 9000 },
  { id: "qatar_japan_malacca", label: "Qatar → Japan (via Malacca)", distanceNm: 6700 },
  { id: "aus_japan", label: "NW Australia → Japan", distanceNm: 3900 },
  { id: "custom_5000", label: "Generic corridor", distanceNm: 5000 },
];

// Engine families (placeholders)
export const ENGINES = [
  {
    id: "me_gi",
    label: "ME-GI / high-pressure dual-fuel (lower slip)",
    defaultSlipPct: 0.2,
    shippingEnergyPctPer1000nm: 0.8,
  },
  {
    id: "x_df",
    label: "X-DF / low-pressure dual-fuel (higher slip)",
    defaultSlipPct: 1.6,
    shippingEnergyPctPer1000nm: 0.9,
  },
  {
    id: "steam_turbine",
    label: "Steam turbine (legacy)",
    defaultSlipPct: 0.1,
    shippingEnergyPctPer1000nm: 1.4,
  },
];

// Global defaults (all editable)
export const DEFAULTS = {
  upstreamLeakPct: 1.5,

  // Process energy penalties, as % of delivered fuel energy
  processingEnergyPct: 2.0,
  liquefactionEnergyPct: 8.0,
  regasEnergyPct: 1.0,

  // Power plant
  plantEfficiencyPct: 55.0,

  // Coal comparator baseline
  coalBaseline_gPerKWh: 900,

  // Physical approximations (placeholders)
  fuelLHV_MJ_per_kg_CH4: 50, // MJ/kg
  combustionCO2_g_per_MJ: 56, // natural gas combustion CO2, g/MJ (placeholder)
  processCO2_g_per_MJ_fuelUsed: 56, // assume same carbon intensity for process fuel (placeholder)

  // Heatmap ranges
  heatmapRanges: {
    leakagePct: { min: 0.0, max: 6.0, steps: 61 },
    slipPct: { min: 0.0, max: 3.0, steps: 61 },
  },
};
