"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EngineProject, listProjects, saveProject, deleteProject } from "@/lib/storage";

function newProject(name: string): EngineProject {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    scene: { objects: [
      { id: "camera-main", name: "Main Camera", type: "camera" },
      { id: "light-main", name: "Directional Light", type: "light" }
    ]}
  };
}

export default function HomePage() {
  const [projects, setProjects] = useState<EngineProject[]>([]);
  const [name, setName] = useState("My First Game");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try { setProjects(await listProjects()); setError(""); }
    catch { setError("Local storage is unavailable. Try a modern browser with IndexedDB enabled."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function create() {
    const project = newProject(name.trim() || "Untitled Project");
    await saveProject(project);
    window.location.href = `/editor/${project.id}`;
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this local project? This cannot be undone.")) return;
    await deleteProject(id);
    await refresh();
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="logo">N</div><span>NEXUS <span style={{color:"var(--cyan)"}}>ENGINE</span></span></div>
      <span className="pill">ALPHA 0.1.0</span>
    </header>
    <section className="hero">
      <div className="eyebrow">Browser-native creation environment</div>
      <h1>Build worlds.<br/><span style={{color:"var(--cyan)"}}>Create games.</span></h1>
      <p className="subtitle">A lightweight 2D & 3D game engine experiment. Your projects are stored locally in this browser using IndexedDB — no account or cloud backup required.</p>
      <div className="actions">
        <input className="field" aria-label="Project name" value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:260,margin:0}}/>
        <button className="btn primary" onClick={()=>void create()}>＋ Create project</button>
      </div>
      {error && <p style={{color:"#ff9d9d"}}>{error}</p>}
    </section>
    <div className="section-title"><h2 style={{margin:0}}>Your projects</h2><span className="muted mono" style={{fontSize:12}}>LOCAL WORKSPACE</span></div>
    {loading ? <p className="muted">Loading local projects…</p> : projects.length === 0 ? <div className="card"><div className="iconbox">▧</div><h3>No projects yet</h3><p className="muted">Create your first project. It will stay in this browser on this device.</p></div> :
      <div className="project-list">{projects.map(p=><div className="project" key={p.id}>
        <div className="project-left"><div className="iconbox">◇</div><div><strong>{p.name}</strong><small>Updated {new Date(p.updatedAt).toLocaleString()}</small></div></div>
        <div className="actions" style={{margin:0}}><Link className="btn" href={`/editor/${p.id}`}>Open</Link><button className="btn" onClick={()=>void remove(p.id)}>Delete</button></div>
      </div>)}</div>}
    <div className="grid" style={{marginBottom:50}}>
      <div className="card"><div className="eyebrow">01 / Runtime</div><h3>2D & 3D core</h3><p className="muted">Rendering and scene systems are under construction.</p></div>
      <div className="card"><div className="eyebrow">02 / Storage</div><h3>Local-first</h3><p className="muted">Projects stay in your browser. Export and import tools are planned.</p></div>
      <div className="card"><div className="eyebrow">03 / AI Hub</div><h3>MCP integration</h3><p className="muted">A shared tool interface for AI coding assistants is planned.</p></div>
    </div>
  </main>;
}
