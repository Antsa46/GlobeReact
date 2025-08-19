import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CitiesOverlay from "../components/CitiesOverlay";
import { fetchCitiesFromInternet, buildCitiesMask } from "../lib/cities/cities";

// apurit
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const EARTH_R = 6371;        // km
const MAX_PICK_KM = 120;     // sietoraja lähimmälle

// *** Sama viitekehys kuin onnistuneessa klikkauksessa ***
// Klikistä saadaan: lon = -(180 - phiDeg)  =>  phiDeg = 180 + lon
// Siksi labelin sijaintiin käytetään: φ = (180 + lon)
function lonLatToVec3(lonDeg, latDeg, radius = 1.0) {
  const lat = latDeg * DEG;
  const phi = (180 + lonDeg) * DEG;    // <-- korjattu: + eikä -
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    -radius * Math.cos(phi) * cosLat,   // X
    +radius * Math.sin(lat),            // Y
    +radius * Math.sin(phi) * cosLat    // Z
  );
}

function angularDistanceRad(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * DEG, φ2 = lat2 * DEG;
  const Δφ = (lat2 - lat1) * DEG;
  const Δλ = (lon2 - lon1) * DEG;
  const s = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(s)));
}

export default function CitiesFeature({
  radius,
  showCities,
  minCityPop,
  cityColorHex,
}) {
  const [cities, setCities] = useState([]);
  const [mask, setMask] = useState(null);
  const [label, setLabel] = useState(null); // {name, pop, lon, lat}

  // Lataa kaupungit
  useEffect(() => {
    if (!showCities && !label) return;
    if (cities.length) return;
    let alive = true;
    (async () => {
      try {
        const rows = await fetchCitiesFromInternet();
        if (!alive) return;
        setCities(rows);
      } catch (err) {
        console.error("[Cities] fetch failed", err);
      }
    })();
    return () => { alive = false; };
  }, [showCities, label, cities.length]);

  // Rakenna maski näkyville pisteille
  useEffect(() => {
    if (!showCities || !cities.length) {
      if (mask) setMask(null);
      return;
    }
    const tex = buildCitiesMask({
      cities,
      threshold: Math.max(0, Number(minCityPop) || 0),
      size: 4096,
      pxPerDot: 1.1,
    });
    setMask(tex);
    return () => tex?.dispose?.();
  }, [showCities, cities, minCityPop]); // eslint-disable-line

  // Tuplaklikki: LOCAL point -> lon/lat -> lähin kaupunki
  const onPickPoint = useCallback(({ x, y, z }) => {
    const r = Math.sqrt(x*x + y*y + z*z);
    const lat = Math.asin(y / r) * RAD;

    // φ = atan2(z, -x)  (sauma +X)
    let phiDeg = Math.atan2(z, -x) * RAD;
    if (phiDeg < 0) phiDeg += 360;
    const lon = -(180 - phiDeg); // tämä on sinulla todetusti oikein

    if (!cities.length) return;

    let best = null;
    let bestRad = Infinity;
    for (const c of cities) {
      const ang = angularDistanceRad(lat, lon, c.lat, c.lon);
      if (ang < bestRad) { bestRad = ang; best = c; }
    }

    const km = EARTH_R * bestRad;
    if (!best || km > MAX_PICK_KM) { setLabel(null); return; }

    setLabel({ name: best.name, pop: best.pop, lon: best.lon, lat: best.lat });
  }, [cities]);

  // Label paikoilleen – suoraan pinnalle, ei nostoa
  const labelPos = useMemo(() => {
    if (!label) return null;
    return lonLatToVec3(label.lon, label.lat, radius);
  }, [label, radius]);

  return (
    <>
      {mask && (
        <CitiesOverlay
          radius={radius}
          map={mask}
          visible={!!showCities}
          opacity={0.75}
          blending="normal"
          colorHex={cityColorHex}
          onPickPoint={onPickPoint}
        />
      )}

      {/* Klikatun kaupungin label – klikkaa sulkeaksesi */}
      {label && labelPos && (
        <Html
          position={labelPos}
          center
          // HUOM: ei transformia -> billboard, ei "jättibanneri" -efektiä
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
            background: "rgba(13,20,34,0.92)",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: 8,
            font: "12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
          onClick={() => setLabel(null)}
          title="Sulje"
        >
          <strong>{label.name}</strong><br />
          {label.pop.toLocaleString("fi-FI")} as.
        </Html>
      )}
    </>
  );
}
