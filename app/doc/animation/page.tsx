import Link from "next/link";

export default function AnimationDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>Animation timeline</h1>
      <p className="subtitle">
        Select an object and add a Move loop or Jump loop, then press Preview
        animations. These are basic procedural previews, not a full keyframe
        timeline yet.
      </p>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>Move loop</h2>
          <p>Moves the selected object side to side during preview.</p>
        </article>
        <article className="docs-card">
          <h2>Jump loop</h2>
          <p>Animates the selected object vertically during preview.</p>
        </article>
      </div>
    </main>
  );
}
