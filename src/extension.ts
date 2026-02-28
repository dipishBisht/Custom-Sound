import * as vscode from "vscode";
import { SoundPlayer } from "./sound-player";
import { CooldownManager } from "./cooldown-manager";
import { Logger } from "./logger";
import { getConfig } from "./config-manager";
import { TerminalListener } from "./terminal-listener";

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext): void {
  const logger = new Logger();
  const cfg = getConfig();
  logger.setDebug(cfg.debug);
  logger.info("Custom Sounds (simplified) activating...");

  const player = new SoundPlayer(logger);
  const cooldown = new CooldownManager();
  const terminalListener = new TerminalListener(player, cooldown, logger);

  function registerListeners(): void {
    disposables.forEach((d) => d.dispose());
    disposables = terminalListener.register();
    context.subscriptions.push(...disposables);
  }

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("customSounds.toggle", async () => {
      const current = getConfig().enabled;
      const next = !current;
      await vscode.workspace
        .getConfiguration("customSounds")
        .update("enabled", next, vscode.ConfigurationTarget.Global);

      const newCfg = getConfig();
      const sound = next ? newCfg.enableSound : newCfg.disableSound;
      if (sound) {
        player.play(sound);
      }
      vscode.window.showInformationMessage(
        `Custom Sounds: ${next ? "🔊 Enabled" : "🔇 Disabled"}`,
      );
    }),

    vscode.commands.registerCommand("customSounds.showLog", () => {
      logger.show();
    }),

    vscode.commands.registerCommand("customSounds.setup", async () => {
      await runSetupWizard(logger);
    }),
  );

  // Config hot‑reload
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("customSounds")) {
        const newCfg = getConfig();
        logger.setDebug(newCfg.debug);
        logger.info("Configuration changed – reloading listeners.");
        cooldown.resetAll();
        registerListeners();
      }
    }),
  );

  registerListeners();
  logger.info(
    'Custom Sounds active. Use "Custom Sounds: Setup Sounds" to configure the terminal error sound.',
  );
}

export function deactivate(): void {
  disposables.forEach((d) => d.dispose());
}

// Setup wizard (simplified to only terminalErrorSound)
interface SoundSlot {
  label: string;
  key: keyof import("./config-manager").CustomSoundsConfig;
  description: string;
}

const SOUND_SLOTS: SoundSlot[] = [
  {
    key: "terminalErrorSound",
    label: "🖥️ Terminal Error",
    description: "Plays when a terminal command fails (non-zero exit code)",
  },
  {
    key: "enableSound",
    label: "🔊 Enable Sound",
    description: "Plays when extension is toggled on",
  },
  {
    key: "disableSound",
    label: "🔇 Disable Sound",
    description: "Plays when extension is toggled off",
  },
];

const AUDIO_FILTER = { Audio: ["mp3", "wav", "ogg", "flac", "aiff", "m4a"] };

async function runSetupWizard(logger: Logger): Promise<void> {
  const picks = await vscode.window.showQuickPick(
    SOUND_SLOTS.map((s) => ({
      label: s.label,
      description: s.description,
      slot: s,
    })),
    {
      canPickMany: true,
      title: "Custom Sounds — Setup",
      placeHolder:
        "Select which sounds to configure (space to select, enter to confirm)",
    },
  );

  if (!picks || picks.length === 0) {
    return;
  }

  const config = vscode.workspace.getConfiguration("customSounds");

  for (const pick of picks) {
    const uris = await vscode.window.showOpenDialog({
      title: `Select sound for: ${pick.label}`,
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      filters: AUDIO_FILTER,
      openLabel: "Use this sound",
    });

    if (!uris || uris.length === 0) {
      const clear = await vscode.window.showQuickPick(
        ["Keep existing", "Clear this sound"],
        {
          title: `No file selected for ${pick.label}`,
        },
      );
      if (clear === "Clear this sound") {
        await config.update(
          pick.slot.key,
          "",
          vscode.ConfigurationTarget.Global,
        );
      }
      continue;
    }

    const filePath = uris[0].fsPath;
    await config.update(
      pick.slot.key,
      filePath,
      vscode.ConfigurationTarget.Global,
    );
    logger.info(`Setup: ${pick.slot.key} = ${filePath}`);
  }

  vscode.window.showInformationMessage("✅ Custom Sounds configured!");
}
