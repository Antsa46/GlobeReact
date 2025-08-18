import * as THREE from "three";

// Natural Earth 1:10m Populated Places (public domain, paljon kattavampi)
const NE10M_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson";

/**
 * Hakee kaupungit suoraan netistä ja normalisoi kentät:
 * { name, lat, lon, pop }
 */
export async function fetchCitiesFromInternet(url = NE10M_URL) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Cities fetch failed: ${res.status} ${res.statusText}`);
  const geo = await res.json();

  const feats = Array.isArray(geo?.features) ? geo.features : [];
  const rows = feats.map((f) => {
    const p = f.properties ?? {};
    const g = f.geometry ?? {};
    const coords = Array.isArray(g.coordinates) ? g.coordinates : [p.LONGITUDE, p.LATITUDE];
    const lon = Number(coords?.[0]);
    const lat = Number(coords?.[1]);
    const name =
      p.name ?? p.nameascii ?? p.NAME ?? p.NAMEASCII ?? p.NAMEALT ?? p.SOV0NAME ?? "Unknown";
    const pop = Number(
      p.pop_max ?? p.POP_MAX ?? p.POP_MIN ?? p.POP_OTHER ?? p.population ?? 0
    );
    return { name, lat, lon, pop };
  });

  return rows.filter(
    (r) =>
      Number.isFinite(r.lat) &&
      Number.isFinite(r.lon) &&
      Math.abs(r.lat) <= 90 &&
      Math.abs(r.lon) <= 180 &&
      (r.pop ?? 0) > 0
  );
}

/**
 * Equirectangular-maskin rakennus: u=(lon+180)/360, v=(90-lat)/180
 */
export function buildCitiesMask({
  cities,
  threshold = 1000000,
  size = 4096,
  pxPerDot = 1.1,
}) {
  const width = size;
  const height = Math.floor(size / 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;

  // pieni, mutta näkyvä minimi myös pienille kaupungeille
  const dotRadius = (pop) =>
    Math.max(0.6, (Math.log10(Math.max(pop, 1)) - 4) * pxPerDot);

  for (const c of cities) {
    if (!isFinite(c.lat) || !isFinite(c.lon)) continue;
    if ((c.pop ?? 0) < threshold) continue;

    const u = (c.lon + 180) / 360;
    const v = (90 - c.lat) / 180;

    const x = Math.round(u * width);
    const y = Math.round(v * height);
    const r = dotRadius(c.pop);

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}
