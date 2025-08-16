import * as THREE from "three";

/** Mercator-proj. (lon,lat radiaaneina) -> UV [0..1] */
export function lonLatToMercatorUV(lonRad, latRad) {
  const PI = Math.PI;
  const maxLat = THREE.MathUtils.degToRad(85.05112878); // ≈1.48442223
  const clampedLat = THREE.MathUtils.clamp(latRad, -maxLat, maxLat);

  const u = (lonRad + PI) / (2 * PI);
  const v = (1 - Math.log(Math.tan(PI / 4 + clampedLat / 2)) / PI) * 0.5;
  return [u, v];
}

/** Täyttää Polygon/MultiPolygonin yhden polygonin rengassarjan (rings) perusteella. 
 *  Parametri `rings` on GeoJSON-Polygonin "coordinates" (array of LinearRings).
 *  Koordinaatit tulevat asteina -> muunnetaan radiaaneiksi täällä.
 */
export function drawPolyFill(ctx, rings, W, H) {
  if (!Array.isArray(rings) || rings.length === 0) return;
  ctx.beginPath();

  for (const ring of rings) {
    if (!Array.isArray(ring) || ring.length < 3) continue;

    // ensimmäinen piste
    let [lon0, lat0] = ring[0];
    let [u0, v0] = lonLatToMercatorUV(
      THREE.MathUtils.degToRad(lon0),
      THREE.MathUtils.degToRad(lat0)
    );
    ctx.moveTo(u0 * W, v0 * H);

    // loput
    for (let i = 1; i < ring.length; i++) {
      const [lon, lat] = ring[i];
      const [u, v] = lonLatToMercatorUV(
        THREE.MathUtils.degToRad(lon),
        THREE.MathUtils.degToRad(lat)
      );
      ctx.lineTo(u * W, v * H);
    }
    ctx.closePath(); // sulje rinkula
  }

  ctx.fill();
}

/** Piirtää reunaviivan samalle rengassarjalle (Polygon/LinearRings). */
export function strokePoly(ctx, rings, W, H) {
  if (!Array.isArray(rings) || rings.length === 0) return;

  for (const ring of rings) {
    if (!Array.isArray(ring) || ring.length < 2) continue;

    ctx.beginPath();
    let [lon0, lat0] = ring[0];
    let [u0, v0] = lonLatToMercatorUV(
      THREE.MathUtils.degToRad(lon0),
      THREE.MathUtils.degToRad(lat0)
    );
    ctx.moveTo(u0 * W, v0 * H);

    for (let i = 1; i < ring.length; i++) {
      const [lon, lat] = ring[i];
      const [u, v] = lonLatToMercatorUV(
        THREE.MathUtils.degToRad(lon),
        THREE.MathUtils.degToRad(lat)
      );
      ctx.lineTo(u * W, v * H);
    }
    ctx.stroke();
  }
}
