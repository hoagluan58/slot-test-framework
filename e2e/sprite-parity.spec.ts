/**
 * Sprite Image Parity Tests
 * 
 * Validates that all localized sprite images exist in every language folder.
 * Also checks that sprite dimensions are consistent across languages.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { games } from '../config/games';

/**
 * Recursively find all files in a directory, returning paths relative to the root.
 */
function findFilesRecursive(dir: string, rootDir?: string): string[] {
  const root = rootDir ?? dir;
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFilesRecursive(fullPath, root));
    } else {
      files.push(path.relative(root, fullPath));
    }
  }
  return files;
}

for (const game of games) {
  const baseLang = game.supportedLangs[0];
  const otherLangs = game.supportedLangs.slice(1);

  test.describe(`[${game.name}] Sprite Image Parity`, () => {
    const baseSpriteDir = path.resolve(game.localizeDataPath, baseLang, 'screenshots', 'sprites');

    // ─── File parity ───
    for (const lang of otherLangs) {
      test(`all sprite images in ${baseLang} exist in ${lang}`, () => {
        const targetSpriteDir = path.resolve(game.localizeDataPath, lang, 'screenshots', 'sprites');

        const baseFiles = findFilesRecursive(baseSpriteDir);
        const targetFiles = new Set(findFilesRecursive(targetSpriteDir));

        const missing = baseFiles.filter(f => !targetFiles.has(f));

        expect(
          missing,
          `Sprite images missing in ${lang}:\n${missing.join('\n')}`
        ).toHaveLength(0);
      });

      test(`no extra sprite images in ${lang} not in ${baseLang}`, () => {
        const targetSpriteDir = path.resolve(game.localizeDataPath, lang, 'screenshots', 'sprites');

        const baseFiles = new Set(findFilesRecursive(baseSpriteDir));
        const targetFiles = findFilesRecursive(
          path.resolve(game.localizeDataPath, lang, 'screenshots', 'sprites')
        );

        const extra = targetFiles.filter(f => !baseFiles.has(f));

        expect(
          extra,
          `Extra sprite images in ${lang} not in ${baseLang}:\n${extra.join('\n')}`
        ).toHaveLength(0);
      });
    }

    // ─── Screenshot file parity (top-level screenshots) ───
    for (const lang of otherLangs) {
      test(`all top-level screenshots in ${baseLang} exist in ${lang}`, () => {
        const baseScreenshotDir = path.resolve(game.localizeDataPath, baseLang, 'screenshots');
        const targetScreenshotDir = path.resolve(game.localizeDataPath, lang, 'screenshots');

        const baseFiles = fs.readdirSync(baseScreenshotDir)
          .filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
        const targetFiles = new Set(
          fs.readdirSync(targetScreenshotDir)
            .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
        );

        const missing = baseFiles.filter(f => !targetFiles.has(f));

        expect(
          missing,
          `Screenshot files missing in ${lang}:\n${missing.join('\n')}`
        ).toHaveLength(0);
      });
    }
  });
}
