import * as vscode from "vscode";

export class Logger {
  private readonly channel: vscode.OutputChannel;
  private debugEnabled = false;

  constructor() {
    this.channel = vscode.window.createOutputChannel("Custom Sounds");
  }

  setDebug(enabled: boolean): void {
    this.debugEnabled = enabled;
  }

  debug(msg: string): void {
    if (this.debugEnabled) {
      this.log("DEBUG", msg);
    }
  }

  info(msg: string): void {
    this.log("INFO", msg);
  }

  warn(msg: string): void {
    this.log("WARN", msg);
  }

  error(msg: string): void {
    this.log("ERROR", msg);
  }

  show(): void {
    this.channel.show();
  }

  dispose(): void {
    this.channel.dispose();
  }

  private log(level: string, msg: string): void {
    const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.channel.appendLine(`[${ts}] [${level}] ${msg}`);
  }
}
