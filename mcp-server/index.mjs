#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "nexus-game-engine", version: "0.1.0" });
let projectPath = null;
let project = null;

function validateProject(value) {
  if (!value || typeof value !== "object" || typeof value.id !== "string" || !value.scene || !Array.isArray(value.scene.objects)) {
    throw new Error("Invalid NEXUS project JSON. Expected id and scene.objects.");
  }
  value.files ??= [];
  value.scripts ??= [];
  value.animations ??= [];
  return value;
}
async function save() {
  if (!projectPath || !project) throw new Error("Open a project first with project.open.");
  project.updatedAt = Date.now();
  await writeFile(projectPath, JSON.stringify(project, null, 2), "utf8");
}
function requireProject() {
  if (!project) throw new Error("No project is open. Call project.open first.");
  return project;
}
function result(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

server.tool("project.open", "Open a NEXUS project JSON file for this MCP session. Use a file exported by NEXUS Game Engine.", {
  path: z.string().min(1).describe("Absolute path to the exported .json project file")
}, async ({ path: requestedPath }) => {
  const resolved = path.resolve(requestedPath);
  if (!resolved.toLowerCase().endsWith(".json")) throw new Error("Only .json project files are supported.");
  const raw = await readFile(resolved, "utf8");
  project = validateProject(JSON.parse(raw));
  projectPath = resolved;
  return result({ opened: path.basename(resolved), project: project.name, objects: project.scene.objects.length, scripts: project.scripts.length, note: "Changes are written to this JSON file. Import it back into the browser editor to sync." });
});

server.tool("project.inspect", "Read project metadata and scene summary.", {}, async () => {
  const p = requireProject();
  return result({ id: p.id, name: p.name, objects: p.scene.objects.length, files: p.files.length, scripts: p.scripts.length, animations: p.animations.length });
});

server.tool("scene.list", "List scene objects, transforms and material colors.", {}, async () => result(requireProject().scene.objects.map(({ id, name, type, shape, color, transform }) => ({ id, name, type, shape, color, transform }))));

server.tool("scene.create_object", "Create a primitive in the open scene. Supported shapes: cube, sphere, capsule, plane, cone, torus, circle.", {
  name: z.string().min(1).max(100),
  shape: z.enum(["cube", "sphere", "capsule", "plane", "cone", "torus", "circle"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
}, async ({ name, shape, color }) => {
  const p = requireProject();
  const object = { id: crypto.randomUUID(), name, type: "mesh", shape, color: color ?? "#50d8e8", transform: { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] } };
  p.scene.objects.push(object);
  await save();
  return result({ created: object });
});

server.tool("scene.update_object", "Update an existing object's name, color or transform.", {
  id: z.string().min(1),
  name: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  scale: z.tuple([z.number(), z.number(), z.number()]).optional()
}, async ({ id, name, color, position, rotation, scale }) => {
  const p = requireProject();
  const object = p.scene.objects.find(item => item.id === id);
  if (!object) throw new Error("Object not found.");
  if (name !== undefined) object.name = name;
  if (color !== undefined) object.color = color;
  object.transform ??= { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
  if (position) object.transform.position = position;
  if (rotation) object.transform.rotation = rotation;
  if (scale) object.transform.scale = scale;
  await save();
  return result({ updated: object });
});

server.tool("scene.delete_object", "Delete an object by its exact ID.", { id: z.string().min(1) }, async ({ id }) => {
  const p = requireProject();
  const before = p.scene.objects.length;
  p.scene.objects = p.scene.objects.filter(item => item.id !== id);
  if (p.scene.objects.length === before) throw new Error("Object not found.");
  await save();
  return result({ deleted: id });
});

server.tool("scripts.list", "List scripts in the project.", {}, async () => result(requireProject().scripts.map(({ id, name, language }) => ({ id, name, language }))));

server.tool("scripts.read", "Read a script by ID.", { id: z.string().min(1) }, async ({ id }) => {
  const script = requireProject().scripts.find(item => item.id === id);
  if (!script) throw new Error("Script not found.");
  return result(script);
});

server.tool("scripts.write", "Replace a script's source code by ID.", {
  id: z.string().min(1),
  content: z.string().max(200000)
}, async ({ id, content }) => {
  const p = requireProject();
  const script = p.scripts.find(item => item.id === id);
  if (!script) throw new Error("Script not found.");
  script.content = content;
  await save();
  return result({ updated: script.id, characters: content.length });
});

server.tool("project.save", "Write all pending changes to the opened project JSON file.", {}, async () => {
  await save();
  return result({ saved: projectPath, updatedAt: project.updatedAt });
});

const transport = new StdioServerTransport();
await server.connect(transport);
