"use client";

// Konsep meja (lanjutan P1): satu meja kerja nyata dilihat dari atas, kamera miring 3/4 ke benda
// yang berdiri. Semua penjelasan tertulis tangan di post-it. Benda bergerak hanya karena scroll.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, SoftShadows, useGLTF, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, SSAO, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { P } from "../palette";
import { matTexture, plainPaperTexture } from "../textures";
import { stopMix } from "../useScrollProgress";
import { Pencil, Sheet } from "../objects/DeskProps";
import { Asset, MODELS } from "../hd/Asset";
import { useFonts } from "../final/useFonts";
import { PhoneFarmRack } from "./PhoneFarmRack";
import { HD, Model, type Fit } from "./Model";
import { Workstation } from "./Workstation";
import { INKS, heroPaper, jobCard, postIt, type HandFamilies, type NoteStyle } from "./paper";
import { useHands } from "./useHands";
import { BOARD_Y, DESK, DESK_STOPS, SPOT, TOP, WALL_Z, deskIndex } from "./stops";
import { IPhone } from "./IPhone";
import type { Copy, Note } from "./copy";
import type { Drive } from "../objects/types";
import type { Quality } from "./quality";
import { applyFraming, makeAxes } from "./frame";
import { DeskText } from "./DeskText";
import { GradCorner } from "./GradCorner";

[MODELS.lamp, MODELS.plant, MODELS.binder].forEach((m) => useGLTF.preload(m));

/** Sembilan sertifikat dengan gambar asli (folder bahanserti), disusun 3×3 di pegboard. */
const CERT_IMAGES = [
  { src: "/assets-3d/certs/bootcamp.jpg", aspect: 1200 / 900 },
  { src: "/assets-3d/certs/google.jpg", aspect: 484 / 374 },
  { src: "/assets-3d/certs/azure.jpg", aspect: 484 / 374 },
  { src: "/assets-3d/certs/cs-cyber.jpg", aspect: 1200 / 849 },
  { src: "/assets-3d/certs/hcia.jpg", aspect: 566 / 800 },
  { src: "/assets-3d/certs/cs-network.jpg", aspect: 1200 / 849 },
  { src: "/assets-3d/certs/cs-pentest.jpg", aspect: 1200 / 849 },
  { src: "/assets-3d/certs/cs-linux.jpg", aspect: 1200 / 849 },
  { src: "/assets-3d/certs/mos.jpg", aspect: 1400 / 1081 },
] as const;

/** Gaya tulisan tiap post-it — sengaja beragam: spidol, pulpen, pensil; polos, bergaris, kotak, titik. */
const STYLE: Record<string, NoteStyle> = {
  about0: { hand: "kalam", ink: INKS.blue, paper: "lined", deco: "underline", doodle: "smile" },
  about1: { hand: "marker", deco: "none" },
  about2: { hand: "marker", ink: INKS.red, deco: "none" },
  about3: { hand: "marker", ink: INKS.blue, deco: "none" },
  farmagent: { hand: "marker", deco: "underline", bullets: "none", doodle: "arrow" },
  sonar: { hand: "kalam", ink: INKS.blue, paper: "grid", deco: "circle", bullets: "dash" },
  promptedsite: { hand: "patrick", deco: "highlight", bullets: "check", doodle: "star" },
  viralengine: { hand: "gochi", ink: INKS.green, paper: "dots", deco: "box", bullets: "arrow" },
  security: { hand: "shadows", ink: INKS.marker, paper: "lined", deco: "underline", bullets: "dot", doodle: "star" },
  skill0: { hand: "marker", deco: "underline", bullets: "none" },
  skill1: { hand: "kalam", ink: INKS.blue, paper: "grid", deco: "circle", bullets: "dash" },
  skill2: { hand: "gochi", ink: INKS.red, paper: "lined", deco: "highlight", bullets: "check" },
  experience: { hand: "patrick", ink: INKS.blue, deco: "underline", doodle: "arrow" },
  certificates: { hand: "caveat", paper: "dots", deco: "circle", doodle: "star" },
  education: { hand: "kalam", ink: INKS.green, paper: "grid", deco: "box" },
};

const PEG_FIT: Fit = { axis: "z", size: 2.2 };
const BINDER_HIDE = ["binder_notebook_closed"];
/** Pegboard SKÅDIS berwarna putih seperti aslinya. */
const whitePeg = (m: THREE.Mesh) => {
  m.material = new THREE.MeshStandardMaterial({ color: "#fbfaf6", roughness: 0.5, metalness: 0.02 });
};


