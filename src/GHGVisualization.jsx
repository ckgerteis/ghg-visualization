import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';

// Historical CO2 data
const co2History = [
  { year: 1750, ppm: 280, era: 'Pre-industrial' },
  { year: 1850, ppm: 285, era: 'Industrial Revolution' },
  { year: 1900, ppm: 296, era: 'Industrial Revolution' },
  { year: 1950, ppm: 311, era: 'Post-WWII Boom' },
  { year: 1980, ppm: 339, era: 'Great Acceleration' },
  { year: 2000, ppm: 369, era: 'Great Acceleration' },
  { year: 2020, ppm: 414, era: 'Current' },
  { year: 2024, ppm: 422, era: 'Current' },
];

// Methane historical data (ppb)
const methaneHistory = [
  { year: 1750, ppb: 722, label: 'Pre-industrial' },
  { year: 1850, ppb: 791, label: 'Early Industrial' },
  { year: 1900, ppb: 879, label: 'Industrial' },
  { year: 1950, ppb: 1100, label: 'Post-WWII' },
  { year: 1980, ppb: 1575, label: 'Acceleration' },
  { year: 1990, ppb: 1714, label: 'Plateau begins' },
  { year: 2000, ppb: 1773, label: 'Plateau' },
  { year: 2007, ppb: 1775, label: 'Plateau ends' },
  { year: 2010, ppb: 1799, label: 'Renewed rise' },
  { year: 2015, ppb: 1834, label: 'Accelerating' },
  { year: 2020, ppb: 1879, label: 'Surge' },
  { year: 2024, ppb: 1934, label: 'Current' },
];

// N2O historical data (ppb)
const n2oHistory = [
  { year: 1750, ppb: 270, label: 'Pre-industrial' },
  { year: 1850, ppb: 275, label: 'Early Industrial' },
  { year: 1900, ppb: 280, label: 'Industrial' },
  { year: 1950, ppb: 290, label: 'Post-WWII' },
  { year: 1980, ppb: 301, label: 'Green Revolution' },
  { year: 1990, ppb: 310, label: 'Fertilizer expansion' },
  { year: 2000, ppb: 316, label: 'Continued rise' },
  { year: 2010, ppb: 323, label: 'Accelerating' },
  { year: 2020, ppb: 333, label: 'Current' },
  { year: 2024, ppb: 337, label: 'Current' },
];

// Combined percentage increase data
const percentIncreaseData = [
  { year: 1750, co2: 0, ch4: 0, n2o: 0 },
  { year: 1850, co2: 1.8, ch4: 9.6, n2o: 1.9 },
  { year: 1900, co2: 5.7, ch4: 21.7, n2o: 3.7 },
  { year: 1950, co2: 11.1, ch4: 52.4, n2o: 7.4 },
  { year: 1980, co2: 21.1, ch4: 118.1, n2o: 11.5 },
  { year: 2000, co2: 31.8, ch4: 145.6, n2o: 17.0 },
  { year: 2024, co2: 50.7, ch4: 167.9, n2o: 24.8 },
];

// Methane sources
const methaneSources = [
  { name: 'Livestock (enteric)', value: 27, color: '#8b4513' },
  { name: 'Oil & Gas', value: 24, color: '#1d3557' },
  { name: 'Landfills & Waste', value: 16, color: '#6b705c' },
  { name: 'Rice Cultivation', value: 10, color: '#a7c957' },
  { name: 'Coal Mining', value: 9, color: '#343a40' },
  { name: 'Manure Management', value: 5, color: '#bc6c25' },
  { name: 'Biomass Burning', value: 4, color: '#e76f51' },
  { name: 'Other', value: 5, color: '#adb5bd' },
];

// N2O sources
const n2oSources = [
  { name: 'Agricultural Soils', value: 57, color: '#606c38' },
  { name: 'Livestock Manure', value: 13, color: '#8b4513' },
  { name: 'Biomass Burning', value: 8, color: '#e76f51' },
  { name: 'Industry', value: 7, color: '#457b9d' },
  { name: 'Fossil Fuel Combustion', value: 6, color: '#1d3557' },
  { name: 'Wastewater', value: 5, color: '#2a9d8f' },
  { name: 'Other', value: 4, color: '#adb5bd' },
];

// Global Warming Potential comparison
const gwpData = [
  { gas: 'CO₂', gwp20: 1, gwp100: 1, lifetime: '300-1000', color: '#1d3557' },
  { gas: 'Methane', gwp20: 80, gwp100: 28, lifetime: '12', color: '#e9c46a' },
  { gas: 'N₂O', gwp20: 273, gwp100: 265, lifetime: '121', color: '#f4a261' },
];

