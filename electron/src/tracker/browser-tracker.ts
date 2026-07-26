// MindGuard Desktop — Browser URL Tracking
// Extracts hostname/domain from browser window titles (never captures passwords/form data)

import type { BrowserInfo } from '../types';
import { BROWSER_APPS } from '../classifier/rules';
import { logger } from '../logger/logger';

export class BrowserTracker {
  // Known browser title patterns
  // Chrome: "Title - Google Chrome"
  // Firefox: "Title — Mozilla Firefox"
  // Edge: "Title - Microsoft Edge"
  // Safari: "Title - Safari"
  // Brave: "Title - Brave"
  // Opera: "Title - Opera"

  private browserSuffixPatterns: Map<string, RegExp> = new Map([
    ['Google Chrome', /(.+?)\s+-\s+Google Chrome$/i],
    ['Chrome', /(.+?)\s+-\s+Chrome$/i],
    ['Chromium', /(.+?)\s+-\s+Chromium$/i],
    ['Mozilla Firefox', /(.+?)\s+[-—]\s+Mozilla Firefox$/i],
    ['Firefox', /(.+?)\s+[-—]\s+Firefox$/i],
    ['Microsoft Edge', /(.+?)\s+-\s+Microsoft Edge$/i],
    ['Edge', /(.+?)\s+-\s+Edge$/i],
    ['Safari', /(.+?)\s+-\s+Safari$/i],
    ['Brave', /(.+?)\s+-\s+Brave$/i],
    ['Brave Browser', /(.+?)\s+-\s+Brave$/i],
    ['Opera', /(.+?)\s+-\s+Opera$/i],
    ['Opera GX', /(.+?)\s+-\s+Opera GX$/i],
    ['Vivaldi', /(.+?)\s+-\s+Vivaldi$/i],
    ['Arc', /(.+?)\s+-\s+Arc$/i],
  ]);

  // Website patterns extracted from titles
  // "YouTube" → youtube.com
  // "GitHub - User/Repo" → github.com
  // "Stack Overflow - Question" → stackoverflow.com
  private titleToHostPatterns: Map<string, string> = new Map([
    ['YouTube', 'youtube.com'],
    ['GitHub', 'github.com'],
    ['Stack Overflow', 'stackoverflow.com'],
    ['Stack Overflow', 'stackoverflow.com'],
    ['Reddit', 'reddit.com'],
    ['Twitter', 'twitter.com'],
    ['Facebook', 'facebook.com'],
    ['Instagram', 'instagram.com'],
    ['LinkedIn', 'linkedin.com'],
    ['Wikipedia', 'wikipedia.org'],
    ['Netflix', 'netflix.com'],
    ['Twitch', 'twitch.tv'],
    ['Medium', 'medium.com'],
    ['Hacker News', 'news.ycombinator.com'],
    ['Product Hunt', 'producthunt.com'],
    ['ChatGPT', 'chat.openai.com'],
    ['Claude', 'claude.ai'],
    ['Notion', 'notion.so'],
    ['Figma', 'figma.com'],
    ['Google Docs', 'docs.google.com'],
    ['Google Drive', 'drive.google.com'],
    ['Google Maps', 'maps.google.com'],
    ['Google Search', 'google.com'],
    ['Gmail', 'gmail.com'],
    ['Outlook', 'outlook.com'],
    ['Slack', 'slack.com'],
    ['Jira', 'jira.com'],
    ['LeetCode', 'leetcode.com'],
    ['HackerRank', 'hackerrank.com'],
    ['CodePen', 'codepen.io'],
    ['npm', 'npmjs.com'],
    ['MDN', 'developer.mozilla.org'],
  ]);

  extractBrowserInfo(appName: string, windowTitle: string, urlFromActiveWin?: string): BrowserInfo {
    const isBrowser = BROWSER_APPS.some(b => appName.toLowerCase().includes(b.toLowerCase()));

    if (!isBrowser) {
      return { isBrowser: false, browserName: null, hostname: null, tabTitle: null, url: null };
    }

    // 1. If active-win provides a URL directly (macOS Chrome with accessibility enabled)
    if (urlFromActiveWin) {
      const hostname = this.sanitizeHostname(urlFromActiveWin);
      const tabTitle = this.extractTabTitle(windowTitle, appName);
      return { isBrowser: true, browserName: appName, hostname, tabTitle, url: null }; // Never expose full URL
    }

    // 2. Try to extract hostname from title using patterns
    const hostname = this.extractHostnameFromTitle(windowTitle);
    const tabTitle = this.extractTabTitle(windowTitle, appName);

    logger.debug('BrowserTracker', 'Browser detected', {
      browser: appName,
      hostname,
      tabTitle,
    });

    return {
      isBrowser: true,
      browserName: appName,
      hostname,
      tabTitle,
      url: null, // NEVER expose full URL — privacy
    };
  }

  private extractTabTitle(windowTitle: string, browserName: string): string | null {
    const pattern = this.browserSuffixPatterns.get(browserName);
    if (pattern) {
      const match = windowTitle.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Generic fallback: remove common browser suffixes
    const genericPattern = /(.+?)\s+[-—]\s+(?:Google Chrome|Chrome|Firefox|Edge|Safari|Brave|Opera|Vivaldi|Arc)$/i;
    const match = windowTitle.match(genericPattern);
    if (match && match[1]) return match[1].trim();

    return windowTitle; // Return full title if no pattern matches
  }

  private extractHostnameFromTitle(title: string): string | null {
    // Check known title→host patterns first
    for (const [keyword, host] of this.titleToHostPatterns) {
      if (title.includes(keyword)) {
        return host;
      }
    }

    // Try to find a domain pattern in the title
    const domainPattern = /(?:([\w.-]+\.(?:com|org|io|net|dev|app|co|edu|gov|uk|de|jp|fr|ru|ca|au|in|pk)))\b/i;
    const match = title.match(domainPattern);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }

    return null;
  }

  private sanitizeHostname(url: string): string | null {
    try {
      const parsed = new URL(url);
      // NEVER expose path, query params, or fragments — only hostname
      return parsed.hostname;
    } catch {
      return this.extractHostnameFromTitle(url);
    }
  }
}
