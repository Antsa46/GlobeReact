// src/lib/cities/wikiPop.js
// NOPEA ENSIN: Wikipedia GeoSearch (+QID -> entity JSON) ➜ P1082 (väkiluku) + P585 (vuosi)
// FALLBACK:    Wikidata SPARQL "around" (POST + timeout + GET-fallback; CORS-robust)
//
// Palauttaa: { value:number|null, year:number|null }

const WIKI_API = "https://www.wikidata.org/w/api.php";
const ENTITY_API = "https://www.wikidata.org/wiki/Special:EntityData";
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// Hyväksytyt kaupunkimaiset luokat (P31)
const OK_CLASSES = new Set([
  "Q486972",  // human settlement
  "Q515",     // city
  "Q1549591", // big city
  "Q200250",  // metropolis
  "Q15284",   // municipality
]);

// Poissuljettavat (aiheuttivat vääräosumia metropoleissa)
const EXCLUDE_CLASSES = new Set([
  "Q13218630", // ward
  "Q132192",   // special ward of Japan
  "Q13220204", // subdistrict
  "Q19953632", // district of Thailand
]);

/* ---------------- välimuistit ---------------- */
const resultCache = new Map();       // key(name,iso3,lat,lon,r) -> {value,year}
const qidCacheByName = new Map();    // key(normName|ISO3) -> QID
const entityCache = new Map();       // QID -> entity JSON
const popCache = new Map();          // QID -> {value,year}

const norm = (s) =>
  String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim();

const deg2rad = (d) => d * Math.PI / 180;
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lon - a.lon);
  const la1 = deg2rad(a.lat), la2 = deg2rad(b.lat);
  const s = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

export async function getWikiPopulation({ name, iso3, lat, lon, radiusKm = 50 }) {
  const key = JSON.stringify({
    n: norm(name),
    i: (iso3 || "").toUpperCase(),
    lat: Number(lat?.toFixed?.(3) ?? lat),
    lon: Number(lon?.toFixed?.(3) ?? lon),
    r: radiusKm,
  });
  if (resultCache.has(key)) return resultCache.get(key);

  // 1) Nopea Geo + nimi -haara
  const fast = await findViaGeoAndName({ name, iso3, lat, lon, radiusKm });
  if (fast) {
    const out = { value: fast.value ?? null, year: fast.year ?? null };
    resultCache.set(key, out);
    return out;
  }

  // 2) Fallback: SPARQL around
  const slow = await sparqlAround({ iso3, lat, lon, radiusKm });
  const out2 = slow ? { value: slow.value ?? null, year: slow.year ?? null } : { value: null, year: null };
  resultCache.set(key, out2);
  return out2;
}

/* ---------------- NOPEA POLKU (ei SPARQL) ---------------- */

