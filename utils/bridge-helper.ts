import { Page, expect } from '@playwright/test';
import { GameTestBridge, GameState } from '../bridge/game-bridge';

/**
 * Evaluate a function in the browser that accesses window.__test__
 * Throws a helpful error if the bridge is not present
 */
async function callBridge<T>(page: Page, fn: (bridge: GameTestBridge) => T): Promise<T> {
  return page.evaluate((fnStr) => {
    const bridge = (globalThis as any).__test__;
    if (!bridge) {
      throw new Error(
        'Game Bridge (window.__test__) is not available. ' +
        'Make sure the game is running with __TEST_ENABLED__=true.'
      );
    }
    return eval(`(${fnStr})(bridge)`);
  }, fn.toString());
}

export class GameBridgeHelper {
  constructor(private page: Page) {}

  async getBalance(): Promise<number> {
    return callBridge(this.page, (b) => b.getBalance());
  }

  async getBetAmount(): Promise<number> {
    return callBridge(this.page, (b) => b.getBetAmount());
  }

  async getGameState(): Promise<GameState> {
    return callBridge(this.page, (b) => b.getGameState());
  }

  async getCurrentSymbols(): Promise<string[][]> {
    return callBridge(this.page, (b) => b.getCurrentSymbols());
  }

  async getLastSpinResult() {
    return callBridge(this.page, (b) => b.getLastSpinResult());
  }

  async getLocaleConfig() {
    return callBridge(this.page, (b) => b.getLocaleConfig());
  }

  async triggerSpin(): Promise<void> {
    await callBridge(this.page, (b) => { b.triggerSpin(); });
  }

  async setBetAmount(amount: number): Promise<void> {
    await callBridge(this.page, (b) => { b.setBetAmount(amount); });
  }

  /** Wait until game reaches a specific state (polls every 200ms) */
  async waitForState(targetState: GameState, timeoutMs = 15000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const current = await this.getGameState();
      if (current === targetState) return;
      await this.page.waitForTimeout(200);
    }
    throw new Error(`Timeout: Game did not reach state "${targetState}" within ${timeoutMs}ms`);
  }

  /** Perform a full spin cycle: trigger → wait spinning → wait idle/win */
  async performSpin(timeoutMs = 15000) {
    const balanceBefore = await this.getBalance();
    const betAmount = await this.getBetAmount();

    await this.triggerSpin();
    await this.waitForState('spinning', timeoutMs);
    await this.waitForState('idle', timeoutMs);

    const balanceAfter = await this.getBalance();
    const spinResult = await this.getLastSpinResult();

    return {
      balanceBefore,
      balanceAfter,
      betAmount,
      balanceChange: balanceAfter - balanceBefore,
      spinResult,
    };
  }

  /** Assert the bridge is available and log a clear message if not */
  async assertBridgeAvailable(): Promise<void> {
    const available = await this.page.evaluate(() => !!(globalThis as any).__test__);
    expect(available, 'window.__test__ must be available (run game with test bridge enabled)').toBe(true);
  }
}
