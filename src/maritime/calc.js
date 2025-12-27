import { DEFAULTS, clamp } from "./data.js";

/**
 * Core modeling choice:
 * - We treat delivered fuel energy to the destination as 1,000 MJ (arbitrary scenario unit).
 * - Upstream processing/liquefaction/shipping/regas are modeled as % energy penalties of delivered energy.
 * - Methane leakage is modeled as % of produced gas mass; methane slip is % of ship fuel used.
 * - CH4 is converted to CO2e using the selected GWP horizon.
 *
 * This is intentionally transparent and editable, not a closed-form LCA.
 */

export function computeScenario({
  boundary, // TTW | WTW | WTWIRE
  gwp, // {ch4}
  corridor, // {distanceNm}
  engine, // {methaneSlipPct, shippingRatePer1000nm}
  upstreamLeakPct,
  processEnergy, // {processingPct, liquefactionPct, regasPct}
  plantEfficiencyPct,
  coalBaseline_gPerKWh,
}) {
  const deliveredMJ = 1000;

  const shippingPct =
    (corridor.distanceNm / 1000) * clamp(engine.shippingRatePer1000nm, 0, 10);

  const totalPenaltyPct =
    clamp(processEnergy.processingPct, 0, 30) +
    clamp(processEnergy.liquefactionPct, 0, 40) +
    clamp(processEnergy.regasPct, 0, 15) +
    clamp(shippingPct, 0, 60);

  // Energy that must be produced at the wellhead to deliver deliveredMJ after penalties.
  const producedMJ = deliveredMJ / (1 - totalPenaltyPct / 100);

  // Stage energies (MJ of fuel "spent" on processes)
  const processMJ = (clamp(processEnergy.processingPct, 0, 30) / 100) * deliveredMJ;
  const liquefactionMJ =
    (clamp(processEnergy.liquefactionPct, 0, 40) / 100) * deliveredMJ;
  const regasMJ = (clamp(processEnergy.regasPct, 0, 15) / 100) * deliveredMJ;
  const shippingMJ = (clamp(shippingPct, 0, 60) / 100) * deliveredMJ;

  // Convert energy to CH4 mass using LHV
  const producedKgCH4 = producedMJ / DEFAULTS.fuelLHV_MJ_per_kg_CH4;
  const upstreamLeakKgCH4 =
    producedKgCH4 * clamp(upstreamLeakPct, 0, 20) / 100;

  const shipFuelKgCH4 = shippingMJ / DEFAULTS.fuelLHV_MJ_per_kg_CH4;
  const shipSlipKgCH4 =
    shipFuelKgCH4 * clamp(engine.methaneSlipPct, 0, 10) / 100;

  // CO2 from process fuel use (placeholder uses a constant gCO2/MJ)
  const processingCO2_g = processMJ * DEFAULTS.processCO2_g_per_MJ_fuelUsed;
  const liquefactionCO2_g = liquefactionMJ * DEFAULTS.processCO2_g_per_MJ_fuelUsed;
  const regasCO2_g = regasMJ * DEFAULTS.processCO2_g_per_MJ_fuelUsed;
  const shippingCO2_g = shippingMJ * DEFAULTS.combustionCO2_g_per_MJ;

  // End-use combustion CO2 (TTW for delivered fuel)
  const combustionCO2_g = deliveredMJ * DEFAULTS.combustionCO2_g_per_MJ;

  // Convert CH4 to CO2e
  const upstreamCH4_CO2e_g = upstreamLeakKgCH4 * 1000 * gwp.ch4;
  const shippingCH4_CO2e_g = shipSlipKgCH4 * 1000 * gwp.ch4;

  // Boundary application
  const includeWTW = boundary === "WTW" || boundary === "WTWIRE";
  const includeTTW = boundary === "TTW" || boundary === "WTW" || boundary === "WTWIRE";

  const breakdown = [
    {
      stage: "Upstream leakage (CH₄)",
      co2_g: 0,
      ch4_co2e_g: includeWTW ? upstreamCH4_CO2e_g : 0,
    },
    {
      stage: "Processing",
      co2_g: includeWTW ? processingCO2_g : 0,
      ch4_co2e_g: 0,
    },
    {
      stage: "Liquefaction",
      co2_g: includeWTW ? liquefactionCO2_g : 0,
      ch4_co2e_g: 0,
    },
    {
      stage: "Shipping (CO₂)",
      co2_g: includeWTW ? shippingCO2_g : 0,
      ch4_co2e_g: 0,
    },
    {
      stage: "Shipping slip (CH₄)",
      co2_g: 0,
      ch4_co2e_g: includeWTW ? shippingCH4_CO2e_g : 0,
    },
    {
      stage: "Regasification",
      co2_g: includeWTW ? regasCO2_g : 0,
      ch4_co2e_g: 0,
    },
    {
      stage: "Combustion (CO₂)",
      co2_g: includeTTW ? combustionCO2_g : 0,
      ch4_co2e_g: 0,
    },
  ];

  const total_gCO2e = breakdown.reduce(
    (acc, d) => acc + d.co2_g + d.ch4_co2e_g,
    0
  );

  const shippingTotal =
    (includeWTW ? shippingCO2_g + shippingCH4_CO2e_g : 0);

  const shippingSharePct =
    total_gCO2e > 0 ? (shippingTotal / total_gCO2e) * 100 : 0;

  // Convert to per-kWh only in WTWIRE mode; otherwise return null for delta.
  let deltaVsCoal_gPerKWh = null;
  let unitHint = "Scenario unit = 1,000 MJ delivered fuel energy";

  if (boundary === "WTWIRE") {
    const eff = clamp(plantEfficiencyPct, 10, 75) / 100;
    // kWh from 1000 MJ fuel = (MJ * eff) / 3.6
    const kWh = (deliveredMJ * eff) / 3.6;
    const gPerKWh = total_gCO2e / kWh;
    deltaVsCoal_gPerKWh = gPerKWh - coalBaseline_gPerKWh;
    unitHint = `Converted using plant efficiency (${plantEfficiencyPct}%) → gCO₂e/kWh`;
  }

  return {
    total_gCO2e,
    breakdown,
    shippingSharePct,
    deltaVsCoal_gPerKWh,
    unitHint,
  };
}

