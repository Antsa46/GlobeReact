// src/lib/borders/bordersMask.js
import * as THREE from "three";
import { strokePoly, lonLatToMercatorUV } from "../geo/mercator";

// Natural Earth -rajat (line features)
const BORDERS_110 = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_boundary_lines_land.geojson";
const BORDERS_50  = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_boundary_lines_land.geojson";
const BORDERS_10  = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_boundary_lines_land.geojson";

async function fetchJSON(url){ const r = await fetch(url,{mode:"cors"}); if(!r.ok) throw new Error(url); return r.json(); }

export async function buildBordersMaskCanvas(W, H, z, { widthPx = 0.9, alpha = 1.0 } = {}){
  try{
    const need10m = z>=3;
    const json = (need10m ? await fetchJSON(BORDERS_10) : await fetchJSON(BORDERS_50).catch(()=>fetchJSON(BORDERS_110)));

    const cvs = document.createElement("canvas");
    cvs.width=W; cvs.height=H;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0,0,W,H);

    // piirretään ALPHA-kanavaan: ensin täytetään mustalla läpinäkyvällä,
    // sitten viivat “valkoisella” alpha-värillä (shader käyttää A-kanavaa)
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(0.5, (W/4096) * widthPx * 1.1);

    const drawLine = (coords)=>{
      if (!coords || coords.length < 2) return;
      ctx.beginPath();
      let [lon0,lat0] = coords[0];
      let [u0,v0] = lonLatToMercatorUV(THREE.MathUtils.degToRad(lon0), THREE.MathUtils.degToRad(lat0));
      ctx.moveTo(u0*W, v0*H);
      for (let i=1;i<coords.length;i++){
        const [lon,lat] = coords[i];
        const [u,v] = lonLatToMercatorUV(THREE.MathUtils.degToRad(lon), THREE.MathUtils.degToRad(lat));
        ctx.lineTo(u*W, v*H);
      }
      ctx.stroke();
    };

    json.features?.forEach(f=>{
      const g=f.geometry; if(!g) return;
      if (g.type==="LineString") drawLine(g.coordinates);
      else if (g.type==="MultiLineString") g.coordinates.forEach(drawLine);
    });

    return cvs;
  }catch(e){
    console.warn("Borders mask build failed:", e);
    return null;
  }
}

export async function buildBordersMaskTexture(W,H,z,opts){
  const cvs = await buildBordersMaskCanvas(W,H,z,opts);
  if(!cvs) return null;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  // tärkeä: käytetään vain A-kanavaa shaderissa
  tex.format = THREE.RGBAFormat;
  return tex;
}
