// MindGuard Desktop — Classification Rules Database
// Comprehensive mapping of apps, websites, and keywords to activity types/categories

import type { ActivityType, ActivityCategory, ProductivityLevel } from '../types';

export interface ClassificationRule {
  match: string | RegExp;
  type: ActivityType;
  category: ActivityCategory;
  productivity: ProductivityLevel;
  priority: number; // Higher = applied first
}

// === URL Rules (for browser windows) ===
export const URL_RULES: ClassificationRule[] = [
  // Productive websites
  { match: 'github.com', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'stackoverflow.com', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'developer.mozilla.org', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'docs.python.org', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'npmjs.com', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'chat.openai.com', type: 'ai_usage', category: 'research', productivity: 'productive', priority: 10 },
  { match: 'claude.ai', type: 'ai_usage', category: 'research', productivity: 'productive', priority: 10 },
  { match: 'gemini.google.com', type: 'ai_usage', category: 'research', productivity: 'productive', priority: 10 },
  { match: 'leetcode.com', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'hackerrank.com', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'notion.so', type: 'writing', category: 'writing', productivity: 'productive', priority: 10 },
  { match: 'linear.app', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'jira.com', type: 'meetings', category: 'meetings', productivity: 'productive', priority: 9 },
  { match: 'figma.com', type: 'deep_work', category: 'design', productivity: 'productive', priority: 10 },
  { match: 'docs.google.com', type: 'writing', category: 'writing', productivity: 'productive', priority: 8 },
  { match: 'wikipedia.org', type: 'research', category: 'research', productivity: 'neutral', priority: 7 },
  { match: 'medium.com', type: 'reading', category: 'research', productivity: 'neutral', priority: 7 },
  { match: 'substack.com', type: 'reading', category: 'research', productivity: 'neutral', priority: 7 },
  { match: 'coursera.org', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'udemy.com', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'khanacademy.org', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'codecademy.com', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },

  // Distracting websites
  { match: 'youtube.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'facebook.com', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 10 },
  { match: 'instagram.com', type: 'browsing', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'tiktok.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'reddit.com', type: 'browsing', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'twitter.com', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 10 },
  { match: 'x.com', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 10 },
  { match: 'netflix.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'twitch.tv', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'hulu.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'disneyplus.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'hbomax.com', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'pinterest.com', type: 'browsing', category: 'entertainment', productivity: 'distracting', priority: 9 },
  { match: 'tumblr.com', type: 'browsing', category: 'entertainment', productivity: 'distracting', priority: 9 },
  { match: 'discord.com', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 8 },
  { match: 'slack.com', type: 'meetings', category: 'communication', productivity: 'productive', priority: 8 },

  // Neutral websites
  { match: 'google.com', type: 'browsing', category: 'research', productivity: 'neutral', priority: 5 },
  { match: 'gmail.com', type: 'browsing', category: 'communication', productivity: 'neutral', priority: 6 },
  { match: 'outlook.com', type: 'browsing', category: 'communication', productivity: 'neutral', priority: 6 },
];

// === App Name Rules ===
export const APP_RULES: ClassificationRule[] = [
  // Productive — Coding
  { match: 'Visual Studio Code', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Code', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 }, // VS Code on Linux
  { match: 'IntelliJ IDEA', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'WebStorm', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'PyCharm', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Xcode', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Terminal', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'iTerm2', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'iTerm', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Command Prompt', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'Windows Terminal', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'PowerShell', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'Warp', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Alacritty', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Hyper', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'GitHub Desktop', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'GitKraken', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'Sublime Text', type: 'coding', category: 'coding', productivity: 'productive', priority: 9 },
  { match: 'Atom', type: 'coding', category: 'coding', productivity: 'productive', priority: 8 },
  { match: 'Neovim', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },
  { match: 'Vim', type: 'coding', category: 'coding', productivity: 'productive', priority: 10 },

  // Productive — Design
  { match: 'Figma', type: 'deep_work', category: 'design', productivity: 'productive', priority: 10 },
  { match: 'Sketch', type: 'deep_work', category: 'design', productivity: 'productive', priority: 10 },
  { match: 'Adobe Photoshop', type: 'deep_work', category: 'design', productivity: 'productive', priority: 9 },
  { match: 'Adobe Illustrator', type: 'deep_work', category: 'design', productivity: 'productive', priority: 9 },
  { match: 'Canva', type: 'deep_work', category: 'design', productivity: 'productive', priority: 8 },
  { match: 'Blender', type: 'deep_work', category: 'design', productivity: 'productive', priority: 9 },

  // Productive — Writing & Productivity
  { match: 'Notion', type: 'writing', category: 'writing', productivity: 'productive', priority: 10 },
  { match: 'Obsidian', type: 'writing', category: 'writing', productivity: 'productive', priority: 10 },
  { match: 'Roam Research', type: 'writing', category: 'writing', productivity: 'productive', priority: 9 },
  { match: 'Bear', type: 'writing', category: 'writing', productivity: 'productive', priority: 9 },
  { match: 'Typora', type: 'writing', category: 'writing', productivity: 'productive', priority: 9 },
  { match: 'Microsoft Word', type: 'writing', category: 'writing', productivity: 'productive', priority: 8 },
  { match: 'Google Docs', type: 'writing', category: 'writing', productivity: 'productive', priority: 8 },
  { match: 'Pages', type: 'writing', category: 'writing', productivity: 'productive', priority: 8 },
  { match: 'Scrivener', type: 'writing', category: 'writing', productivity: 'productive', priority: 9 },
  { match: 'Todoist', type: 'focus', category: 'other', productivity: 'productive', priority: 8 },
  { match: 'Things', type: 'focus', category: 'other', productivity: 'productive', priority: 8 },
  { match: 'OmniFocus', type: 'focus', category: 'other', productivity: 'productive', priority: 8 },
  { match: 'Asana', type: 'focus', category: 'other', productivity: 'productive', priority: 8 },
  { match: 'Trello', type: 'focus', category: 'other', productivity: 'productive', priority: 7 },
  { match: 'Linear', type: 'focus', category: 'other', productivity: 'productive', priority: 9 },

  // Productive — Communication (work)
  { match: 'Slack', type: 'meetings', category: 'communication', productivity: 'productive', priority: 7 },
  { match: 'Microsoft Teams', type: 'meetings', category: 'communication', productivity: 'productive', priority: 8 },
  { match: 'Zoom', type: 'meetings', category: 'meetings', productivity: 'productive', priority: 8 },
  { match: 'Google Meet', type: 'meetings', category: 'meetings', productivity: 'productive', priority: 8 },
  { match: 'Webex', type: 'meetings', category: 'meetings', productivity: 'productive', priority: 7 },

  // Productive — Research & Learning
  { match: 'Kindle', type: 'reading', category: 'learning', productivity: 'productive', priority: 9 },
  { match: 'Anki', type: 'learning', category: 'learning', productivity: 'productive', priority: 10 },
  { match: 'Calibre', type: 'reading', category: 'learning', productivity: 'productive', priority: 8 },

  // Distracting — Entertainment
  { match: 'Netflix', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'Spotify', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 7 },
  { match: 'Apple Music', type: 'entertainment', category: 'entertainment', productivity: 'neutral', priority: 6 },
  { match: 'Apple TV', type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'VLC', type: 'entertainment', category: 'entertainment', productivity: 'neutral', priority: 5 },
  { match: 'Steam', type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'Epic Games', type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: 'Battle.net', type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },

  // Distracting — Social
  { match: 'Discord', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 8 },
  { match: 'WhatsApp', type: 'browsing', category: 'communication', productivity: 'neutral', priority: 6 },
  { match: 'Telegram', type: 'browsing', category: 'communication', productivity: 'neutral', priority: 6 },
  { match: 'Messenger', type: 'browsing', category: 'communication', productivity: 'distracting', priority: 7 },
  { match: 'Signal', type: 'browsing', category: 'communication', productivity: 'neutral', priority: 6 },
  { match: 'FaceTime', type: 'meetings', category: 'communication', productivity: 'neutral', priority: 6 },
  { match: 'Skype', type: 'meetings', category: 'communication', productivity: 'neutral', priority: 6 },

  // Distracting — Games
  { match: /Minecraft/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /League of Legends/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /Valorant/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /Counter-Strike/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /Fortnite/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /Overwatch/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },
  { match: /World of Warcraft/i, type: 'gaming', category: 'entertainment', productivity: 'distracting', priority: 10 },

  // Neutral — System
  { match: 'Calculator', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Finder', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Explorer', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'File Explorer', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Settings', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'System Preferences', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Activity Monitor', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Task Manager', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Spotlight', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Alfred', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 5 },
  { match: 'Raycast', type: 'app_usage', category: 'other', productivity: 'productive', priority: 7 },
  { match: '1Password', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 6 },
  { match: 'Bitwarden', type: 'app_usage', category: 'other', productivity: 'neutral', priority: 6 },
];

// === Title Keyword Rules ===
export const KEYWORD_RULES: ClassificationRule[] = [
  // Productive keywords
  { match: /\b(debug|deploy|commit|branch|merge|pull request|PR|build|compile)\b/i, type: 'coding', category: 'coding', productivity: 'productive', priority: 6 },
  { match: /\b(meeting|call|standup|sync|huddle|interview|presentation)\b/i, type: 'meetings', category: 'meetings', productivity: 'productive', priority: 6 },
  { match: /\b(document|doc|spec|requirements|design|proposal|RFC)\b/i, type: 'writing', category: 'writing', productivity: 'productive', priority: 6 },
  { match: /\b(learn|course|tutorial|lecture|study|exercise|quiz|exam)\b/i, type: 'learning', category: 'learning', productivity: 'productive', priority: 6 },
  { match: /\b(read|book|article|paper|blog|newsletter)\b/i, type: 'reading', category: 'research', productivity: 'productive', priority: 5 },
  { match: /\b(ChatGPT|Claude|Gemini|Copilot|GPT)\b/i, type: 'ai_usage', category: 'research', productivity: 'productive', priority: 7 },

  // Distracting keywords
  { match: /\b(game|play|watch|stream|movie|show|series|episode)\b/i, type: 'entertainment', category: 'entertainment', productivity: 'distracting', priority: 5 },
  { match: /\b(scroll|feed|timeline|feed|post|tweet|story|reel)\b/i, type: 'browsing', category: 'entertainment', productivity: 'distracting', priority: 4 },
];

// === Browser App Names ===
export const BROWSER_APPS = [
  'Google Chrome', 'Chrome', 'Chromium',
  'Mozilla Firefox', 'Firefox',
  'Microsoft Edge', 'Edge',
  'Safari', 'WebKit',
  'Brave', 'Brave Browser',
  'Opera', 'Opera GX',
  'Vivaldi',
  'Arc',
  'Thor',
];

// === Meeting App Names ===
export const MEETING_APPS = [
  'Zoom', 'Microsoft Teams', 'Google Meet',
  'Webex', 'Skype', 'FaceTime',
  'Slack (Call)', 'Discord (Voice)',
  'Jitsi Meet', 'BlueJeans',
  'GoTo Meeting', 'RingCentral',
];

// === Default Classification (when nothing matches) ===
export const DEFAULT_CLASSIFICATION = {
  type: 'app_usage' as ActivityType,
  category: 'other' as ActivityCategory,
  productivity: 'neutral' as ProductivityLevel,
  confidence: 0.3,
  source: 'default' as string,
};