export function computeHeatmapGrid({
  gwp,
  corridorNm,
  engineDefaults, // {shippingRatePer1000nm}
  processEnergy,
  plantEfficiencyPct,
  coalBaseline_gPerKWh,
  ranges,
}) {
  const lx = ranges.leakagePct;
  const sy = ranges.slipPct;

  const grid = [];
  for (let j = 0; j < sy.steps; j++) {
    const slipPct = sy.min + (j * (sy.max - sy.min)) / (sy.steps - 1);
    const row = [];
    for (let i = 0; i < lx.steps; i++) {
      const leakPct = lx.min + (i * (lx.max - lx.min)) / (lx.steps - 1);

      const scenario = computeScenario({
        boundary: "WTWIRE",
        gwp,
        corridor: { distanceNm: corridorNm },
        engine: {
          methaneSlipPct: slipPct,
          shippingRatePer1000nm: engineDefaults.shippingRatePer1000nm,
        },
        upstreamLeakPct: leakPct,
        processEnergy,
        plantEfficiencyPct,
        coalBaseline_gPerKWh,
      });

      row.push(scenario.deltaVsCoal_gPerKWh ?? 0);
    }
    grid.push(row);
  }

  return {
    leakage: lx,
    slip: sy,
    values: grid,
    coalBaseline_gPerKWh,
    gwpLabel: gwp.label,
  };
}

export function coalComparatorLabel(boundary) {
  if (boundary === "WTWIRE") return "Δ vs coal baseline";
  return "Δ vs coal baseline";
}
