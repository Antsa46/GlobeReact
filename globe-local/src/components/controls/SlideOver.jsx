import React from "react";
import "../../styles/panel.css";

export default function SlideOver({ open, onClose, title = "Säädöt", children }) {
  return (
    <>
      <button className="panel-toggle" onClick={onClose ? onClose : () => {}}>
        {/* nappi näkyy aina – klikkaus avaa/ sulkee App.jsx:stä */}
        ⚙
      </button>

      <div className={`slide-over ${open ? "open" : ""}`}>
        <div className="slide-over__header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <strong>{title}</strong>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#eaf2ff",fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        <div className="slide-over__body">
          {children}
        </div>
      </div>
    </>
  );
}
