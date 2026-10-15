"use client";

// Hero: satu-satunya meja — meja penjaga museum di lobi, dilihat dari atas.
// Model CC0 (Poly Haven): meja besi, senter vintage, radio transceiver, jam weker, lampu meja, map log jaga.
// Ditambah benda kecil buatan sendiri: mug kopi, kunci, topi, kartu ID, dan brosur pameran
// (satu-satunya tempat nama tertulis).
import { useEffect, useMemo } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import { plainPaperTexture } from "../textures";
import { Mug } from "../objects/DeskProps";
import { Asset, MODELS } from "../hd/Asset";
import { FONT, Lettering } from "./Lettering";
import type { Drive } from "../objects/types";
import type { Copy } from "./copy";

export const GUARD_TOP = 0.788;

function Keys({ position }: { position: [number, number, number] }) {
  const brass = <meshStandardMaterial color="#B89A5E" metalness={0.9} roughness={0.28} />;
  return (
    <group position={position}>
      <mesh rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[0.024, 0.0035, 10, 40]} />
        {brass}
      </mesh>
      {[0.3, 1.1, 2.0].map((a, i) => (
        <group key={i} rotation-y={a} position={[0, 0.002 + i * 0.002, 0]}>
          <RoundedBox args={[0.055, 0.003, 0.012]} radius={0.001} position={[0.055, 0, 0]} castShadow>
            {brass}
          </RoundedBox>
          <mesh position={[0.034, 0, 0]}>
            <cylinderGeometry args={[0.011, 0.011, 0.004, 24]} />
            {brass}
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Cap({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh castShadow>
        <sphereGeometry args={[0.095, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1f2430" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.0965, 0.0965, 0.024, 40, 1, true]} />
        <meshStandardMaterial color="#c9a55c" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.004, 0.105]} scale={[1, 0.12, 0.7]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 40, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#151820" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function GuardDesk({ f, position, copy }: { f: Drive; position: [number, number, number]; copy: Copy }) {
  const paper = useMemo(() => plainPaperTexture(), []);
  useEffect(() => () => paper.dispose(), [paper]);
  const T = GUARD_TOP;

  return (
    <group position={position}>
      <Asset src={MODELS.desk} rotation-y={Math.PI} />

      {/* Brosur pameran di tengah meja, menghadap pengunjung (kamera) */}
      <group position={[-0.05, T + 0.004, 0.08]} rotation-y={0.04}>
        <mesh rotation-x={-Math.PI / 2} castShadow receiveShadow>
          <planeGeometry args={[0.42, 0.297]} />
          <meshStandardMaterial map={paper} roughness={0.9} />
        </mesh>
        <Lettering
          f={f}
          k={0}
          always
          width={2.1}
          scale={0.17}
          rotation-x={-Math.PI / 2}
          position={[-0.18, 0.001, -0.12]}
          items={[
            { kind: "kicker", text: copy.brochure.kicker },
            { kind: "title", text: "Self-Running Machines", size: 0.27 },
            { kind: "body", text: copy.brochure.body },
            { kind: "hand", text: copy.brochure.hint },
          ]}
        />
      </group>

      {/* Benda-benda penjaga */}
      <Asset src={MODELS.binder} position={[-0.6, T, 0.12]} rotation-y={0.1} hide={["binder_notebook_closed"]} />
      <Asset src={MODELS.flashlight} position={[0.42, T, 0.24]} rotation-y={1.9} />
      <Asset src={MODELS.radio} position={[-0.72, T + 0.032, -0.26]} rotation-y={0.35} scale={0.75} />
      <Asset src={MODELS.clock} position={[0.36, T, -0.28]} rotation-y={-0.4} />
      <Asset src={MODELS.lamp} position={[0.8, T + 0.088, -0.3]} rotation-y={-2.4} />
      <pointLight position={[0.62, T + 0.42, -0.1]} intensity={0.3} distance={1.4} decay={1.6} color="#ffe2b8" />
      <Mug position={[0.66, T, 0.12]} scale={0.15} />
      <Keys position={[-0.28, T + 0.004, 0.33]} />
      <Cap position={[0.83, T + 0.002, 0.3]} rotation={-0.5} />

      {/* Kartu ID penjaga */}
      <group position={[0.24, T + 0.003, 0.33]} rotation-y={-0.25}>
        <mesh rotation-x={-Math.PI / 2} castShadow>
          <planeGeometry args={[0.085, 0.055]} />
          <meshStandardMaterial color={P.paper} roughness={0.5} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.0005, -0.019]}>
          <planeGeometry args={[0.085, 0.017]} />
          <meshStandardMaterial color="#1f2430" />
        </mesh>
        <Text rotation-x={-Math.PI / 2} position={[0, 0.001, -0.019]} font={FONT.mono} fontSize={0.009} letterSpacing={0.1} color={P.paper}>
          SECURITY
        </Text>
        <Text rotation-x={-Math.PI / 2} position={[0, 0.001, 0.008]} font={FONT.mono} fontSize={0.006} color={P.ink}>
          NIGHT SHIFT · GALLERY A
        </Text>
      </group>
    </group>
  );
}
