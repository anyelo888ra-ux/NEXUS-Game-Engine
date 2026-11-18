# NEXUS Game Engine

**Alpha 0.3.0** — browser-based 2D/3D game engine experiment.

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
- Assistant AI permission panel and MCP Hub planning page.

## Important Alpha limitations
- Script files are edited and saved as text; Python, C++, Lua and NEXUS Script runtimes/compilers are not integrated yet.
- Animation tools are simple procedural preview loops, not a full keyframe timeline.
- The project file panel currently stores and reorders entries; nested drag-and-drop folder moves are not implemented yet.
- The MCP Hub documents the planned connection and the editor has an Assistant AI permissions UI, but a remote MCP transport/server is **not connected yet**. Do not treat the UI as a live MCP connection.
- Projects and imported assets remain in the current browser's IndexedDB. There is no cloud backup or automatic access from external AI chats.

## Blender workflow
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
