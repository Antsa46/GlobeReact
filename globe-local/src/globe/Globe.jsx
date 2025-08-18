import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import GlobeMaterial from "./GlobeMaterial.jsx";
import { buildTerrariumMosaic } from "../lib/terrain/terrarium.js";
import { buildWaterMaskTexture } from "../lib/water/waterMask.js";
import { buildBordersMaskTexture } from "../lib/borders/bordersMask.js";
import { sunDirectionFromDate } from "../lib/sun/astronomy.js";

const SIDEREAL_DAY = 86164;

export default function Globe({
  z,
  seaLevel,
  exaggeration,
  autoSpin,
  realSunEnabled,
  dateForSun,

  // shader (vesi)
  inlandCap,
  riverNarrow,
  riverSharpness,
  riverMix,
  lakeMix,

  // borders-UI:sta (lisätty WaterControlsiin alla)
  showBorders = false,
  borderWidthPx = 0.8,
  borderOpacity = 0.8,
  borderColor = [0.08, 0.10, 0.13], // tummahko sinertävä oletus

  // mask builder
  riverWidthFactor,
  lakeErodePx,
}) {
  const [terr, setTerr] = useState(null);
  const [maskTex, setMaskTex] = useState(null);
  const [bordersTex, setBordersTex] = useState(null);
  const groupRef = useRef();

  // lataa mosaikki + maskit
  useEffect(() => {
    let alive = true;
    (async () => {
      const t = await buildTerrariumMosaic(z);
      if (!alive) return;
      setTerr(t);

      const water = await buildWaterMaskTexture(t.width, t.height, z, {
        riverWidthFactor,
        lakeErodePx,
      });
      if (!alive) return;
      setMaskTex(water);

      const borders = await buildBordersMaskTexture(t.width, t.height, z, {
        widthPx: borderWidthPx,
        alpha: 1.0,
      });
      if (!alive) return;
      setBordersTex(borders);
    })();
    return () => { alive = false; };
  }, [z, riverWidthFactor, lakeErodePx, borderWidthPx]);

  // varmistus: pyöritetään myös ilman OrbitControlsin autoRotatea
  useFrame((_, delta) => {
    if (autoSpin && groupRef.current) {
      groupRef.current.rotation.y += delta * (2 * Math.PI / SIDEREAL_DAY) * 8000;
    }
  });

  const sunDir = useMemo(
    () => (realSunEnabled ? sunDirectionFromDate(dateForSun) : new THREE.Vector3(1, 0, 0)),
    [realSunEnabled, dateForSun]
  );

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 128, 64]} />
        {terr ? (
          <GlobeMaterial
            terrariumTex={terr.texture}
            waterMaskTex={maskTex}
            bordersTex={bordersTex}
            texelSize={[1 / terr.width, 1 / terr.height]}
            seaLevelMeters={seaLevel}
            exaggeration={exaggeration}
            enableSun={!!realSunEnabled}
            sunDir={sunDir}
            inlandCap={inlandCap}
            riverNarrow={riverNarrow}
            riverSharpness={riverSharpness}
            riverMix={riverMix}
            lakeMix={lakeMix}
            // borders-uniformit
            showBorders={showBorders}
            borderOpacity={borderOpacity}
            borderColor={borderColor}
          />
        ) : (
          <meshStandardMaterial color="#123" />
        )}
      </mesh>
    </group>
  );
}
