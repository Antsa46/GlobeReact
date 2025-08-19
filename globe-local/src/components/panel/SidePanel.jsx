import React from "react";
import "../../styles/panel.css";

/** Yleinen sivupaneeli: otsikko, sulkunappi ja rullaava sisältö. */
export default function SidePanel({ open, onClose, title, children }) {
  return (
    <aside className={`slide-over ${open ? "open" : ""}`}>
      <div className="slide-over__header" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <h2 style={{margin:0}}>{title}</h2>
        <button onClick={onClose} style={{
          width:36, height:36, borderRadius:10, border:"none",
          background:"rgba(255,255,255,0.12)", color:"#fff", cursor:"pointer"
        }}>✕</button>
      </div>

      <div className="slide-over__body">
        {children}
      </div>
    </aside>
  );
}
