"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 90;
const MAX_DIST = 4;

function NetworkField() {
  const groupRef = useRef<THREE.Group>(null);

  const { pointsGeo, linesGeo } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

      if (Math.random() > 0.82) {
        // Accent orange
        col[i * 3]     = 0.98;
        col[i * 3 + 1] = 0.45;
        col[i * 3 + 2] = 0.24;
      } else {
        // Brand indigo/blue gradient
        const t = Math.random();
        col[i * 3]     = 0.27 + t * 0.22;
        col[i * 3 + 1] = 0.35 + t * 0.24;
        col[i * 3 + 2] = 0.88 + t * 0.09;
      }
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ptGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    // Build connection lines between nearby nodes
    const verts: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pos[i * 3]     - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < MAX_DIST * MAX_DIST) {
          verts.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2],
          );
        }
      }
    }

    const lnGeo = new THREE.BufferGeometry();
    lnGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(verts), 3),
    );

    return { pointsGeo: ptGeo, linesGeo: lnGeo };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow base rotation + mouse parallax
    groupRef.current.rotation.y = t * 0.04 + state.mouse.x * 0.4;
    groupRef.current.rotation.x =
      Math.sin(t * 0.15) * 0.08 - state.mouse.y * 0.15;
  });

  return (
    <group ref={groupRef}>
      <points geometry={pointsGeo}>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial color="#7c96f8" transparent opacity={0.14} />
      </lineSegments>
    </group>
  );
}

export function HeroBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 55 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      <NetworkField />
    </Canvas>
  );
}