/** Selotip kertas setengah transparan (penanda post-it benar-benar ditempel). */
function Tape({ w = 0.06, rot = 0, position }: { w?: number; rot?: number; position: [number, number, number] }) {
  return (
    <mesh position={position} rotation-z={rot}>
      <planeGeometry args={[w, w * 0.32]} />
      <meshStandardMaterial color="#efe6cf" transparent opacity={0.72} roughness={0.9} depthWrite={false} />
    </mesh>
  );
}

/** Post-it tunggal dengan gaya tulisan tertentu; digambar ulang saat bahasa berganti. */
function PostIt({
  note,
  hands,
  style,
  size = 0.1,
  tape = false,
  ...props
}: {
  note: Note;
  hands: HandFamilies;
  style: NoteStyle;
  size?: number;
  tape?: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const t = useMemo(() => postIt(note, hands, style), [note, hands, style]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <group {...props}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, 0.0008]} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={note.color ?? "#F6DD7A"} />
        ))}
        <meshStandardMaterial attach="material-4" map={t} roughness={0.85} />
      </mesh>
      {tape && <Tape w={size * 0.42} rot={-0.06} position={[0, size / 2 - size * 0.02, 0.0012]} />}
    </group>
  );
}

/** Post-it yang berbaring di permukaan meja (dibaca dari atas). */
function DeskNote(props: { note: Note; hands: HandFamilies; style: NoteStyle; size?: number; x: number; z: number; rot?: number; lift?: number }) {
  return (
    <PostIt
      note={props.note}
      hands={props.hands}
      style={props.style}
      size={props.size}
      position={[props.x, TOP + 0.002 + (props.lift ?? 0), props.z]}
      rotation={[-Math.PI / 2, 0, props.rot ?? 0]}
    />
  );
}


/** Serat kertas: normal map & roughness dari noise, dipakai bersama semua kertas di pegboard. */
const PAPER = (() => {
  if (typeof document === "undefined") return null;
  const n = 256;
  const h = new Float32Array(n * n);
  // Noise halus + serat memanjang acak
  for (let i = 0; i < n * n; i++) h[i] = Math.random() * 0.35;
  for (let k = 0; k < 900; k++) {
    let x = Math.random() * n, y = Math.random() * n;
    const a = Math.random() * Math.PI, len = 6 + Math.random() * 18;
    for (let t = 0; t < len; t++) {
      h[(Math.floor(y + n) % n) * n + (Math.floor(x + n) % n)] += 0.5;
      x += Math.cos(a);
      y += Math.sin(a);
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(n, n);
  const r = document.createElement("canvas");
  r.width = r.height = n;
  const rctx = r.getContext("2d")!;
  const rimg = rctx.createImageData(n, n);
  const at = (x: number, y: number) => h[((y + n) % n) * n + ((x + n) % n)];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 0.9;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 0.9;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * n + x) * 4;
      img.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / l) * 255;
      img.data[i + 3] = 255;
      const v = 200 + at(x, y) * 60;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.min(255, v);
      rimg.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  rctx.putImageData(rimg, 0, 0);
  const normal = new THREE.CanvasTexture(c);
  const rough = new THREE.CanvasTexture(r);
  for (const t of [normal, rough]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
  }
  return { normal, rough };
})();

