import React from "react";
import "../../styles/panel.css";

export default function WaterControls({
  open,
  setOpen,

  // mask builder
  riverWidthFactor, setRiverWidthFactor,
  lakeErodePx, setLakeErodePx,
  inlandCap, setInlandCap,

  // shader
  riverNarrowUI, setRiverNarrowUI,
  riverSharpness, setRiverSharpness,
  riverMix, setRiverMix,
  lakeMix, setLakeMix,

  // borders
  showBorders, setShowBorders,
  borderWidthPx, setBorderWidthPx,
  borderOpacity, setBorderOpacity,

  // lisäosiot (Kaupungit jne.)
  children,
}) {
  return (
    <aside className={`slide-over ${open ? "open" : ""}`}>
      <div className="slide-over__header" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <h2 style={{margin:0}}>Joet & järvet</h2>
        <button onClick={() => setOpen(false)} style={{
          width:36, height:36, borderRadius:10, border:"none",
          background:"rgba(255,255,255,0.12)", color:"#fff", cursor:"pointer"
        }}>✕</button>
      </div>

      <div className="slide-over__body">
        {/* Joet & järvet */}
        <div className="ctrl">
          <div>Joen perusleveys</div>
          <input type="range" min={0.1} max={2.0} step={0.02}
            value={riverWidthFactor}
            onChange={(e)=>setRiverWidthFactor(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{riverWidthFactor.toFixed(2)}×</div>
        </div>

        <div className="ctrl">
          <div>Joen kavennus<br/>(shader)</div>
          <input type="range" min={0} max={6} step={1}
            value={riverNarrowUI}
            onChange={(e)=>setRiverNarrowUI(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{riverNarrowUI}</div>
        </div>

        <div className="ctrl">
          <div>Joen terävyys<br/>(shader)</div>
          <input type="range" min={0.0} max={1.5} step={0.01}
            value={riverSharpness}
            onChange={(e)=>setRiverSharpness(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{riverSharpness.toFixed(2)}</div>
        </div>

        <div className="ctrl">
          <div>Joen vaaleus<br/>(shader)</div>
          <input type="range" min={0.0} max={1.0} step={0.01}
            value={riverMix}
            onChange={(e)=>setRiverMix(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{riverMix.toFixed(2)}</div>
        </div>

        <div className="ctrl">
          <div>Järvien reunakutistus<br/>(px @4096)</div>
          <input type="range" min={0.0} max={3.0} step={0.1}
            value={lakeErodePx}
            onChange={(e)=>setLakeErodePx(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{lakeErodePx.toFixed(1)} px</div>
        </div>

        <div className="ctrl">
          <div>Järvien vaaleus<br/>(shader)</div>
          <input type="range" min={0.0} max={1.0} step={0.01}
            value={lakeMix}
            onChange={(e)=>setLakeMix(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{lakeMix.toFixed(2)}</div>
        </div>

        <div className="ctrl">
          <div>Järvien inlandCap<br/>(m)</div>
          <input type="range" min={0} max={4000} step={50}
            value={inlandCap}
            onChange={(e)=>setInlandCap(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{inlandCap} m</div>
        </div>

        {/* Maiden rajat */}
        <h3 style={{margin:"18px 0 8px 0"}}>Maiden rajat</h3>

        <div className="ctrl">
          <div>Näytä rajat</div>
          <input type="checkbox"
            checked={!!showBorders}
            onChange={(e)=>setShowBorders(e.target.checked)} />
          <div style={{textAlign:"right", opacity:.8}}>{showBorders ? "ON" : "OFF"}</div>
        </div>

        <div className="ctrl">
          <div>Viivan paksuus (px<br/>@4096)</div>
          <input type="range" min={0.0} max={2.0} step={0.1}
            value={borderWidthPx}
            onChange={(e)=>setBorderWidthPx(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{borderWidthPx.toFixed(1)} px</div>
        </div>

        <div className="ctrl">
          <div>Viivan tummuus</div>
          <input type="range" min={0.0} max={1.0} step={0.01}
            value={borderOpacity}
            onChange={(e)=>setBorderOpacity(Number(e.target.value))}/>
          <div style={{textAlign:"right"}}>{borderOpacity.toFixed(2)}</div>
        </div>

        {/* --- tänne lisäosat: Kaupungit jne. --- */}
        {children}
      </div>
    </aside>
  );
}
