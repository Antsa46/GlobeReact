import React, { useMemo } from "react";
import * as THREE from "three";

export default function GlobeMaterial({
  terrariumTex,
  waterMaskTex,
  bordersTex,                             // ← uutta
  texelSize = [1 / 1024, 1 / 512],
  seaLevelMeters = 0,
  dispScale = 1 / 6371000,
  exaggeration = 30,
  enableSun = false,
  sunDir = new THREE.Vector3(1, 0, 0),

  inlandCap = 2000.0,
  riverNarrow = -0.30,
  riverSharpness = 1.4,
  riverMix = 0.12,
  lakeMix = 0.35,

  // borders-uniformit
  showBorders = false,
  borderOpacity = 0.8,
  borderColor = [0.08, 0.10, 0.13],
}) {
  const uniforms = useMemo(
    () => ({
      terrarium: { value: terrariumTex },
      waterMask: { value: waterMaskTex || null },
      hasMask:   { value: waterMaskTex ? 1.0 : 0.0 },

      bordersMask: { value: bordersTex || null },         // ← uutta
      hasBorders:  { value: bordersTex ? 1.0 : 0.0 },
      showBorders: { value: showBorders ? 1.0 : 0.0 },
      borderOpacity: { value: borderOpacity },
      borderColor: { value: new THREE.Color(...borderColor) },

      seaLevel: { value: seaLevelMeters },
      dispScale: { value: dispScale * exaggeration },
      texel: { value: new THREE.Vector2(...texelSize) },
      enableSun: { value: enableSun ? 1.0 : 0.0 },
      sunDir: { value: sunDir.clone().normalize() },

      inlandCap: { value: inlandCap },
      riverNarrow: { value: riverNarrow },
      riverSharpness: { value: riverSharpness },
      riverMix: { value: riverMix },
      lakeMix: { value: lakeMix },
    }),
    [
      terrariumTex, waterMaskTex, bordersTex,
      seaLevelMeters, dispScale, exaggeration, texelSize,
      enableSun, sunDir,
      inlandCap, riverNarrow, riverSharpness, riverMix, lakeMix,
      showBorders, borderOpacity, borderColor,
    ]
  );

  // ——— sinun aiempi vertexShader sellaisenaan ———
  const vertexShader = /* glsl */`
    uniform sampler2D terrarium;
    uniform float seaLevel;
    uniform float dispScale;

    varying vec2 vUvEQ;
    varying vec3 vNormalW;

    float terrariumMeters(vec3 rgb01){
      vec3 c = rgb01 * 255.0;
      return (c.r * 256.0 + c.g + c.b/256.0) - 32768.0;
    }
    void uvToLonLat(vec2 uv, out float lon, out float lat){
      lon = (uv.x * 2.0 - 1.0) * 3.14159265359;
      lat = (0.5 - uv.y) * 3.14159265359;
    }
    vec2 lonLatToMercatorUV(float lon, float lat){
      float PI = 3.14159265359;
      float u = (lon + PI) / (2.0 * PI);
      float cl = clamp(lat, -1.48442222975, 1.48442222975);
      float v = (1.0 - log(tan(PI/4.0 + cl/2.0)) / PI) * 0.5;
      return vec2(u, v);
    }
    void main(){
      vUvEQ = uv;
      float lon, lat; uvToLonLat(uv, lon, lat);
      vec2 uvM = lonLatToMercatorUV(lon, lat);
      float meters = terrariumMeters(texture2D(terrarium, uvM).rgb);
      float disp = (meters - seaLevel) * dispScale;
      vec3 displaced = position + normalize(position) * disp;
      vNormalW = normalize(mat3(modelMatrix) * normalize(displaced));
      gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);
    }
  `;

  // ——— sinun aiempi fragmentShader + rajat ———
  const fragmentShader = /* glsl */`
    uniform sampler2D terrarium;
    uniform sampler2D waterMask;   // R = lakes, G = rivers
    uniform float hasMask;
    uniform float seaLevel;
    uniform vec2  texel;
    uniform float enableSun;
    uniform vec3  sunDir;

    uniform float inlandCap;
    uniform float riverNarrow;
    uniform float riverSharpness;
    uniform float riverMix;
    uniform float lakeMix;

    // borders
    uniform sampler2D bordersMask;
    uniform float hasBorders;
    uniform float showBorders;
    uniform float borderOpacity;
    uniform vec3  borderColor;

    varying vec2 vUvEQ;
    varying vec3 vNormalW;

    float terrariumMeters(vec3 rgb01){
      vec3 c = rgb01 * 255.0;
      return (c.r * 256.0 + c.g + c.b/256.0) - 32768.0;
    }
    void uvToLonLat(vec2 uv, out float lon, out float lat){
      lon = (uv.x * 2.0 - 1.0) * 3.14159265359;
      lat = (0.5 - uv.y) * 3.14159265359;
    }
    vec2 lonLatToMercatorUV(float lon, float lat){
      float PI = 3.14159265359;
      float u = (lon + PI) / (2.0 * PI);
      float cl = clamp(lat, -1.48442222975, 1.48442222975);
      float v = (1.0 - log(tan(PI/4.0 + cl/2.0)) / PI) * 0.5;
      return vec2(u, v);
    }
    float hash12(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }
    vec3 mix3(vec3 a, vec3 b, float t){ return mix(a,b,clamp(t,0.0,1.0)); }

    void main(){
      float lon, lat; uvToLonLat(vUvEQ, lon, lat);
      vec2 uvM = lonLatToMercatorUV(lon, lat);

      float meters = terrariumMeters(texture2D(terrarium, uvM).rgb);
      float rel = meters - seaLevel;

      vec3 mm = (hasMask > 0.5) ? texture2D(waterMask, uvM).rgb : vec3(0.0);

      float lakeM = smoothstep(0.85, 0.98, mm.r) * smoothstep(inlandCap, 0.0, rel);

      float baseLo = 0.48;
      float baseHi = 0.70;
      float lo = baseLo + riverNarrow * 0.08;
      float hi = baseHi - riverNarrow * 0.08;
      hi = max(hi, lo + 0.02);
      float riverBand    = smoothstep(lo, hi, mm.g);
      float lakeSuppress = smoothstep(0.60, 0.90, mm.r);
      float sharp = max(0.5, riverSharpness);
      riverBand = pow(clamp(riverBand, 0.0, 1.0), sharp);
      float riverM = max(0.0, riverBand * (1.0 - lakeSuppress));

      bool seaWater = (rel <= 0.0);
      bool isWater  = seaWater || (lakeM > 0.0) || (riverM > 0.0);

      vec3 color;
      if (isWater){
        float depth = clamp((seaLevel - meters) / 10000.0, 0.0, 1.0);
        vec3 c0 = vec3(0.62,0.88,0.97);
        vec3 c1 = vec3(0.28,0.68,0.86);
        vec3 c2 = vec3(0.10,0.34,0.62);
        vec3 c3 = vec3(0.04,0.16,0.35);
        color = (depth < 0.33) ? mix(c0,c1, depth/0.33)
              : (depth < 0.66) ? mix(c1,c2, (depth-0.33)/0.33)
                               : mix(c2,c3, (depth-0.66)/0.34);
        color = mix(color, vec3(0.72,0.90,0.99), clamp(lakeM,0.0,1.0) * clamp(lakeMix,0.0,1.0));
        color = mix(color, vec3(0.70,0.88,0.98), clamp(riverM,0.0,1.0) * clamp(riverMix,0.0,1.0));
      } else {
        float landH = max(rel, 0.0);
        vec3 lightG = vec3(0.86,0.97,0.76);
        vec3 green  = vec3(0.35,0.70,0.35);
        vec3 darkG  = vec3(0.18,0.45,0.20);
        vec3 brown1 = vec3(0.72,0.58,0.40);
        vec3 brown2 = vec3(0.55,0.40,0.25);
        vec3 brown3 = vec3(0.40,0.28,0.18);
        if (landH < 1000.0){
          float t = clamp(landH / 1000.0, 0.0, 1.0);
          color = (t < 0.5) ? mix3(lightG, green, t*2.0) : mix3(green, darkG, (t-0.5)*2.0);
        } else {
          float t = clamp((landH - 1000.0) / 4000.0, 0.0, 1.0);
          color = (t < 0.5) ? mix3(brown1, brown2, t*2.0) : mix3(brown2, brown3, (t-0.5)*2.0);
        }
      }

      // rantapisteet
      float shoreBand = 6.0;
      float nearShore = 1.0 - clamp(abs(rel)/shoreBand, 0.0, 1.0);
      float speckle = step(0.92, hash12(vUvEQ*vec2(4096.0,2048.0)));
      float dots = speckle * nearShore;
      color = mix(color, vec3(0.0), dots*0.6);

      // maiden rajat (overlay)
      if (showBorders > 0.5 && hasBorders > 0.5){
        float b = texture2D(bordersMask, uvM).r;          // 0..1 viivalla
        color = mix(color, borderColor, b * borderOpacity);
      }

      float lambert = max(dot(normalize(vNormalW), normalize(sunDir)), 0.0);
      float lit = mix(1.0, 0.25 + 1.25 * lambert, enableSun);
      color *= lit;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <shaderMaterial attach="material" args={[{ uniforms, vertexShader, fragmentShader }]} />;
}
