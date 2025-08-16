// src/components/controls/WaterControls.jsx
import React from "react";
import "../../styles/panel.css";

export default function WaterControls({
  open, setOpen,

  // Mask builder
  riverWidthFactor, setRiverWidthFactor,
  lakeErodePx, setLakeErodePx,
  inlandCap, setInlandCap,

  // Shader
  riverNarrowUI, setRiverNarrowUI, // 0..10
  riverSharpness, setRiverSharpness,
  riverMix, setRiverMix,
  lakeMix, setLakeMix,
}) {
  return (
    <>
      <button className="panel-toggle" onClick={()=>setOpen(o=>!o)}>⚙</button>
      <aside className={`slide-over ${open ? "open" : ""}`}>
        <div className="slide-over__header">
          <h3 style={{margin:0}}>Joet & järvet</h3>
        </div>
        <div className="slide-over__body">

          <div className="ctrl">
            <label>Joen perusleveys</label>
            <input
              type="range" min={0.02} max={2.0} step={0.01}
              value={riverWidthFactor}
              onChange={(e)=>setRiverWidthFactor(+e.target.value)}
            />
            <span>{riverWidthFactor.toFixed(2)}×</span>
          </div>

          <div className="ctrl">
            <label>Joen kavennus (shader)</label>
            <input
              type="range" min={0} max={10} step={1}
              value={riverNarrowUI}
              onChange={(e)=>setRiverNarrowUI(+e.target.value)}
            />
            <span>{riverNarrowUI}</span>
          </div>

          <div className="ctrl">
            <label>Joen terävyys (shader)</label>
            <input
              type="range" min={0.6} max={6.0} step={0.1}
              value={riverSharpness}
              onChange={(e)=>setRiverSharpness(+e.target.value)}
            />
            <span>{riverSharpness.toFixed(1)}</span>
          </div>

          <div className="ctrl">
            <label>Joen vaaleus (shader)</label>
            <input
              type="range" min={0.00} max={1.00} step={0.01}
              value={riverMix}
              onChange={(e)=>setRiverMix(+e.target.value)}
            />
            <span>{riverMix.toFixed(2)}</span>
          </div>

          <div className="ctrl">
            <label>Järvien reunakutistus (px @4096)</label>
            <input
              type="range" min={0.0} max={3.0} step={0.1}
              value={lakeErodePx}
              onChange={(e)=>setLakeErodePx(+e.target.value)}
            />
            <span>{lakeErodePx.toFixed(1)} px</span>
          </div>

          <div className="ctrl">
            <label>Järvien vaaleus (shader)</label>
            <input
              type="range" min={0.00} max={1.00} step={0.01}
              value={lakeMix}
              onChange={(e)=>setLakeMix(+e.target.value)}
            />
            <span>{lakeMix.toFixed(2)}</span>
          </div>

          <div className="ctrl">
            <label>Järvien inlandCap (m)</label>
            <input
              type="range" min={0} max={4000} step={25}
              value={inlandCap}
              onChange={(e)=>setInlandCap(+e.target.value)}
            />
            <span>{inlandCap} m</span>
          </div>

        </div>
      </aside>
    </>
  );
}
