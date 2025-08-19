import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "../globe/Globe.jsx";
import ZoomHUD from "./hud/ZoomHUD.jsx";

export default function GlobeCanvas(props) {
  const { autoSpin, ...globeProps } = props;

  // ZoomHUD tarvitsee viitteen OrbitControls-olioon
  const controlsRef = useRef(null);

  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        {/* tausta */}
        <color attach="background" args={["#0b1220"]} />

        {/* kevyt perusvalo fallback-materiaaleille */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 1.5, 2.0]} intensity={0.6} />

        <Suspense fallback={null}>
          {/* Globen oma autokierto pidetään pois päältä – pyöritämme kameraa */}
          <Globe {...globeProps} autoSpin={false} />
        </Suspense>

        {/* Koko maailman autokierto OrbitControlsilla */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          autoRotate={!!autoSpin}
          autoRotateSpeed={0.25} // säädä makusi mukaan
          // enableZoom
          // minDistance={1.4}
          // maxDistance={4.0}
        />
      </Canvas>

      {/* HUD tarvitsee saman controlsRefin */}
      <ZoomHUD controlsRef={controlsRef} />
    </div>
  );
}