/** Lembar kertas sedikit melengkung: tepi bawah menjauh dari papan, dengan gelombang halus. */
function curledSheet(w: number, h: number, seed: number) {
  const g = new THREE.PlaneGeometry(w, h, 12, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / w + 0.5;
    const v = p.getY(i) / h + 0.5; // 1 = atas (dijepit)
    const down = 1 - v;
    const z = down * down * 0.006 + Math.sin(u * Math.PI * 2 + seed) * 0.0007 * down + Math.abs(u - 0.5) * down * 0.004;
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  return g;
}

/** Kertas yang dijepit di pegboard. */
function Pinned({ map, w, h, x, y, rot = 0, pin = true }: { map: THREE.Texture; w: number; h: number; x: number; y: number; rot?: number; pin?: boolean }) {
  const geo = useMemo(() => curledSheet(w, h, x * 7 + y * 3), [w, h, x, y]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group position={[x, y, WALL_Z + 0.05]} rotation-z={rot}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial
          map={map}
          normalMap={PAPER?.normal ?? null}
          normalScale={[0.35, 0.35]}
          roughnessMap={PAPER?.rough ?? null}
          roughness={0.95}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
        />
      </mesh>
      {pin && (
        // Klip penjepit kertas di kait pegboard
        <group position={[0, h / 2 - 0.004, 0.006]}>
          <mesh castShadow>
            <boxGeometry args={[0.032, 0.016, 0.01]} />
            <meshStandardMaterial color="#1c1c1e" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.016, -0.004]}>
            <torusGeometry args={[0.009, 0.0013, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#c9c7c3" metalness={1} roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function DeskLamp({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={target} position={[0.7, TOP, 0.18]} />
      <spotLight
        position={[0.9, TOP + 0.42, -0.14]}
        target={target}
        angle={0.95}
        penumbra={0.85}
        intensity={1.6}
        distance={1.6}
        decay={1.6}
        color="#ffd9a8"
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.002}
        shadow-camera-near={0.05}
        shadow-camera-far={1.6}
      />
    </>
  );
}

function useRoomPBR() {
  const floor = useTexture({
    map: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_diff_1k.jpg",
    normalMap: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_nor_gl_1k.jpg",
    roughnessMap: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_rough_1k.jpg",
  });
  const wall = useTexture({
    normalMap: "/assets-3d/textures/white_plaster_02/white_plaster_02_nor_gl_1k.jpg",
    roughnessMap: "/assets-3d/textures/white_plaster_02/white_plaster_02_rough_1k.jpg",
  });
  const oak = useTexture({
    map: "/assets-3d/textures/oak_veneer_01/oak_veneer_01_diff_1k.jpg",
    normalMap: "/assets-3d/textures/oak_veneer_01/oak_veneer_01_nor_gl_1k.jpg",
    roughnessMap: "/assets-3d/textures/oak_veneer_01/oak_veneer_01_rough_1k.jpg",
  });
  return useMemo(() => {
    const prep = (set: Record<string, THREE.Texture>, rx: number, ry: number) => {
      const out: Record<string, THREE.Texture> = {};
      for (const [k, t] of Object.entries(set)) {
        const c = t.clone();
        c.wrapS = c.wrapT = THREE.RepeatWrapping;
        c.repeat.set(rx, ry);
        c.anisotropy = 8;
        if (k === "map") c.colorSpace = THREE.SRGBColorSpace;
        c.needsUpdate = true;
        out[k] = c;
      }
      return out;
    };
    return { floor: prep(floor, 6, 6), wall: prep(wall, 3, 1.5), oak: prep(oak, 2, 1) };
  }, [floor, wall, oak]);
}

/** Efek layar sesuai tier: AO + bloom + vignette (high), bloom (mid), tanpa post (low). */
function Post({ mode }: { mode: Quality["post"] }) {
  if (mode === "none") return null;
  if (mode === "bloom")
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.3} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={4} enableNormalPass>
      {/* Ambient occlusion: sudut & sela antar benda menggelap halus (skala meja, satuan meter) */}
      <SSAO
        samples={16}
        rings={5}
        radius={0.05}
        intensity={14}
        luminanceInfluence={0.6}
        bias={0.02}
        worldDistanceThreshold={3}
        worldDistanceFalloff={1}
        worldProximityThreshold={0.03}
        worldProximityFalloff={0.02}
        color="#2a1d12"
      />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.3} />
      <Vignette offset={0.3} darkness={0.35} />
    </EffectComposer>
  );
}

