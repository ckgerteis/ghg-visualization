import React from "react";

const COLORS = {
  co2: "#0f172a",
  ch4: "#b91c1c",
  bg: "#f8fafc",
  border: "#e2e8f0",
};

export default function StageBreakdownBar({ breakdown }) {
  const total = breakdown.reduce((acc, d) => acc + d.co2_g + d.ch4_co2e_g, 0);

  if (!Number.isFinite(total) || total <= 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-slate-600">
        No emissions in current boundary selection.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="w-full rounded-md border overflow-hidden"
        style={{ background: COLORS.bg, borderColor: COLORS.border }}
      >
        <div className="flex w-full h-10">
          {breakdown.map((d, idx) => {
            const co2W = ((d.co2_g || 0) / total) * 100;
            const ch4W = ((d.ch4_co2e_g || 0) / total) * 100;

            return (
              <React.Fragment key={idx}>
                {co2W > 0.2 ? (
                  <div
                    title={`${d.stage}: CO₂ ${(d.co2_g || 0).toFixed(0)} g`}
                    style={{ width: `${co2W}%`, background: COLORS.co2 }}
                  />
                ) : null}
                {ch4W > 0.2 ? (
                  <div
                    title={`${d.stage}: CH₄ (CO₂e) ${(d.ch4_co2e_g || 0).toFixed(
                      0
                    )} g`}
                    style={{ width: `${ch4W}%`, background: COLORS.ch4 }}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {breakdown.map((d, idx) => {
          const co2 = d.co2_g || 0;
          const ch4 = d.ch4_co2e_g || 0;
          const share = ((co2 + ch4) / total) * 100;

          return (
            <div key={idx} className="rounded-md border p-3">
              <div className="text-sm font-medium">{d.stage}</div>
              <div className="text-xs text-slate-600 mt-1">
                Share: {share.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-700 mt-2 flex gap-3">
                <span>
                  <span
                    className="inline-block w-2 h-2 rounded-sm mr-2 align-middle"
                    style={{ background: COLORS.co2 }}
                  />
                  CO₂: {co2.toFixed(0)} g
                </span>
                <span>
                  <span
                    className="inline-block w-2 h-2 rounded-sm mr-2 align-middle"
                    style={{ background: COLORS.ch4 }}
                  />
                  CH₄ (CO₂e): {ch4.toFixed(0)} g
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-600">
        Color key: <span className="font-medium">CO₂</span> (dark) and{" "}
        <span className="font-medium">CH₄ as CO₂e</span> (red).
      </div>
    </div>
  );
}