async function findViaGeoAndName({ name, iso3, lat, lon, radiusKm }) {
  const nameKey = `${norm(name)}|${(iso3 || "").toUpperCase()}`;

  // Jos meillä on jo QID nimen perusteella
  if (qidCacheByName.has(nameKey)) {
    const q = qidCacheByName.get(nameKey);
    const p = await getPopByQID(q);
    if (p) return { id: q, ...p, source: "cache" };
  }

  // GeoSearch → pageids → QID → entity → P1082
  const pages = await geoSearch({ lat, lon, radiusKm, limit: 8 });
  const pageidList = pages.map(p => p.pageid);
  const qidMap = await pagePropsQIDs(pageidList); // { pageid: Qxx }
  const qids = [...new Set(pages.map(p => qidMap[p.pageid]).filter(Boolean))].slice(0, 6);

  const center = { lat: Number(lat), lon: Number(lon) };
  const wanted = norm(name);

  const ents = await Promise.all(qids.map(q => getEntity(q)));
  const candidates = [];
  for (let i = 0; i < ents.length; i++) {
    const ent = ents[i]; if (!ent) continue;
    const qid = qids[i];

    const coord = getCoord(ent); if (!coord) continue;
    const classes = getClasses(ent);
    const hasBad = classes.some(c => EXCLUDE_CLASSES.has(c));
    const hasOk  = classes.some(c => OK_CLASSES.has(c));
    if (hasBad || !hasOk) continue;

    const pop = getPopulation(ent); if (!pop) continue;

    const dist = haversineKm(center, coord);
    const title = (pages.find(p => qidMap[p.pageid] === qid)?.title) || "";
    const nameMatch = norm(title) === wanted ||
                      Object.values(ent.labels || {}).some(v => norm(v.value) === wanted);

    // Hyväksyttävän “nopea” osuma: nimiosuma & lähellä tai järkevän kokoinen kaupunki
    const good = (nameMatch && dist <= 20) || (pop.value >= 15000);

    // pisteytys (ei erikoissääntöjä)
    const score = scoreCandidate({ pop: pop.value, year: pop.year, distKm: dist, nameMatch, strict: true });

    candidates.push({ id: qid, ...pop, distKm: dist, score, good });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (best?.good) {
    qidCacheByName.set(nameKey, best.id);
    popCache.set(best.id, { value: best.value, year: best.year });
    return best;
  }

  // Nimi-fallback (wbsearchentities)
  const byName = await wbSearchEntities(name, 6);
  const ents2 = await Promise.all(byName.map(r => getEntity(r.id)));
  const cand2 = [];
  for (let i = 0; i < ents2.length; i++) {
    const ent = ents2[i]; if (!ent) continue;
    const qid = byName[i].id;

    const coord = getCoord(ent); if (!coord) continue;
    const classes = getClasses(ent);
    const hasBad = classes.some(c => EXCLUDE_CLASSES.has(c));
    const hasOk  = classes.some(c => OK_CLASSES.has(c));
    if (hasBad || !hasOk) continue;

    const pop = getPopulation(ent); if (!pop) continue;

    const dist = haversineKm(center, coord);
    const labels = Object.values(ent.labels || {}).map(v => norm(v.value));
    const nameMatch = labels.includes(wanted);

    const good = nameMatch && dist <= 50;
    const score = scoreCandidate({ pop: pop.value, year: pop.year, distKm: dist, nameMatch, strict: false });

    cand2.push({ id: qid, ...pop, distKm: dist, score, good });
  }
  cand2.sort((a, b) => b.score - a.score);
  const best2 = cand2[0];

  if (best2?.good) {
    qidCacheByName.set(nameKey, best2.id);
    popCache.set(best2.id, { value: best2.value, year: best2.year });
    return best2;
  }

  // Muutoin palauta paras ehdokas (ei välttämättä “good”), jotta voidaan vielä tippua SPARQLiin
  return best || null;
}

function scoreCandidate({ pop, year, distKm, nameMatch, strict }) {
  const popScore   = Math.log10(Math.max(1, pop)) * 2;
  const yearScore  = (year || 0) / 4000;
  const distPenalty = Math.min(1.5, (distKm || 0) / 50);
  const nameBonus  = nameMatch ? 2.0 : 0;
  const strictBias = strict ? 0.4 : 0;
  return popScore + yearScore + nameBonus + strictBias - distPenalty;
}

/* ---------------- SPARQL FALLBACK (around) ---------------- */

async function sparqlAround({ iso3, lat, lon, radiusKm }) {
  const iso3Filter = iso3
    ? `?item wdt:P17 ?country . ?country wdt:P298 "${escapeSparqlString(iso3)}" .`
    : "";

  const okValues = ["Q486972","Q515","Q1549591","Q200250","Q15284"].map(q => `wd:${q}`).join(" ");
  const excludes = ["Q13218630","Q132192","Q13220204","Q19953632"]
    .map(q => `FILTER NOT EXISTS { ?item wdt:P31/wdt:P279* wd:${q} }`).join("\n");

  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX p: <http://www.wikidata.org/prop/>
    PREFIX ps: <http://www.wikidata.org/prop/statement/>
    PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    SELECT ?item ?population ?pointInTime WHERE {
      SERVICE wikibase:around {
        ?item wdt:P625 ?coord .
        bd:serviceParam wikibase:center "Point(${Number(lon)} ${Number(lat)})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "${Number(radiusKm)}" .
      }
      VALUES ?okClass { ${okValues} }
      ?item wdt:P31/wdt:P279* ?okClass .
      ${excludes}
      ${iso3Filter}
      ?item p:P1082 ?popStmt .
      ?popStmt ps:P1082 ?population .
      OPTIONAL { ?popStmt pq:P585 ?pointInTime . }
    }
    ORDER BY DESC(?pointInTime) DESC(?population)
    LIMIT 1
  `;

  const json = await runSparql(query);
  const b = json?.results?.bindings?.[0];
  if (!b?.population?.value) return null;

  const val = Number(b.population.value);
  const year = b.pointInTime?.value ? new Date(b.pointInTime.value).getUTCFullYear() : null;
  return {
    value: Number.isFinite(val) ? val : null,
    year,
    qid: b.item?.value?.split("/").pop(),
    source: "sparql-around",
  };
}

function escapeSparqlString(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function runSparql(query) {
  // 1) POST (CORS-ok) + timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const body = new URLSearchParams();
    body.set("query", query);
    const res = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      body,
      headers: {
        "Accept": "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    // 2) GET fallback
    try {
      const url = SPARQL_ENDPOINT + "?format=json&query=" + encodeURIComponent(query);
      const res = await fetch(url, { headers: { "Accept": "application/sparql-results+json" } });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  } finally {
    clearTimeout(t);
  }
}

/* ---------------- Wikipedia/Wikidata API wrappers ---------------- */

async function geoSearch({ lat, lon, radiusKm, limit = 10 }) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "geosearch");
  url.searchParams.set("gscoord", `${lat}|${lon}`);
  url.searchParams.set("gsradius", String(Math.round(radiusKm * 1000)));
  url.searchParams.set("gslimit", String(limit));
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  try {
    const r = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.query?.geosearch) ? j.query.geosearch : [];
  } catch { return []; }
}

async function pagePropsQIDs(pageids) {
  if (!pageids.length) return {};
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "pageprops");
  url.searchParams.set("ppprop", "wikibase_item");
  url.searchParams.set("pageids", pageids.join("|"));
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  try {
    const r = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
    if (!r.ok) return {};
    const j = await r.json();
    const mp = {};
    const pages = j?.query?.pages || {};
    Object.keys(pages).forEach(pid => {
      const q = pages[pid]?.pageprops?.wikibase_item;
      if (q) mp[pid] = q;
    });
    return mp;
  } catch { return {}; }
}

async function wbSearchEntities(name, limit = 6) {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", name);
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("limit", String(limit));
  try {
    const r = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.search) ? j.search.map(s => ({ id: s.id })) : [];
  } catch { return []; }
}

async function getEntity(qid) {
  if (entityCache.has(qid)) return entityCache.get(qid);
  const url = `${ENTITY_API}/${qid}.json`;
  try {
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const ent = j?.entities?.[qid] || null;
    entityCache.set(qid, ent);
    return ent;
  } catch { return null; }
}

async function getPopByQID(qid) {
  if (popCache.has(qid)) return popCache.get(qid);
  const ent = await getEntity(qid);
  if (!ent) return null;
  const p = getPopulation(ent);
  if (!p) return null;
  popCache.set(qid, p);
  return p;
}

/* ---------------- entity parsers ---------------- */

function getClasses(entity) {
  const claims = entity?.claims?.P31;
  if (!Array.isArray(claims)) return [];
  const out = [];
  for (const st of claims) {
    const id = st?.mainsnak?.datavalue?.value?.id;
    if (id) out.push(id);
  }
  return out;
}

function getCoord(entity) {
  const c = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  if (!c) return null;
  if (typeof c.latitude === "number" && typeof c.longitude === "number") {
    return { lat: c.latitude, lon: c.longitude };
  }
  return null;
}

function getPopulation(entity) {
  const arr = entity?.claims?.P1082;
  if (!Array.isArray(arr) || !arr.length) return null;

  let best = null;
  for (const st of arr) {
    const v = st?.mainsnak?.datavalue?.value;
    if (v == null) continue;

    let num = null;
    if (typeof v === "number") num = v;
    else if (typeof v === "object" && v.amount != null) {
      const s = String(v.amount).replace("+", "");
      const n = Number(s);
      if (Number.isFinite(n)) num = n;
    }
    if (!Number.isFinite(num)) continue;

    // Vuosi (P585) valinnainen
    let yr = null;
    const quals = st?.qualifiers?.P585;
    if (Array.isArray(quals) && quals[0]?.datavalue?.value?.time) {
      const t = quals[0].datavalue.value.time; // '+2010-00-00T00:00:00Z'
      const m = String(t).match(/(\d{4})/);
      if (m) yr = Number(m[1]);
    }

    const rankScore = st?.rank === "preferred" ? 2 : st?.rank === "normal" ? 1 : 0;
    const cand = { value: num, year: yr, _rank: rankScore };
    if (!best) best = cand;
    else {
      if (cand._rank !== best._rank) best = cand._rank > best._rank ? cand : best;
      else if ((cand.year ?? -Infinity) !== (best.year ?? -Infinity))
        best = (cand.year ?? -Infinity) > (best.year ?? -Infinity) ? cand : best;
      else if (cand.value > best.value) best = cand;
    }
  }

  return best ? { value: best.value, year: best.year } : null;
}
