// src/lib/countries/countries.js

// ---------- Natural Earth: countries (GeoJSON) ----------
let countriesPromise = null;
let countriesCache = null;

export async function getCountries() {
  if (countriesCache) return countriesCache;
  if (countriesPromise) return countriesPromise;

  const URL =
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

  countriesPromise = fetch(URL)
    .then((r) => r.json())
    .then((geojson) => {
      const feats = geojson.features.map((f) => normalizeFeature(f));
      countriesCache = feats;
      return feats;
    })
    .catch((err) => {
      console.error("Failed to load countries:", err);
      countriesPromise = null;
      throw err;
    });

  return countriesPromise;
}

function normalizeFeature(f) {
  const p = f.properties || {};
  const name =
    p.NAME_EN ||
    p.ADMIN ||
    p.NAME_LONG ||
    p.NAME ||
    p.SOVEREIGNT ||
    p.GEOUNIT ||
    p.BRK_NAME ||
    p.NAME_SORT ||
    p.FORMAL_EN ||
    p.ALT_NAME ||
    null;

  // World Bank käyttää joissain tapauksissa XKX (Kosovo)
  const iso3raw =
    p.ISO_A3_EH || p.ADM0_A3 || p.ISO_A3 || p.ADM0_A3_US || p.ABBREV || null;

  f.properties = {
    ...p,
    name: name || p.name || p.admin || "",
    iso3: iso3raw && iso3raw !== "-99" ? iso3raw : null,
  };

  f._bbox = computeBBox(f.geometry);          // [minLon, minLat, maxLon, maxLat]
  f._centroid = centroidLatLngOfGeom(f.geometry); // [lon, lat] yksinkertainen centroidi
  return f;
}

function computeBBox(geom) {
  let minLon = 180,
    minLat = 90,
    maxLon = -180,
    maxLat = -90;

  const each = (fn) => {
    if (!geom) return;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach((ring) => ring.forEach(([lo, la]) => fn(lo, la)));
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) => ring.forEach(([lo, la]) => fn(lo, la)))
      );
    }
  };

  each((lo, la) => {
    const L = normalizeLon(lo);
    if (L < minLon) minLon = L;
    if (L > maxLon) maxLon = L;
    if (la < minLat) minLat = la;
    if (la > maxLat) maxLat = la;
  });

  return [minLon, minLat, maxLon, maxLat];
}

// Yksinkertainen centroidi: keskiarvo ulkorenkaan pisteistä (riittää valintaan)
function centroidLatLngOfGeom(geom){
  let sumLon = 0, sumLat = 0, n = 0;
  const add = (lo, la) => { sumLon += normalizeLon(lo); sumLat += la; n++; };
  if (!geom) return [0, 0];

  if (geom.type === "Polygon") {
    const outer = geom.coordinates?.[0] || [];
    outer.forEach(([lo, la]) => add(lo, la));
  } else if (geom.type === "MultiPolygon") {
    geom.coordinates.forEach(poly => {
      const outer = poly?.[0] || [];
      outer.forEach(([lo, la]) => add(lo, la));
    });
  }
  if (!n) return [0, 0];
  return [ normalizeLon(sumLon / n), sumLat / n ];
}

function haversineSq(lon1, lat1, lon2, lat2){
  const R = 6371000;
  const toRad = Math.PI / 180;
  const φ1 = lat1 * toRad, φ2 = lat2 * toRad;
  const dφ = (lat2 - lat1) * toRad;
  const dλ = (normalizeLon(lon2 - lon1)) * toRad;
  const a = Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  const d = 2 * R * Math.asin(Math.sqrt(a));
  return d * d; // neliömetrit – riittää vertailuun
}

