import Link from "next/link";

export default function ScriptingDocs() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/doc">← Docs</Link>
      <h1>Programming languages</h1>
      <p className="subtitle">
        NEXUS Engine has its own browser-first language: NEXUS Script (.nxs).
        Python, C++ and Lua can also be stored as source files, with adapters
        planned as separate runtimes.
      </p>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>NEXUS Script 0.1</h2>
          <p>Native allowlisted interpreter in the browser. Supports game start and player jump events, messages, player movement, teleporting and movement speed.</p>
        </article>
        <article className="docs-card">
          <h2>Python</h2>
          <p>Source editing is available. A Python runtime or compiler is not bundled in this browser version.</p>
        </article>
        <article className="docs-card">
          <h2>C / C++</h2>
          <p>Source editing is available. Native compilation requires a separate toolchain and is not executed by the browser sandbox.</p>
        </article>
        <article className="docs-card">
          <h2>Lua</h2>
          <p>Source editing is available. Lua runtime integration is planned as a separate adapter.</p>
        </article>
        <article className="docs-card">
          <h2>PHP and other languages</h2>
          <p>Possible future adapters for tools or server-side workflows. PHP will not run inside the game browser sandbox.</p>
        </article>
        <article className="docs-card">
          <h2>Sandbox</h2>
          <p>NEXUS Script does not use eval or expose browser globals, network, filesystem, Node.js or arbitrary imports. It has source and command limits.</p>
        </article>
      </div>
      <h2>Example</h2>
      <pre className="code-block"><code>{`when game.starts {
  say "Welcome to my game!"
  player.set_speed(6)
}

when player.jumps {
  say "Jump!"
  player.move(0, 0.1, 0)
}`}</code></pre>
      <p className="warning-note">
        NEXUS Script 0.1 is intentionally small: no variables, loops, custom
        functions or unrestricted code execution yet. Those features can be
        added to later language versions after testing the sandbox.
      </p>
      <Link className="docs-link" href="/mcp">MCP Hub →</Link>
    </main>
  );
}
