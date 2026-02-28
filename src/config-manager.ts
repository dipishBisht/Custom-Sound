import * as vscode from "vscode";

export interface CustomSoundsConfig {
  enabled: boolean;
  cooldown: number;
  debug: boolean;
  terminalErrorSound: string;
  enableSound: string;
  disableSound: string;
}

const SECTION = "customSounds";

export function getConfig(): CustomSoundsConfig {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  return {
    enabled: cfg.get<boolean>("enabled", true),
    cooldown: cfg.get<number>("cooldown", 3000),
    debug: cfg.get<boolean>("debug", false),
    terminalErrorSound: cfg.get<string>("terminalErrorSound", ""),
    enableSound: cfg.get<string>("enableSound", ""),
    disableSound: cfg.get<string>("disableSound", ""),
  };
}
