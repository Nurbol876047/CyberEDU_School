"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Placeholder low-poly mentor: capsule body + sphere head + antenna. */
export function Mentor({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const g = useRef<THREE.Group>(null);
  const eye = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g.current) {
      g.current.position.y = position[1] + Math.sin(t * 2.5) * 0.08;
      g.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    }
    if (eye.current) eye.current.emissiveIntensity = 1 + Math.sin(t * 6) * 0.4;
  });
  return (
    <group ref={g} position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.28, 0.5, 4, 8]} />
        <meshStandardMaterial color="#2dd4bf" flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#e6edf7" flatShading />
      </mesh>
      {/* visor */}
      <mesh position={[0, 1.27, 0.22]}>
        <boxGeometry args={[0.42, 0.14, 0.18]} />
        <meshStandardMaterial ref={eye} color="#0a0e20" emissive="#facc15" emissiveIntensity={1} />
      </mesh>
      {/* antenna */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.36, 0.6, 0]} rotation={[0, 0, s * 0.5]}>
          <capsuleGeometry args={[0.07, 0.3, 4, 6]} />
          <meshStandardMaterial color="#14b8a6" flatShading />
        </mesh>
      ))}
    </group>
  );
}
