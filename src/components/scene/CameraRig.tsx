"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const REST_LOOK = new THREE.Vector3(0, -1.6, -2);

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

interface Props {
  /** When set, GSAP flies the camera there and calls onArrive. */
  target: CameraTarget | null;
  onArrive?: () => void;
  parallax?: boolean;
  base?: [number, number, number];
}

export function CameraRig({
  target,
  onArrive,
  parallax = true,
  base = [0, 5, 10],
}: Props) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const flying = useRef(false);
  const look = useRef(new THREE.Vector3(0, -1.6, -2));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (!target) return;
    flying.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        flying.current = false;
        onArrive?.();
      },
    });
    tl.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: 1.4,
      ease: "power2.inOut",
    });
    tl.to(
      look.current,
      { x: target.lookAt[0], y: target.lookAt[1], z: target.lookAt[2], duration: 1.4, ease: "power2.inOut" },
      0,
    );
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useFrame(() => {
    if (!flying.current) {
      const px = parallax ? mouse.current.x * 0.8 : 0;
      const py = parallax ? -mouse.current.y * 0.4 : 0;
      camera.position.x += (base[0] + px - camera.position.x) * 0.05;
      camera.position.y += (base[1] + py - camera.position.y) * 0.05;
      camera.position.z += (base[2] - camera.position.z) * 0.05;
      look.current.lerp(REST_LOOK, 0.05);
    }
    camera.lookAt(look.current);
  });

  return null;
}
