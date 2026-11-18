# NEXUS Script Language Specification — 0.1

## Design goals
- Readable, event-driven, beginner-friendly syntax.
- Browser-first execution inside NEXUS Game Engine.
- No arbitrary JavaScript evaluation.
- Small allowlisted API surface and deterministic command limits.

## Lexical rules
- UTF-8 source text.
- Whitespace separates tokens.
- `//` and `#` start line comments.
- Strings use single or double quotes.
- Numeric arguments are finite decimal numbers.

## Event grammar
```
program       := event_block*
event_block   := "when" event_name "{" command* "}"
event_name    := "game.starts" | "player.jumps"
command       := say | move | set_position | jump | set_speed
say           := "say" string
move          := "player.move(" number "," number "," number ")"
set_position  := "player.set_position(" number "," number "," number ")"
jump          := "player.jump()"
set_speed     := "player.set_speed(" number ")"
```

## Runtime constraints
- Maximum source: 20,000 characters.
- Maximum executed commands per event: 100.
- Coordinate values: -10,000 to 10,000.
- Player speed: 0 to 30.
- Output strings are truncated to 500 characters.
- Unknown commands are rejected.
- No eval, Function constructor, arbitrary imports, browser globals, network, filesystem or server access.

This is an intentionally limited 0.1 language. Variables, loops, functions, expressions and custom modules are not part of this version.
