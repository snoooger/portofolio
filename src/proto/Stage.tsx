"use client";

// Kanvas & pencahayaan bersama untuk semua prototipe. Environment dibuat dari Lightformer
// (tanpa unduhan HDR) supaya kaca & logam tetap punya pantulan studio yang lembut.
import { Suspense, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

export function Stage({
  children,
  shadows = true,
  antialias = true,
  env,
  ...props
}: CanvasProps & { children: ReactNode; env?: string; antialias?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows={shadows ? "soft" : false}
      gl={{ antialias, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      {...props}
    >
      <Suspense fallback={null}>{children}</Suspense>
      {env ? (
        // HDRI lokal (CC0, Poly Haven) untuk pantulan & cahaya realistis.
        <Environment files={env} environmentIntensity={0.55} />
      ) : (
        <Environment resolution={256} frames={1} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={2.2} color="#fff6ea" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#ffe2cf" position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={1.0} color="#e6eef5" position={[6, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 3, 7]} scale={3} />
        </Environment>
      )}
    </Canvas>
  );
}

/** Matahari lembut dari kiri atas, dengan bayangan. */
export function Sun({ position = [-5, 10, 6] as [number, number, number], size = 10, intensity = 1.7 }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#fff8ef", "#d8c7b0", 0.35]} />
      <directionalLight
        castShadow
        position={position}
        intensity={intensity}
        color="#fff3e4"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
      />
    </>
  );
}
