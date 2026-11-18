import Link from "next/link";

export default function SceneDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>Scene editor</h1>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>Hierarchy</h2>
          <p>Select objects in the left panel to inspect them. The object marked PLAYER is used by Play mode.</p>
        </article>
        <article className="docs-card">
          <h2>Player capsule</h2>
          <p>Add a Capsule, select it and press Set as Player in the Inspector. Only one scene object can have the Player role.</p>
        </article>
        <article className="docs-card">
          <h2>Scene camera</h2>
          <p>Add a Camera from the Scene panel. Edit its Position and Rotation in the Inspector. During Play, its position offset follows the Player and its rotation controls the game view.</p>
        </article>
        <article className="docs-card">
          <h2>Play controls</h2>
          <p>Press Play after assigning a Player capsule. Use WASD to move and Space to jump. Stop saves the Player's final position back into the scene.</p>
        </article>
        <article className="docs-card">
          <h2>Right-click menu</h2>
          <p>Right-click inside the 3D viewport to add primitives, import models, duplicate or delete the selected object.</p>
        </article>
        <article className="docs-card">
          <h2>Transform</h2>
          <p>Change Position, Rotation and Scale on X, Y and Z from the Inspector.</p>
        </article>
        <article className="docs-card">
          <h2>Import</h2>
          <p>GLB is recommended. glTF and OBJ are also accepted. Blender .blend files must be exported first.</p>
        </article>
      </div>
      <p className="warning-note">Play mode physics are experimental in Alpha 0.4. Collision detection is approximate and is not a full physics engine.</p>
    </main>
  );
}
