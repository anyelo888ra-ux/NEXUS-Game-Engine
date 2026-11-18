import Link from "next/link";

const items = [
  ["Cube", "BoxGeometry", "General block shape."],
  ["Sphere", "SphereGeometry", "Round object."],
  ["Capsule", "CapsuleGeometry", "Rounded cylinder-like alternative."],
  ["Plane", "PlaneGeometry", "Flat rectangular surface."],
  ["Cone", "ConeGeometry", "Tapered primitive."],
  ["Torus", "TorusGeometry", "Ring or donut shape."],
  ["Circle", "CircleGeometry", "Flat disk."],
];

export default function PrimitivesDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>3D primitives</h1>
      <p className="subtitle">
        Built-in shapes available in the Alpha scene editor.
      </p>
      <div className="docs-grid">
        {items.map(([name, api, desc]) => (
          <article className="docs-card" key={name}>
            <h2>{name}</h2>
            <code>{api}</code>
            <p>{desc}</p>
          </article>
        ))}
      </div>
      <p className="muted">
        Standalone cylinders are excluded by the current project design. See{" "}
        <Link className="docs-link" href="/doc/cilindros-not-used">
          the primitive policy
        </Link>.
      </p>
    </main>
  );
}
