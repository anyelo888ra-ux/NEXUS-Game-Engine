# NEXUS Game Engine

**Alpha 0.4.0** — browser-based 3D game engine experiment.

Repository: https://github.com/anyelo888ra-ux/NEXUS-Game-Engine

## Alpha 0.4 features
- Three.js real-time WebGL scene viewport with orbit, zoom and pan.
- Scene hierarchy and Inspector with editable Position, Rotation, Scale and material color.
- Built-in primitives: cube, sphere, capsule, plane, cone, torus and flat circle.
- Import GLB, glTF and OBJ models.
- Add a scene Camera and edit its transform.
- Mark one Capsule as the Player; Play uses that exact object.
- Play follows the Player capsule using the scene Camera's position offset and rotation.
- Basic WASD movement, Space jump, gravity and approximate platform landing.
- Stop saves the Player's final position into the scene.
- NEXUS Script 0.1 interpreter with a restricted browser sandbox.
- Python, C++ and Lua source editors; future adapters are planned.
- Local project file/folder panel and JSON export/import.
- Local MCP 0.1 stdio server for editing exported project JSON.

## NEXUS Script 0.1
The first-party browser language is stored under `language/nexus-script/`.
See:
- [Language overview](language/README.md)
- [NEXUS Script guide](language/nexus-script/README.md)
- [Language specification](language/nexus-script/SPEC.md)

The current interpreter supports `when game.starts` and `when player.jumps` events, with `say`, `player.move`, `player.set_position`, `player.jump` and `player.set_speed`.

## Important Alpha limitations
- NEXUS Script 0.1 is intentionally small: no variables, loops, user-defined functions or arbitrary code execution yet.
- Python, C++ and Lua are saved as source text only; their runtimes/toolchains are not bundled.
- PHP is not executed in the browser sandbox. It may be considered later for separate server-side tools.
- Play physics are a lightweight prototype, not a complete physics engine. Collision shapes are approximate.
- Animation tools are procedural preview loops, not a full keyframe timeline.
- MCP 0.1 edits an exported JSON file. It does not connect directly to browser IndexedDB or run as a hosted Vercel MCP endpoint.
- Projects and imported assets remain in the current browser's IndexedDB. There is no cloud backup or automatic access from external AI chats.

## MCP 0.1
See [mcp-server/README.md](mcp-server/README.md) for installation and MCP client configuration.

## Blender workflow
The native `.blend` format is not loaded directly. In Blender, use **File → Export → glTF 2.0**, preferably as **GLB**. GLB can package meshes, materials and textures in one file. glTF may need external textures beside it; OBJ geometry is supported, but separate MTL materials are not implemented yet.

## Local development
```bash
npm install
npm run dev
npm run build
```

## Documentation
- `/doc` — documentation index.
- `/doc/primitives` — supported shapes.
- `/doc/scene-editor` — scene editor controls.
- `/doc/scripting` — language support and limitations.
- `/doc/animation` — animation preview.
- `/mcp` — Assistant AI and MCP Hub.

## License
MIT. Third-party dependencies retain their own licenses.
