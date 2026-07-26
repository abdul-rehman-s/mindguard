/**
 * MindGuard Desktop Agent — Activity Classifier
 * 
 * Automatically classifies desktop activity into types based on:
 * - Application name
 * - Window title
 * - Browser URL domain
 * 
 * Classification categories:
 * Deep Work, Learning, Coding, Writing, Meetings, Browsing,
 * Entertainment, Gaming, Idle
 */

// ─── Classification Rules ───

const APP_RULES = [
  // Coding apps
  { apps: ['VS Code', 'Code', 'Visual Studio Code', 'Cursor', 'Sublime Text', 'Atom', 'Vim', 'Neovim', 'Emacs', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Xcode', 'Android Studio', 'Eclipse', 'NetBeans'], type: 'coding', category: 'coding' },
  // Terminal / CLI
  { apps: ['Terminal', 'iTerm2', 'PowerShell', 'Command Prompt', 'Windows Terminal', 'Alacritty', 'Hyper', 'Warp', 'iterm'], type: 'coding', category: 'coding' },
  // Design apps
  { apps: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch', 'InVision', 'Canva', 'Blender'], type: 'focus', category: 'design' },
  // Writing apps
  { apps: ['Microsoft Word', 'Google Docs', 'Notion', 'Obsidian', 'Typora', 'iA Writer', 'Scrivener', 'Ulysses', 'Bear', 'Roam Research'], type: 'writing', category: 'writing' },
  // Learning apps
  { apps: ['Coursera', 'Udemy', 'Skillshare', 'LinkedIn Learning', 'Khan Academy', 'Duolingo', 'Anki'], type: 'learning', category: 'learning' },
  // Meeting apps
  { apps: ['Zoom', 'Microsoft Teams', 'Slack', 'Google Meet', 'Skype', 'Webex', 'Discord', 'Jitsi Meet', 'BlueJeans', 'Loom'], type: 'meetings', category: 'meetings' },
  // Entertainment apps
  { apps: ['Netflix', 'Hulu', 'Disney+', 'Amazon Prime Video', 'Apple TV', 'Spotify', 'Apple Music', 'VLC', 'iTunes'], type: 'entertainment', category: 'entertainment' },
  // Gaming apps
  { apps: ['Steam', 'Epic Games', 'Battle.net', 'Origin', 'Xbox', 'PlayStation', 'Roblox', 'Minecraft'], type: 'gaming', category: 'entertainment' },
  // Communication apps (can be productive or distracting)
  { apps: ['Mail', 'Gmail', 'Outlook', 'Thunderbird', 'Spark', 'Calendar', 'Google Calendar', 'Todoist', 'Trello', 'Asana', 'Jira', 'Linear', 'GitHub'], type: 'focus', category: 'communication' },
];

const URL_RULES = [
  // Coding websites
  { domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.microsoft.com', 'npmjs.com', 'pypi.org', 'codepen.io', 'replit.com', 'leetcode.com', 'hackerrank.com'], type: 'coding', category: 'coding' },
  // Learning websites
  { domains: ['coursera.org', 'udemy.com', 'skillshare.com', 'linkedin.com/learning', 'khanacademy.org', 'duolingo.com', 'wikipedia.org', 'scholar.google.com'], type: 'learning', category: 'learning' },
  // Meeting/video websites
  { domains: ['zoom.us', 'meet.google.com', 'teams.microsoft.com', 'webex.com', 'discord.com/channels'], type: 'meetings', category: 'meetings' },
  // Social media (distracted)
  { domains: ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'reddit.com', 'linkedin.com/feed', 'snapchat.com', 'threads.net'], type: 'browsing', category: 'communication' },
  // Entertainment websites
  { domains: ['youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'primevideo.com', 'twitch.tv', 'dailymotion.com', 'vimeo.com', 'funnyordie.com'], type: 'entertainment', category: 'entertainment' },
  // Gaming websites
  { domains: ['steamcommunity.com', 'epicgames.com', 'roblox.com', 'minecraft.net', 'ign.com', 'gamespot.com'], type: 'gaming', category: 'entertainment' },
  // Shopping (distracted)
  { domains: ['amazon.com', 'ebay.com', 'aliexpress.com', 'etsy.com', 'walmart.com', 'target.com'], type: 'browsing', category: 'other' },
  // News (can be productive or distracting)
  { domains: ['nytimes.com', 'bbc.com', 'cnn.com', 'theguardian.com', 'reuters.com', 'wsj.com'], type: 'browsing', category: 'research' },
  // Productive browsing
  { domains: ['docs.google.com', 'notion.so', 'obsidian.md', 'trello.com', 'asana.com', 'figma.com', 'airtable.com', 'monday.com'], type: 'focus', category: 'design' },
];

const TITLE_KEYWORDS = {
  coding: ['debug', 'compile', 'build', 'deploy', 'commit', 'branch', 'merge', 'terminal', 'console', 'stack overflow', 'error', 'exception', 'fix', 'refactor'],
  writing: ['document', 'draft', 'essay', 'article', 'blog', 'post', 'write', 'edit', 'manuscript', 'chapter'],
  learning: ['course', 'lecture', 'lesson', 'study', 'tutorial', 'quiz', 'exam', 'practice', 'learn'],
  meetings: ['meeting', 'call', 'conference', 'zoom', 'hangout', 'presentation', 'demo', 'standup', 'review', 'sync'],
  deep_work: ['focus', 'deep work', 'pomodoro', 'flow', 'intensive'],
  entertainment: ['movie', 'show', 'series', 'game', 'play', 'stream', 'watch', 'listen', 'music'],
  distracted: ['scroll', 'feed', 'browse', 'shop', 'social'],
};

class ActivityClassifier {
  classify(window) {
    const appName = window.app || '';
    const title = window.title || '';
    const url = window.url || '';

    // Step 1: Check exclusion list
    // (handled by tracker — excluded apps won't be tracked)

    // Step 2: Check URL rules (highest priority for browser windows)
    if (url) {
      const domain = this.extractDomain(url);
      for (const rule of URL_RULES) {
        if (rule.domains.some(d => domain.includes(d) || url.includes(d))) {
          return { type: rule.type, category: rule.category };
        }
      }
    }

    // Step 3: Check app rules
    for (const rule of APP_RULES) {
      if (rule.apps.some(a => appName.toLowerCase().includes(a.toLowerCase()))) {
        return { type: rule.type, category: rule.category };
      }
    }

    // Step 4: Check title keywords
    const titleLower = title.toLowerCase();
    for (const [type, keywords] of Object.entries(TITLE_KEYWORDS)) {
      if (keywords.some(k => titleLower.includes(k))) {
        const category = this.typeToCategory(type);
        return { type, category };
      }
    }

    // Step 5: Browser with no matching URL — default to browsing
    if (this.isBrowser(appName)) {
      return { type: 'browsing', category: 'other' };
    }

    // Step 6: Default classification
    return { type: 'app_usage', category: 'other' };
  }

  isBrowser(appName) {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave', 'Arc', 'Vivaldi'];
    return browsers.some(b => appName.toLowerCase().includes(b.toLowerCase()));
  }

  extractDomain(url) {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  typeToCategory(type) {
    const map = {
      coding: 'coding',
      writing: 'writing',
      learning: 'learning',
      meetings: 'meetings',
      deep_work: 'coding',
      entertainment: 'entertainment',
      distracted: 'other',
      browsing: 'other',
      focus: 'coding',
    };
    return map[type] || 'other';
  }
}

module.exports = { ActivityClassifier };
