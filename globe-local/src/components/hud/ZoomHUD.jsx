import React from "react";
import "../../styles/hud.css";

/**
 * Kevyt overlay, joka näyttää zoom-etäisyyden.
 * Ei käytä R3F-hookeja -> voidaan piirtää Canvasin ulkopuolelle.
 */
export default function ZoomHUD({ controlsRef }) {
  const [dist, setDist] = React.useState(null);

  React.useEffect(() => {
    let raf;
    const tick = () => {
      const d = controlsRef.current?.getDistance?.();
      if (typeof d === "number") setDist(d);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [controlsRef]);

  return (
    <div className="zoom-hud">
      {dist == null ? "Zoom: —" : `Zoom: ${dist.toFixed(2)}`}
    </div>
  );
}
