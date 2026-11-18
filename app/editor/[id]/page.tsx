"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EngineProject, getProject, saveProject } from "@/lib/storage";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<EngineProject | null>(null);
  const [status, setStatus] = useState("Loading project…");
  const [objectName, setObjectName] = useState("Cube");

  useEffect(() => {
    let active = true;
    params.then(({id}) => getProject(id).then(p => {
      if (!active) return;
      if (p) { setProject(p); setStatus("All changes saved locally"); }
      else setStatus("Project not found in this browser.");
    }).catch(() => setStatus("Could not read local project.")));
    return () => { active = false; };
  }, [params]);

  const persist = useCallback(async (next: EngineProject) => {
    setProject(next);
    setStatus("Saving…");
    try { await saveProject({...next, updatedAt:Date.now()}); setStatus("Saved locally"); }
    catch { setStatus("Save failed — check browser storage permissions."); }
  }, []);

  function addObject() {
    if (!project) return;
    const obj = {id:crypto.randomUUID(),name:objectName.trim()||"New Cube",type:"mesh" as const};
    void persist({...project,scene:{...project.scene,objects:[...project.scene.objects,obj]}});
  }

  if (!project) return <main className="shell" style={{padding:40}}><p>{status}</p><Link href="/" className="btn">Back to projects</Link></main>;

  return <main className="editor-layout">
    <header className="editorbar">
      <div className="brand"><div className="logo">N</div><Link href="/">NEXUS ENGINE</Link><span className="muted">/ {project.name}</span></div>
      <div style={{display:"flex",alignItems:"center",gap:14}}><span className="muted mono" style={{fontSize:11}}>{status}</span><Link href="/" className="btn">Projects</Link></div>
    </header>
    <section className="editor-workspace">
      <aside className="sidepanel"><div className="panel-label">HIERARCHY</div>
        {project.scene.objects.map(o=><div className="object-row" key={o.id}>◇ {o.name}<small className="muted" style={{display:"block",paddingLeft:18}}>{o.type}</small></div>)}
        <div style={{marginTop:24}} className="panel-label">CREATE OBJECT</div>
        <input className="field" value={objectName} onChange={e=>setObjectName(e.target.value)} aria-label="Object name"/>
        <button className="btn primary" style={{width:"100%"}} onClick={addObject}>＋ Add cube</button>
      </aside>
      <div className="viewport"><div className="viewport-card"><div style={{fontSize:44,color:"var(--cyan)"}}>◇</div><h2>Scene Viewport</h2><p className="muted">3D renderer is coming in a future Alpha update.</p><span className="pill">SCENE: MAIN</span></div></div>
      <aside className="sidepanel right"><div className="panel-label">INSPECTOR</div><h3 style={{fontSize:15}}>Scene</h3><p className="muted" style={{fontSize:13}}>Select an object in the hierarchy to inspect its properties. Transform tools are coming soon.</p><div className="panel-label" style={{marginTop:30}}>PROJECT</div><p className="muted mono" style={{fontSize:11,wordBreak:"break-all"}}>{project.id}</p><div className="panel-label">STORAGE</div><p className="muted" style={{fontSize:12}}>IndexedDB · This browser only</p></aside>
    </section>
  </main>;
}
