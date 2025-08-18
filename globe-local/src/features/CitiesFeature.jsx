import React, { useEffect, useState } from "react";
import CitiesOverlay from "../components/CitiesOverlay";
import { fetchCitiesFromInternet, buildCitiesMask } from "../lib/cities/cities";

/**
 * Piirtää kaupungit overlaynä. Ei sisällä HUDia.
 * Props:
 *  - scene: THREE.Scene
 *  - radius: number
 *  - showCities: boolean
 *  - minCityPop: number
 *  - cityColorHex: string (esim. "#ffffff")
 */
export default function CitiesFeature({ scene, radius, showCities, minCityPop, cityColorHex }) {
  const [cities, setCities] = useState([]);
  const [mask, setMask] = useState(null);

  // Lataa kaupungit kerran, kun overlay halutaan näkyviin
  useEffect(() => {
    if (!showCities || cities.length) return;
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
  }, [showCities, cities.length]);

  // Rakenna maski kun data/raja muuttuu
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
  }, [showCities, cities, minCityPop]);

  return (
    <>
      {mask && (
        <CitiesOverlay
          scene={scene}
          radius={radius}
          map={mask}
          visible={!!showCities}
          opacity={0.75}
          blending="normal"
          colorHex={cityColorHex}
        />
      )}
    </>
  );
}