// ---------- Point in polygon (antimeridiaani huomioiden) ----------
export function findCountryAt(lon, lat, features) {
  if (!features?.length) return null;

  const L = normalizeLon(lon);
  const Phi = lat;

  // Kerää kaikki aidot osumat ja valitse lähimmän centroidin maa
  let best = null;
  let bestD2 = Infinity;

  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const b = f._bbox;
    if (b) {
      const withinLat = Phi >= b[1] - 0.2 && Phi <= b[3] + 0.2;
      const withinLon = withinWrapped(L, b[0] - 0.2, b[2] + 0.2);
      if (!withinLat || !withinLon) continue;
    }
    if (geomContains(f.geometry, L, Phi)) {
      const [clon, clat] = f._centroid || centroidLatLngOfGeom(f.geometry);
      const d2 = haversineSq(L, Phi, clon, clat);
      if (d2 < bestD2) { best = f; bestD2 = d2; }
    }
  }
  return best;
}

function withinWrapped(x, min, max) {
  // jos bbox ei ylitä datelinen rajaa
  if (min <= max) return x >= min && x <= max;
  // ylittää datelinen: esim [170, -170] → [170..180] U [-180..-170]
  return x >= min || x <= max;
}

function normalizeLon(lon) {
  let L = lon % 360;
  if (L > 180) L -= 360;
  if (L <= -180) L += 360;
  return L;
}

function geomContains(geom, lon, lat) {
  if (!geom) return false;
  if (geom.type === "Polygon") return polygonContains(geom.coordinates, lon, lat);
  if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) if (polygonContains(poly, lon, lat)) return true;
  }
  return false;
}

// polygon: [ring1 (outer), ring2 (hole), ...], ring: [[lon,lat], ...]
function polygonContains(rings, lon, lat) {
  let inside = false;
  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r];
    const hit = ringContains(ring, lon, lat);
    if (r === 0) inside = hit;      // outer
    else if (hit) inside = !inside; // holes
  }
  return inside;
}

function ringContains(ring, lon, lat) {
  let inside = false;
  const L = lon;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let [x1, y1] = ring[j];
    let [x2, y2] = ring[i];

    x1 = unwrapToNear(x1, L);
    x2 = unwrapToNear(x2, L);

    // raycast y-suunnassa
    const intersects =
      (y1 > lat) !== (y2 > lat) &&
      L < ((x2 - x1) * (lat - y1)) / ((y2 - y1) + 1e-12) + x1;

    if (intersects) inside = !inside;
  }
  return inside;
}

function unwrapToNear(x, L) {
  let v = normalizeLon(x);
  while (v - L > 180) v -= 360;
  while (v - L < -180) v += 360;
  return v;
}

// ---------- Population: World Bank WDI (SP.POP.TOTL) ----------
const popCache = new Map();
const ISO3_FIX = { KOS: "XKX" }; // mahdollinen korjaus

export async function getPopulation(iso3, fallbackName) {
  const key = (iso3 || (fallbackName || "")).toUpperCase();
  if (!key) return { value: null, year: null };
  if (popCache.has(key)) return popCache.get(key);

  const code = (ISO3_FIX[key] || key).toUpperCase();
  const base = `https://api.worldbank.org/v2/country/${code}/indicator/SP.POP.TOTL?format=json`;
  const urls = [
    `${base}&per_page=1&mrv=1`, // uusin havainto
    `${base}&per_page=5&mrv=5`, // fallback: poimi eka ei-null
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url);
      const j = await r.json();
      const rows = j?.[1] || [];
      const pick =
        (url.includes("mrv=5") ? rows.find((d) => d?.value != null) : rows[0]) ||
        rows[0];

      const out = {
        value: pick?.value ?? null,
        year: pick?.date ? Number(pick.date) : null,
      };
      popCache.set(key, out);
      return out;
    } catch (e) {
      // kokeile seuraavaa
    }
  }
  const out = { value: null, year: null };
  popCache.set(key, out);
  return out;
}

// Pieni formatteri (valinnainen, jos haluat käyttää importoituna)
export const fmt = (n) =>
  n == null ? "—" : Math.round(n).toLocaleString("fi-FI");
