import Link from "next/link";

const credits = [
  { name: "Three.js", role: "3D rendering engine and WebGL scene", url: "https://threejs.org/", creator: "Three.js contributors" },
  { name: "Next.js", role: "React framework and application routing", url: "https://nextjs.org/", creator: "Vercel and Next.js contributors" },
  { name: "React", role: "User interface library", url: "https://react.dev/", creator: "Meta and React contributors" },
  { name: "TypeScript", role: "Typed JavaScript language", url: "https://www.typescriptlang.org/", creator: "Microsoft and TypeScript contributors" },
  { name: "Blender", role: "Recommended authoring tool for 3D models; export as GLB", url: "https://www.blender.org/", creator: "Blender Foundation and community" },
  { name: "IndexedDB", role: "Browser database used for local projects and imported assets", url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API", creator: "Web platform standard; browser vendors" },
];

export default function CreditsPage() {
  return <main className="shell credits">
    <header className="topbar"><div className="brand"><div className="logo">N</div><span>NEXUS <span style={{ color: "var(--cyan)" }}>ENGINE</span></span></div><span className="pill">ALPHA 0.2.0</span></header>
    <p className="eyebrow" style={{ marginTop: 48 }}>OPEN SOURCE · ATTRIBUTION</p>
    <h1>Credits & acknowledgements</h1>
    <p className="subtitle">This page documents the project, the technologies used to build it and the people or communities behind those tools. If you reuse this code, keep the applicable license and third-party notices with your copy.</p>

    <section className="card" style={{ marginTop: 28 }}>
      <div className="eyebrow">PROJECT</div><h2>NEXUS Game Engine</h2>
      <p className="credit-note">Creator / maintainer: <strong>anyelo888ra-ux</strong></p>
      <p className="credit-note">Source code: <a href="https://github.com/anyelo888ra-ux/NEXUS-Game-Engine" target="_blank" rel="noreferrer">github.com/anyelo888ra-ux/NEXUS-Game-Engine</a></p>
      <p className="credit-note">License: MIT · See the LICENSE file in the repository.</p>
    </section>

    <h2 style={{ marginTop: 38 }}>Technologies and creators</h2>
    <p className="credit-note">These are the direct frameworks, libraries and browser technologies used by this project. Their names and logos remain the property of their respective owners.</p>
    <section className="card" style={{ marginTop: 14 }}>
      {credits.map((item) => <div className="credit-row" key={item.name}>
        <div><strong>{item.name}</strong><div className="credit-note">{item.role}</div><div className="credit-note">Creator: {item.creator}</div></div>
        <a href={item.url} target="_blank" rel="noreferrer">Official source ↗</a>
      </div>)}
    </section>

    <h2 style={{ marginTop: 38 }}>Reuse this project</h2>
    <div className="card"><p className="credit-note">NEXUS Game Engine is distributed under the MIT License. You may reuse and modify the project under its terms. Include the original copyright and license notice in copies or substantial portions of the software. Check each dependency's own license before redistributing a build.</p><p className="credit-note">This credits page is an attribution guide; it does not replace the repository's LICENSE file or the license notices of third-party packages.</p></div>
    <div className="actions"><Link href="/" className="btn primary">← Back to projects</Link><a className="btn" href="https://github.com/anyelo888ra-ux/NEXUS-Game-Engine" target="_blank" rel="noreferrer">Open GitHub repository ↗</a></div>
  </main>;
}
