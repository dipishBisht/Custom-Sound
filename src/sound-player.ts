import * as vscode from "vscode";
import { exec } from "child_process";
import * as fs from "fs";
import { Logger } from "./logger";

export class SoundPlayer {
  constructor(private readonly logger: Logger) {}

  async play(soundPath: string): Promise<void> {
    if (!soundPath) {
      return;
    }

    if (!fs.existsSync(soundPath)) {
      this.logger.warn(`Sound file not found: ${soundPath}`);
      vscode.window.showWarningMessage(
        `Custom Sounds: file not found → ${soundPath}`,
      );
      return;
    }

    const cmd = this.buildCommand(soundPath);
    if (!cmd) {
      return;
    }

    this.logger.debug(`Playing: ${soundPath}`);
    return new Promise((resolve) => {
      exec(cmd, { timeout: 30_000 }, (err) => {
        if (err && err.signal !== "SIGTERM") {
          this.logger.error(`Playback error: ${err.message}`);
        }
        resolve();
      });
    });
  }

  private buildCommand(filePath: string): string | undefined {
    const escaped = `"${filePath.replace(/"/g, '\\"')}"`;
    const platform = process.platform;

    if (platform === "darwin") {
      return `afplay ${escaped}`;
    }

    if (platform === "win32") {
      return `powershell -c (New-Object Media.SoundPlayer ${escaped}).PlaySync()`;
    }

    // Linux
    if (this.commandExists("paplay")) {
      return `paplay ${escaped}`;
    }
    if (this.commandExists("aplay")) {
      return `aplay ${escaped}`;
    }
    if (this.commandExists("mpg123")) {
      return `mpg123 -q ${escaped}`;
    }

    this.logger.warn(
      "No audio player found. Install pulseaudio-utils, alsa-utils, or mpg123.",
    );
    vscode.window.showWarningMessage(
      "Custom Sounds: No audio player found on Linux. Install `paplay`, `aplay`, or `mpg123`.",
    );
    return undefined;
  }

  private commandExists(cmd: string): boolean {
    try {
      const { execSync } = require("child_process");
      execSync(`which ${cmd}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}
