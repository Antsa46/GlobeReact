import React from "react";
import "../../styles/panel.css";

export default function CitiesControls({
  showCities, setShowCities,
  minCityPop, setMinCityPop,
  cityColorHex, setCityColorHex,
}) {
  return (
    <>
      <h3 style={{margin:"18px 0 8px 0"}}>Kaupungit</h3>

      <div className="ctrl">
        <div>Näytä kaupungit</div>
        <input
          type="checkbox"
          checked={!!showCities}
          onChange={(e)=>setShowCities(e.target.checked)}
        />
        <div style={{textAlign:"right", opacity:.8}}>{showCities ? "ON" : "OFF"}</div>
      </div>

      <div className="ctrl">
        <div>Min asukasluku<br/>(pisteet)</div>
        <input
          type="range"
          min={1000}
          max={1000000}
          step={1000}
          value={minCityPop}
          onChange={(e)=>setMinCityPop(Number(e.target.value))}
        />
        <div style={{textAlign:"right"}}>{Number(minCityPop).toLocaleString("fi-FI")}</div>
      </div>

      <div className="ctrl">
        <div>Pisteen väri<br/>(RGB)</div>
        <input
          type="color"
          value={cityColorHex}
          onChange={(e)=>setCityColorHex(e.target.value)}
          style={{width:42, height:28, padding:0, border:"none", background:"none"}}
          title={cityColorHex}
        />
        <div style={{textAlign:"right"}}>{cityColorHex.toUpperCase()}</div>
      </div>
    </>
  );
}
