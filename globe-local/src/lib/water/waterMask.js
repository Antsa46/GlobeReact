// src/lib/water/waterMask.js
import * as THREE from "three";
import { drawPolyFill, strokePoly, lonLatToMercatorUV } from "../geo/mercator";

const LAKES_110 = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_lakes.geojson";
const LAKES_50  = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson";
const LAKES_10  = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson";
const RIVERS_110= "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_rivers_lake_centerlines.geojson";
const RIVERS_50 = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson";
const RIVERS_10 = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson";

async function fetchJSON(url){ const r = await fetch(url,{mode:"cors"}); if(!r.ok) throw new Error(url); return r.json(); }

/** Rakentaa RG-maskin (R=järvet, G=joet). */
export async function buildWaterMaskCanvas(W, H, z, { riverWidthFactor=1.0, lakeErodePx=0.6 } = {}){
  try{
    const need10m = z>=3;
    const [l110,l50,l10,r110,r50,r10] = await Promise.allSettled([
      fetchJSON(LAKES_110), fetchJSON(LAKES_50), need10m ? fetchJSON(LAKES_10) : Promise.resolve(null),
      fetchJSON(RIVERS_110), fetchJSON(RIVERS_50), need10m ? fetchJSON(RIVERS_10) : Promise.resolve(null),
    ]);
    const lakes  = (l10.value||l50.value||l110.value);
    const rivers = (r10.value||r50.value||r110.value);

    const cvs = document.createElement("canvas");
    cvs.width=W; cvs.height=H;
    const ctx = cvs.getContext("2d"); ctx.clearRect(0,0,W,H);

    // 1) Järvet → R
    if (lakes?.features){
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,0,0,1)";
      lakes.features.forEach(f=>{
        const g=f.geometry; if(!g) return;
        if (g.type==="Polygon") drawPolyFill(ctx,g.coordinates,W,H);
        else if(g.type==="MultiPolygon") g.coordinates.forEach(p=>drawPolyFill(ctx,p,W,H));
      });
      // kevyt kutistus
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.strokeStyle="rgba(0,0,0,1)";
      ctx.lineWidth=Math.max(0.4, (W/4096)*lakeErodePx);
      lakes.features.forEach(f=>{
        const g=f.geometry; if(!g) return;
        if (g.type==="Polygon") strokePoly(ctx,g.coordinates,W,H);
        else if(g.type==="MultiPolygon") g.coordinates.forEach(p=>strokePoly(ctx,p,W,H));
      });
    }

    // 2) Joet → G (erittäin ohut mahdollinen viiva)
    if (rivers?.features){
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle="rgba(0,255,0,1)";
      ctx.lineCap="round"; ctx.lineJoin="round";

      const drawLine = (line)=>{
        if (!line || line.length<2) return;

        // Pienin leveys todella ohueksi; riverWidthFactor voi olla 0.02..2.0
        const base = Math.max(0.01, (W/4096)*0.06) * Math.max(0.02, riverWidthFactor);
        const minPix = Math.max(3.0, W/1200);

        let [lonPrev, latPrev] = line[0];
        let [uPrev, vPrev] = lonLatToMercatorUV(
          THREE.MathUtils.degToRad(lonPrev), THREE.MathUtils.degToRad(latPrev)
        );

        ctx.beginPath();
        ctx.moveTo(uPrev*W, vPrev*H);

        let kept=0;
        for (let i=1;i<line.length;i++){
          const [lon,lat] = line[i];
          const [u,v] = lonLatToMercatorUV(
            THREE.MathUtils.degToRad(lon), THREE.MathUtils.degToRad(lat)
          );
          const dx=(u-uPrev)*W, dy=(v-vPrev)*H;
          if (dx*dx+dy*dy < minPix*minPix) continue;

          const latRad = THREE.MathUtils.degToRad((latPrev+lat)*0.5);
          const latScale = Math.max(0.40, Math.cos(latRad)); // ohuempi pohjoisessa
          ctx.lineWidth = Math.max(0.01, base*latScale);

          ctx.lineTo(u*W, v*H);
          uPrev=u; vPrev=v; latPrev=lat; kept++;
        }
        if (kept>0) ctx.stroke();
      };

      rivers.features.forEach(f=>{
        const g=f.geometry; if(!g) return;
        if (g.type==="LineString") drawLine(g.coordinates);
        else if (g.type==="MultiLineString") g.coordinates.forEach(drawLine);
      });
    }

    return cvs;
  }catch(e){
    console.warn("Water mask build failed:", e);
    return null;
  }
}

export async function buildWaterMaskTexture(W,H,z,opts){
  const cvs = await buildWaterMaskCanvas(W,H,z,opts);
  if(!cvs) return null;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}
