/**
 * NEXUS Script runtime 0.1
 * A deliberately small command interpreter. It never uses eval(), Function(),
 * dynamic imports, DOM access, network access, or Node.js APIs.
 */

export type NexusEvent = "game.starts" | "player.jumps";
export type NexusRuntimeAPI = {
  say: (message: string) => void;
  movePlayer: (x: number, y: number, z: number) => void;
  setPlayerPosition: (x: number, y: number, z: number) => void;
  jumpPlayer: () => void;
  setPlayerSpeed: (speed: number) => void;
};

const MAX_COMMANDS = 100;
const MAX_SOURCE_LENGTH = 20_000;
const MAX_NUMBER = 10_000;

function safeNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && Math.abs(parsed) <= MAX_NUMBER ? parsed : null;
}

function arguments3(source: string): [number, number, number] | null {
  const values = source.split(",").map(safeNumber);
  if (values.length !== 3 || values.some(v => v === null)) return null;
  return values as [number, number, number];
}

/**
 * Runs one event block. Supported commands:
 *   say "text"
 *   player.move(x, y, z)
 *   player.set_position(x, y, z)
 *   player.jump()
 *   player.set_speed(number)
 *
 * Event blocks use: when game.starts { ... }
 *                  when player.jumps { ... }
 */
export function runNexusScript(
  source: string,
  event: NexusEvent,
  api: NexusRuntimeAPI,
): { executed: number; errors: string[] } {
  const errors: string[] = [];
  if (source.length > MAX_SOURCE_LENGTH) {
    return { executed: 0, errors: ["Script exceeds the 20 KB sandbox limit."] };
  }

  const eventPattern = /when\s+(game\.starts|player\.jumps)\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;
  let executed = 0;

  while ((match = eventPattern.exec(source)) !== null) {
    if (match[1] !== event) continue;
    const lines = match[2].split(/\r?\n|;/).map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      if (executed >= MAX_COMMANDS) {
        errors.push("Sandbox command limit reached (100 commands per event).");
        return { executed, errors };
      }
      if (line.startsWith("//") || line.startsWith("#")) continue;

      const sayMatch = line.match(/^say\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/);
      if (sayMatch) {
        api.say(sayMatch[1].slice(1, -1).replace(/\\n/g, "\n").slice(0, 500));
        executed++;
        continue;
      }

      const moveMatch = line.match(/^player\.move\s*\((.*)\)$/);
      if (moveMatch) {
        const values = arguments3(moveMatch[1]);
        if (!values) errors.push(`Invalid coordinates: ${line}`);
        else { api.movePlayer(...values); executed++; }
        continue;
      }

      const positionMatch = line.match(/^player\.set_position\s*\((.*)\)$/);
      if (positionMatch) {
        const values = arguments3(positionMatch[1]);
        if (!values) errors.push(`Invalid coordinates: ${line}`);
        else { api.setPlayerPosition(...values); executed++; }
        continue;
      }

      if (line === "player.jump()") {
        api.jumpPlayer();
        executed++;
        continue;
      }

      const speedMatch = line.match(/^player\.set_speed\s*\((.*)\)$/);
      if (speedMatch) {
        const speed = safeNumber(speedMatch[1]);
        if (speed === null || speed < 0 || speed > 30) errors.push("Player speed must be between 0 and 30.");
        else { api.setPlayerSpeed(speed); executed++; }
        continue;
      }

      errors.push(`Unknown or unsupported command: ${line.slice(0, 120)}`);
    }
  }

  return { executed, errors };
}
