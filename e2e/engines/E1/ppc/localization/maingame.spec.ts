// e2e/engines/E1/ppc/localization/maingame.spec.ts
//
// Re-generate baselines:
//   npx playwright test e2e/engines/E1/ppc/localization/maingame.spec.ts --project=ppc --update-snapshots

import { test, expect } from '../../../../fixtures/game';
import { gameRegistry, findGame } from '../../../../../config';
import { goToMainGame } from '../../../../helpers/screen-nav';

const _gameId = process.env.GAME_ID;
const _langs = _gameId
  ? findGame(gameRegistry, _gameId).supportedLangs
  : gameRegistry[0].supportedLangs;

test.describe('Main game — screenshot per language', () => {

  for (const lang of _langs) {
    test(`maingame renders correctly in [${lang}]`, async ({ page, gameCfg, bridge }, testInfo) => {

      await goToMainGame({ bridge, page, baseUrl: gameCfg.baseUrl, lang });

      const bytes = await page.screenshot({ fullPage: false });
      await testInfo.attach(`maingame-${lang}`, { body: bytes, contentType: 'image/png' });

      await expect(page).toHaveScreenshot(`maingame-${lang}.png`, {
        maxDiffPixelRatio: 0.02,
        threshold: 0.3,
      });
    });
  }
});
