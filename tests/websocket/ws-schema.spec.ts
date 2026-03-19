import { test, expect } from '@playwright/test';
import { WsInterceptor } from '../../utils/ws-interceptor';
import { SpinResponseSchema, BalanceUpdateSchema, SessionInitSchema } from '../../schemas/ws-messages';
import { GameBridgeHelper } from '../../utils/bridge-helper';

const BASE_URL = process.env.GAME_BASE_URL ?? 'http://localhost:8080';

test.describe('WebSocket — Schema Validation', () => {
  let ws: WsInterceptor;
  let bridge: GameBridgeHelper;

  test.beforeEach(async ({ page }) => {
    ws = new WsInterceptor(page);
    ws.attach();
    bridge = new GameBridgeHelper(page);
    await page.goto(BASE_URL);
  });

  test('SESSION_INIT message validates against schema', async () => {
    const frame = await ws.waitForMessageType('SESSION_INIT', 15000);
    const raw = JSON.parse(frame.payload);
    const result = SessionInitSchema.safeParse(raw);

    expect(result.success, `SESSION_INIT schema error: ${!result.success ? result.error.message : ''}`).toBe(true);

    if (result.success) {
      expect(result.data.initialBalance).toBeGreaterThan(0);
      expect(result.data.availableBets.length).toBeGreaterThan(0);
      console.log(`✅ Session: balance=${result.data.initialBalance}, currency=${result.data.currency}`);
    }
  });

  test('SPIN_RESPONSE message validates against schema', async () => {
    await bridge.assertBridgeAvailable();
    await bridge.triggerSpin();

    const frame = await ws.waitForMessageType('SPIN_RESPONSE', 15000);
    const raw = JSON.parse(frame.payload);
    const result = SpinResponseSchema.safeParse(raw);

    expect(result.success, `SPIN_RESPONSE schema error: ${!result.success ? result.error.message : ''}`).toBe(true);

    if (result.success) {
      expect(result.data.result.newBalance).toBeGreaterThanOrEqual(0);
      expect(result.data.result.winAmount).toBeGreaterThanOrEqual(0);
      expect(typeof result.data.result.isWin).toBe('boolean');
    }
  });

  test('BALANCE_UPDATE message validates against schema', async () => {
    await bridge.assertBridgeAvailable();
    await bridge.triggerSpin();

    // Balance update should follow each spin
    const frame = await ws.waitForMessageType('BALANCE_UPDATE', 15000);
    const raw = JSON.parse(frame.payload);
    const result = BalanceUpdateSchema.safeParse(raw);

    expect(result.success, `BALANCE_UPDATE schema error: ${!result.success ? result.error.message : ''}`).toBe(true);

    if (result.success) {
      expect(result.data.balance).toBeGreaterThanOrEqual(0);
      expect(result.data.currency).toBeTruthy();
    }
  });

  test('Balance in SPIN_RESPONSE matches BALANCE_UPDATE', async () => {
    await bridge.assertBridgeAvailable();
    await bridge.triggerSpin();

    const spinFrame = await ws.waitForMessageType('SPIN_RESPONSE', 15000);
    const balanceFrame = await ws.waitForMessageType('BALANCE_UPDATE', 15000);

    const spinData = SpinResponseSchema.parse(JSON.parse(spinFrame.payload));
    const balanceData = BalanceUpdateSchema.parse(JSON.parse(balanceFrame.payload));

    expect(spinData.result.newBalance).toBe(balanceData.balance);
  });

  test('No unknown or malformed WS messages received', async () => {
    await bridge.assertBridgeAvailable();
    await bridge.performSpin();

    const summary = ws.getSummary();
    console.log('WS Summary:', summary);
    expect(summary.validationErrors, `${summary.validationErrors} WS messages failed schema validation`).toBe(0);
  });
});
