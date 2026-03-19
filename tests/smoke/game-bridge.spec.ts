import { test, expect } from '@playwright/test';
import { GameBridgeHelper } from '../../utils/bridge-helper';
import { WsInterceptor } from '../../utils/ws-interceptor';

const BASE_URL = process.env.GAME_BASE_URL ?? 'http://localhost:8080';

test.describe('Smoke Tests — Game Bridge', () => {
  let bridge: GameBridgeHelper;
  let ws: WsInterceptor;

  test.beforeEach(async ({ page }) => {
    ws = new WsInterceptor(page);
    ws.attach();
    bridge = new GameBridgeHelper(page);
    await page.goto(BASE_URL);
    // Wait for session init message indicating the game connected to server
    await ws.waitForMessageType('SESSION_INIT', 15000).catch(() => {
      console.warn('Warning: SESSION_INIT not received — server may not be running');
    });
  });

  test('1. Game bridge is available', async () => {
    await bridge.assertBridgeAvailable();
  });

  test('2. Initial balance is a positive number', async () => {
    await bridge.assertBridgeAvailable();
    const balance = await bridge.getBalance();
    expect(balance, 'Balance should be a positive number').toBeGreaterThan(0);
    console.log(`💰 Initial balance: ${balance}`);
  });

  test('3. Bet amount is set and within valid range', async () => {
    await bridge.assertBridgeAvailable();
    const betAmount = await bridge.getBetAmount();
    expect(betAmount, 'Bet amount should be positive').toBeGreaterThan(0);
    const balance = await bridge.getBalance();
    expect(betAmount, 'Bet amount should not exceed balance').toBeLessThanOrEqual(balance);
    console.log(`🎰 Bet amount: ${betAmount}`);
  });

  test('4. Game starts in idle state', async () => {
    await bridge.assertBridgeAvailable();
    const state = await bridge.getGameState();
    expect(state, 'Game should start in idle state').toBe('idle');
  });

  test('5. Spin cycle completes and returns to idle', async () => {
    await bridge.assertBridgeAvailable();
    const { balanceBefore, balanceAfter, betAmount, spinResult } = await bridge.performSpin();

    console.log(`🎲 Spin complete | Before: ${balanceBefore} | After: ${balanceAfter} | Bet: ${betAmount}`);
    console.log(`📋 Spin result:`, JSON.stringify(spinResult, null, 2));

    // Balance should decrease by bet amount, or increase if win
    if (spinResult?.isWin) {
      expect(balanceAfter).toBeGreaterThan(balanceBefore - betAmount);
    } else {
      expect(balanceAfter).toBe(balanceBefore - betAmount);
    }

    const stateAfter = await bridge.getGameState();
    expect(stateAfter).toBe('idle');
  });

  test('6. Spin result has correct symbol grid structure', async () => {
    await bridge.assertBridgeAvailable();
    await bridge.performSpin();
    const spinResult = await bridge.getLastSpinResult();

    expect(spinResult).not.toBeNull();
    expect(Array.isArray(spinResult?.symbols)).toBe(true);
    // Each row should be a non-empty array of strings
    spinResult?.symbols.forEach((row: string[]) => {
      expect(Array.isArray(row)).toBe(true);
      row.forEach((symbol: string) => expect(typeof symbol).toBe('string'));
    });
  });

  test('7. No WebSocket schema validation errors during smoke test', async ({ page: _ }) => {
    await bridge.assertBridgeAvailable();
    await bridge.performSpin();
    const hasErrors = ws.hasValidationErrors();
    if (hasErrors) {
      console.error('WS Validation errors:', ws.errors);
    }
    expect(hasErrors, 'All WS messages should match their schemas').toBe(false);
  });
});
