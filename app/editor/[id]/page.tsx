"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { EngineAnimation, EngineFile, EngineObject, EngineProject, EngineScript, EngineShape, EngineTransform, getProject, saveProject } from "@/lib/storage";
import { runNexusScript } from "@/language/nexus-script/runtime";

const shapes: EngineShape[] = ["cube","sphere","capsule","plane","cone","torus","circle"];
const defaultTransform = (): EngineTransform => ({position:[0,0.5,0],rotation:[0,0,0],scale:[1,1,1]});
const starterCode: Record<EngineScript["language"],string> = {
  python: "def on_start():\n    print('Hello from NEXUS!')\n\ndef on_update(delta):\n    pass\n",
  cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from NEXUS!\" << std::endl;\n    return 0;\n}\n",
  lua: "function on_start()\n    print('Hello from NEXUS!')\nend\n\nfunction on_update(delta)\nend\n",
  nexus: "// NEXUS Script — experimental language\nwhen game.starts {\n  say \"Hello from NEXUS!\"\n}\n\nwhen player.jumps {\n  say "Jump!"\n  player.move(0, 0.1, 0)\n}\n"
};

export default function EditorPage({params}:{params:Promise<{id:string}>}) {
  const [project,setProject]=useState<EngineProject|null>(null);
  const [status,setStatus]=useState("Loading project…");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [tab,setTab]=useState<"scene"|"files"|"code"|"animation"|"assistant">("scene");
  const [menu,setMenu]=useState<{x:number;y:number}|null>(null);
  const [scriptLanguage,setScriptLanguage]=useState<EngineScript["language"]>("lua");
  const [selectedScript,setSelectedScript]=useState<string|null>(null);
  const [selectedFileId,setSelectedFileId]=useState<string|null>(null);
  const [assistantEnabled,setAssistantEnabled]=useState(false);
  const [permissions,setPermissions]=useState({readScene:true,editScene:false,editCode:false,runGame:false});
  const [preview,setPreview]=useState(false);
  const [isPlaying,setIsPlaying]=useState(false);
  const [gameOutput,setGameOutput]=useState<string[]>([]);
  const playPositionRef=useRef<[number,number,number]|null>(null);
  const [newFileName,setNewFileName]=useState("NewScript.lua");
  const viewportRef=useRef<HTMLDivElement>(null);
  const importRef=useRef<HTMLInputElement>(null);
  const projectJsonRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{let active=true;params.then(({id})=>getProject(id).then(p=>{if(!active)return;if(p){setProject({...p,files:p.files??[],scripts:p.scripts??[],animations:p.animations??[]});setStatus("Project loaded · Local workspace");}else setStatus("Project not found in this browser.");}).catch(()=>{if(active)setStatus("Could not read local project.");}));return()=>{active=false;};},[params]);
  const persist=useCallback(async(next:EngineProject)=>{setProject(next);setStatus("Saving locally…");try{await saveProject({...next,updatedAt:Date.now()});setStatus("Saved locally");}catch{setStatus("Save failed — check browser storage permissions.");}},[]);
  const selected=useMemo(()=>project?.scene.objects.find(o=>o.id===selectedId)??null,[project,selectedId]);
  const scripts=project?.scripts??[];
  const activeScript=scripts.find(s=>s.id===selectedScript)??scripts[0]??null;
  const activeFile=(project?.files??[]).find(file=>file.id===selectedFileId)??null;

  function exportProjectJson(){
    if(!project)return;
    const exportable={...project,scene:{...project.scene,objects:project.scene.objects.map(({asset,...item})=>item)}};
    const blob=new Blob([JSON.stringify(exportable,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(project.name||"nexus-project").replace(/[^a-z0-9-_]+/gi,"-")+".json";a.click();URL.revokeObjectURL(url);
    setStatus("Project JSON exported · binary model files are separate");
  }
  async function importProjectJson(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];if(!file)return;
    try{const parsed=JSON.parse(await file.text()) as EngineProject;if(!parsed||typeof parsed.id!=="string"||!parsed.scene||!Array.isArray(parsed.scene.objects))throw new Error("Invalid NEXUS project JSON");
      const restored:EngineProject={...parsed,files:parsed.files??[],scripts:parsed.scripts??[],animations:parsed.animations??[],scene:{...parsed.scene,objects:parsed.scene.objects.map(o=>({...o,asset:undefined}))}};
      await persist(restored);setSelectedId(null);setStatus("Project JSON imported · re-import binary models separately");
    }catch(error){setStatus(error instanceof Error?"Import failed: "+error.message:"Could not import project JSON");}
    event.target.value="";
  }

  function addCamera(){
    if(!project)return;
    const camera:EngineObject={id:crypto.randomUUID(),name:"Main Camera",type:"camera",transform:{position:[0,3,6],rotation:[-0.35,0,0],scale:[1,1,1]}};
    void persist({...project,scene:{...project.scene.objects.length?project.scene:{objects:[]},objects:[...project.scene.objects.filter(o=>o.type!=="camera"),camera]}});
    setSelectedId(camera.id);setTab("scene");setMenu(null);
  }
  function setSelectedAsPlayer(){
    if(!project||!selected||selected.shape!=="capsule")return;
    void persist({...project,scene:{...project.scene,objects:project.scene.objects.map(o=>({...o,role:o.id===selected.id?"player":undefined}))}});
  }
  function addShape(shape:EngineShape){
    if(!project)return;
    const obj:EngineObject={id:crypto.randomUUID(),name:shape[0].toUpperCase()+shape.slice(1),type:"mesh",shape,transform:defaultTransform()};
    void persist({...project,scene:{...project.scene,objects:[...project.scene.objects,obj]}});
    setSelectedId(obj.id);setTab("scene");setMenu(null);
  }
  function updateSelected(patch:Partial<EngineObject>){
    if(!project||!selected)return;
    void persist({...project,scene:{...project.scene,objects:project.scene.objects.map(o=>o.id===selected.id?{...o,...patch}:o)}});
  }
  function updateTransform(axis:"position"|"rotation"|"scale",index:number,value:number){
    if(!selected)return;
    const current=selected.transform??defaultTransform();
    const next=[...current[axis]] as [number,number,number];next[index]=value;
    updateSelected({transform:{...current,[axis]:next}});
  }
  function deleteSelected(){if(!project||!selected)return;void persist({...project,scene:{...project.scene,objects:project.scene.objects.filter(o=>o.id!==selected.id)}});setSelectedId(null);setMenu(null);}
  function duplicateSelected(){if(!project||!selected)return;const copy:EngineObject={...selected,id:crypto.randomUUID(),name:selected.name+" Copy",transform:{...(selected.transform??defaultTransform()),position:[(selected.transform??defaultTransform()).position[0]+1,(selected.transform??defaultTransform()).position[1],(selected.transform??defaultTransform()).position[2]]}};void persist({...project,scene:{...project.scene,objects:[...project.scene.objects,copy]}});setSelectedId(copy.id);setMenu(null);}
  function createScript(){if(!project)return;const script:EngineScript={id:crypto.randomUUID(),name:"Main."+({python:"py",cpp:"cpp",lua:"lua",nexus:"nxs"}[scriptLanguage]),language:scriptLanguage,content:starterCode[scriptLanguage]};void persist({...project,scripts:[...(project.scripts??[]),script]});setSelectedScript(script.id);setTab("code");}
  function updateScript(content:string){if(!project||!activeScript)return;void persist({...project,scripts:(project.scripts??[]).map(s=>s.id===activeScript.id?{...s,content}:s)});}
  function createFile(kind:"file"|"folder"){if(!project)return;const file:EngineFile={id:crypto.randomUUID(),name:kind==="folder"?(newFileName.trim()||"NewFolder"):(newFileName.trim()||"NewFile.txt"),kind,parentId:null,content:kind==="file"?"":undefined};void persist({...project,files:[...(project.files??[]),file]});if(kind==="file")setSelectedFileId(file.id);}
  function moveFile(id:string,direction:-1|1){if(!project)return;const files=[...(project.files??[])];const index=files.findIndex(f=>f.id===id);const target=index+direction;if(index<0||target<0||target>=files.length)return;[files[index],files[target]]=[files[target],files[index]];void persist({...project,files});}
  function updateFileContent(content:string){if(!project||!activeFile)return;void persist({...project,files:(project.files??[]).map(file=>file.id===activeFile.id?{...file,content}:file)});}
  function moveFileToFolder(id:string,parentId:string|null){if(!project)return;void persist({...project,files:(project.files??[]).map(file=>file.id===id?{...file,parentId}:file)});}
  function addAnimation(kind:"move"|"jump"){if(!project||!selected)return;const animation:EngineAnimation={id:crypto.randomUUID(),name:kind==="jump"?"Jump":"Move",targetId:selected.id,kind,duration:1};void persist({...project,animations:[...(project.animations??[]),animation]});}
  async function importModel(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file||!project)return;const ext=file.name.split(".").pop()?.toLowerCase();if(ext!=="glb"&&ext!=="gltf"&&ext!=="obj"){setStatus("Unsupported format. Choose GLB, glTF or OBJ.");event.target.value="";return;}const obj:EngineObject={id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,""),type:"mesh",asset:file.slice(0,file.size,file.type||"application/octet-stream"),format:ext,transform:defaultTransform()};await persist({...project,scene:{...project.scene,objects:[...project.scene.objects,obj]}});setSelectedId(obj.id);event.target.value="";}

  useEffect(()=>{
    const host=viewportRef.current;if(!host||!project)return;
    let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch{setStatus("WebGL is unavailable. Enable hardware acceleration.");return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.replaceChildren(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color("#0b1422");
    const camera=new THREE.PerspectiveCamera(55,host.clientWidth/Math.max(host.clientHeight,1),.1,1000);camera.position.set(5,4,7);
    const playerData=project.scene.objects.find(o=>o.role==="player");
    const cameraData=project.scene.objects.find(o=>o.type==="camera");
    const playerStart=playerData?.transform??defaultTransform();
    const cameraStart=cameraData?.transform??{position:[playerStart.position[0],playerStart.position[1]+3,playerStart.position[2]+6] as [number,number,number],rotation:[0,0,0] as [number,number,number],scale:[1,1,1] as [number,number,number]};
    camera.position.set(...cameraStart.position);camera.rotation.set(...cameraStart.rotation);
    const cameraOffset=new THREE.Vector3(cameraStart.position[0]-playerStart.position[0],cameraStart.position[1]-playerStart.position[1],cameraStart.position[2]-playerStart.position[2]);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enabled=!isPlaying;controls.enableDamping=true;controls.target.set(...playerStart.position);
    scene.add(new THREE.HemisphereLight(0xb9dcff,0x253044,2.1));const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(5,9,6);scene.add(sun);scene.add(new THREE.GridHelper(30,30,0x39718b,0x26394d));scene.add(new THREE.AxesHelper(2));
    const urls:string[]=[];const geometries:THREE.BufferGeometry[]=[];const materials:THREE.Material[]=[];const animated:THREE.Object3D[]=[];const objectNodes=new Map<string,THREE.Object3D>();
    for(const item of project.scene.objects){if(item.type!=="mesh")continue;
      const transform=item.transform??defaultTransform();
      if(item.asset&&item.format){const url=URL.createObjectURL(item.asset);urls.push(url);if(item.format==="obj"){item.asset.text().then(t=>{const model=new OBJLoader().parse(t);model.name=item.name;model.position.set(...transform.position);model.rotation.set(...transform.rotation);model.scale.set(...transform.scale);if(item.id===selectedId)model.traverse(child=>{if(child instanceof THREE.Mesh){const m=new THREE.MeshStandardMaterial({color:item.color??0x50d8e8});materials.push(m);child.material=m;}});scene.add(model);objectNodes.set(item.id,model);if(preview&&project.animations?.some(a=>a.targetId===item.id))animated.push(model);});}else new GLTFLoader().load(url,g=>{g.scene.name=item.name;g.scene.position.set(...transform.position);g.scene.rotation.set(...transform.rotation);g.scene.scale.set(...transform.scale);if(item.id===selectedId)g.scene.traverse(child=>{if(child instanceof THREE.Mesh){const m=new THREE.MeshStandardMaterial({color:0x50d8e8});materials.push(m);child.material=m;}});scene.add(g.scene);objectNodes.set(item.id,g.scene);if(preview&&project.animations?.some(a=>a.targetId===item.id))animated.push(g.scene);},undefined,()=>setStatus("Could not load "+item.name+". Export as GLB from Blender."));continue;}
      let geometry:THREE.BufferGeometry;
      switch(item.shape??"cube"){case"sphere":geometry=new THREE.SphereGeometry(.65,32,20);break;case"capsule":geometry=new THREE.CapsuleGeometry(.38,.8,8,16);break;case"plane":geometry=new THREE.PlaneGeometry(2,2);break;case"cone":geometry=new THREE.ConeGeometry(.65,1.3,32);break;case"torus":geometry=new THREE.TorusGeometry(.6,.2,16,48);break;case"circle":geometry=new THREE.CircleGeometry(.75,48);break;default:geometry=new THREE.BoxGeometry(1,1,1);}
      geometries.push(geometry);const material=new THREE.MeshStandardMaterial({color:item.color??(item.id===selectedId?0xffc857:0x50d8e8),metalness:.12,roughness:.55,side:THREE.DoubleSide});materials.push(material);
      const mesh=new THREE.Mesh(geometry,material);mesh.name=item.name;mesh.position.set(...transform.position);mesh.rotation.set(...transform.rotation);mesh.scale.set(...transform.scale);scene.add(mesh);objectNodes.set(item.id,mesh);if(preview&&project.animations?.some(a=>a.targetId===item.id))animated.push(mesh);
    }
    const clock=new THREE.Clock();let frame=0;let disposed=false;
    let verticalVelocity=0;let grounded=false;let moveSpeed=5;
    const playerNode=playerData?objectNodes.get(playerData.id):undefined;
    const playerHalfHeight=0.78;
    const platformBounds=project.scene.objects.filter(o=>o.type==="mesh"&&o.id!==playerData?.id&&!o.asset).map(o=>{const t=o.transform??defaultTransform();const sx=Math.abs(t.scale[0]),sy=Math.abs(t.scale[1]),sz=Math.abs(t.scale[2]);const half=o.shape==="plane"?[sx,0.02,sz]:o.shape==="sphere"?[.65*sx,.65*sy,.65*sz]:o.shape==="capsule"?[.38*sx,.78*sy,.38*sz]:[.5*sx,.5*sy,.5*sz];return {x:t.position[0],y:t.position[1],z:t.position[2],hx:half[0],hy:half[1],hz:half[2],top:t.position[1]+half[1]};});
    if(playerNode)playPositionRef.current=[playerNode.position.x,playerNode.position.y,playerNode.position.z];
    const scriptAPI={say:(message:string)=>setGameOutput(previous=>[...previous.slice(-7),message]),movePlayer:(x:number,y:number,z:number)=>{if(playerNode)playerNode.position.add(new THREE.Vector3(x,y,z));},setPlayerPosition:(x:number,y:number,z:number)=>{if(playerNode)playerNode.position.set(x,y,z);},jumpPlayer:()=>{if(playerNode&&grounded){verticalVelocity=7;grounded=false;}},setPlayerSpeed:(speed:number)=>{moveSpeed=speed;}};
    if(isPlaying&&playerNode){for(const script of project.scripts??[]){if(script.language==="nexus"){const result=runNexusScript(script.content,"game.starts",scriptAPI);result.errors.forEach(error=>setGameOutput(previous=>[...previous.slice(-7),"NEXUS Script: "+error]));}}}
    const resize=()=>{if(disposed)return;const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const observer=new ResizeObserver(resize);observer.observe(host);
    const onKeyDown=(event:KeyboardEvent)=>{if(!isPlaying||!playerNode)return;const key=event.key.toLowerCase();if(key===" "||key==="arrowup"){event.preventDefault();if(grounded){verticalVelocity=7;grounded=false;for(const script of project.scripts??[]){if(script.language==="nexus"){const result=runNexusScript(script.content,"player.jumps",scriptAPI);result.errors.forEach(error=>setGameOutput(previous=>[...previous.slice(-7),"NEXUS Script: "+error]));}}}return;}const direction=new THREE.Vector3();camera.getWorldDirection(direction);direction.y=0;direction.normalize();const right=new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0)).normalize();const step=(event.shiftKey?2:1)*moveSpeed*0.05;if(key==="w")playerNode.position.addScaledVector(direction,step);if(key==="s")playerNode.position.addScaledVector(direction,-step);if(key==="a")playerNode.position.addScaledVector(right,step);if(key==="d")playerNode.position.addScaledVector(right,-step);};
    window.addEventListener("keydown",onKeyDown);
    const render=()=>{if(disposed)return;const delta=Math.min(clock.getDelta(),0.05);const t=clock.elapsedTime;if(isPlaying&&playerNode){const previousY=playerNode.position.y;verticalVelocity-=18*delta;playerNode.position.y+=verticalVelocity*delta;grounded=false;const px=playerNode.position.x,pz=playerNode.position.z;const previousBottom=previousY-playerHalfHeight;const currentBottom=playerNode.position.y-playerHalfHeight;for(const platform of platformBounds){if(px>=platform.x-platform.hx-playerHalfHeight*0.25&&px<=platform.x+platform.hx+playerHalfHeight*0.25&&pz>=platform.z-platform.hz-playerHalfHeight*0.25&&pz<=platform.z+platform.hz+playerHalfHeight*0.25&&verticalVelocity<=0&&previousBottom>=platform.top-0.15&&currentBottom<=platform.top+0.08){playerNode.position.y=platform.top+playerHalfHeight;verticalVelocity=0;grounded=true;}}if(playerNode.position.y<playerHalfHeight){playerNode.position.y=playerHalfHeight;verticalVelocity=0;grounded=true;}camera.position.copy(playerNode.position).add(cameraOffset);camera.lookAt(playerNode.position.x,playerNode.position.y+0.35,playerNode.position.z);playPositionRef.current=[playerNode.position.x,playerNode.position.y,playerNode.position.z];}if(preview||isPlaying)animated.forEach((o,i)=>{const anim=project.animations?.find(a=>a.targetId===o.name||a.targetId===project.scene.objects[i]?.id);if(anim?.kind==="jump")o.position.y=(project.scene.objects[i]?.transform??defaultTransform()).position[1]+Math.abs(Math.sin(t*Math.PI*2))*1.2;else if(anim?.kind==="move")o.position.x=(project.scene.objects[i]?.transform??defaultTransform()).position[0]+Math.sin(t*Math.PI*2)*1.5;});controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);};render();
    return()=>{window.removeEventListener("keydown",onKeyDown);disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();urls.forEach(URL.revokeObjectURL);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();host.replaceChildren();};
  },[project,selectedId,preview,isPlaying]);

  if(!project)return <main className="shell" style={{padding:40}}><p>{status}</p><Link href="/" className="btn">Back to projects</Link></main>;
  const panelStyle:CSSProperties={display:"flex",gap:6,flexWrap:"wrap"};
  return <main className="editor-layout">
    <header className="editorbar"><div className="brand"><div className="logo">N</div><Link href="/">NEXUS ENGINE</Link><span className="muted">/ {project.name}</span><span className="pill">0.3 ALPHA</span></div><div style={{display:"flex",alignItems:"center",gap:8}}><span className="muted mono" style={{fontSize:10}}>{status}</span><button className="btn primary" disabled={!isPlaying&&!project.scene.objects.some(o=>o.role==="player")} onClick={()=>{if(isPlaying){const position=playPositionRef.current;const player=project.scene.objects.find(o=>o.role==="player");if(position&&player)void persist({...project,scene:{...project.scene,objects:project.scene.objects.map(o=>o.id===player.id?{...o,transform:{...(o.transform??defaultTransform()),position}}:o)}});setIsPlaying(false);setStatus("Playtest stopped · player position saved");}else{setGameOutput([]);setIsPlaying(true);setPreview(false);setStatus("Playtest running · WASD move · Space jump");}}}>{isPlaying?"■ Stop":"▶ Play"}</button><button className="btn" onClick={exportProjectJson}>Export JSON</button><button className="btn" onClick={()=>projectJsonRef.current?.click()}>Import JSON</button><input ref={projectJsonRef} type="file" accept=".json,application/json" onChange={e=>void importProjectJson(e)} hidden/><button className="btn" onClick={()=>{setAssistantEnabled(!assistantEnabled);setTab("assistant");}}>✦ Assistant AI</button><Link href="/mcp" className="btn">MCP Hub</Link><Link href="/credits" className="btn">Credits</Link></div></header>
    <section className="editor-workspace editor-v3">
      <aside className="sidepanel">
        <div className="editor-tabs">{(["scene","files","code","animation","assistant"] as const).map(t=><button key={t} className={"tab-btn "+(tab===t?"selected":"")} onClick={()=>setTab(t)}>{({scene:"Scene",files:"Files",code:"Code",animation:"Anim",assistant:"AI"})[t]}</button>)}</div>
        {tab==="scene"&&<><div className="panel-label">HIERARCHY · {project.scene.objects.length} OBJECTS</div>{project.scene.objects.map(o=><button key={o.id} className={"object-row "+(selectedId===o.id?"active":"")} onClick={()=>setSelectedId(o.id)}>◇ {o.name}<small className="muted" style={{display:"block",paddingLeft:18}}>{o.format?.toUpperCase()??o.shape??o.type}</small></button>)}<div className="panel-label" style={{marginTop:18}}>ADD OBJECT</div><div style={panelStyle}>{shapes.map(s=><button key={s} className="mini-btn" onClick={()=>addShape(s)}>{s}</button>)}<button className="mini-btn" onClick={addCamera}>＋ Camera</button></div><p className="muted" style={{fontSize:10}}>Cylinder primitive is intentionally excluded. Use Capsule instead.</p><button className="btn" style={{width:"100%",marginTop:8}} onClick={()=>importRef.current?.click()}>↑ Import 3D model</button><input ref={importRef} type="file" accept=".glb,.gltf,.obj" onChange={e=>void importModel(e)} hidden/></>}
        {tab==="files"&&<><div className="panel-label">PROJECT FILES</div><input className="field" value={newFileName} onChange={e=>setNewFileName(e.target.value)} aria-label="New file or folder name"/><div style={panelStyle}><button className="mini-btn" onClick={()=>createFile("file")}>＋ File</button><button className="mini-btn" onClick={()=>createFile("folder")}>＋ Folder</button></div>{(project.files??[]).map((f,i)=><div className={"file-row "+(selectedFileId===f.id?"file-selected":"")} key={f.id} style={{paddingLeft:f.parentId?18:4}}><button className="file-open" onClick={()=>f.kind==="file"?setSelectedFileId(f.id):undefined}>{f.kind==="folder"?"▰":"▤"} {f.name}</button><span><button className="tiny-btn" onClick={()=>moveFile(f.id,-1)}>↑</button><button className="tiny-btn" onClick={()=>moveFile(f.id,1)}>↓</button><button className="tiny-btn" onClick={()=>{if(project)void persist({...project,files:(project.files??[]).filter(x=>x.id!==f.id)});if(selectedFileId===f.id)setSelectedFileId(null);}}>×</button></span><select className="file-parent" aria-label={"Move "+f.name+" into folder"} value={f.parentId??""} onChange={e=>moveFileToFolder(f.id,e.target.value||null)}><option value="">Root</option>{(project.files??[]).filter(x=>x.kind==="folder"&&x.id!==f.id).map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></div>)}<p className="muted" style={{fontSize:10}}>Select a file to edit it. Use the folder selector to move entries.</p></>}
        {tab==="code"&&<><div className="panel-label">SCRIPT LANGUAGE</div><select className="field" value={scriptLanguage} onChange={e=>setScriptLanguage(e.target.value as EngineScript["language"])}><option value="python">Python</option><option value="cpp">C++</option><option value="lua">Lua</option><option value="nexus">NEXUS Script (custom)</option></select><button className="btn" style={{width:"100%"}} onClick={createScript}>＋ New script</button><div className="panel-label" style={{marginTop:18}}>SCRIPTS</div>{scripts.map(s=><button key={s.id} className={"object-row "+(activeScript?.id===s.id?"active":"")} onClick={()=>setSelectedScript(s.id)}>⌘ {s.name}<small className="muted">{s.language.toUpperCase()}</small></button>)}</>}
        {tab==="animation"&&<><div className="panel-label">ANIMATION TIMELINE</div><p className="muted" style={{fontSize:12}}>Select an object, then add a preset animation.</p><button className="btn" style={{width:"100%"}} disabled={!selected} onClick={()=>addAnimation("move")}>＋ Move loop</button><button className="btn" style={{width:"100%",marginTop:7}} disabled={!selected} onClick={()=>addAnimation("jump")}>＋ Jump loop</button><button className="btn primary" style={{width:"100%",marginTop:12}} onClick={()=>setPreview(!preview)}>{preview?"■ Stop preview":"▶ Preview animations"}</button>{(project.animations??[]).map(a=><div className="file-row" key={a.id}><span>{a.name}</span><button className="tiny-btn" onClick={()=>void persist({...project,animations:(project.animations??[]).filter(x=>x.id!==a.id)})}>×</button></div>)}</>}
        {tab==="assistant"&&<><div className="panel-label">ASSISTANT AI · MCP</div><p className="muted" style={{fontSize:12}}>Grant only the tools you want the connected assistant to use.</p>{Object.entries({readScene:"Read scene",editScene:"Edit scene",editCode:"Edit scripts",runGame:"Run preview"}).map(([key,label])=><label className="permission-row" key={key}><input type="checkbox" checked={permissions[key as keyof typeof permissions]} onChange={e=>setPermissions(p=>({...p,[key]:e.target.checked}))}/>{label}</label>)}<div className="mcp-state">{assistantEnabled?"Assistant panel enabled":"Assistant panel paused"}<small>MCP transport: not connected</small></div><Link href="/mcp" className="btn" style={{display:"block",textAlign:"center",marginTop:10}}>Configure MCP Hub →</Link></>}
      </aside>
      <div className="viewport viewport-live" ref={viewportRef} onContextMenu={e=>{e.preventDefault();setMenu({x:e.clientX,y:e.clientY});}} onClick={()=>menu&&setMenu(null)}>
        <div className="viewport-hint">{isPlaying?"PLAYTEST · WASD move · Q/E height · Stop to edit":"3D VIEW · Drag: orbit · Scroll: zoom · Right-click: create menu"}</div>
        {menu&&<div className="context-menu" style={{left:Math.min(menu.x,window.innerWidth-190),top:Math.min(menu.y,window.innerHeight-310)}} onClick={e=>e.stopPropagation()}><strong>Scene actions</strong>{shapes.map(s=><button key={s} onClick={()=>addShape(s)}>＋ {s}</button>)}<button onClick={()=>importRef.current?.click()}>↑ Import model</button><button onClick={duplicateSelected} disabled={!selected}>▣ Duplicate selected</button><button onClick={deleteSelected} disabled={!selected}>× Delete selected</button><button onClick={()=>setMenu(null)}>Close</button></div>}
      </div>
      <aside className="sidepanel right">
        {tab==="code"?<><div className="panel-label">CODE EDITOR</div>{activeScript?<><div className="file-row"><strong>{activeScript.name}</strong><span className="pill">{activeScript.language}</span></div><textarea className="code-editor" spellCheck={false} value={activeScript.content} onChange={e=>updateScript(e.target.value)} aria-label="Script code"/><p className="muted" style={{fontSize:10}}>{activeScript.language==="nexus"?"NEXUS Script 0.1 · sandbox de comandos permitidos. Eventos: game.starts y player.jumps.":"Editor de texto. Python, C++ y Lua se guardan como código fuente; sus runtimes aún no están integrados."}</p></>:<p className="muted">Create a script to start coding.</p>}</>:tab==="files"?<><div className="panel-label">FILE DETAILS</div><p className="muted" style={{fontSize:12}}>Files and folders are saved with the project in this browser.</p></>:tab==="animation"?<><div className="panel-label">ANIMATION INSPECTOR</div><p className="muted" style={{fontSize:12}}>Select an object in Scene. Move and Jump are preview loops.</p></>:tab==="assistant"?<><div className="panel-label">AI TOOL PERMISSIONS</div><p className="muted" style={{fontSize:12}}>The MCP server must be connected before external chats can call these tools. Permissions are opt-in.</p><Link href="/mcp" className="btn">Read MCP docs</Link></>:<><div className="panel-label">INSPECTOR</div>{selected?<><input className="field" value={selected.name} onChange={e=>updateSelected({name:e.target.value})} aria-label="Object name"/>{selected.shape==="capsule"&&<button className="btn" style={{width:"100%",marginBottom:8}} onClick={setSelectedAsPlayer}>{selected.role==="player"?"✓ Player assigned":"Set as Player"}</button>}{selected.type==="camera"&&<div className="mcp-state">Scene camera<small>At Play, its position becomes the follow-camera offset relative to the Player capsule.</small></div>}<div className="panel-label">MATERIAL</div><label className="permission-row">Base color <input type="color" value={selected.color??"#50d8e8"} onChange={e=>updateSelected({color:e.target.value})} aria-label="Object color" style={{width:48,height:30,padding:2,background:"transparent",border:"1px solid var(--line)",borderRadius:6}}/></label><div className="panel-label">TRANSFORM</div>{(["position","rotation","scale"] as const).map(axis=><div key={axis} className="transform-group"><strong>{axis}</strong>{[0,1,2].map((i)=><label key={i}>{["X","Y","Z"][i]}<input type="number" step="0.1" value={(selected.transform??defaultTransform())[axis][i]} onChange={e=>updateTransform(axis,i,Number(e.target.value))}/></label>)}</div>)}<div style={panelStyle}><button className="mini-btn" onClick={duplicateSelected}>Duplicate</button><button className="mini-btn danger" onClick={deleteSelected}>Delete</button></div></>:<p className="muted" style={{fontSize:13}}>Select an object in the hierarchy to edit its transform.</p>}<div className="panel-label" style={{marginTop:26}}>STORAGE</div><p className="muted" style={{fontSize:11}}>IndexedDB · This browser only</p>{gameOutput.length>0&&<><div className="panel-label">GAME CONSOLE</div>{gameOutput.map((line,index)=><p key={index} className="muted" style={{fontSize:11,margin:"4px 0"}}>{line}</p>)}</>}</>}
      </aside>
    </section>
  </main>;
}
