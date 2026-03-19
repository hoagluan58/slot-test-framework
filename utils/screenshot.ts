import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export type DiffResult = {
  diffPixels: number;
  totalPixels: number;
  diffPercent: number;
  passed: boolean;
  diffImagePath?: string;
};

/**
 * Capture a screenshot of the current game state and save it
 */
export async function captureScreenshot(page: Page, name: string, outputDir: string): Promise<string> {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

/**
 * Compare a captured screenshot against a baseline PNG
 * Returns diff stats and optionally writes a diff image
 */
export function compareScreenshots(
  baselinePath: string,
  actualPath: string,
  diffOutputPath?: string,
  thresholdPercent = 0.1
): DiffResult {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(fs.readFileSync(actualPath));

  const { width, height } = baseline;
  const diffPng = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baseline.data, actual.data, diffPng.data,
    width, height,
    { threshold: 0.1 }
  );

  const totalPixels = width * height;
  const diffPercent = (diffPixels / totalPixels) * 100;

  if (diffOutputPath) {
    fs.mkdirSync(path.dirname(diffOutputPath), { recursive: true });
    fs.writeFileSync(diffOutputPath, PNG.sync.write(diffPng));
  }

  return {
    diffPixels,
    totalPixels,
    diffPercent,
    passed: diffPercent <= thresholdPercent,
    diffImagePath: diffOutputPath,
  };
}

/**
 * Capture a baseline screenshot (run this once to establish ground truth)
 */
export async function captureBaseline(page: Page, name: string, baselinesDir: string): Promise<string> {
  fs.mkdirSync(baselinesDir, { recursive: true });
  const filePath = path.join(baselinesDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`✅ Baseline captured: ${filePath}`);
  return filePath;
}
