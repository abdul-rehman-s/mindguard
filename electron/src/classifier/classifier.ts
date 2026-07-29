// MindGuard Desktop — Productivity Classification Engine
// Classifies activities as productive/neutral/distracting using rules database

import type { ActivityType, ActivityCategory, ProductivityLevel, ClassificationResult } from '../types';
import { URL_RULES, APP_RULES, KEYWORD_RULES, BROWSER_APPS, DEFAULT_CLASSIFICATION, ClassificationRule } from './rules';

interface RawActivity {
  appName: string;
  windowTitle: string;
  hostname: string | null;
  url: string | null;
}

export class ActivityClassifier {
  private customOverrides: Map<string, ClassificationResult> = new Map();

  setCustomOverride(appNameOrHost: string, result: ClassificationResult): void {
    this.customOverrides.set(appNameOrHost.toLowerCase(), result);
  }

  removeCustomOverride(appNameOrHost: string): void {
    this.customOverrides.delete(appNameOrHost.toLowerCase());
  }

  classify(activity: RawActivity): ClassificationResult {
    // 1. Check custom overrides first (highest priority)
    const customApp = this.customOverrides.get(activity.appName.toLowerCase());
    if (customApp) return customApp;

    if (activity.hostname) {
      const customHost = this.customOverrides.get(activity.hostname.toLowerCase());
      if (customHost) return customHost;
    }

    // 2. If browser, check URL rules first
    if (this.isBrowser(activity.appName) && activity.hostname) {
      const urlResult = this.matchRules(URL_RULES, activity.hostname);
      if (urlResult) return { ...urlResult, source: 'url' };
    }

    // 3. Check app name rules
    const appResult = this.matchRules(APP_RULES, activity.appName);
    if (appResult) {
      // If it's a browser without a URL match, default to browsing
      if (this.isBrowser(activity.appName)) {
        return {
          type: 'browsing',
          category: 'other',
          productivityLevel: 'neutral',
          confidence: 0.5,
          source: 'app',
        };
      }
      return { ...appResult, source: 'app' };
    }

    // 4. Check title keyword rules
    if (activity.windowTitle) {
      const keywordResult = this.matchKeywordRules(activity.windowTitle);
      if (keywordResult) {
        // If browser, override type to browsing/website_usage
        if (this.isBrowser(activity.appName)) {
          return {
            type: keywordResult.productivity === 'distracting' ? 'browsing' : 'website_usage',
            category: keywordResult.category,
            productivityLevel: keywordResult.productivity,
            confidence: 0.4,
            source: 'keyword',
          };
        }
        return { ...keywordResult, productivityLevel: keywordResult.productivity, confidence: 0.4, source: 'keyword' };
      }
    }

    // 5. Browser default = browsing
    if (this.isBrowser(activity.appName)) {
      return {
        type: 'browsing',
        category: 'other',
        productivityLevel: 'neutral',
        confidence: 0.3,
        source: 'default',
      };
    }

    // 6. Default fallback
    return {
      type: DEFAULT_CLASSIFICATION.type,
      category: DEFAULT_CLASSIFICATION.category,
      productivityLevel: DEFAULT_CLASSIFICATION.productivity,
      confidence: DEFAULT_CLASSIFICATION.confidence,
      source: 'default',
    };
  }

  isBrowser(appName: string): boolean {
    return BROWSER_APPS.some(b => appName.toLowerCase().includes(b.toLowerCase()));
  }

  private matchRules(rules: ClassificationRule[], input: string): ClassificationResult | null {
    // Sort by priority descending, try highest priority first
    const sorted = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sorted) {
      if (typeof rule.match === 'string') {
        if (input.toLowerCase().includes(rule.match.toLowerCase())) {
          return {
            type: rule.type,
            category: rule.category,
            productivityLevel: rule.productivity,
            confidence: rule.priority / 10,
            source: rule.priority >= 9 ? 'exact' : 'partial',
          };
        }
      } else {
        // RegExp match
        if (rule.match.test(input)) {
          return {
            type: rule.type,
            category: rule.category,
            productivityLevel: rule.productivity,
            confidence: Math.min(rule.priority / 10, 0.7),
            source: 'keyword',
          };
        }
      }
    }
    return null;
  }

  private matchKeywordRules(title: string): { type: ActivityType; category: ActivityCategory; productivity: ProductivityLevel } | null {
    for (const rule of KEYWORD_RULES) {
      if (typeof rule.match === 'string') {
        if (title.toLowerCase().includes(rule.match.toLowerCase())) {
          return { type: rule.type, category: rule.category, productivity: rule.productivity };
        }
      } else {
        if (rule.match.test(title)) {
          return { type: rule.type, category: rule.category, productivity: rule.productivity };
        }
      }
    }
    return null;
  }
}
