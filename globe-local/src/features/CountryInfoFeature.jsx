// src/features/CountryInfoFeature.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  getCountries,
  findCountryAt,
  getPopulation,
} from "../lib/countries/countries"; // <-- ei fmt

// pieni paikallinen formatteri (FI-ryhmittely, viiva jos puuttuu)
const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("fi-FI"));

// kuinka paikallaan hiiren pitää pysyä (px) ennen syttymistä
const STILL_PX = 4;

export default function CountryInfoFeature({ holdMs = 3000 }) {
  const { camera, scene, pointer, gl } = useThree();

  const [countries, setCountries] = useState([]);
  useEffect(() => { getCountries().then(setCountries); }, []);

  // label: { key, name, pop, year, pos:[x,y,z] }
  const [label, setLabel] = useState(null);

  const ray = useRef(new THREE.Raycaster());
  const st = useRef({
    key: null,
    stillMs: 0,
    country: null,
    pos: new THREE.Vector3(),
    lastPx: { x: null, y: null },
  });

  // sama muunnos kuin teidän tuplaklikissä
  function localToLonLat({ x, y, z }) {
    const RAD = 180 / Math.PI;
    const r = Math.sqrt(x * x + y * y + z * z);
    const lat = Math.asin(y / r) * RAD;
    let phiDeg = Math.atan2(z, -x) * RAD;
    if (phiDeg < 0) phiDeg += 360;
    const lon = -(180 - phiDeg);
    return { lon, lat };
  }

  function pointerPx() {
    const rect = gl.domElement.getBoundingClientRect();
    return {
      x: (pointer.x * 0.5 + 0.5) * rect.width + rect.left,
      y: (-pointer.y * 0.5 + 0.5) * rect.height + rect.top,
    };
  }

  useFrame((_, delta) => {
    if (label) return; // kun label näkyy, ei päivityksiä → ei vilkkumista
    if (!countries.length) return;

    const globe = scene.getObjectByName("globe-mesh");
    if (!globe) return;

    ray.current.setFromCamera(pointer, camera);
    const hit = ray.current.intersectObject(globe, true)[0];
    if (!hit) {
      st.current.stillMs = 0;
      st.current.key = null;
      st.current.country = null;
      st.current.lastPx = { x: null, y: null };
      return;
    }

    if (!globe.geometry.boundingSphere) globe.geometry.computeBoundingSphere();
    const radius =
      globe.geometry.boundingSphere?.radius ??
      globe.geometry.parameters?.radius ??
      1;
    const pos = hit.point.clone().setLength(radius + 0.0005);

    const local = hit.point.clone(); globe.worldToLocal(local);
    const { lon, lat } = localToLonLat(local);
    const country = findCountryAt(lon, lat, countries);
    const name = country?.properties?.name;
    const iso3 = country?.properties?.iso3;
    const newKey = iso3 || name || null;

    const curPx = pointerPx();
    const last = st.current.lastPx;
    const moved =
      last.x === null
        ? false
        : Math.hypot(curPx.x - last.x, curPx.y - last.y) > STILL_PX;
    st.current.lastPx = curPx;

    if (newKey && newKey === st.current.key && !moved) {
      st.current.stillMs += delta * 1000;
      st.current.pos.copy(pos);
    } else {
      st.current.key = newKey || null;
      st.current.stillMs = 0;
      st.current.country = country || null;
      st.current.pos.copy(pos);
    }

    if (!label && st.current.key && st.current.stillMs >= holdMs) {
      const worldPos = st.current.pos.clone();
      const fireKey = st.current.key;
      setLabel({ key: fireKey, name, pop: null, year: null, pos: worldPos.toArray() });

      // World Bank WDI: palauttaa { value, year }
      (async () => {
        const res = await getPopulation(iso3, name);
        const value = typeof res === "number" ? res : res?.value ?? null;
        const year  = typeof res === "number" ? null : res?.year ?? null;
        setLabel(cur => (cur && cur.key === fireKey) ? { ...cur, pop: value, year } : cur);
      })();
    }
  });

  if (!label) return null;

  return (
    <Html
      position={label.pos}
      transform={false}
      center
      pointerEvents="auto"
      zIndexRange={[100, 2000]}
    >
      <div
        onPointerLeave={() => setLabel(null)}
        style={{
          padding: "6px 9px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontSize: 13,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,.25)",
          userSelect: "none",
          cursor: "default",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{label.name}</div>
        <div>Väkiluku: {fmt(label.pop)}</div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>
          Data: {label.year ?? "—"}, World Bank (WDI)
        </div>
      </div>
    </Html>
  );
}
