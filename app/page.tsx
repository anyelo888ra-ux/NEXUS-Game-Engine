"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {EngineProject,EngineShape,listProjects,saveProject,deleteProject} from "@/lib/storage";
type Template="empty"|"platformer"|"showcase";
function newProject(name:string,template:Template):EngineProject{
 const now=Date.now();const id=crypto.randomUUID();
 const objects=template==="empty"?[{id:"camera-main",name:"Main Camera",type:"camera" as const},{id:"light-main",name:"Directional Light",type:"light" as const}]:template==="platformer"?[
 {id:"camera-main",name:"Main Camera",type:"camera" as const},{id:"light-main",name:"Directional Light",type:"light" as const},
 {id:crypto.randomUUID(),name:"Player Capsule",type:"mesh" as const,shape:"capsule" as EngineShape,transform:{position:[0,1,0] as [number,number,number],rotation:[0,0,0] as [number,number,number],scale:[1,1,1] as [number,number,number]}},
 {id:crypto.randomUUID(),name:"Ground",type:"mesh" as const,shape:"plane" as EngineShape,transform:{position:[0,0,0] as [number,number,number],rotation:[-Math.PI/2,0,0] as [number,number,number],scale:[5,5,5] as [number,number,number]}}
 ]:[
 {id:"camera-main",name:"Main Camera",type:"camera" as const},{id:"light-main",name:"Directional Light",type:"light" as const},
 {id:crypto.randomUUID(),name:"Hero Sphere",type:"mesh" as const,shape:"sphere" as EngineShape,transform:{position:[0,1,0] as [number,number,number],rotation:[0,0,0] as [number,number,number],scale:[1,1,1] as [number,number,number]}},
 {id:crypto.randomUUID(),name:"Ring",type:"mesh" as const,shape:"torus" as EngineShape,transform:{position:[2,1,0] as [number,number,number],rotation:[0,0,0] as [number,number,number],scale:[1,1,1] as [number,number,number]}}
 ];
 return{id,name,createdAt:now,updatedAt:now,scene:{objects},files:[],scripts:[],animations:[]};
}
export default function HomePage(){
 const[projects,setProjects]=useState<EngineProject[]>([]);const[name,setName]=useState("My First Game");const[template,setTemplate]=useState<Template>("empty");const[loading,setLoading]=useState(true);const[error,setError]=useState("");
 async function refresh(){try{setProjects(await listProjects());setError("");}catch{setError("Local storage is unavailable. Enable IndexedDB in your browser.");}finally{setLoading(false);}}
 useEffect(()=>{void refresh();},[]);
 async function create(){const p=newProject(name.trim()||"Untitled Project",template);await saveProject(p);window.location.href="/editor/"+p.id;}
 async function remove(id:string){if(!window.confirm("Delete this local project? This cannot be undone."))return;await deleteProject(id);await refresh();}
 return <main className="shell">
 <header className="topbar"><div className="brand"><div className="logo">N</div><span>NEXUS <span style={{color:"var(--cyan)"}}>ENGINE</span></span></div><div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}><span className="pill">ALPHA 0.4.0</span><Link className="btn" href="/doc">Docs</Link><Link className="btn" href="/demo-game">▶ Play demo</Link><Link className="btn" href="/mcp">MCP Hub</Link><Link className="btn" href="/credits">Credits</Link></div></header>
 <section className="hero"><div className="eyebrow">Browser-native creation environment</div><h1>Build worlds.<br/><span style={{color:"var(--cyan)"}}>Create games.</span></h1><p className="subtitle">A local-first 3D game engine. Build scenes, mark a capsule as Player, position your Camera, run a playtest and write NEXUS Script inside the browser sandbox.</p>
 <div className="actions"><input className="field" aria-label="Project name" value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:260,margin:0}}/><button className="btn primary" onClick={()=>void create()}>＋ Create project</button></div>
 <div className="template-row"><span className="muted" style={{fontSize:12}}>START FROM TEMPLATE</span>{(["empty","platformer","showcase"] as Template[]).map(t=><button key={t} className={"mini-btn "+(template===t?"template-selected":"")} onClick={()=>setTemplate(t)}>{({empty:"Empty scene",platformer:"Platformer starter",showcase:"3D showcase"})[t]}</button>)}</div>
 {error&&<p style={{color:"#ff9d9d"}}>{error}</p>}</section>
 <div className="section-title"><h2 style={{margin:0}}>Your projects</h2><span className="muted mono" style={{fontSize:12}}>LOCAL WORKSPACE</span></div>
 {loading?<p className="muted">Loading local projects…</p>:projects.length===0?<div className="card"><div className="iconbox">▧</div><h3>No projects yet</h3><p className="muted">Choose a template and create your first project.</p></div>:<div className="project-list">{projects.map(p=><div className="project" key={p.id}><div className="project-left"><div className="iconbox">◇</div><div><strong>{p.name}</strong><small>Updated {new Date(p.updatedAt).toLocaleString()}</small></div></div><div className="actions" style={{margin:0}}><Link className="btn" href={"/editor/"+p.id}>Open</Link><button className="btn" onClick={()=>void remove(p.id)}>Delete</button></div></div>)}</div>}
 <div className="grid" style={{marginBottom:50}}><div className="card"><div className="eyebrow">PLAYABLE DEMO</div><h3>NEXUS: Crystal Run</h3><p className="muted">A complete mini platformer: run, jump, collect five crystals and reach the portal.</p><Link className="docs-link" href="/demo-game">Play Crystal Run →</Link></div><div className="card"><div className="eyebrow">01 / Scene</div><h3>3D editor</h3><p className="muted">Right-click menus, hierarchy, transform inspector and GLB, glTF or OBJ import.</p></div><div className="card"><div className="eyebrow">02 / Code</div><h3>Multi-language scripts</h3><p className="muted">Python, C++ and Lua source editors plus the NEXUS Script 0.1 browser interpreter.</p></div><div className="card"><div className="eyebrow">03 / Play mode</div><h3>Player + Camera</h3><p className="muted">Choose the Player capsule, place the scene Camera and test movement with WASD and Space.</p></div><div className="card"><div className="eyebrow">04 / Animation</div><h3>Animation previews</h3><p className="muted">Create Move and Jump loops for selected scene objects.</p></div><div className="card"><div className="eyebrow">05 / AI Hub</div><h3>Assistant AI + MCP</h3><p className="muted">Local MCP 0.1 lets compatible desktop AI clients edit exported project JSON files.</p><Link className="docs-link" href="/mcp">MCP documentation →</Link></div></div>
 <footer className="footer-links"><Link href="/doc">Documentation</Link><Link href="/about:blank">about:blank</Link><Link href="/credits">Credits</Link></footer>
 </main>;
}
