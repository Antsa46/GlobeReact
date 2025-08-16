import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "../globe/Globe";
import ZoomHUD from "./hud/ZoomHUD";

function UseNorthUp({ controlsRef }) {
  // ei R3F-hookkeja täällä; tämän voi jättää jos käytössä on useThree, muuten poista
  return null;
}

export default function GlobeCanvas(props){
  const controlsRef = useRef(null);

  return (
    <div className="canvas-wrap">
      <Canvas
        dpr={[1,1]}
        camera={{ position:[0,0,2.4], fov:45 }}
        gl={({ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace })}
        onCreated={({ gl }) => { gl.toneMappingExposure = 1.12; }}
      >
        <color attach="background" args={["#0b1220"]} />
        <ambientLight intensity={props.realSunEnabled ? 0.28 : 0.75} />
        <hemisphereLight args={[0xbfd7ff, 0x0b1220, props.realSunEnabled ? 0.30 : 0.5]} />
        {props.realSunEnabled && <directionalLight position={[3,2,1]} intensity={1.3} />}

        <Globe {...props} />

        <OrbitControls
          ref={controlsRef}
          enablePan enableRotate enableZoom
          autoRotate={false}
          minDistance={1.0}
          maxDistance={4.0}   // -> jos “mennee askeleen liian pitkälle”, pienennä esim. 3.5
          rotateSpeed={0.7} panSpeed={0.6} zoomSpeed={0.9}
          mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />
        {/* Jos käytät UseNorthUp:ia jossa on useThree, pidä se Canvasin sisällä */}
        {/* <UseNorthUp controlsRef={controlsRef} /> */}
      </Canvas>

      {/* HUD ulkopuolelle – ei R3F-hookkeja */}
      <ZoomHUD controlsRef={controlsRef} />
    </div>
  );
}
