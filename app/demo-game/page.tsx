"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Platform = { x: number; y: number; z: number; w: number; d: number };
const platforms: Platform[] = [
  { x: 0, y: 0, z: 0, w: 8, d: 8 },
  { x: 5, y: 1.35, z: 0, w: 3.2, d: 3.2 },
  { x: 9, y: 2.55, z: 2, w: 3.2, d: 3.2 },
  { x: 13, y: 3.65, z: 0, w: 3.2, d: 3.2 },
  { x: 17, y: 4.7, z: -2, w: 4, d: 4 },
];

export default function CrystalRunPage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const restart = useCallback(() => {
    setScore(0);
    setWon(false);
    setLost(false);
    setResetKey(v => v + 1);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      host.textContent = "WebGL no está disponible en este navegador.";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071321");
    scene.fog = new THREE.Fog("#071321", 22, 55);
    const camera = new THREE.PerspectiveCamera(60, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 120);
    camera.position.set(-7, 8, 12);

    scene.add(new THREE.HemisphereLight(0xbdeaff, 0x17243c, 2));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(5, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const grid = new THREE.GridHelper(60, 60, 0x28516c, 0x173044);
    grid.position.y = -0.52;
    scene.add(grid);

    const platformMaterial = new THREE.MeshStandardMaterial({ color: "#1d4260", metalness: 0.35, roughness: 0.48 });
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: "#28d9ee", emissive: "#087c9a", emissiveIntensity: 0.65 });
    platforms.forEach((p, i) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.5, p.d), platformMaterial.clone());
      mesh.position.set(p.x, p.y - 0.25, p.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.08, 0.08, p.d + 0.08), edgeMaterial);
      rim.position.set(p.x, p.y - 0.02, p.z);
      scene.add(rim);
      const beacon = new THREE.PointLight("#21cce7", 1.2, 5);
      beacon.position.set(p.x, p.y + 0.4, p.z);
      scene.add(beacon);
    });

    const player = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.38, 0.72, 8, 16),
      new THREE.MeshStandardMaterial({ color: "#ffc857", metalness: 0.2, roughness: 0.35 })
    );
    player.position.set(-1.5, 1.05, 0);
    player.castShadow = true;
    scene.add(player);

    const gems: THREE.Mesh[] = [];
    const gemPositions = [
      new THREE.Vector3(1.5, 1.0, 0),
      new THREE.Vector3(5, 2.25, 0),
      new THREE.Vector3(9, 3.45, 2),
      new THREE.Vector3(13, 4.55, 0),
      new THREE.Vector3(17, 5.65, -2),
    ];
    const gemGeometry = new THREE.OctahedronGeometry(0.42, 0);
    gemPositions.forEach(pos => {
      const gem = new THREE.Mesh(gemGeometry, new THREE.MeshStandardMaterial({ color: "#53f3dc", emissive: "#087e75", emissiveIntensity: 1.1, metalness: 0.45, roughness: 0.2 }));
      gem.position.copy(pos);
      gem.castShadow = true;
      scene.add(gem);
      gems.push(gem);
    });

    const goal = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.13, 16, 48), new THREE.MeshStandardMaterial({ color: "#b58aff", emissive: "#6e35cf", emissiveIntensity: 1.4, metalness: 0.3 }));
    ring.rotation.y = Math.PI / 2;
    goal.add(ring);
    const goalLight = new THREE.PointLight("#a879ff", 3, 9);
    goalLight.position.set(0, 0, 0);
    goal.add(goalLight);
    goal.position.set(18.2, 6.0, -2);
    scene.add(goal);

    const keys = new Set<string>();
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      keys.add(k);
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let velocityY = 0;
    let grounded = false;
    let collected = 0;
    let ended = false;
    let frame = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    const playerRadius = 0.38;
    const resize = () => {
      if (disposed) return;
      const w = Math.max(host.clientWidth, 1);
      const h = Math.max(host.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const animate = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.04);
      const t = clock.elapsedTime;
      if (!ended) {
        const forward = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
        const side = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        const move = new THREE.Vector3(side, 0, forward);
        if (move.lengthSq() > 0) move.normalize().multiplyScalar(5.2 * dt);
        player.position.x += move.x;
        player.position.z += move.z;
        if ((keys.has(" ") || keys.has("space")) && grounded) {
          velocityY = 8.5;
          grounded = false;
        }
        const previousFoot = player.position.y - 0.72;
        velocityY -= 20 * dt;
        player.position.y += velocityY * dt;
        grounded = false;
        for (const p of platforms) {
          const inside = Math.abs(player.position.x - p.x) <= p.w / 2 + playerRadius && Math.abs(player.position.z - p.z) <= p.d / 2 + playerRadius;
          const foot = player.position.y - 0.72;
          if (inside && velocityY <= 0 && previousFoot >= p.y - 0.18 && foot <= p.y + 0.12) {
            player.position.y = p.y + 0.72;
            velocityY = 0;
            grounded = true;
          }
        }
        player.rotation.z = THREE.MathUtils.damp(player.rotation.z, -side * 0.12, 8, dt);
        player.rotation.x = THREE.MathUtils.damp(player.rotation.x, forward * 0.08, 8, dt);

        gems.forEach((gem, i) => {
          if (!gem.visible) return;
          gem.rotation.y += dt * 1.8;
          gem.position.y = gemPositions[i].y + Math.sin(t * 2.4 + i) * 0.12;
          if (player.position.distanceTo(gem.position) < 1.05) {
            gem.visible = false;
            collected += 1;
            setScore(collected);
          }
        });
        goal.rotation.y += dt * 0.45;
        if (player.position.distanceTo(goal.position) < 1.65) {
          ended = true;
          setWon(true);
        }
        if (player.position.y < -8) {
          ended = true;
          setLost(true);
        }
      }

      const target = new THREE.Vector3(player.position.x - 5.5, player.position.y + 5.5, player.position.z + 8);
      camera.position.lerp(target, 1 - Math.pow(0.001, dt));
      camera.lookAt(player.position.x + 1.2, player.position.y + 0.5, player.position.z);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => m.dispose());
        }
      });
      renderer.dispose();
      host.replaceChildren();
    };
  }, [resetKey]);

  return (
    <main style={{ minHeight: "100vh", background: "#071321", color: "#eaf6ff", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: "1px solid #234057", flexWrap: "wrap" }}>
        <div><Link href="/" style={{ color: "#7cecff", textDecoration: "none", fontWeight: 800 }}>NEXUS ENGINE</Link><span style={{ color: "#8299ad", marginLeft: 12 }}>/ CRYSTAL RUN</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><strong>◇ {score}/5 CRYSTALS</strong><button onClick={restart} style={{ border: "1px solid #3d718d", background: "#15334a", color: "white", borderRadius: 8, padding: "9px 14px", cursor: "pointer" }}>↻ Restart</button></div>
      </header>
      <section style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#9db5c8", fontSize: 13 }}>
        <span>WASD / Flechas: mover · ESPACIO: saltar · Recoge cristales y alcanza el portal violeta.</span>
        <span style={{ color: "#54e6d5" }}>DEMO PLAYABLE · 3D PLATFORMER</span>
      </section>
      <div style={{ position: "relative", flex: 1, minHeight: 480, margin: "0 16px 16px", border: "1px solid #1d4057", borderRadius: 14, overflow: "hidden" }}>
        <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
        {(won || lost) && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#06101dcc", backdropFilter: "blur(5px)" }}>
          <div style={{ textAlign: "center", padding: 28, border: "1px solid #37627c", borderRadius: 16, background: "#10263a", maxWidth: 380 }}>
            <div style={{ fontSize: 42 }}>{won ? "🏆" : "↻"}</div>
            <h1 style={{ margin: "8px 0", color: won ? "#6df5df" : "#ffc857" }}>{won ? "Portal reached!" : "Try again!"}</h1>
            <p style={{ color: "#b3c9d9" }}>{won ? `You collected ${score} of 5 crystals. Great run!` : "You fell off the platforms. Give it another try."}</p>
            <button onClick={restart} style={{ border: 0, background: "#39cde0", color: "#061321", borderRadius: 9, padding: "11px 20px", fontWeight: 800, cursor: "pointer" }}>Play again</button>
          </div>
        </div>}
      </div>
      <footer style={{ padding: "0 20px 16px", color: "#68859b", fontSize: 11 }}>NEXUS: Crystal Run · Built with Three.js · Prototype game inside NEXUS Game Engine</footer>
    </main>
  );
}
