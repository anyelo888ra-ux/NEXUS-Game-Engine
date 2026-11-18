"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { EngineObject, EngineProject, getProject, saveProject } from "@/lib/storage";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<EngineProject | null>(null);
  const [status, setStatus] = useState("Loading project…");
  const [objectName, setObjectName] = useState("Cube");
  const [busy, setBusy] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    params.then(({ id }) => getProject(id).then((p) => {
      if (!active) return;
      if (p) { setProject(p); setStatus("Project loaded · Local workspace"); }
      else setStatus("Project not found in this browser.");
    }).catch(() => { if (active) setStatus("Could not read local project."); }));
    return () => { active = false; };
  }, [params]);

  const persist = useCallback(async (next: EngineProject) => {
    setProject(next);
    setStatus("Saving locally…");
    try {
      await saveProject({ ...next, updatedAt: Date.now() });
      setStatus("Saved locally");
    } catch {
      setStatus("Save failed — check browser storage permissions.");
    }
  }, []);

  const addCube = useCallback(() => {
    if (!project) return;
    const obj: EngineObject = { id: crypto.randomUUID(), name: objectName.trim() || "Cube", type: "mesh" };
    void persist({ ...project, scene: { ...project.scene, objects: [...project.scene.objects, obj] } });
  }, [objectName, persist, project]);

  async function importModel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !project) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "glb" && extension !== "gltf" && extension !== "obj") {
      setStatus("Unsupported format. Choose GLB, glTF or OBJ.");
      event.target.value = "";
      return;
    }
    setBusy(true);
    const obj: EngineObject = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ""),
      type: "mesh",
      asset: file.slice(0, file.size, file.type || "application/octet-stream"),
      format: extension,
    };
    await persist({ ...project, scene: { ...project.scene, objects: [...project.scene.objects, obj] } });
    setBusy(false);
    event.target.value = "";
  }

  useEffect(() => {
    const host = viewportRef.current;
    if (!host || !project) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setStatus("WebGL is unavailable. Enable hardware acceleration or try another browser.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1422");
    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 1000);
    camera.position.set(5, 4, 7);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.8, 0);
    scene.add(new THREE.HemisphereLight(0xb9dcff, 0x253044, 2.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(5, 9, 6);
    scene.add(sun);
    scene.add(new THREE.GridHelper(20, 20, 0x39718b, 0x26394d));
    scene.add(new THREE.AxesHelper(2));

    let disposed = false;
    const objectUrls: string[] = [];
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x50d8e8, metalness: 0.12, roughness: 0.55 });

    for (const item of project.scene.objects) {
      if (item.type !== "mesh") continue;
      if (!item.asset || !item.format) {
        const cube = new THREE.Mesh(geometry, material);
        cube.name = item.name;
        cube.position.y = 0.5;
        scene.add(cube);
        continue;
      }
      const url = URL.createObjectURL(item.asset);
      objectUrls.push(url);
      if (item.format === "obj") {
        item.asset.text().then((text) => {
          if (disposed) return;
          const model = new OBJLoader().parse(text);
          model.name = item.name;
          model.position.y = 0;
          scene.add(model);
        }).catch(() => setStatus("Could not load OBJ model: " + item.name));
      } else {
        new GLTFLoader().load(url, (gltf) => {
          if (disposed) return;
          gltf.scene.name = item.name;
          scene.add(gltf.scene);
        }, undefined, () => setStatus("Could not load " + item.name + ". Try exporting as GLB from Blender."));
      }
    }

    const resize = () => {
      if (!host || disposed) return;
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    let frame = 0;
    const render = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      objectUrls.forEach(URL.revokeObjectURL);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      host.replaceChildren();
    };
  }, [project]);

  if (!project) return <main className="shell" style={{ padding: 40 }}><p>{status}</p><Link href="/" className="btn">Back to projects</Link></main>;

  return <main className="editor-layout">
    <header className="editorbar">
      <div className="brand"><div className="logo">N</div><Link href="/">NEXUS ENGINE</Link><span className="muted">/ {project.name}</span><span className="pill">0.2 ALPHA</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span className="muted mono" style={{ fontSize: 11 }}>{status}</span><Link href="/credits" className="btn">Credits</Link><Link href="/" className="btn">Projects</Link></div>
    </header>
    <section className="editor-workspace">
      <aside className="sidepanel">
        <div className="panel-label">HIERARCHY · {project.scene.objects.length} OBJECTS</div>
        {project.scene.objects.map((o) => <div className="object-row" key={o.id}>◇ {o.name}<small className="muted" style={{ display: "block", paddingLeft: 18 }}>{o.format ? o.format.toUpperCase() : o.type}</small></div>)}
        <div style={{ marginTop: 24 }} className="panel-label">CREATE</div>
        <input className="field" value={objectName} onChange={(e) => setObjectName(e.target.value)} aria-label="Object name" />
        <button className="btn primary" style={{ width: "100%" }} onClick={addCube}>＋ Add cube</button>
        <button className="btn" style={{ width: "100%", marginTop: 9 }} onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? "Importing…" : "↑ Import 3D model"}</button>
        <input ref={fileRef} type="file" accept=".glb,.gltf,.obj,model/gltf-binary,model/gltf+json" onChange={(e) => void importModel(e)} style={{ display: "none" }} />
        <p className="muted" style={{ fontSize: 11, lineHeight: 1.6, marginTop: 12 }}>Supported: GLB, glTF and OBJ. For Blender, export as GLB for the best results.</p>
      </aside>
      <div className="viewport viewport-live" ref={viewportRef}>
        <div className="viewport-hint">3D VIEW · Drag to orbit · Scroll to zoom · Right-drag to pan</div>
      </div>
      <aside className="sidepanel right">
        <div className="panel-label">INSPECTOR</div><h3 style={{ fontSize: 15 }}>Scene</h3>
        <p className="muted" style={{ fontSize: 13 }}>Interactive WebGL viewport powered by Three.js. Orbit, zoom and pan around your scene.</p>
        <div className="panel-label" style={{ marginTop: 30 }}>PROJECT</div><p className="muted mono" style={{ fontSize: 11, wordBreak: "break-all" }}>{project.id}</p>
        <div className="panel-label">STORAGE</div><p className="muted" style={{ fontSize: 12 }}>IndexedDB · This browser only</p>
        <div className="panel-label">IMPORT NOTES</div><p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>GLB embeds textures. A glTF file may need its external texture files beside it. OBJ geometry is supported; separate MTL materials are not included yet.</p>
      </aside>
    </section>
  </main>;
}
