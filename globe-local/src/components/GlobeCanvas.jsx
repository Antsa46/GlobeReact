import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "../globe/Globe";

function UseNorthUp({ controlsRef }) {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.up.set(0, 1, 0);
    camera.position.set(0, 0, 2.4);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.reset();
  }, []);
  return null;
}

export default function GlobeCanvas(props) {
  const controlsRef = useRef(null);

  return (
    <Canvas
      dpr={[1, 1]}
      camera={{ position: [0, 0, 2.4], fov: 45 }}
      gl={({ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace })}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.12; }}
    >
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={props.realSunEnabled ? 0.28 : 0.75} />
      <hemisphereLight args={[0xbfd7ff, 0x0b1220, props.realSunEnabled ? 0.30 : 0.5]} />
      {props.realSunEnabled && <directionalLight position={[3, 2, 1]} intensity={1.3} />}

      <Globe
  {...props}
        showBorders={props.showBorders}
        borderWidthPx={props.borderWidthPx}
        borderOpacity={props.borderOpacity}
/>


      <OrbitControls
        ref={controlsRef}
        enablePan
        enableRotate
        enableZoom
        autoRotate={props.autoSpin}              // ← auto-kierto UI:sta
        autoRotateSpeed={0.35}                   // maltillinen nopeus
        minDistance={0.9}
        maxDistance={10}
        rotateSpeed={0.7}
        panSpeed={0.6}
        zoomSpeed={0.9}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <UseNorthUp controlsRef={controlsRef} />
    </Canvas>
  );
}
