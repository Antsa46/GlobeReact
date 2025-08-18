import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "../globe/Globe.jsx";

export default function GlobeCanvas(props) {
  const {
    z, seaLevel, exaggeration, autoSpin, realSunEnabled, dateForSun,
    riverWidthFactor, lakeErodePx, inlandCap,
    riverNarrow, riverSharpness, riverMix, lakeMix,
    showBorders, borderWidthPx, borderOpacity,
    showCities, minCityPop, cityColorHex,
  } = props;

  return (
    <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} />

      <Globe
        z={z}
        seaLevel={seaLevel}
        exaggeration={exaggeration}
        autoSpin={autoSpin}
        realSunEnabled={realSunEnabled}
        dateForSun={dateForSun}
        riverWidthFactor={riverWidthFactor}
        lakeErodePx={lakeErodePx}
        inlandCap={inlandCap}
        riverNarrow={riverNarrow}
        riverSharpness={riverSharpness}
        riverMix={riverMix}
        lakeMix={lakeMix}
        showBorders={showBorders}
        borderWidthPx={borderWidthPx}
        borderOpacity={borderOpacity}
        // kaupungit
        showCities={showCities}
        minCityPop={minCityPop}
        cityColorHex={cityColorHex}
      />

      <OrbitControls enableDamping dampingFactor={0.08} autoRotate={false} />
    </Canvas>
  );
}
