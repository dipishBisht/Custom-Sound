export class CooldownManager {
  private readonly lastFired = new Map<string, number>();

  tryFire(key: string, cooldownMs: number): boolean {
    const now = Date.now();
    const last = this.lastFired.get(key) ?? 0;
    if (now - last < cooldownMs) {
      return false;
    }
    this.lastFired.set(key, now);
    return true;
  }

  resetAll(): void {
    this.lastFired.clear();
  }
}
