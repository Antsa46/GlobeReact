import * as THREE from "three";

export async function buildTerrariumMosaic(z=2){
  const tiles = 1 << z;
  const TILE = 256;
  const W = tiles*TILE, H = tiles*TILE;

  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0,0,W,H);

  const load = (x,y)=> new Promise((res)=>{
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res({x,y,img});
    img.onerror = () => res({x,y,img:null});
    img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  });

  const jobs = [];
  for (let y=0;y<tiles;y++) for (let x=0;x<tiles;x++) jobs.push(load(x,y));
  const results = await Promise.all(jobs);
  results.forEach(({x,y,img}) => { if(img) ctx.drawImage(img, x*TILE, y*TILE); });

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return { texture: tex, width: W, height: H };
}
