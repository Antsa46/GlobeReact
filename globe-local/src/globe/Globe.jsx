import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import GlobeMaterial from "./GlobeMaterial.jsx";
import { buildTerrariumMosaic } from "../lib/terrain/terrarium.js";
import { buildWaterMaskTexture } from "../lib/water/waterMask.js";
import { sunDirectionFromDate } from "../lib/sun/astronomy.js";

const SIDEREAL_DAY = 86164;

export default function Globe({
  z,
  seaLevel,
  exaggeration,
  autoSpin,
  realSunEnabled,
  dateForSun,

  // shader controls
  inlandCap,
  riverNarrow,
  riverSharpness,
  riverMix,
  lakeMix,

  // water-mask builder
  riverWidthFactor,
  lakeErodePx,
}) {
  const [terr, setTerr] = useState(null);
  const [maskTex, setMaskTex] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    let alive = true;
    (async () => {
      const t = await buildTerrariumMosaic(z);
      if (!alive) return;
      setTerr(t);

      const mask = await buildWaterMaskTexture(t.width, t.height, z, {
        riverWidthFactor,
        lakeErodePx,
      });
      if (!alive) return;
      setMaskTex(mask);
    })();
    return () => { alive = false; };
  }, [z, riverWidthFactor, lakeErodePx]);

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
        {terr
          ? <GlobeMaterial
              terrariumTex={terr.texture}
              waterMaskTex={maskTex}
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
            />
          : <meshStandardMaterial color="#123" />
        }
      </mesh>
    </group>
  );
}
