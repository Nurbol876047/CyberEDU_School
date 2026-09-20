"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import type { ModuleInfo } from "@/data/modules";

interface Props {
  info: ModuleInfo;
  completed: boolean;
  stars: number;
  lowPerf?: boolean;
  position?: [number, number, number];
  /** Render the label above the island (back row on portrait screens). */
  labelAbove?: boolean;
  onClick: (info: ModuleInfo) => void;
}

export function Island({ info, completed, stars, lowPerf, position, labelAbove, onClick }: Props) {
  const ly = labelAbove ? 2.6 : -2.15;
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = new THREE.Color(info.color);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glow.current) {
      const base = completed ? 0.9 : 0.5 + Math.sin(t * 2) * 0.35;
      glow.current.emissiveIntensity = hovered ? base + 0.6 : base;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.4;
      ring.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <group position={position ?? info.position}>
      <Float speed={lowPerf ? 0 : 1.2} floatIntensity={0.4} rotationIntensity={0.1}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onClick(info);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <mesh position={[0, -0.9, 0]}>
            <coneGeometry args={[1.6, 1.8, 6]} />
            <meshStandardMaterial color="#2c3e63" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[1.6, 1.6, 0.3, 6]} />
            <meshStandardMaterial ref={glow} color={color} emissive={color} emissiveIntensity={0.5} flatShading roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.9} flatShading />
          </mesh>
          {[0.9, -0.8, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.3, i === 1 ? 0.8 : -0.7]}>
              <dodecahedronGeometry args={[0.18 + i * 0.05, 0]} />
              <meshStandardMaterial color="#4b5f8c" flatShading />
            </mesh>
          ))}
          <mesh ref={ring} position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 1.95, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          {/* stars earned */}
          {Array.from({ length: stars }).map((_, i) => (
            <mesh key={i} position={[(i - (stars - 1) / 2) * 0.55, 1.75, 0]}>
              <torusGeometry args={[0.16, 0.05, 8, 20]} />
              <meshStandardMaterial color="#ffd900" emissive="#ffd900" emissiveIntensity={1.5} />
            </mesh>
          ))}
        </group>
      </Float>
      <Text font="/fonts/Rubik-SemiBold.ttf" position={[0, ly, 1.4]} fontSize={0.36} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#0a0e20">
        {completed ? "✓ " : ""}
        {info.title}
      </Text>
      <Text font="/fonts/Rubik-SemiBold.ttf" position={[0, ly - 0.4, 1.4]} fontSize={0.22} color={info.color} anchorX="center" anchorY="middle">
        {info.subtitle}
      </Text>
    </group>
  );
}
