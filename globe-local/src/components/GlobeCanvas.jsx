import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "../globe/Globe.jsx";
import ZoomHUD from "./hud/ZoomHUD.jsx";
import SiteFooter from "./hud/SiteFooter.jsx";
import CountryInfoFeature from "../features/CountryInfoFeature.jsx";

export default function GlobeCanvas(props) {
  const { autoSpin, ...globeProps } = props;
  const controlsRef = useRef(null);
  const globeRef = useRef(null);

  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        {/* tausta */}
        <color attach="background" args={["#0b1220"]} />

        {/* perusvalot */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 1.5, 2.0]} intensity={0.6} />

        <Suspense fallback={null}>
          {/* Pallo pyörii (autospin Globe-komponentissa), kamera ei */}
          <Globe ref={globeRef} {...globeProps} autoSpin={autoSpin} />
        </Suspense>

        {/* Maa-info (3 s paikallaan) */}
        <CountryInfoFeature holdMs={3000} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          autoRotate={false}          // kamera ei pyöri automaattisesti
          enableZoom                   // zoom päälle (jos ei ollut)
          minDistance={1.14}           // lähin sallittu zoom
          maxDistance={10}             // kaukaisin sallittu zoom
        />
      </Canvas>

      {/* HUDit Canvasin päällä */}
      <ZoomHUD controlsRef={controlsRef} />
      <SiteFooter />
    </div>
  );
}
