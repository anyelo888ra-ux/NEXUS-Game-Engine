# NEXUS Game Engine

**Alpha 0.2.0** — browser-based 2D/3D game engine experiment.

Repository: https://github.com/anyelo888ra-ux/NEXUS-Game-Engine

## Features in Alpha 0.2
- Next.js + React application.
- Three.js real-time WebGL scene viewport.
- Orbit camera controls (orbit, zoom and pan).
- Add basic cube meshes.
- Import 3D models in GLB, glTF and OBJ formats.
- Project data and imported model blobs stored locally in IndexedDB.
- Credits page at `/credits`.

## Blender workflow
The native `.blend` project format is not directly loaded by the browser engine. In Blender, export the model using **File → Export → glTF 2.0**, preferably as **GLB**. GLB is recommended because it can package meshes, materials and textures in one file.

glTF files that reference external textures need those files alongside the glTF; this initial importer is best suited to self-contained GLB files. OBJ geometry is supported; separate MTL materials are not implemented yet.

## Local-first storage
Projects are stored in the current browser's IndexedDB database (`nexus-game-engine`). Clearing browser site data can remove local projects. There is no server-side project backup.

## Development
```bash
npm install
npm run dev
```

## Credits and licensing
See [the credits page](/credits) for the project repository, framework and dependency links. The project is licensed under MIT; see [LICENSE](./LICENSE). Third-party dependencies retain their own licenses.
