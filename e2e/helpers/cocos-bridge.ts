/**
 * CocosTestBridge
 *
 * A Playwright-side helper that talks to the Cocos Creator engine
 * running inside the game's browser context via `window.cc`.
 *
 * Cocos side (see cocos-scripts/test/TestRegistry.ts):
 *   TestRegistry.register('landing', { getStartedBtn: this.btn });
 *
 * Playwright side:
 *   const bridge = new CocosTestBridge(page);
 *   await bridge.waitForGameLoaded(url);
 *   const label = await bridge.getNodeLabel('landing.getStartedBtn');
 */

import { type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Types mirrored from the Cocos CC runtime (serialisable subset)
// ---------------------------------------------------------------------------

export interface NodeInfo {
  name: string;
  active: boolean;
  childCount: number;
  components: string[];
}

export interface LabelInfo {
  nodePath: string;
  text: string;
  active: boolean;
}

export interface SpriteInfo {
  nodePath: string;
  spriteName: string | null;  // null when no sprite frame loaded
  active: boolean;
}

// ---------------------------------------------------------------------------
// Bridge
// ---------------------------------------------------------------------------

export class CocosTestBridge {
  constructor(private readonly page: Page) {}

  /** Return the current active scene name. */
  async getSceneName(): Promise<string | null> {
    return this.page.evaluate(() => {
      const cc = (window as any).cc;
      return cc?.director?.getScene()?.name ?? null;
    });
  }

  /**
   * Walk the node tree and return flat info about all nodes up to `maxDepth`.
   * Useful for discovering what nodes exist after load.
   */
  async getSceneTree(maxDepth = 4): Promise<NodeInfo[]> {
    return this.page.evaluate((depth) => {
      const cc = (window as any).cc;
      const scene = cc?.director?.getScene();
      if (!scene) return [];

      const result: { name: string; active: boolean; childCount: number; components: string[] }[] = [];

      function walk(node: any, d: number) {
        if (d > depth) return;
        result.push({
          name: node.name,
          active: node.active ?? node.activeInHierarchy ?? true,
          childCount: node.children?.length ?? 0,
          components: (node.components ?? []).map(
            (c: any) => c.constructor?.name ?? c.__classname__ ?? 'Unknown'
          ),
        });
        (node.children ?? []).forEach((child: any) => walk(child, d + 1));
      }

      walk(scene, 0);
      return result;
    }, maxDepth);
  }

  // ─── Exposed-node helpers (TestRegistry / test=1 mode) ───────────────────

  /**
   * Read a label's string value from an exposed Cocos node.
   *
   * Checks `window.__testNodes` (populated by TestRegistry.register) first,
   * then falls back to a scene tree walk by path segments.
   *
   * @param key  Namespaced key from TestRegistry (e.g. 'landing.getStartedBtn')
   *             OR a slash-path for the scene walker (e.g. 'LandingScreen/Btn')
   */
  async getNodeLabel(key: string): Promise<string | null> {
    return this.page.evaluate((path) => {
      const cc = (window as any).cc;

      // Production-safe component getter: use the cc.Label class reference,
      // not the string 'Label' which breaks after minification.
      function getLabel(node: any): any {
        if (!node) return null;
        // Prefer class-reference lookup (works in both dev & prod builds)
        if (cc?.Label) return node.getComponent?.(cc.Label) ?? null;
        // Fallback: string lookup (dev/preview only)
        return node.getComponent?.('Label') ?? node.getComponent?.('cc.Label') ?? null;
      }

      // 1. Try the TestRegistry node map first (namespaced keys e.g. 'landing.btn')
      const exposed = (window as any).__testNodes ?? (window as any).testNodes;
      if (exposed && exposed[path]) {
        const lbl = getLabel(exposed[path]);
        return lbl?.string ?? lbl?.labelText ?? null;
      }

      // 2. Walk the scene by path segments (e.g. 'LandingScreen/GetStartedBtn')
      const segments = path.split('/');
      let current = cc?.director?.getScene();
      for (const seg of segments) {
        if (!current) return null;
        current = current.children?.find((c: any) => c.name === seg) ?? null;
      }
      if (!current) return null;

      const lbl = getLabel(current);
      return lbl?.string ?? lbl?.labelText ?? null;
    }, key);
  }

  /**
   * Access a raw node from `window.__testNodes` and run an evaluator against it.
   *
   * Useful for reading custom component properties or calling Cocos APIs directly.
   *
   * @param key      Namespaced key e.g. 'game.betSelector'
   * @param evaluate Function string that receives (node, cc) and returns a value
   *
   * @example
   *   const active = await bridge.getNode('game.spinBtn', (node, cc) =>
   *     node.getComponent(cc.Button)?.interactable ?? false
   *   );
   */
  async getNode<T = any>(
    key: string,
    evaluate?: (node: any, cc: any) => T
  ): Promise<T | null> {
    if (!evaluate) {
      // Simple existence check — returns node name or null
      return this.page.evaluate((k) => {
        const node = (window as any).__testNodes?.[k] ?? null;
        return node ? node.name : null;
      }, key) as Promise<T | null>;
    }

    return this.page.evaluate(
      ([k, fnSrc]) => {
        const cc = (window as any).cc;
        const node = (window as any).__testNodes?.[k] ?? null;
        if (!node) return null;
        // eslint-disable-next-line no-new-func
        const fn = new Function('node', 'cc', `return (${fnSrc})(node, cc)`);
        return fn(node, cc);
      },
      [key, evaluate.toString()] as [string, string]
    );
  }

  /**
   * Return all Label nodes reachable from the scene (up to maxDepth),
   * including their text values.
   */
  async getAllLabels(maxDepth = 6): Promise<LabelInfo[]> {
    return this.page.evaluate((depth) => {
      const cc = (window as any).cc;
      const scene = cc?.director?.getScene();
      if (!scene) return [];

      // Production-safe: prefer cc.Label class reference over string lookup.
      const LabelClass = cc?.Label ?? null;

      const results: { nodePath: string; text: string; active: boolean }[] = [];

      function walk(node: any, pathSoFar: string, d: number) {
        if (d > depth) return;
        const currentPath = pathSoFar ? `${pathSoFar}/${node.name}` : node.name;

        let lbl: any = null;
        if (LabelClass) {
          lbl = node.getComponent?.(LabelClass) ?? null;
        }
        if (!lbl) {
          lbl = node.getComponent?.('Label') ?? node.getComponent?.('cc.Label') ?? null;
        }
        if (!lbl) {
          lbl = (node.components ?? []).find((c: any) =>
            c.__classname__ === 'cc.Label' || c.__classname__ === 'Label'
          ) ?? null;
        }

        if (lbl) {
          results.push({
            nodePath: currentPath,
            text: lbl.string ?? lbl.labelText ?? '',
            active: node.activeInHierarchy ?? node.active ?? true,
          });
        }

        (node.children ?? []).forEach((child: any) => walk(child, currentPath, d + 1));
      }

      walk(scene, '', 0);
      return results;
    }, maxDepth);
  }

  /**
   * Return all Sprite nodes reachable from the scene (up to maxDepth).
   * Includes the sprite frame name so you can verify localized art assets.
   */
  async getAllSprites(maxDepth = 6): Promise<SpriteInfo[]> {
    return this.page.evaluate((depth) => {
      const cc = (window as any).cc;
      const scene = cc?.director?.getScene();
      if (!scene) return [];

      const SpriteClass = cc?.Sprite ?? null;

      const results: { nodePath: string; spriteName: string | null; active: boolean }[] = [];

      function walk(node: any, pathSoFar: string, d: number) {
        if (d > depth) return;
        const currentPath = pathSoFar ? `${pathSoFar}/${node.name}` : node.name;

        let spr: any = null;
        if (SpriteClass) {
          spr = node.getComponent?.(SpriteClass) ?? null;
        }
        if (!spr) {
          spr = node.getComponent?.('Sprite') ?? node.getComponent?.('cc.Sprite') ?? null;
        }
        if (!spr) {
          spr = (node.components ?? []).find((c: any) =>
            c.__classname__ === 'cc.Sprite' || c.__classname__ === 'Sprite'
          ) ?? null;
        }

        if (spr) {
          const frameName: string | null =
            spr.spriteFrame?.name ??
            spr.spriteFrame?._name ??
            spr._spriteFrame?.name ??
            null;

          results.push({
            nodePath: currentPath,
            spriteName: frameName,
            active: node.activeInHierarchy ?? node.active ?? true,
          });
        }

        (node.children ?? []).forEach((child: any) => walk(child, currentPath, d + 1));
      }

      walk(scene, '', 0);
      return results;
    }, maxDepth);
  }

  // ─── Button helpers ───────────────────────────────────────────────────────

  /**
   * Programmatically click a Cocos Button component by finding the first
   * node whose name matches `nodeName`.
   * Falls back to a canvas coordinate click if the node cannot be found.
   */
  async clickNodeByName(nodeName: string): Promise<boolean> {
    return this.page.evaluate((name) => {
      const cc = (window as any).cc;
      const scene = cc?.director?.getScene();
      if (!scene) return false;

      function find(node: any): any {
        if (node.name === name) return node;
        for (const child of node.children ?? []) {
          const found = find(child);
          if (found) return found;
        }
        return null;
      }

      const target = find(scene);
      if (!target) return false;

      const ButtonClass = cc?.Button ?? null;
      let btn: any = null;
      if (ButtonClass) {
        btn = target.getComponent?.(ButtonClass) ?? null;
      }
      if (!btn) {
        btn = target.getComponent?.('Button') ?? target.getComponent?.('cc.Button') ?? null;
      }
      if (!btn) {
        btn = (target.components ?? []).find((c: any) =>
          c.__classname__ === 'cc.Button' || c.__classname__ === 'Button'
        ) ?? null;
      }

      if (btn?.node) {
        btn.node.emit('click', btn);
        return true;
      }

      target.emit?.('touchend');
      return true;
    }, nodeName);
  }

  /**
   * Programmatically click a Cocos Button using its TestRegistry key.
   * Prefer this over clickNodeByName when using the TestRegistry pattern.
   *
   * @param key  Namespaced key e.g. 'landing.getStartedBtn'
   */
  async clickNode(key: string): Promise<boolean> {
    return this.page.evaluate((k) => {
      const cc = (window as any).cc;
      const target = (window as any).__testNodes?.[k] ?? null;
      if (!target) return false;

      const ButtonClass = cc?.Button ?? null;
      let btn: any = ButtonClass ? target.getComponent?.(ButtonClass) : null;
      if (!btn) btn = target.getComponent?.('Button') ?? null;
      if (!btn) {
        btn = (target.components ?? []).find((c: any) =>
          c.__classname__ === 'cc.Button' || c.__classname__ === 'Button'
        ) ?? null;
      }

      if (btn?.node) {
        btn.node.emit('click', btn);
        return true;
      }

      target.emit?.('touchend');
      return true;
    }, key);
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  /** Inject a helper that flags when the game has fired its 'game-loaded' event. */
  async injectLoadedEventListener(): Promise<void> {
    await this.page.addInitScript(() => {
      (window as any).__gameLoaded = false;
      window.addEventListener('game-loaded', () => {
        (window as any).__gameLoaded = true;
      });
    });
  }

  /** Return raw info about any window properties the game exposes for testing. */
  async getExposedTestNodes(): Promise<Record<string, string[]>> {
    return this.page.evaluate(() => {
      const exposed =
        (window as any).__testNodes ??
        (window as any).testNodes ??
        (window as any).__exposedNodes ??
        null;

      if (!exposed) return {};

      const result: Record<string, string[]> = {};
      for (const key of Object.keys(exposed)) {
        const node = exposed[key];
        result[key] = (node.components ?? []).map(
          (c: any) => c.constructor?.name ?? c.__classname__ ?? 'Unknown'
        );
      }
      return result;
    });
  }
}
