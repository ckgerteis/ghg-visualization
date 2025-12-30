# The Other Greenhouse Gases

An interactive visualization exploring methane (CH₄) and nitrous oxide (N₂O) — the accelerating crisis beyond CO₂.

## Live Demo

🌐 **[View Live Website](https://ckgerteis.github.io/ghg-visualization/)**

The site is available at: `https://ckgerteis.github.io/ghg-visualization/`

## Pages

### Main Visualization

🔗 **[Main Page](https://ckgerteis.github.io/ghg-visualization/)** - Interactive exploration of greenhouse gas trends and their climate impact:

- **The Three Gases**: Compare percentage increases of CO₂, CH₄, and N₂O since pre-industrial times
- **Methane Crisis**: Deep dive into the post-2007 methane surge
- **N₂O Problem**: The fertilizer-driven nitrous oxide rise
- **Warming Power**: Global Warming Potential comparisons (20-year vs 100-year)
- **Emission Sources**: Where methane and N₂O come from
- **Agriculture Link**: How food production drives these emissions
- **Climate Impact**: Radiative forcing breakdown

### Maritime Corridors

🔗 **[Maritime Corridors](https://ckgerteis.github.io/ghg-visualization/maritime-corridor.html)** - Well-to-Wake and Well-to-Wire scenario explorer for maritime fuel pathways:

- **Boundary Analysis**: Compare Tank-to-Wake (TTW), Well-to-Wake (WTW), and Well-to-Wire (WTW→Wire) boundaries
- **Break-Even Heatmap**: Interactive visualization showing when LNG becomes competitive with coal power
- **Stage Breakdown**: Detailed GHG emissions by fuel cycle stage (upstream, shipping, combustion, power plant)
- **Scenario Controls**: Adjust key parameters like methane slip, upstream leakage, GWP horizon, and corridor distance
- **Multiple Corridors**: Pre-configured routes including Qatar→South Korea, US Gulf→Japan, and Australia→China

### References

🔗 **[Full Reference List](https://ckgerteis.github.io/ghg-visualization/references.html)** - Complete bibliography with links to all data sources

## Data Sources

All data is sourced from peer-reviewed scientific literature and authoritative institutions:

- **NOAA Global Monitoring Laboratory** — Atmospheric concentration measurements
- **IPCC AR6** — Global Warming Potential values
- **Global Carbon Project** — Emission budgets
- **FAO/FAOSTAT** — Agricultural data
- **Climate & Clean Air Coalition / UNEP** — Source breakdowns

See the [full reference list](https://ckgerteis.github.io/ghg-visualization/references.html) for detailed citations and links to original sources.

---

## Development

### Local Development
```bash
npm install
npm run dev
```
The development server will start at `http://localhost:5173/ghg-visualization/`

### Build & Deploy
```bash
npm run build      # Build for production
npm run preview    # Preview production build
npm run deploy     # Deploy to GitHub Pages
```

---

Data visualizations created for educational purposes. All underlying data is from public sources cited in the [reference list](https://ckgerteis.github.io/ghg-visualization/references.html).

## Credits

Built with React, Recharts, and Tailwind CSS.
