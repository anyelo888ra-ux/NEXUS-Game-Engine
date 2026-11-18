import Link from "next/link";

export default function SceneDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>Scene editor</h1>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>Hierarchy</h2>
          <p>Select objects in the left panel to inspect them.</p>
        </article>
        <article className="docs-card">
          <h2>Right-click menu</h2>
          <p>
            Right-click inside the 3D viewport to add primitives, import models,
            duplicate or delete the selected object.
          </p>
        </article>
        <article className="docs-card">
          <h2>Transform</h2>
          <p>Change Position, Rotation and Scale on X, Y and Z from the Inspector.</p>
        </article>
        <article className="docs-card">
          <h2>Import</h2>
          <p>
            GLB is recommended. glTF and OBJ are also accepted. Blender .blend
            files must be exported first.
          </p>
        </article>
      </div>
    </main>
  );
}
