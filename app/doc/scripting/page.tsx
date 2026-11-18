import Link from "next/link";

export default function ScriptingDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>Scripting</h1>
      <p className="subtitle">
        Create text script files and choose a language for your project.
      </p>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>Python</h2>
          <p>Script text support. Runtime execution is not included yet.</p>
        </article>
        <article className="docs-card">
          <h2>C++</h2>
          <p>
            Script text support. Native compilation is not included in the
            browser editor.
          </p>
        </article>
        <article className="docs-card">
          <h2>Lua</h2>
          <p>Script text support. Lua runtime integration is planned.</p>
        </article>
        <article className="docs-card">
          <h2>NEXUS Script</h2>
          <p>
            Our experimental custom syntax. Parser and runtime are future work.
          </p>
        </article>
      </div>
      <p className="warning-note">
        The Alpha currently provides a code editor and local script storage,
        not execution or compilation. Do not treat the selected language as an
        installed runtime.
      </p>
    </main>
  );
}
