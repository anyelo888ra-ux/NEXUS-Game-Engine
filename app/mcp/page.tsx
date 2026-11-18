import Link from "next/link";

export default function McpHub() {
  return (
    <main className="docs-layout">
      <Link className="docs-link" href="/">← NEXUS Engine</Link>
      <div className="eyebrow" style={{ marginTop: 28 }}>NEXUS AI CONNECTIVITY · MCP 0.1</div>
      <h1>MCP Hub</h1>
      <p className="subtitle">
        NEXUS MCP 0.1 ya incluye un servidor local real basado en MCP stdio.
        Puedes conectar un cliente compatible para consultar y editar un proyecto
        exportado en JSON.
      </p>
      <div className="warning-note">
        MCP 0.1 funciona mediante un ciclo explícito: exporta el proyecto JSON,
        abre ese archivo con la herramienta project.open del servidor MCP,
        deja que el asistente lo edite y vuelve a importarlo en el editor.
        Todavía no existe sincronización en vivo con IndexedDB ni un endpoint MCP alojado en Vercel.
      </div>
      <div className="docs-grid">
        <article className="docs-card">
          <h2>Herramientas de escena</h2>
          <p><code>scene.list</code>, <code>scene.create_object</code>, <code>scene.update_object</code> y <code>scene.delete_object</code> permiten inspeccionar y modificar objetos y sus colores.</p>
        </article>
        <article className="docs-card">
          <h2>Herramientas de scripts</h2>
          <p><code>scripts.list</code>, <code>scripts.read</code> y <code>scripts.write</code> permiten consultar y editar el código guardado en el proyecto.</p>
        </article>
        <article className="docs-card">
          <h2>Proyecto</h2>
          <p><code>project.open</code>, <code>project.inspect</code> y <code>project.save</code> abren, inspeccionan y guardan el archivo JSON local.</p>
        </article>
        <article className="docs-card">
          <h2>Privacidad y control</h2>
          <p>El servidor se ejecuta en tu equipo por stdio. Solo puede trabajar con el archivo que eliges abrir. Usa clientes MCP de confianza y revisa las acciones de escritura.</p>
        </article>
      </div>
      <h2>Instalación</h2>
      <ol className="subtitle">
        <li>Descarga o clona el repositorio e instala dependencias con <code>npm install</code>.</li>
        <li>En NEXUS Engine, abre un proyecto y pulsa <strong>Export JSON</strong>.</li>
        <li>Configura tu cliente MCP con <code>node</code> y la ruta absoluta a <code>mcp-server/index.mjs</code>.</li>
        <li>Reinicia el cliente y llama <code>project.open</code> con la ruta absoluta del JSON exportado.</li>
        <li>Cuando el asistente termine, importa el JSON modificado en el mismo proyecto.</li>
      </ol>
      <p className="muted" style={{fontSize:12,lineHeight:1.7}}>
        Limitaciones 0.1: no ejecuta Python, C++, Lua ni NEXUS Script; no sincroniza cambios en vivo; los modelos binarios GLB/glTF/OBJ deben importarse por separado después de un intercambio JSON.
      </p>
      <p><a className="docs-link" href="https://github.com/anyelo888ra-ux/NEXUS-Game-Engine/tree/main/mcp-server" target="_blank" rel="noreferrer">Ver servidor MCP y guía de configuración en GitHub ↗</a></p>
      <Link className="btn primary" href="/">Back to projects</Link>
    </main>
  );
}
