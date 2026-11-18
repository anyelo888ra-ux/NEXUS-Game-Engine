# NEXUS Game Engine

**Alpha 0.4.0** — browser-based 2D/3D game engine experiment.

Repository: https://github.com/anyelo888ra-ux/NEXUS-Game-Engine

## Alpha 0.3 features
- Three.js real-time WebGL scene viewport with orbit, zoom and pan.
- Right-click scene context menu to add primitives, import models, duplicate and delete objects.
- Scene hierarchy and Inspector with editable Position, Rotation and Scale.
- Built-in primitives: cube, sphere, capsule, plane, cone, torus and flat circle. Standalone cylinders are intentionally excluded; see `/doc/cilindros-not-used`.
- Import GLB, glTF and OBJ models.
- Project file panel with local file/folder entries.
- Script text editor for Python, C++, Lua and experimental NEXUS Script.
- Basic Move and Jump animation preview loops.
- Starter templates: empty scene, platformer and 3D showcase.
- Custom 404 page, `/about:blank`, and documentation at `/doc`.
- Per-object material color picker and Play/Stop scene playtest with basic WASD camera movement.\n- JSON project export/import for a controlled MCP editing round trip.\n- Local MCP 0.1 stdio server with scene and script tools.

## Important Alpha limitations
- Python, C++ and Lua remain source-text editors only; their runtimes/toolchains are not bundled. NEXUS Script 0.1 is the only integrated runtime.
- Animation tools are simple procedural preview loops, not a full keyframe timeline.
- The project file panel currently stores and reorders entries; nested drag-and-drop folder moves are not implemented yet.
- MCP 0.1 is a real local stdio server (`mcp-server/index.mjs`) that edits an exported project JSON file. It does not connect directly to browser IndexedDB or run as a hosted Vercel MCP endpoint; use the editor Export JSON / Import JSON round trip.
- Projects and imported assets remain in the current browser's IndexedDB. There is no cloud backup or automatic access from external AI chats.

## MCP 0.1\nSee [`mcp-server/README.md`](mcp-server/README.md) for installation and MCP client configuration.\n\n## Blender workflow
The native `.blend` format is not directly loaded by the browser. In Blender, use **File → Export → glTF 2.0**, preferably as **GLB**. GLB can package meshes, materials and textures in one file. glTF files may need external textures beside them; OBJ geometry is supported, but separate MTL materials are not implemented yet.

## Local-first storage
Projects are stored in the current browser's IndexedDB database (`nexus-game-engine`). Clearing browser site data can remove local projects. Export/backup is a future feature.

## Development
```bash
npm install
npm run dev
npm run build
```

## Documentation
- `/doc` — documentation index.
- `/doc/primitives` — supported shapes.
- `/doc/cilindros-not-used` — excluded cylinder primitive note.
- `/doc/scene-editor` — scene editor controls.
- `/doc/scripting` — language support and limitations.
- `/doc/animation` — animation preview.
- `/mcp` — Assistant AI and MCP Hub.

## Credits and licensing
See `/credits` for third-party dependencies and attribution. The project is licensed under MIT; third-party dependencies retain their own licenses.
