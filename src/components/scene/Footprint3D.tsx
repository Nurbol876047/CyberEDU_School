"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useProgress } from "@/store/progress";

interface Props {
  /** Labels of leaked data nodes; center node is "Ты". */
  leaks: string[];
  /** 0..1 how well the user did (affects color) */
  safety: number;
}

function Graph({ leaks, safety }: Props) {
  const group = useRef<THREE.Group>(null);
  const color = safety > 0.8 ? "#2dd4bf" : safety > 0.5 ? "#facc15" : "#f87171";
  const nodes = useMemo(() => {
    const n = leaks.length;
    return leaks.map((label, i) => {
      const a = (i / Math.max(n, 1)) * Math.PI * 2;
      const r = 2.2 + (i % 2) * 0.5;
      return { label, pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 1.7) * 0.8, Math.sin(a) * r) };
    });
  }, [leaks]);
  const progress = useRef(0);
  useFrame((_, dt) => {
    progress.current = Math.min(1, progress.current + dt * 0.35);
    if (group.current) group.current.rotation.y += dt * 0.15;
  });
  return (
    <group ref={group}>
      <Float speed={2} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial color="#e6edf7" emissive={color} emissiveIntensity={0.8} />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.3} color="#fff" font="/fonts/Rubik-SemiBold.ttf" anchorX="center">Ты</Text>
      </Float>
      {nodes.map((n, i) => (
        <group key={i}>
          <AnimatedLine to={n.pos} color={color} delay={i * 0.25} />
          <mesh position={n.pos}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} flatShading />
          </mesh>
          <Text position={[n.pos.x, n.pos.y + 0.45, n.pos.z]} fontSize={0.22} color={color} font="/fonts/Rubik-SemiBold.ttf" anchorX="center" outlineWidth={0.01} outlineColor="#0a0e20">
            {n.label}
          </Text>
        </group>
      ))}
      {/* connections between leaks: the more leaks, the denser the web */}
      {nodes.map((a, i) =>
        nodes.slice(i + 1).map((b, j) => (
          <Line key={`${i}-${j}`} points={[a.pos, b.pos]} color={color} transparent opacity={0.18} lineWidth={1} />
        )),
      )}
      {leaks.length === 0 && (
        <Text position={[0, -1.2, 0]} fontSize={0.28} color="#2dd4bf" font="/fonts/Rubik-SemiBold.ttf" anchorX="center">
          След чистый ✨
        </Text>
      )}
    </group>
  );
}

function AnimatedLine({ to, color, delay }: { to: THREE.Vector3; color: string; delay: number }) {
  const t = useRef(-delay);
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), []);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }), [color]);
  const line = useMemo(() => new THREE.Line(geom, mat), [geom, mat]);
  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt * 0.8);
    const k = Math.max(0, t.current);
    const p = to.clone().multiplyScalar(k);
    const arr = geom.attributes.position.array as Float32Array;
    arr[3] = p.x; arr[4] = p.y; arr[5] = p.z;
    geom.attributes.position.needsUpdate = true;
  });
  return <primitive object={line} />;
}

export function Footprint3D({ leaks, safety }: Props) {
  const lowPerf = useProgress((s) => s.lowPerf);
  return (
    <Canvas camera={{ position: [0, 2.5, 6], fov: 50 }} dpr={lowPerf ? 1 : [1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 5, 4]} intensity={2} />
      <Graph leaks={leaks} safety={safety} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
    </Canvas>
  );
}
