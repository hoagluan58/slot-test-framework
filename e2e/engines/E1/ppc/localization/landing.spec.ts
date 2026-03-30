// e2e/engines/E1/ppc/localization/landing.spec.ts
//
// Re-generate baselines:
//   npx playwright test e2e/engines/E1/ppc/localization/landing.spec.ts --project=ppc --update-snapshots

import { test, expect } from '../../../../fixtures/game';
import { gameRegistry, findGame } from '../../../../../config';
import { goToLanding } from '../../../../helpers/screen-nav';

const _gameId = process.env.GAME_ID;
const _langs = _gameId
  ? findGame(gameRegistry, _gameId).supportedLangs
  : gameRegistry[0].supportedLangs;

test.describe('Landing screen — screenshot per language', () => {

  for (const lang of _langs) {
    test(`landing renders correctly in [${lang}]`, async ({ page, gameCfg, bridge }, testInfo) => {

      await goToLanding({ bridge, page, baseUrl: gameCfg.baseUrl, lang });

      const bytes = await page.screenshot({ fullPage: false });
      await testInfo.attach(`landing-${lang}`, { body: bytes, contentType: 'image/png' });

      await expect(page).toHaveScreenshot(`landing-${lang}.png`, {
        maxDiffPixelRatio: 0.02,
        threshold: 0.3,
      });
    });
  }
});
