# NEXUS Game Engine

**Alpha 0.1.0** — an experimental browser-based 2D and 3D game engine.

## Current status

- Next.js App Router + TypeScript.
- Local project creation and listing.
- Projects stored in browser IndexedDB.
- Basic editor shell with a scene hierarchy and object creation.
- No account, cloud project storage, or server-side backup.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Local data

Project data is stored in the browser's IndexedDB database named `nexus-game-engine`. Clearing browser site data can delete local projects. Export/import and backup tools are planned; keep important work backed up manually until those features exist.

## Roadmap

- [ ] Project export/import (.nexusgame)
- [ ] 2D renderer and scene system
- [ ] 3D renderer and scene system
- [ ] Inspector and transform tools
- [ ] Asset management
- [ ] MCP server and AI Hub

## License

MIT. See [LICENSE](./LICENSE).
