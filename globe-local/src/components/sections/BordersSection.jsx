import React from "react";

/** Maiden rajat -asetukset */
export default function BordersSection({
  showBorders, setShowBorders,
  borderWidthPx, setBorderWidthPx,
  borderOpacity, setBorderOpacity,
}) {
  return (
    <>
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
    </>
  );
}
