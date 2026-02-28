import * as vscode from "vscode";
import { SoundPlayer } from "./sound-player";
import { CooldownManager } from "./cooldown-manager";
import { getConfig } from "./config-manager";
import { Logger } from "./logger";

export class TerminalListener {
  constructor(
    private readonly player: SoundPlayer,
    private readonly cooldown: CooldownManager,
    private readonly logger: Logger,
  ) {}

  register(): vscode.Disposable[] {
    // Check if the required API exists (VS Code >= 1.93)
    if (
      typeof (vscode.window as any).onDidEndTerminalShellExecution !==
      "function"
    ) {
      this.logger.info(
        "Terminal shell integration API not available (needs VS Code ≥ 1.93). Terminal errors disabled.",
      );
      return [];
    }

    const disposable = (vscode.window as any).onDidEndTerminalShellExecution(
      async (event: any) => {
        try {
          const exitCode = event.exitCode as number | undefined;

          // Only play if exit code is non-zero (command failed)
          if (exitCode === undefined || exitCode === 0) {
            return;
          }

          const cfg = getConfig();
          if (!cfg.enabled || !cfg.terminalErrorSound) {
            return;
          }

          if (this.cooldown.tryFire("terminalError", cfg.cooldown)) {
            this.logger.info(
              `Terminal command failed with exit code ${exitCode} – playing terminalErrorSound`,
            );
            await this.player.play(cfg.terminalErrorSound);
          }
        } catch (err) {
          this.logger.error(`Error in terminal end handler: ${err}`);
        }
      },
    );

    this.logger.debug("Terminal listener registered.");
    return [disposable];
  }
}
