/**
 * Localization Data Tests
 * 
 * Pure data validation against text.json files — no browser needed.
 * Tests key parity, empty values, untranslated text, and placeholder consistency.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { games } from '../config/games';

interface LocaleEntry {
  k: string;
  v: string;
}

/**
 * Load text.json for a given language.
 */
function loadLocaleData(localizeDataPath: string, lang: string): LocaleEntry[] {
  const filePath = path.resolve(localizeDataPath, lang, 'text.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Convert locale entries array to a Map for quick lookup.
 */
function toKeyMap(entries: LocaleEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    map.set(entry.k, entry.v);
  }
  return map;
}

/**
 * Extract placeholders like {0}, {1} from a string.
 */
function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{(\d+)\}/g);
  return matches ? matches.sort() : [];
}

// Keys that are expected to be the same across languages (codes, proper nouns, etc.)
const SKIP_TRANSLATION_CHECK_PATTERNS = [
  /^COMMON_ERROR_\d+$/,   // Error codes may be similar
  /^X$/,                   // Single letter
  /^TITLE$/,              // Game title may stay the same
];

for (const game of games) {
  const baseLang = game.supportedLangs[0]; // 'en' is the source of truth
  const otherLangs = game.supportedLangs.slice(1);

  test.describe(`[${game.name}] Localization Data`, () => {
    let baseEntries: LocaleEntry[];
    let baseMap: Map<string, string>;

    test.beforeAll(() => {
      baseEntries = loadLocaleData(game.localizeDataPath, baseLang);
      baseMap = toKeyMap(baseEntries);
    });

    // ─── Key parity tests ───
    for (const lang of otherLangs) {
      test.describe(`Key Parity: ${baseLang} ↔ ${lang}`, () => {
        let targetEntries: LocaleEntry[];
        let targetMap: Map<string, string>;

        test.beforeAll(() => {
          targetEntries = loadLocaleData(game.localizeDataPath, lang);
          targetMap = toKeyMap(targetEntries);
        });

        test(`all ${baseLang} keys exist in ${lang}`, () => {
          const missingKeys: string[] = [];
          for (const key of baseMap.keys()) {
            if (!targetMap.has(key)) {
              missingKeys.push(key);
            }
          }
          expect(missingKeys, `Keys missing in ${lang}: ${missingKeys.join(', ')}`).toHaveLength(0);
        });

        test(`all ${lang} keys exist in ${baseLang}`, () => {
          const extraKeys: string[] = [];
          for (const key of targetMap.keys()) {
            if (!baseMap.has(key)) {
              extraKeys.push(key);
            }
          }
          expect(extraKeys, `Extra keys in ${lang} not in ${baseLang}: ${extraKeys.join(', ')}`).toHaveLength(0);
        });
      });
    }

    // ─── No empty values ───
    for (const lang of game.supportedLangs) {
      test(`no empty values in ${lang}`, () => {
        const entries = loadLocaleData(game.localizeDataPath, lang);
        const emptyKeys = entries.filter(e => !e.v || e.v.trim() === '').map(e => e.k);
        expect(emptyKeys, `Empty values found for keys: ${emptyKeys.join(', ')}`).toHaveLength(0);
      });
    }

    // ─── No untranslated text ───
    for (const lang of otherLangs) {
      test(`no untranslated text in ${lang}`, () => {
        const targetEntries = loadLocaleData(game.localizeDataPath, lang);
        const targetMap = toKeyMap(targetEntries);

        const untranslated: string[] = [];
        for (const [key, baseValue] of baseMap.entries()) {
          const targetValue = targetMap.get(key);
          if (!targetValue) continue;

          // Skip keys that are expected to be the same
          if (SKIP_TRANSLATION_CHECK_PATTERNS.some(p => p.test(key))) continue;

          // If the target value is identical to the base, it's likely untranslated
          if (baseValue === targetValue && baseValue.length > 3) {
            untranslated.push(key);
          }
        }

        expect(
          untranslated,
          `Potentially untranslated keys in ${lang} (${untranslated.length}): ${untranslated.slice(0, 10).join(', ')}${untranslated.length > 10 ? '...' : ''}`
        ).toHaveLength(0);
      });
    }

    // ─── Placeholder consistency ───
    for (const lang of otherLangs) {
      test(`placeholder consistency: ${baseLang} ↔ ${lang}`, () => {
        const targetEntries = loadLocaleData(game.localizeDataPath, lang);
        const targetMap = toKeyMap(targetEntries);

        const mismatches: string[] = [];
        for (const [key, baseValue] of baseMap.entries()) {
          const targetValue = targetMap.get(key);
          if (!targetValue) continue;

          const basePlaceholders = extractPlaceholders(baseValue);
          const targetPlaceholders = extractPlaceholders(targetValue);

          if (JSON.stringify(basePlaceholders) !== JSON.stringify(targetPlaceholders)) {
            mismatches.push(
              `${key}: ${baseLang}=${basePlaceholders.join(',')} vs ${lang}=${targetPlaceholders.join(',')}`
            );
          }
        }

        expect(
          mismatches,
          `Placeholder mismatches:\n${mismatches.join('\n')}`
        ).toHaveLength(0);
      });
    }

    // ─── Duplicate keys ───
    for (const lang of game.supportedLangs) {
      test(`no duplicate keys in ${lang}`, () => {
        const entries = loadLocaleData(game.localizeDataPath, lang);
        const keys = entries.map(e => e.k);
        const seen = new Set<string>();
        const duplicates: string[] = [];

        for (const key of keys) {
          if (seen.has(key)) {
            duplicates.push(key);
          }
          seen.add(key);
        }

        expect(
          duplicates,
          `Duplicate keys found in ${lang}: ${duplicates.join(', ')}`
        ).toHaveLength(0);
      });
    }
  });
}
