import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import GlobeMaterial from "./GlobeMaterial.jsx";
import { buildTerrariumMosaic } from "../lib/terrain/terrarium.js";
import { buildWaterMaskTexture } from "../lib/water/waterMask.js";
import { buildBordersMaskTexture } from "../lib/borders/bordersMask.js";
import { sunDirectionFromDate } from "../lib/sun/astronomy.js";
import CitiesFeature from "../features/CitiesFeature.jsx";

function Globe(
  {
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

    // borders
    showBorders = false,
    borderWidthPx = 0.8,
    borderOpacity = 0.8,
    borderColor = [0.08, 0.10, 0.13],

    // mask builder
    riverWidthFactor,
    lakeErodePx,

    // kaupungit
    showCities = true,
    minCityPop = 100000,
    cityColorHex = "#ffffff",
  },
  ref
) {
  const [terr, setTerr] = useState(null);
  const [maskTex, setMaskTex] = useState(null);
  const [bordersTex, setBordersTex] = useState(null);
  const groupRef = useRef();

  // globen meshistä ref (CountryInfoFeature raycastaa tätä)
  const globeMeshRef = useRef(null);

  // three-viitteet imperatiivista käyttöä varten
  const { gl, camera, controls } = useThree();

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

  const sunDir = useMemo(
    () => (realSunEnabled ? sunDirectionFromDate(dateForSun) : new THREE.Vector3(1, 0, 0)),
    [realSunEnabled, dateForSun]
  );

  // Imperatiiviset getterit (CountryInfoFeature käyttää näitä)
  useImperativeHandle(ref, () => ({
    getRenderer: () => gl || null,
    getCamera: () => camera || null,
    getControls: () => controls || null,
    getCanvas: () => (gl ? gl.domElement : null),
    getGlobeMesh: () => globeMeshRef.current || null
  }), [gl, camera, controls]);

  return (
    <group ref={groupRef}>
      <mesh ref={globeMeshRef} name="globe-mesh">
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
            showBorders={showBorders}
            borderOpacity={borderOpacity}
            borderColor={borderColor}
          />
        ) : (
          <meshStandardMaterial color="#123" />
        )}
      </mesh>

      {/* Kaupunkipisteet overlaynä – ei mitään rotaatiota täällä */}
      <CitiesFeature
        radius={1}
        showCities={showCities}
        minCityPop={minCityPop}
        cityColorHex={cityColorHex}
      />
    </group>
  );
}

export default forwardRef(Globe);
