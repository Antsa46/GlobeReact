import React from "react";

/** Joet & järvet -asetukset */
export default function WaterSection({
  riverWidthFactor, setRiverWidthFactor,
  riverNarrowUI, setRiverNarrowUI,
  riverSharpness, setRiverSharpness,
  riverMix, setRiverMix,
  lakeErodePx, setLakeErodePx,
  lakeMix, setLakeMix,
  inlandCap, setInlandCap,
}) {
  return (
    <>
      {/* Paneelin otsikko tulee SidePanelista */}
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
    </>
  );
}