// Recent methane surge data (annual growth rate)
const methaneGrowthRate = [
  { year: 2000, rate: 0.8 },
  { year: 2005, rate: 0.2 },
  { year: 2007, rate: 0.5 },
  { year: 2010, rate: 5.1 },
  { year: 2012, rate: 5.8 },
  { year: 2014, rate: 12.7 },
  { year: 2016, rate: 9.1 },
  { year: 2018, rate: 8.5 },
  { year: 2020, rate: 15.1 },
  { year: 2021, rate: 18.3 },
  { year: 2022, rate: 14.0 },
  { year: 2023, rate: 10.9 },
];

// Radiative forcing contribution
const forcingData = [
  { gas: 'CO₂', forcing: 2.16, percent: 66, color: '#1d3557' },
  { gas: 'CH₄', forcing: 0.54, percent: 16, color: '#e9c46a' },
  { gas: 'N₂O', forcing: 0.21, percent: 6, color: '#f4a261' },
  { gas: 'Halocarbons', forcing: 0.41, percent: 12, color: '#e63946' },
];

// Agriculture's growing footprint
const agricultureGrowth = [
  { year: 1960, fertilizer: 27, livestock: 2500 },
  { year: 1970, fertilizer: 46, livestock: 2900 },
  { year: 1980, fertilizer: 78, livestock: 3400 },
  { year: 1990, fertilizer: 85, livestock: 3800 },
  { year: 2000, fertilizer: 89, livestock: 4200 },
  { year: 2010, fertilizer: 108, livestock: 4700 },
  { year: 2020, fertilizer: 115, livestock: 5000 },
];

