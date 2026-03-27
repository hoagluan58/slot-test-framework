import * as fs from 'fs';
import * as path from 'path';

/** Single entry in the data/localize/<lang>/text.json file */
interface L10nEntry { k: string; v: string; }

/**
 * Load the localization map for a given language.
 * Returns a Map<key, value> for fast lookups.
 *
 * @param lang   Language code, e.g. 'en' or 'th'
 * @param dir    Localize data directory (default: data/localize)
 */
export function loadL10n(lang: string, dir = 'data/localize'): Map<string, string> {
  const filePath = path.resolve(dir, lang, 'text.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const entries: L10nEntry[] = JSON.parse(raw);
  return new Map(entries.map(e => [e.k, e.v]));
}

/**
 * Look up the expected text for a localization key.
 * Throws with a clear message if the key is not found.
 */
export function getExpectedText(map: Map<string, string>, l10nKey: string): string {
  const value = map.get(l10nKey);
  if (value === undefined) {
    throw new Error(`Localization key "${l10nKey}" not found in text.json`);
  }
  return value;
}