export function DeskScene({ f, copy, quality: q, onReady, onPhone }: { f: Drive; copy: Copy; quality: Quality; onReady?: () => void; onPhone?: () => void }) {
  const fonts = useFonts();
  const pbr = useRoomPBR();
  const mat = useMemo(() => matTexture("#2f6f55"), []); // hijau cutting mat klasik
  useEffect(() => () => mat.dispose(), [mat]);

  const paper = useMemo(() => (fonts ? heroPaper(copy.portfolio, fonts.serif) : null), [fonts, copy]);
  const hands = useHands();
  const monitorNotes = useMemo(() => {
    if (!hands) return null;
    return (["sonar", "promptedsite", "viralengine", "security"] as const).map((k) => postIt(copy.projects[k], hands, STYLE[k]));
  }, [hands, copy]);
  const certImages = useTexture(CERT_IMAGES.map((c) => c.src));
  useEffect(() => {
    certImages.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [certImages]);
  const board = useMemo(() => {
    if (!fonts) return null;
    return {
      jobs: copy.jobs.map((j) => jobCard(j, fonts.serif, fonts.sans, fonts.mono)),
    };
  }, [fonts, copy]);
  useEffect(() => () => paper?.dispose(), [paper]);
  const blank = useMemo(() => plainPaperTexture(), []);
  useEffect(() => () => blank.dispose(), [blank]);
  // Komponen ini baru ter-mount setelah semua aset (Suspense) selesai; beri tahu loader saat font juga siap.
  useEffect(() => {
    if (fonts && hands) onReady?.();
  }, [fonts, hands, onReady]);
  useEffect(() => () => monitorNotes?.forEach((t) => t.dispose()), [monitorNotes]);
  useEffect(
    () => () => {
      if (board) board.jobs.forEach((t) => t.dispose());
    },
    [board],
  );

  // Penggerak scroll
  const farmRun = useRef(0);
  const screen = useRef(-1);
  const noteIdx = useRef(0);
  const galleryScroll = useRef(0);
  const look = useRef(new THREE.Vector3(...DESK_STOPS[0].look));
  const vecs = useMemo(() => DESK_STOPS.map((s) => ({ p: new THREE.Vector3(...s.pos), l: new THREE.Vector3(...s.look) })), []);
  const tmp = useRef({ p: new THREE.Vector3(), l: new THREE.Vector3() });
  const tmpAxes = useRef(makeAxes());
  const I = { farm: deskIndex("farmagent"), sonar: deskIndex("sonar"), ps: deskIndex("promptedsite"), sec: deskIndex("security") };

  useFrame((state, dt) => {
    const v = f.current;
    const { camera, pointer } = state;
    const { a, b, t } = stopMix(v, DESK_STOPS.length, 0.3);
    const { p, l } = tmp.current;
    p.lerpVectors(vecs[a].p, vecs[b].p, t);
    l.lerpVectors(vecs[a].l, vecs[b].l, t);
    const A = DESK_STOPS[a], B = DESK_STOPS[b];
    const span = THREE.MathUtils.lerp(A.span, B.span, t);
    const side = THREE.MathUtils.lerp(A.text?.side ?? 0, B.text?.side ?? 0, t);
    const text = THREE.MathUtils.lerp(A.text ? 1 : 0, B.text ? 1 : 0, t);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = applyFraming(p, l, span, side, text, cam.aspect, tmpAxes.current);
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const reach = Math.min(1, p.distanceTo(l) / 4);
    l.x += pointer.x * 0.08 * reach;
    l.y += pointer.y * 0.05 * reach;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, p.x, 4.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, p.y, 4.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, p.z, 4.5, dt);
    look.current.x = THREE.MathUtils.damp(look.current.x, l.x, 4.5, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, l.y, 4.5, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, l.z, 4.5, dt);
    camera.lookAt(look.current);

    farmRun.current = THREE.MathUtils.clamp((v - (I.farm - 0.5)) / 0.8, 0, 1) * (v > I.farm + 0.8 ? 0 : 1);
    screen.current = v > I.sonar - 0.5 && v < I.sec + 0.6 ? v - I.sonar : -1;
    noteIdx.current = THREE.MathUtils.clamp(v - I.sonar, 0, 3);
    galleryScroll.current = THREE.MathUtils.clamp((v - (I.ps - 0.4)) / 0.8, 0, 1);
  });

  const [rx, rz] = SPOT.rack;
  const [mx, mz] = SPOT.monitor;
  const [mtx, mtz] = SPOT.mat;
  const [px, pz] = SPOT.paper;
  const [ax, az] = SPOT.about;
  const [sx, sz] = SPOT.skills;
  const [phx, phz] = SPOT.phone;
  const BY = BOARD_Y;

  return (
    <>
      <color attach="background" args={[P.cream]} />
      {/* Dengan bayangan: cahaya pengisi diredam supaya bayangan jendela terbaca; tanpa bayangan: lebih rata */}
      <ambientLight intensity={q.shadows ? 0.1 : 0.3} />
      <hemisphereLight args={["#fffaf2", "#d9c7ae", q.shadows ? 0.42 : 0.5]} />
      {/* Bayangan lembut PCSS: tajam di dekat titik kontak, makin kabur makin jauh (seperti cahaya jendela asli) */}
      {q.soft && <SoftShadows size={10} samples={12} focus={0.4} />}
      {/* Cahaya jendela dari kiri depan; di-remount saat tier berubah supaya peta bayangan dibuat ulang */}
      <directionalLight
        key={q.tier}
        castShadow={q.shadows}
        position={[-2.2, 3.4, 2.2]}
        intensity={q.shadows ? 2.1 : 1.35}
        color="#fff1df"
        shadow-mapSize={[q.shadowMap, q.shadowMap]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        // Skala meja (benda 1–4 cm): bias harus kecil, ±1 texel peta bayangan, supaya bayangan tidak terkikis.
        shadow-bias={-0.0001}
        shadow-normalBias={4 / q.shadowMap}
      />

      {/* Ruangan */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial {...pbr.floor} color="#eadfce" />
      </mesh>
      <mesh position={[0, 1.6, WALL_Z - 0.05]} receiveShadow>
        <boxGeometry args={[6, 3.2, 0.1]} />
        <meshStandardMaterial {...pbr.wall} color="#f3ede4" />
      </mesh>

      {/* Meja oak + rangka baja */}
      <RoundedBox args={[DESK.w, 0.04, DESK.d]} radius={0.008} position={[0, TOP - 0.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...pbr.oak} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (DESK.w / 2 - 0.1), 0, 0]}>
          {[-1, 1].map((z) => (
            <mesh key={z} position={[0, (TOP - 0.04) / 2, z * (DESK.d / 2 - 0.08)]} castShadow>
              <boxGeometry args={[0.04, TOP - 0.04, 0.04]} />
              <meshStandardMaterial color="#1f2023" metalness={0.6} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, TOP - 0.07, 0]} castShadow>
            <boxGeometry args={[0.04, 0.04, DESK.d - 0.12]} />
            <meshStandardMaterial color="#1f2023" metalness={0.6} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Rak phone farm */}
      <group position={[rx, TOP, rz]} rotation-y={0.32}>
        {fonts && <PhoneFarmRack fonts={fonts} run={farmRun} />}
      </group>
      {/* Binder terbuka di kiri-depan rak; post-it FarmAgent menempel di halaman kanannya, di samping teks 3D */}
      <group position={[-1.02, 0, 0.059]} rotation-y={0.35}>
        <Asset src={MODELS.binder} position={[0, TOP, 0]} hide={BINDER_HIDE} />
        {hands && <DeskNote note={copy.projects.farmagent} hands={hands} style={STYLE.farmagent} size={0.13} x={0.098} z={-0.006} rot={0.06} lift={0.0145} />}
      </group>

      {/* Monitor + Mac mini (Sonar, PromptedSite, ViralEngine, Security) */}
      {fonts && monitorNotes && (
        <Workstation fonts={fonts} glow={q.practicals} screen={screen} scroll={galleryScroll} notes={monitorNotes} noteIndex={noteIdx} position={[mx, TOP, mz]} />
      )}

      {/* Hero: cutting mat + tumpukan kertas (sedikit berantakan, tetap rapi dipandang) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.035]} position={[mtx, TOP + 0.001, mtz]} receiveShadow>
        <planeGeometry args={[0.96, 0.58]} />
        <meshStandardMaterial map={mat} roughness={0.85} />
      </mesh>
      {blank && <Sheet map={blank} w={0.5} h={0.344} rotation={[-Math.PI / 2, 0, 0.07]} position={[px + 0.035, TOP + 0.0022, pz + 0.02]} />}
      {paper && <Sheet map={paper} w={0.5} h={0.344} rotation={[-Math.PI / 2, 0, -0.03]} position={[px, TOP + 0.0034, pz]} />}
      <Pencil color="#f2c12e" eraser position={[px - 0.03, TOP + 0.006, pz + 0.215]} rotation-y={0.1} scale={0.13} />
      {hands && (
        <>
          <DeskNote note={copy.about[0]} hands={hands} style={STYLE.about0} size={0.15} x={ax + 0.01} z={az - 0.075} rot={0.07} lift={0.002} />
          <DeskNote note={copy.about[1]} hands={hands} style={STYLE.about1} size={0.075} x={ax - 0.075} z={az + 0.105} rot={-0.12} lift={0.0025} />
          <DeskNote note={copy.about[2]} hands={hands} style={STYLE.about2} size={0.075} x={ax + 0.012} z={az + 0.125} rot={0.06} lift={0.003} />
          <DeskNote note={copy.about[3]} hands={hands} style={STYLE.about3} size={0.075} x={ax + 0.098} z={az + 0.098} rot={0.16} lift={0.0035} />

          {/* Skills: tiga post-it saling tumpang tindih sedikit */}
          {copy.skills.map((n, i) => (
            <DeskNote
              key={n.title}
              note={n}
              hands={hands}
              style={STYLE[`skill${i}`]}
              size={0.13}
              x={sx - 0.125 + i * 0.122}
              z={sz + [0.0, 0.035, -0.01][i]}
              rot={[0.09, -0.05, 0.12][i]}
              lift={0.0004 * i}
            />
          ))}
        </>
      )}

      {/* Kontak & footer: iPhone + kartu nama */}
      {fonts && <IPhone fonts={fonts} copy={copy} onOpen={onPhone} position={[phx, TOP, phz]} rotation-y={-0.2} />}

      {/* Barang CC0 & personal */}
      <Asset src={MODELS.lamp} position={[1.05, TOP + 0.088, -0.36]} rotation-y={-2.6} />
      {q.practicals ? (
        // Lampu meja menyala: spot hangat ke arah iPhone & kartu nama, ikut menjatuhkan bayangan.
        <DeskLamp shadows={q.shadows} mapSize={q.tier === "high" ? 1024 : 512} />
      ) : (
        <pointLight position={[0.88, TOP + 0.45, -0.16]} intensity={0.35} distance={1.4} decay={1.6} color="#ffe2b8" />
      )}
      <Asset src={MODELS.plant} position={[-0.4, TOP, -0.5]} scale={0.3} />

      {/* Pegboard IKEA SKÅDIS (model HD) di belakang monitor */}
      <Model src={HD.pegboard} fit={PEG_FIT} onMesh={whitePeg} rotation-y={-Math.PI / 2} position={[0.05, BY - 0.47, WALL_Z + 0.02]} />
      {board && (
        <>
          {/* Pengalaman: 4 kartu 2×2 */}
          {board.jobs.map((m, i) => (
            <Pinned key={i} map={m} w={0.3} h={0.187} x={-0.9 + (i % 2) * 0.32} y={BY + 0.24 - Math.floor(i / 2) * 0.23} rot={((i * 7) % 5 - 2) * 0.008} />
          ))}
          {/* Sertifikat: 9 gambar asli, grid 3×3 (lebar 29 cm; pegboard tinggi 0.94 m: BY−0.47 … BY+0.47) */}
          {CERT_IMAGES.map((c, i) => {
            const w = c.aspect < 1 ? 0.155 : 0.29;
            const h = w / c.aspect;
            return (
              <Pinned
                key={c.src}
                map={certImages[i]}
                w={w}
                h={h}
                x={-0.21 + (i % 3) * 0.32}
                y={BY + 0.29 - Math.floor(i / 3) * 0.27}
                rot={[-0.012, 0.008, -0.004, 0.01, -0.008, 0.006, -0.01, 0.004, 0.012][i]}
              />
            );
          })}
        </>
      )}
      {hands && (
        <group position={[0, 0, WALL_Z + 0.056]}>
          <PostIt note={copy.experience} hands={hands} style={STYLE.experience} size={0.18} tape position={[-0.93, BY - 0.3, 0]} rotation={[0, 0, 0.03]} />
          <PostIt note={copy.certificates} hands={hands} style={STYLE.certificates} size={0.18} tape position={[0.85, BY + 0.27, 0]} rotation={[0, 0, -0.04]} />
        </group>
      )}
      {/* Pendidikan: sudut kelulusan (panji, rak buku, topi toga) di dinding kanan pegboard */}
      <GradCorner position={[1.56, BY + 0.02, WALL_Z]} />
      {/* Post-it pendidikan ditempel langsung di dinding, di tengah sudut kelulusan */}
      {hands && (
        <PostIt note={copy.education} hands={hands} style={STYLE.education} size={0.18} tape position={[1.56, BY - 0.01, WALL_Z + 0.002]} rotation={[0, 0, 0.025]} />
      )}

      {/* Penjelasan tiap perhentian: teks 3D melayang di sisi kosong bingkai */}
      <DeskText f={f} copy={copy} />

      <Post mode={q.post} />
    </>
  );
}
