"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES, type ModuleInfo } from "@/data/modules";
import { useProgress } from "@/store/progress";
import { Island } from "./Island";
import { Mentor } from "./Mentor";
import { CameraRig, type CameraTarget } from "./CameraRig";

export function IslandMap() {
  const router = useRouter();
  const modules = useProgress((s) => s.modules);
  const lowPerf = useProgress((s) => s.lowPerf);
  const [target, setTarget] = useState<CameraTarget | null>(null);
  const [fading, setFading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  // portrait screens: islands in a 2×2 grid and the camera pulled back a bit
  const [portrait, setPortrait] = useState(false);
  const base: [number, number, number] = portrait ? [0, 16, 26] : [0, 8.5, 13];
  const positions = (m: ModuleInfo): [number, number, number] => {
    if (!portrait) return m.position;
    const i = MODULES.indexOf(m);
    return [i % 2 === 0 ? -2.4 : 2.4, 0, 5 - Math.floor(i / 2) * 6.5];
  };
  useEffect(() => {
    const update = () => setPortrait(window.innerWidth / window.innerHeight < 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // mentor stands on the first island that is not completed yet (or the last one)
  const active = MODULES.find((m) => modules[m.slug].status !== "completed") ?? MODULES[MODULES.length - 1];

  const handleSelect = useCallback((info: ModuleInfo) => {
    if (pending) return;
    setPending(info.slug);
    const [x, y, z] = positions(info);
    setTarget({ position: [x, y + 2.2, z + 4.2], lookAt: [x, y + 0.5, z] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, portrait]);

  const handleArrive = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      if (pending) router.push(`/modules/${pending}`);
    }, 550);
  }, [pending, router]);

  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 55, far: 60 }}
        dpr={lowPerf ? [1, 1] : [1, 2]}
        gl={{ antialias: !lowPerf, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0a0e20"]} />
        <fog attach="fog" args={["#0a0e20", portrait ? 24 : 9, portrait ? 56 : 30]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} color="#dbeafe" />
        <pointLight position={[0, 4, 0]} intensity={2} color="#2dd4bf" distance={20} />
        <Suspense fallback={null}>
          <Stars radius={80} depth={40} count={lowPerf ? 800 : 3500} factor={4} saturation={0} fade speed={0.6} />
          {!lowPerf && (
            <Sparkles count={120} scale={[24, 8, 16]} size={2} speed={0.3} color="#2dd4bf" opacity={0.5} />
          )}
          {MODULES.map((m) => (
            <Island
              key={m.slug}
              info={m}
              completed={modules[m.slug].status === "completed"}
              stars={modules[m.slug].stars}
              lowPerf={lowPerf}
              position={positions(m)}
              labelAbove={portrait ? MODULES.indexOf(m) >= 2 : MODULES.indexOf(m) % 2 === 1}
              onClick={handleSelect}
            />
          ))}
          <Mentor
            position={[positions(active)[0] + 0.9, positions(active)[1] + 0.2, positions(active)[2] + 0.6]}
            scale={0.75}
          />
          {/* water plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, -2]}>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#0f1f45" roughness={0.3} metalness={0.4} />
          </mesh>
        </Suspense>
        <CameraRig target={target} onArrive={handleArrive} parallax={!lowPerf} base={base} />
      </Canvas>

      <AnimatePresence>
        {fading && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0a0e20]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
