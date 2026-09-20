"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useProgress } from "@/store/progress";

interface Props {
  /** 0..1 strength */
  strength: number;
  color: string;
}

function ShieldSphere({ strength, color }: Props) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const shell = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Color(color));
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    target.current.set(color);
    if (mat.current) {
      mat.current.emissive.lerp(target.current, 0.08);
      mat.current.color.lerp(target.current, 0.08);
      const base = 0.15 + strength * 1.1;
      mat.current.emissiveIntensity += (base + Math.sin(t * 3) * 0.15 * strength - mat.current.emissiveIntensity) * 0.1;
    }
    if (shell.current) {
      shell.current.rotation.y = t * 0.4;
      shell.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      const s = 1.25 + strength * 0.35;
      shell.current.scale.setScalar(shell.current.scale.x + (s - shell.current.scale.x) * 0.1);
      (shell.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + strength * 0.35;
    }
  });
  return (
    <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.2}>
      <mesh>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.4} flatShading />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} wireframe transparent opacity={0.2} />
      </mesh>
    </Float>
  );
}

export function Shield3D({ strength, color }: Props) {
  const lowPerf = useProgress((s) => s.lowPerf);
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={lowPerf ? 1 : [1, 2]} gl={{ alpha: true, antialias: !lowPerf }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={2} />
      <pointLight position={[-3, -2, 2]} intensity={1} color={color} />
      {!lowPerf && <Stars radius={30} depth={10} count={600} factor={2} fade />}
      {!lowPerf && strength > 0.5 && <Sparkles count={40} scale={4} size={3} speed={0.6} color={color} />}
      <ShieldSphere strength={strength} color={color} />
    </Canvas>
  );
}
