import { useMemo, useEffect } from "react";
import * as THREE from "three";

export default function CitiesOverlay({
  scene,
  radius,
  map,
  opacity = 0.75,
  visible = true,
  blending = "normal", // "normal" ei haalista jokia
  colorHex = "#ffffff",
}) {
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(radius + 0.003, 128, 64);
    const material = new THREE.MeshBasicMaterial({
      map: null,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending:
        blending === "add" ? THREE.AdditiveBlending : THREE.NormalBlending,
      opacity,
      color: new THREE.Color(colorHex),
      toneMapped: false,
    });
    const m = new THREE.Mesh(geometry, material);
    m.frustumCulled = true;
    m.renderOrder = 999;
    return m;
  }, [radius, blending, opacity, colorHex]);

  useEffect(() => {
    if (scene && mesh) {
      scene.add(mesh);
      return () => scene.remove(mesh);
    }
  }, [scene, mesh]);

  useEffect(() => {
    if (mesh?.material) {
      mesh.material.map = map || null;
      mesh.material.needsUpdate = true;
    }
  }, [map, mesh]);

  useEffect(() => {
    if (mesh) mesh.visible = !!visible && !!map;
  }, [visible, map, mesh]);

  useEffect(() => {
    if (mesh?.material) {
      mesh.material.opacity = opacity;
      mesh.material.color.set(colorHex);
      mesh.material.needsUpdate = true;
    }
  }, [opacity, colorHex, mesh]);

  return null;
}
