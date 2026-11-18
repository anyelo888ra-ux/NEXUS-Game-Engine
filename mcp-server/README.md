# NEXUS Game Engine MCP Server 0.1

A local **Model Context Protocol (MCP)** server using stdio. It lets an MCP-compatible desktop client inspect and edit a NEXUS project JSON export.

## Requirements
- Node.js 18 or newer
- NEXUS Game Engine 0.1 project JSON export
- An MCP-compatible client that supports stdio servers

## Install
From the repository root:

```bash
npm install
```

## Client configuration
Use an absolute path to this repository's `mcp-server/index.mjs` file:

```json
{
  "mcpServers": {
    "nexus-game-engine": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO_REPOSITORY/mcp-server/index.mjs"]
    }
  }
}
```

Restart the MCP client after saving its configuration.

## First use
1. In NEXUS Engine, export a project as JSON.
2. In the connected AI client, call `project.open` with the absolute path to that JSON file.
3. Use `project.inspect`, `scene.list`, `scene.create_object`, `scene.update_object`, `scene.delete_object`, `scripts.list`, `scripts.read`, and `scripts.write`.
4. Changes are saved to the JSON file.
5. Import the modified JSON back into the same project in NEXUS Engine.

## Important 0.1 limitations
- This is a real local stdio MCP server, not a hosted Vercel endpoint.
- It edits the exported JSON file; it does not directly attach to the browser's IndexedDB while the editor is open. Sync is an explicit export/import round trip.
- Binary model assets (GLB/glTF/OBJ blobs) are not embedded in JSON exports. Re-import those assets separately if needed.
- Python, C++, Lua and NEXUS scripts are edited as text; this server does not execute them.
- Only open project files you trust. MCP clients can modify the file using the granted tools.
