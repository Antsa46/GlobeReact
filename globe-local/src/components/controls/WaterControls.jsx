import React from "react";
import "../../styles/panel.css";

export default function WaterControls({
  open, setOpen,

  // Mask builder
  riverWidthFactor, setRiverWidthFactor,
  lakeErodePx, setLakeErodePx,
  inlandCap, setInlandCap,

  // Shader
  riverNarrowUI, setRiverNarrowUI,
  riverSharpness, setRiverSharpness,
  riverMix, setRiverMix,
  lakeMix, setLakeMix,

  // Borders
  showBorders = false, setShowBorders = () => {},
  borderWidthPx, setBorderWidthPx = () => {},
  borderOpacity, setBorderOpacity = () => {},
}) {
  const safeBorderWidth = Number(borderWidthPx ?? 0.6);
  const safeBorderOpacity = Number(borderOpacity ?? 0.7);

  return (
    <aside className={`slide-over ${open ? "open" : ""}`}>

      <div className="slide-over__header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{margin:0}}>Joet & järvet</h3>
        <button className="panel-toggle" onClick={()=>setOpen(false)}>✕</button>
      </div>

      <div className="slide-over__body">
        {/* Joet */}
        <div className="ctrl">
          <label>Joen perusleveys</label>
          <input type="range" min={0.1} max={2.0} step={0.01}
                 value={riverWidthFactor}
                 onChange={(e)=>setRiverWidthFactor(+e.target.value)} />
          <span>{riverWidthFactor.toFixed(2)}×</span>
        </div>

        <div className="ctrl">
          <label>Joen kavennus (shader)</label>
          <input type="range" min={0} max={6} step={1}
                 value={riverNarrowUI}
                 onChange={(e)=>setRiverNarrowUI(+e.target.value)} />
          <span>{riverNarrowUI}</span>
        </div>

        <div className="ctrl">
          <label>Joen terävyys (shader)</label>
          <input type="range" min={0.6} max={6} step={0.1}
                 value={riverSharpness}
                 onChange={(e)=>setRiverSharpness(+e.target.value)} />
          <span>{riverSharpness.toFixed(1)}</span>
        </div>

        <div className="ctrl">
          <label>Joen vaaleus (shader)</label>
          <input type="range" min={0} max={1} step={0.01}
                 value={riverMix}
                 onChange={(e)=>setRiverMix(+e.target.value)} />
          <span>{riverMix.toFixed(2)}</span>
        </div>

        {/* Järvet */}
        <div className="ctrl">
          <label>Järvien reunakutistus (px @4096)</label>
          <input type="range" min={0} max={2} step={0.1}
                 value={lakeErodePx}
                 onChange={(e)=>setLakeErodePx(+e.target.value)} />
          <span>{lakeErodePx.toFixed(1)} px</span>
        </div>

        <div className="ctrl">
          <label>Järvien vaaleus (shader)</label>
          <input type="range" min={0} max={1} step={0.01}
                 value={lakeMix}
                 onChange={(e)=>setLakeMix(+e.target.value)} />
          <span>{lakeMix.toFixed(2)}</span>
        </div>

        <div className="ctrl">
          <label>Järvien inlandCap (m)</label>
          <input type="range" min={0} max={4000} step={50}
                 value={inlandCap}
                 onChange={(e)=>setInlandCap(+e.target.value)} />
          <span>{inlandCap.toFixed(0)} m</span>
        </div>

        {/* --- Maiden rajat --- */}
        <h3 style={{marginTop:10}}>Maiden rajat</h3>

        <div className="ctrl">
          <label>Näytä rajat</label>
          <input type="checkbox"
                 checked={!!showBorders}
                 onChange={(e)=>setShowBorders(e.target.checked)} />
          <span>{showBorders ? "ON" : "OFF"}</span>
        </div>

        <div className="ctrl">
          <label>Viivan paksuus (px @4096)</label>
          <input type="range" min={0} max={3} step={0.1}
                 value={safeBorderWidth}
                 onChange={(e)=>setBorderWidthPx(+e.target.value)} />
          <span>{safeBorderWidth.toFixed(1)} px</span>
        </div>

        <div className="ctrl">
          <label>Viivan tummuus</label>
          <input type="range" min={0} max={1} step={0.05}
                 value={safeBorderOpacity}
                 onChange={(e)=>setBorderOpacity(+e.target.value)} />
          <span>{safeBorderOpacity.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}
