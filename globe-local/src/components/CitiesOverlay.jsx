import React, { useCallback } from "react";
import * as THREE from "three";

export default function CitiesOverlay({
  radius,
  map,
  opacity = 0.75,
  visible = true,
  blending = "normal",
  colorHex = "#ffffff",
  onPickPoint,                   // ({x,y,z}) local-space
}) {
  const handleDoubleClick = useCallback(
    (e) => {
      const hit = e.intersections?.find((i) => i.object === e.object) || null;
      const pWorld = hit?.point || e.point;
      if (!pWorld) return;
      const pLocal = pWorld.clone();
      e.object.worldToLocal(pLocal);           // <- tärkeä!
      onPickPoint?.({ x: pLocal.x, y: pLocal.y, z: pLocal.z });
      e.stopPropagation?.();
    },
    [onPickPoint]
  );

  return (
    <mesh
      renderOrder={999}
      visible={!!visible && !!map}
      onDoubleClick={handleDoubleClick}
    >
      <sphereGeometry args={[radius + 0.003, 128, 64]} />
      <meshBasicMaterial
        map={map || null}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        opacity={opacity}
        color={colorHex}
        blending={blending === "add" ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
}
