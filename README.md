# Custom Sounds — VS Code Extension

A flexible, pattern-based developer sound engine for VS Code.


## Quick Start

1. Install the extension
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type: **"Custom Sounds: Setup Sounds"**


## Features

- **Custom sound** — Add your favorite sounds in terminal error 
- **Toggle command** — quickly mute sounds

## Platform Support

| OS      | Audio Engine                            |
|---------|-----------------------------------------|
| macOS   | `afplay` (built-in)                     |
| Windows | PowerShell `System.Windows.Media`       |
| Linux   | `paplay` → `aplay` → `mpg123` (auto)   |


## Commands

| Command                              | Description                   |
|--------------------------------------|-------------------------------|
| `Custom Sounds: Toggle On/Off`       | Enable or disable all sounds  |
| `Custom Sounds: Setup Sounds`        | Setup any sound as error sound|
| `Custom Sounds: Show Log`            | Open the debug output channel |


## Architecture

```
src/
├── extension.ts          # Activation, command registration, wiring
├── config-manager.ts      # Typed config access (getConfig())
├── sound-player.ts        # Cross-platform audio playback
├── cooldown-manager.ts    # Per-key debounce logic
├── terminal-listener.ts   # onDidWriteTerminalData handler
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