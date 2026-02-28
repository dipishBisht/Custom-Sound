# Custom Sounds — VS Code Extension

A flexible, pattern-based developer sound engine for VS Code.

## Features

- 🎯 **Task events** — success/fail for any task, plus build-specific and test-specific sounds
- 🔴 **Diagnostics** — sound when errors appear or are cleared in the Problems panel
- 💾 **Save events** — different sound for clean saves vs saves with errors
- 🖥️ **Terminal patterns** — regex or substring matching against terminal output
- 🎲 **Random from folder** — pick a random sound from a directory
- ⏱️ **Per-event cooldowns** — no sound spam, configurable per trigger
- 🔇 **Toggle command** — quickly mute all sounds

## Platform Support

| OS      | Audio Engine                            |
|---------|-----------------------------------------|
| macOS   | `afplay` (built-in)                     |
| Windows | PowerShell `System.Windows.Media`       |
| Linux   | `paplay` → `aplay` → `mpg123` (auto)   |

## Quick Start

1. Install the extension
2. Open `settings.json` and add your sound paths
3. See `example-settings.json` for a full configuration example

## Commands

| Command                              | Description                   |
|--------------------------------------|-------------------------------|
| `Custom Sounds: Toggle On/Off`       | Enable or disable all sounds  |
| `Custom Sounds: Test a Sound File`   | Play any file path you enter  |
| `Custom Sounds: Show Log`            | Open the debug output channel |
| `Custom Sounds: Reset All Cooldowns` | Immediately reset all timers  |

## Pattern Triggers

Patterns can be plain substrings (case-insensitive) or regex strings using
`/pattern/flags` syntax:

```json
"customSounds.triggers": [
  { "pattern": "Compiled successfully", "sound": "/path/victory.mp3" },
  { "pattern": "/\\d+ tests? failed/i", "sound": "/path/fail.mp3" }
]
```

Each trigger can have its own `cooldown` in milliseconds to override the global setting.

## Architecture

```
src/
├── extension.ts          # Activation, command registration, wiring
├── configManager.ts      # Typed config access (getConfig())
├── soundPlayer.ts        # Cross-platform audio playback
├── cooldownManager.ts    # Per-key debounce logic
├── taskListener.ts       # onDidEndTaskProcess handler
├── diagnosticsListener.ts# onDidChangeDiagnostics handler
├── saveListener.ts       # onDidSaveTextDocument handler
├── terminalListener.ts   # onDidWriteTerminalData handler
└── logger.ts             # Output channel logger
```

## Linux Setup

Install one of these audio players:

```bash
# Ubuntu/Debian
sudo apt install pulseaudio-utils    # paplay
sudo apt install alsa-utils           # aplay
sudo apt install mpg123               # mpg123

# Fedora
sudo dnf install mpg123
```

## Terminal Pattern Matching Note

Terminal data events require the `terminalDataWriteEvent` proposed API
(`enabledApiProposals` in package.json). This works when running the extension
via `vsce` against VS Code ≥ 1.87 with the proposed API enabled, or in the
Extension Development Host (F5).