const GHGVisualization = () => {
  const [activeView, setActiveView] = useState('threegas');

  const views = [
    { id: 'threegas', label: 'The Three Gases' },
    { id: 'methane', label: 'Methane Crisis' },
    { id: 'n2o', label: 'N₂O Problem' },
    { id: 'gwp', label: 'Warming Power' },
    { id: 'sources', label: 'Where They Come From' },
    { id: 'agriculture', label: 'Agriculture Link' },
    { id: 'forcing', label: 'Climate Impact' },
  ];

  const renderThreeGas = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">Percentage increase from pre-industrial levels</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={percentIncreaseData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: '% increase', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value, name) => {
            const labels = { co2: 'CO₂', ch4: 'Methane', n2o: 'N₂O' };
            return [`+${value.toFixed(1)}%`, labels[name]];
          }} />
          <Legend formatter={(value) => {
            const labels = { co2: 'CO₂', ch4: 'Methane (CH₄)', n2o: 'Nitrous Oxide (N₂O)' };
            return labels[value];
          }} />
          <Line type="monotone" dataKey="co2" stroke="#1d3557" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="ch4" stroke="#e9c46a" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="n2o" stroke="#f4a261" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
          <div className="text-3xl font-bold text-blue-700">+51%</div>
          <div className="text-sm text-blue-600 font-medium">CO₂</div>
          <div className="text-xs text-blue-500 mt-1">280 → 422 ppm</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center border-2 border-yellow-400">
          <div className="text-3xl font-bold text-yellow-700">+168%</div>
          <div className="text-sm text-yellow-600 font-medium">Methane</div>
          <div className="text-xs text-yellow-500 mt-1">722 → 1934 ppb</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center border-2 border-orange-300">
          <div className="text-3xl font-bold text-orange-700">+25%</div>
          <div className="text-sm text-orange-600 font-medium">N₂O</div>
          <div className="text-xs text-orange-500 mt-1">270 → 337 ppb</div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
        <p className="text-sm text-amber-800">
          <strong>The overlooked crisis:</strong> While CO₂ dominates public attention, methane has nearly <em>tripled</em> since pre-industrial times. 
          Both CH₄ and N₂O are accelerating, driven primarily by agriculture and fossil fuel systems.
        </p>
      </div>
    </div>
  );

  const renderMethane = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-yellow-600">1,934 ppb</div>
        <div className="text-gray-600 mt-1">Current atmospheric methane</div>
        <div className="text-sm text-gray-500">168% above pre-industrial (722 ppb)</div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={methaneHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[600, 2100]} label={{ value: 'ppb', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value} ppb`, 'CH₄']} />
          <defs>
            <linearGradient id="methaneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e9c46a" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#e9c46a" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="ppb" stroke="#d4a017" fill="url(#methaneGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-800 font-medium">The Post-2007 Surge</p>
        <p className="text-sm text-red-700 mt-1">
          After a decade of stabilization (1999–2006), methane began rising again—and is now accelerating. 
          2020–2021 saw the largest annual increases since records began.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2 font-medium">Annual growth rate (ppb/year)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={methaneGrowthRate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis label={{ value: 'ppb/yr', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip formatter={(value) => [`${value} ppb/year`, 'Growth']} />
            <Bar dataKey="rate" fill="#e9c46a">
              {methaneGrowthRate.map((entry, index) => (
                <Cell key={index} fill={entry.rate > 10 ? '#e63946' : '#e9c46a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-4">
        <p className="text-sm text-gray-700">
          <strong>Why it matters:</strong> Methane's 12-year atmospheric lifetime makes it a high-leverage target. 
          Rapid CH₄ cuts could slow near-term warming faster than any CO₂ intervention—but emissions are going the wrong direction.
        </p>
      </div>
    </div>
  );

  const renderN2O = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-orange-600">337 ppb</div>
        <div className="text-gray-600 mt-1">Current atmospheric nitrous oxide</div>
        <div className="text-sm text-gray-500">25% above pre-industrial (270 ppb)</div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={n2oHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[260, 350]} label={{ value: 'ppb', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value} ppb`, 'N₂O']} />
          <defs>
            <linearGradient id="n2oGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f4a261" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f4a261" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="ppb" stroke="#e76f51" fill="url(#n2oGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-700">265×</div>
          <div className="text-sm text-orange-600">More potent than CO₂</div>
          <div className="text-xs text-orange-500">(100-year GWP)</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-700">121 years</div>
          <div className="text-sm text-orange-600">Atmospheric lifetime</div>
          <div className="text-xs text-orange-500">(long-lasting impact)</div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
        <p className="text-sm text-amber-800 font-medium">The Fertilizer Problem</p>
        <p className="text-sm text-amber-700 mt-1">
          57% of anthropogenic N₂O comes from agricultural soils—primarily synthetic nitrogen fertilizers. 
          Global fertilizer use has increased 8× since 1960, and continues rising.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-800">
          <strong>The acceleration:</strong> N₂O growth rate has increased 30% since 1980. 
          Unlike methane, there's no "plateau" period—emissions track directly with agricultural intensification.
        </p>
      </div>
    </div>
  );

  const renderGWP = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">Global Warming Potential: How much heat each gas traps relative to CO₂</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {gwpData.map((gas) => (
          <div key={gas.gas} className="p-4 rounded-lg text-center" style={{ backgroundColor: `${gas.color}15`, borderLeft: `4px solid ${gas.color}` }}>
            <div className="text-lg font-bold" style={{ color: gas.color }}>{gas.gas}</div>
            <div className="mt-3">
              <div className="text-3xl font-bold" style={{ color: gas.color }}>{gas.gwp20}×</div>
              <div className="text-xs text-gray-500">20-year GWP</div>
            </div>
            <div className="mt-2">
              <div className="text-xl font-semibold text-gray-600">{gas.gwp100}×</div>
              <div className="text-xs text-gray-500">100-year GWP</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Lifetime: {gas.lifetime} years
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <p className="text-sm text-yellow-800 font-medium">Methane's Short-Term Punch</p>
        <p className="text-sm text-yellow-700 mt-1">
          Over 20 years, methane traps <strong>80× more heat</strong> than CO₂. Its short lifetime (12 years) means 
          cutting methane now delivers rapid cooling benefits—the fastest lever we have.
        </p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
        <p className="text-sm text-orange-800 font-medium">N₂O's Long Shadow</p>
        <p className="text-sm text-orange-700 mt-1">
          N₂O is <strong>265× more potent than CO₂</strong> and persists for over a century. 
          Unlike methane, its warming effect doesn't fade quickly—emissions today warm the planet until the 2140s.
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mt-4">
        <p className="text-sm text-gray-700">
          <strong>Why GWP matters:</strong> When we convert all gases to "CO₂-equivalent," methane and N₂O together 
          contribute ~22% of current radiative forcing—a share that's growing as their emissions accelerate while CO₂ growth slows in some regions.
        </p>
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Methane Sources */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 text-center mb-2">Methane Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={methaneSources}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {methaneSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 text-xs mt-2">
            {methaneSources.map((s) => (
              <div key={s.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: s.color }}></div>
                <span className="truncate">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* N2O Sources */}
        <div>
          <h3 className="text-lg font-bold text-orange-700 text-center mb-2">N₂O Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={n2oSources}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {n2oSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 text-xs mt-2">
            {n2oSources.map((s) => (
              <div key={s.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: s.color }}></div>
                <span className="truncate">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
        <p className="text-sm text-amber-800 font-medium">The Common Thread: Agriculture & Fossil Fuels</p>
        <p className="text-sm text-amber-700 mt-1">
          <strong>Methane:</strong> ~60% from agriculture (livestock, rice, manure) + ~33% from fossil fuels (oil, gas, coal)<br/>
          <strong>N₂O:</strong> ~75% from agriculture (fertilizers, manure, soil management)
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Policy implications:</strong> Reducing these gases requires fundamentally different interventions than decarbonizing energy. 
          Methane leaks from oil/gas infrastructure are low-hanging fruit; agricultural emissions require systemic changes to food systems.
        </p>
      </div>
    </div>
  );

  const renderAgriculture = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">The agricultural drivers of CH₄ and N₂O</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={agricultureGrowth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis yAxisId="left" label={{ value: 'Fertilizer (Mt N/yr)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Livestock (millions)', angle: 90, position: 'insideRight', fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="fertilizer" name="Synthetic N fertilizer" fill="#f4a261" />
          <Line yAxisId="right" type="monotone" dataKey="livestock" name="Global livestock" stroke="#8b4513" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
          <div className="text-2xl font-bold text-orange-700">8×</div>
          <div className="text-sm text-orange-600">Increase in synthetic nitrogen fertilizer since 1960</div>
          <div className="text-xs text-orange-500 mt-2">→ Primary driver of N₂O emissions</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
          <div className="text-2xl font-bold text-yellow-700">2×</div>
          <div className="text-sm text-yellow-600">Increase in global livestock since 1960</div>
          <div className="text-xs text-yellow-500 mt-2">→ Primary driver of CH₄ emissions</div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 p-4 mt-4">
        <p className="text-sm text-green-800 font-medium">The Green Revolution's Shadow</p>
        <p className="text-sm text-green-700 mt-1">
          Post-1960 agricultural intensification fed billions—but locked in rising CH₄ and N₂O emissions. 
          Nitrogen use efficiency remains low: only ~50% of applied fertilizer is taken up by crops. The rest escapes as N₂O, pollutes waterways, or volatilizes.
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>The challenge:</strong> Food security and emissions reduction seem to conflict. Potential solutions include 
          precision agriculture, nitrification inhibitors, reduced meat consumption, and methane-reducing feed additives—but none are scaling fast enough.
        </p>
      </div>
    </div>
  );

  const renderForcing = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">Radiative forcing: how much each gas is warming the planet (W/m²)</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={forcingData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 2.5]} />
          <YAxis type="category" dataKey="gas" width={80} />
          <Tooltip formatter={(value) => [`${value} W/m²`, 'Forcing']} />
          <Bar dataKey="forcing">
            {forcingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {forcingData.map((gas) => (
          <div key={gas.gas} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${gas.color}20` }}>
            <div className="text-xl font-bold" style={{ color: gas.color }}>{gas.percent}%</div>
            <div className="text-xs text-gray-600">{gas.gas}</div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
        <p className="text-sm text-blue-800">
          <strong>Total forcing:</strong> ~3.3 W/m² above pre-industrial. CO₂ dominates (66%), but CH₄ + N₂O together 
          contribute 22%—and their share is <em>growing</em> as their emissions accelerate while CO₂ growth slows in some regions.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-800 font-medium">The "Hidden Third" of Climate Change</p>
        <p className="text-sm text-red-700 mt-1">
          Methane and N₂O receive a fraction of the policy attention that CO₂ does—yet they're responsible for 
          over a fifth of current warming. Addressing them is essential to staying below 1.5°C.
        </p>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'threegas': return renderThreeGas();
      case 'methane': return renderMethane();
      case 'n2o': return renderN2O();
      case 'gwp': return renderGWP();
      case 'sources': return renderSources();
      case 'agriculture': return renderAgriculture();
      case 'forcing': return renderForcing();
      default: return renderThreeGas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
                The Other Greenhouse Gases
              </h1>
              <p className="text-gray-500 text-center mb-2 text-sm">
                Methane & Nitrous Oxide: The accelerating crisis beyond CO₂
              </p>
            </div>
            <a 
              href="/references.html"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              📚 References
            </a>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-4">
            {renderView()}
          </div>
        </div>

        {/* Key stats footer */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">+168%</div>
            <div className="text-xs text-gray-500">Methane since 1750</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-orange-600">+25%</div>
            <div className="text-xs text-gray-500">N₂O since 1750</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-red-600">22%</div>
            <div className="text-xs text-gray-500">Share of warming</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">~75%</div>
            <div className="text-xs text-gray-500">From agriculture</div>
          </div>
        </div>

        {/* References footer link */}
        <div className="mt-4 text-center">
          <a 
            href="/references.html"
            className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all data sources and references →
          </a>
        </div>
      </div>
    </div>
  );
};

export default GHGVisualization;
