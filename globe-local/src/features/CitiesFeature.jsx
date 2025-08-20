// src/features/CitiesFeature.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CitiesOverlay from "../components/CitiesOverlay";
import { fetchCitiesFromInternet, buildCitiesMask } from "../lib/cities/cities";
import { getWikiPopulation } from "../lib/cities/wikiPop";

// apurit
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const EARTH_R = 6371;          // km
const MAX_PICK_KM = 120;       // sietoraja lähimmälle
const DISMISS_GUARD_MS = 150;  // suojaviive labelin luonnin jälkeen

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("fi-FI"));

// Klikistä saadaan: lon = -(180 - phiDeg)  =>  phiDeg = 180 + lon
// Siksi labelin sijaintiin käytetään: φ = (180 + lon)
function lonLatToVec3(lonDeg, latDeg, radius = 1.0) {
  const lat = latDeg * DEG;
  const phi = (180 + lonDeg) * DEG;
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

  // label: { key, name, pop, lon, lat, iso3?, wiki?: {value,year} }
  const [label, setLabel] = useState(null);
  const labelShownAt = useRef(0);
  const labelDivRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCities, cities, minCityPop]);

  // Tuplaklikki: LOCAL point -> lon/lat -> lähin kaupunki
  const onPickPoint = useCallback(({ x, y, z }) => {
    // Jos label on näkyvissä, käsittele tämä klikkaus sulkemisena
    if (label) { setLabel(null); return; }

    const r = Math.sqrt(x*x + y*y + z*z);
    const lat = Math.asin(y / r) * RAD;

    // φ = atan2(z, -x)  (sauma +X)
    let phiDeg = Math.atan2(z, -x) * RAD;
    if (phiDeg < 0) phiDeg += 360;
    const lon = -(180 - phiDeg); // todetusti oikein

    if (!cities.length) return;

    let best = null;
    let bestRad = Infinity;
    for (const c of cities) {
      const ang = angularDistanceRad(lat, lon, c.lat, c.lon);
      if (ang < bestRad) { bestRad = ang; best = c; }
    }

    const km = EARTH_R * bestRad;
    if (!best || km > MAX_PICK_KM) { setLabel(null); return; }

    const key = `${best.iso3 || ""}|${best.name}`;
    labelShownAt.current = performance.now();
    setLabel({
      key,
      name: best.name,
      pop: best.pop, // Natural Earth POP_MAX/MIN → "Malli"
      lon: best.lon,
      lat: best.lat,
      iso3: best.iso3 || null,
      wiki: null,    // täytetään haun jälkeen
    });

    (async () => {
      try {
        const res = await getWikiPopulation({
          name: best.name,
          iso3: best.iso3,
          lat: best.lat,
          lon: best.lon
        });
        setLabel(cur => (cur && cur.key === key) ? { ...cur, wiki: res } : cur);
      } catch { /* no-op */ }
    })();
  }, [cities, label]);

  // Label paikoilleen – suoraan pinnalle, ei nostoa
  const labelPos = useMemo(() => {
    if (!label) return null;
    return lonLatToVec3(label.lon, label.lat, radius);
  }, [label, radius]);

  // Yhden klikkauksen sulku: klik anywhere kun label näkyy
  useEffect(() => {
    if (!label) return;

    const onDocPointerDown = (e) => {
      // suoja: älä sulje heti jos tapahtuu aivan labelin luonnin jälkeen
      if (performance.now() - labelShownAt.current < DISMISS_GUARD_MS) return;
      setLabel(null);
    };

    window.addEventListener("pointerdown", onDocPointerDown, true);
    return () => window.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [label]);

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

      {/* Klikatun kaupungin label */}
      {label && labelPos && (
        <Html
          position={labelPos}
          center
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
          <div ref={labelDivRef}>
            <strong>{label.name}</strong><br />
            Malli: {fmt(label.pop)} as.<br />
            <span style={{ opacity: 0.9 }}>
              Wikipedia: {label.wiki?.value != null
                ? `${fmt(label.wiki.value)} as.${label.wiki.year ? ` (${label.wiki.year})` : ""}`
                : "—"}
            </span>
          </div>
        </Html>
      )}
    </>
  );
}
