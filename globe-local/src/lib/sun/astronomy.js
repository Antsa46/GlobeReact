import * as THREE from "three";

export function daysSinceJ2000(dateUTC){
  return (dateUTC.getTime() - Date.UTC(2000,0,1,12,0,0)) / 86400000;
}
export function sunDirectionFromDate(dateUTC){
  const d = daysSinceJ2000(dateUTC);
  const L = (280.460 + 0.9856474 * d) % 360;
  const g = (357.528 + 0.9856003 * d) % 360;
  const Lr = THREE.MathUtils.degToRad(L);
  const gr = THREE.MathUtils.degToRad(g);
  const lambda = Lr + THREE.MathUtils.degToRad(1.915) * Math.sin(gr)
                   + THREE.MathUtils.degToRad(0.020) * Math.sin(2*gr);
  const eps = THREE.MathUtils.degToRad(23.4397);
  const sinL = Math.sin(lambda), cosL = Math.cos(lambda);
  const alpha = Math.atan2(Math.cos(eps)*sinL, cosL);
  const delta = Math.asin(Math.sin(eps)*sinL);
  const GST = THREE.MathUtils.degToRad((280.46061837 + 360.98564736629 * d) % 360);
  const H = GST - alpha;
  const x = Math.cos(delta) * Math.cos(H);
  const y = Math.sin(delta);
  const z = Math.cos(delta) * Math.sin(H);
  return new THREE.Vector3(x,y,z).normalize();
}
