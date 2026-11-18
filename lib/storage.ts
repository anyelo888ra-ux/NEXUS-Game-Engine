export type EngineShape = "cube" | "sphere" | "capsule" | "plane" | "cone" | "torus" | "circle";
export type EngineTransform = { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] };
export type EngineObject = {
  id: string; name: string; type: "camera" | "light" | "mesh" | "sprite";
  shape?: EngineShape; transform?: EngineTransform; asset?: Blob; format?: "glb" | "gltf" | "obj";
};
export type EngineFile = { id: string; name: string; kind: "file" | "folder"; parentId: string | null; content?: string };
export type EngineScript = { id: string; name: string; language: "python" | "cpp" | "lua" | "nexus"; content: string };
export type EngineAnimation = { id: string; name: string; targetId: string; kind: "move" | "jump"; duration: number };
export type EngineProject = {
  id: string; name: string; createdAt: number; updatedAt: number;
  scene: { objects: EngineObject[] };
  files?: EngineFile[]; scripts?: EngineScript[]; animations?: EngineAnimation[];
};

const DB_NAME = "nexus-game-engine";
const STORE = "projects";
const VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is not available in this browser."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) { const store = db.createObjectStore(STORE, { keyPath: "id" }); store.createIndex("updatedAt", "updatedAt"); }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local project database."));
  });
}
export async function listProjects(): Promise<EngineProject[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onerror = () => { db.close(); reject(request.error); };
    request.onsuccess = () => { resolve((request.result as EngineProject[]).sort((a,b)=>b.updatedAt-a.updatedAt)); db.close(); };
  });
}
export async function saveProject(project: EngineProject): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx=db.transaction(STORE,"readwrite"); tx.objectStore(STORE).put(project);
    tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>{db.close();reject(tx.error);}; tx.onabort=()=>{db.close();reject(tx.error);};
  });
}
export async function getProject(id:string):Promise<EngineProject|undefined>{
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{const request=db.transaction(STORE,"readonly").objectStore(STORE).get(id);request.onsuccess=()=>{db.close();resolve(request.result as EngineProject|undefined);};request.onerror=()=>{db.close();reject(request.error);};});
}
export async function deleteProject(id:string):Promise<void>{
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error);};});
}
