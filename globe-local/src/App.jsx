import React, { useMemo, useState } from "react";
import GlobeCanvas from "./components/GlobeCanvas";
import SidePanel from "./components/panel/SidePanel.jsx";
import WaterSection from "./components/sections/WaterSection.jsx";
import BordersSection from "./components/sections/BordersSection.jsx";
import CitiesSection from "./components/sections/CitiesSection.jsx";
import "./styles/App.css";
import "./styles/panel.css";

export default function App() {
  const [z, setZ] = useState(2);
  const [sea, setSea] = useState(0);
  const [exag, setExag] = useState(30);
  const [auto, setAuto] = useState(false);
  const [realSun, setRealSun] = useState(false);

  const [dateStr, setDateStr] = useState(() => {
    const d = new Date(); const pad = n => String(n).padStart(2,"0");
    return `${pad(d.getUTCDate())} / ${pad(d.getUTCMonth()+1)} / ${d.getUTCFullYear()}`;
  });
  const dateForSun = useMemo(() => {
    const m = dateStr.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d{4})/);
    let d = new Date();
    if (m) d = new Date(Date.UTC(+m[3], +m[2]-1, +m[1], 12, 0, 0));
    return d;
  }, [dateStr]);

  const [panelOpen, setPanelOpen] = useState(false);

  // Mask builder
  const [riverWidthFactor, setRiverWidthFactor] = useState(0.2);
  const [lakeErodePx, setLakeErodePx] = useState(0.6);
  const [inlandCap, setInlandCap] = useState(2000);

  // Shader
  const [riverNarrowUI, setRiverNarrowUI] = useState(6);
  const riverNarrow = useMemo(() => {
    const t = Math.max(0, Math.min(6, riverNarrowUI)) / 6;
    return (1 - t) * (+0.30) + t * (-0.30);
  }, [riverNarrowUI]);
  const [riverSharpness, setRiverSharpness] = useState(1.0);
  const [riverMix, setRiverMix] = useState(0.12);
  const [lakeMix, setLakeMix] = useState(0.35);

  // Borders
  const [showBorders, setShowBorders] = useState(false);
  const [borderWidthPx, setBorderWidthPx] = useState(0.6);
  const [borderOpacity, setBorderOpacity] = useState(0.7);

  // Cities
  const [showCities, setShowCities] = useState(true);
  const [minCityPop, setMinCityPop] = useState(1000);
  const [cityColorHex, setCityColorHex] = useState("#ffffff");

  return (
    <div style={{ height:"100vh", background:"#0b1220", color:"#fff" }}>
      {/* yläpalkki */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:10, padding:"8px 12px",
        display:"flex", gap:12, alignItems:"center", flexWrap:"wrap",
        background:"rgba(11,18,32,0.85)", backdropFilter:"blur(6px)" }}>
        <strong>Tellus</strong>

        <label>Laatu:</label>
        <select value={z} onChange={(e)=>setZ(+e.target.value)}>
          <option value={1}>z=1 (512×256)</option>
          <option value={2}>z=2 (1024×512)</option>
          <option value={3}>z=3 (2048×1024)</option>
        </select>

        <label style={{marginLeft:8}}>Merenpinta:</label>
        <input type="range" min={-1000} max={1000} value={sea}
               onChange={(e)=>setSea(+e.target.value)} style={{ width: 180 }}/>
        <input type="number" value={sea} onChange={(e)=>setSea(Number(e.target.value))}
               style={{ width: 80 }}/>
        <span>m</span>
        <button onClick={()=>setSea(0)}>Nollaa merenpinta</button>

        <label style={{marginLeft:8}}>Korostus:</label>
        <input type="range" min={5} max={80} value={exag}
               onChange={(e)=>setExag(+e.target.value)} style={{ width: 160 }}/>
        <span>{exag}×</span>

        <button onClick={()=>setAuto(a=>!a)}>{auto ? "Auto-kierto: ON" : "Auto-kierto: OFF"}</button>
        <button onClick={()=>setRealSun(s=>!s)}>{realSun ? "Todellinen aurinko: ON" : "Todellinen aurinko: OFF"}</button>

        <label>Päivä (UTC):</label>
        <input type="text" value={dateStr} onChange={(e)=>setDateStr(e.target.value)}
               style={{ width: 130 }} title="pp / kk / vvvv" />

        <button className="panel-toggle" onClick={()=>setPanelOpen(o=>!o)}>⚙</button>
      </div>
      <div style={{ height: 48 }} />

      {/* Sivupaneeli osioineen */}
      <SidePanel open={panelOpen} onClose={()=>setPanelOpen(false)} title="Joet & järvet">
        <WaterSection
          riverWidthFactor={riverWidthFactor} setRiverWidthFactor={setRiverWidthFactor}
          riverNarrowUI={riverNarrowUI} setRiverNarrowUI={setRiverNarrowUI}
          riverSharpness={riverSharpness} setRiverSharpness={setRiverSharpness}
          riverMix={riverMix} setRiverMix={setRiverMix}
          lakeErodePx={lakeErodePx} setLakeErodePx={setLakeErodePx}
          lakeMix={lakeMix} setLakeMix={setLakeMix}
          inlandCap={inlandCap} setInlandCap={setInlandCap}
        />

        <BordersSection
          showBorders={showBorders} setShowBorders={setShowBorders}
          borderWidthPx={borderWidthPx} setBorderWidthPx={setBorderWidthPx}
          borderOpacity={borderOpacity} setBorderOpacity={setBorderOpacity}
        />

        <CitiesSection
          showCities={showCities} setShowCities={setShowCities}
          minCityPop={minCityPop} setMinCityPop={setMinCityPop}
          cityColorHex={cityColorHex} setCityColorHex={setCityColorHex}
        />
      </SidePanel>

      {/* 3D-kartta */}
      <GlobeCanvas
        z={z}
        seaLevel={sea}
        exaggeration={exag}
        autoSpin={auto}
        realSunEnabled={realSun}
        dateForSun={dateForSun}
        riverWidthFactor={riverWidthFactor}
        lakeErodePx={lakeErodePx}
        inlandCap={inlandCap}
        riverNarrow={useMemo(() => {
          const t = Math.max(0, Math.min(6, riverNarrowUI)) / 6;
          return (1 - t) * (+0.30) + t * (-0.30);
        }, [riverNarrowUI])}
        riverSharpness={riverSharpness}
        riverMix={riverMix}
        lakeMix={lakeMix}
        showBorders={showBorders}
        borderWidthPx={borderWidthPx}
        borderOpacity={borderOpacity}
        // kaupungit
        showCities={showCities}
        minCityPop={minCityPop}
        cityColorHex={cityColorHex}
      />
    </div>
  );
}
