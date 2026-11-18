# NEXUS Script 0.1

NEXUS Script (`.nxs`) is the engine's own browser-first scripting language. Its syntax takes inspiration from Python's readability, Lua's lightweight event style, and C-like blocks. It is **not** Python, Lua, C, JavaScript, or PHP.

## Example

```nxs
// Runs once when Play starts
when game.starts {
  say "Welcome to my game!"
  player.set_speed(6)
  player.move(0, 0, 0)
}

// Runs when the player jumps
when player.jumps {
  say "Jump!"
  player.move(0, 0.1, 0)
}
```

## 0.1 supported events

- `when game.starts { ... }`
- `when player.jumps { ... }`

## 0.1 commands

- `say "message"`
- `player.move(x, y, z)`
- `player.set_position(x, y, z)`
- `player.jump()`
- `player.set_speed(value)` (0 to 30)

## Browser sandbox

The interpreter is a small allowlisted command parser. It does not evaluate JavaScript and does not expose `window`, `document`, network, filesystem, Node.js, dynamic imports, or arbitrary browser APIs. A script is limited to 20 KB and 100 executed commands per event. Invalid commands are reported instead of being executed.

## Roadmap

0.2: variables, constants, arithmetic expressions, reusable functions and collision events.
0.3: scene queries, input events, UI events and a visual debugger.
Later: optional transpilers or isolated runtimes for other languages. Native C/C++ compilation and unrestricted PHP are not browser runtime features.

## Project integration

The editor stores source as an ordinary project script. The browser interpreter is bundled with the engine, so no server-side PHP or Python installation is required.
