# Slot Game Automation Testing Framework

A Playwright + TypeScript test framework for a **Cocos-based slot game**, designed for both QA and Developers.

---

## Quick Start

```bash
# 1. Install dependencies
npm install
npx playwright install chromium

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set GAME_BASE_URL to your game's URL

# 3. Run smoke tests
npm run test:smoke

# 4. Run all tests
npm test
```

---

## Test Suites

| Command | What it runs |
|---|---|
| `npm run test:smoke` | Game Bridge smoke tests (balance, spin, state) |
| `npm run test:ws` | WebSocket message schema validation |
| `npm run test:matrix` | Currency × locale matrix (all combos) |
| `npm run test:ui` | Visual regression against baselines |
| `npm test` | All suites |

---

## Visual Regression — Baselines

Baselines are golden PNG screenshots. To set them up:

```bash
# Option A: Copy Figma-exported PNGs directly
cp /path/to/figma-exports/*.png baselines/

# Option B: Capture from the running game
npm run baseline
```

Then run `npm run test:ui` to compare.

---

## Game Bridge (`window.__test__`)

The Cocos dev team must expose this in non-production builds:

```ts
window.__test__ = {
  getBalance(): number,
  getBetAmount(): number,
  getGameState(): 'idle' | 'spinning' | 'win' | 'bonus' | 'freespin' | 'error',
  getLastSpinResult(): SpinResult | null,
  getLocaleConfig(): LocaleConfig,
  getCurrentSymbols(): string[][],
  triggerSpin(): void,
  setBetAmount(amount: number): void,
  onStateChange(cb: (state) => void): () => void,
  onSpinResult(cb: (result) => void): () => void,
}
```

See full spec in [`bridge/game-bridge.ts`](./bridge/game-bridge.ts).

---

## Adding Scenarios (Matrix Tests)

Edit [`tests/matrix/currency-locale.spec.ts`](./tests/matrix/currency-locale.spec.ts):

```ts
const scenarios = [
  { currency: 'USD', lang: 'en', currencySymbol: '$' },
  { currency: 'VND', lang: 'vi', currencySymbol: '₫' },
  // Add more here ↓
];
```

---

## Project Structure

```
slot-test-framework/
├── tests/
│   ├── smoke/             # Game bridge smoke tests
│   ├── websocket/         # WS schema validation
│   ├── matrix/            # Currency × locale matrix
│   └── ui/                # Visual regression
├── schemas/               # Zod WS message schemas
├── baselines/             # Golden PNG screenshots (from Figma)
├── bridge/                # window.__test__ TypeScript interface
├── reporters/             # Custom JSON reporter
├── utils/                 # ws-interceptor, screenshot, bridge-helper
├── report-dashboard/      # Standalone Vite + React reporting app
└── playwright.config.ts
```

---

## Report Dashboard

After running tests, a JSON file is written to `report-dashboard/data/`.  
Start the dashboard:

```bash
npm run dashboard
# Opens at http://localhost:5173
```
