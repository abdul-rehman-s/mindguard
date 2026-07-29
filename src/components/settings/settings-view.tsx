'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  LogOut,
  Loader2,
  Check,
  Shield,
  Download,
  Bell,
  Monitor,
  Keyboard,
  Info,
  ExternalLink,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  AppWindow,
  Globe,
  Clock,
  Settings,
  ToggleLeft,
  Plus,
  X,
  Zap,
  Volume2,
  Bug,
  Heart,
  Target,
  Sparkles,
  ChevronDown,
  FlaskConical,
  Search,
  Upload,
  RotateCcw,
  Trash2,
  Brain,
  MessageSquare,
  RefreshCcw,
  Terminal,
  Code2,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { shortcutManager } from '@/lib/shortcut-manager';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { DesktopSettingsData, UserSettingsData } from '@/types';

// ─── Utility ───

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

// ─── Section Definitions ───

type SectionId = 'general' | 'account' | 'appearance' | 'desktop' | 'tracking' | 'privacy' | 'focus' | 'notifications' | 'keyboard' | 'ai-coach' | 'advanced' | 'about';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof User;
  description: string;
}

const sections: SectionDef[] = [
  { id: 'general',       label: 'General',       icon: Settings,     description: 'Language, timezone, display name' },
  { id: 'account',       label: 'Account',       icon: User,         description: 'Email, sign out, data export' },
  { id: 'appearance',    label: 'Appearance',    icon: Palette,      description: 'Theme, sidebar, compact mode' },
  { id: 'desktop',       label: 'Desktop',       icon: Monitor,      description: 'Desktop agent, tracker, blocking' },
  { id: 'tracking',      label: 'Tracking',      icon: Target,       description: 'Activity tracking, exclusions' },
  { id: 'privacy',       label: 'Privacy',       icon: Shield,       description: 'Data sharing, privacy mode' },
  { id: 'focus',         label: 'Focus',         icon: Zap,          description: 'Timer defaults, goals, ambient sound' },
  { id: 'notifications', label: 'Notifications', icon: Bell,         description: 'Desktop alerts, reminders' },
  { id: 'keyboard',      label: 'Keyboard',      icon: Keyboard,     description: 'Shortcuts, customization' },
  { id: 'ai-coach',      label: 'AI Coach',      icon: Brain,        description: 'Provider, model, personality, API key' },
  { id: 'advanced',      label: 'Advanced',      icon: FlaskConical, description: 'Debug, developer tools, data management' },
  { id: 'about',         label: 'About',         icon: Info,         description: 'Version, links, credits' },
];

// ─── Settings Search Index ───

interface SearchableSetting {
  id: string;
  sectionId: SectionId;
  label: string;
  description: string;
  keywords: string[];
}

const searchIndex: SearchableSetting[] = [
  // General
  { id: 's-language',          sectionId: 'general',       label: 'Language',              description: 'Choose your preferred language.',                  keywords: ['language', 'locale', 'english', 'spanish', 'french'] },
  { id: 's-timezone',          sectionId: 'general',       label: 'Timezone',              description: 'Used for scheduling and daily statistics.',          keywords: ['timezone', 'utc', 'time', 'zone', 'eastern', 'pacific'] },
  { id: 's-displayname',       sectionId: 'general',       label: 'Display Name',          description: 'Your name shown in the app.',                       keywords: ['name', 'display', 'profile', 'username'] },
  // Account
  { id: 's-email',             sectionId: 'account',       label: 'Email',                 description: 'Your login email address (read-only).',             keywords: ['email', 'account', 'login'] },
  { id: 's-exportdata',        sectionId: 'account',       label: 'Export Your Data',      description: 'Download all your data as JSON.',                   keywords: ['export', 'download', 'data', 'backup'] },
  { id: 's-signout',           sectionId: 'account',       label: 'Sign Out',              description: 'End your current session.',                         keywords: ['signout', 'logout', 'sign out', 'log out'] },
  // Appearance
  { id: 's-theme',             sectionId: 'appearance',    label: 'Theme',                 description: 'Choose dark, light, or system color scheme.',       keywords: ['theme', 'dark', 'light', 'system', 'color', 'mode'] },
  { id: 's-compact',           sectionId: 'appearance',    label: 'Compact Mode',          description: 'Reduce spacing for more content.',                  keywords: ['compact', 'dense', 'spacing', 'layout'] },
  { id: 's-sidebarcollapsed',  sectionId: 'appearance',    label: 'Sidebar Collapsed',     description: 'Start with collapsed sidebar.',                     keywords: ['sidebar', 'collapsed', 'nav', 'navigation'] },
  // Desktop
  { id: 's-autostart',         sectionId: 'desktop',       label: 'Auto Start',            description: 'Launch MindGuard with system login.',               keywords: ['autostart', 'launch', 'startup', 'boot'] },
  { id: 's-runbg',             sectionId: 'desktop',       label: 'Run in Background',     description: 'Minimize to tray instead of closing.',              keywords: ['background', 'tray', 'minimize'] },
  { id: 's-tracking',          sectionId: 'desktop',       label: 'Tracking Enabled',      description: 'Record desktop activity.',                          keywords: ['tracking', 'activity', 'monitor', 'record'] },
  { id: 's-focusprotection',   sectionId: 'desktop',       label: 'Focus Protection',      description: 'Block distracting apps during focus.',               keywords: ['focus', 'protection', 'block', 'distract'] },
  { id: 's-mutenotif',         sectionId: 'desktop',       label: 'Mute Notifications',    description: 'Suppress all desktop notifications.',               keywords: ['mute', 'silence', 'notification', 'suppress'] },
  { id: 's-trackerinterval',   sectionId: 'desktop',       label: 'Tracker Interval',      description: 'How often tracker polls (5–120 sec).',              keywords: ['interval', 'poll', 'frequency', 'seconds'] },
  // Tracking
  { id: 's-tracktoggle',       sectionId: 'tracking',      label: 'Activity Tracking',     description: 'Enable or disable desktop tracking.',               keywords: ['tracking', 'desktop', 'activity', 'monitor'] },
  { id: 's-exclusions',        sectionId: 'tracking',      label: 'Tracking Exclusions',   description: 'Apps/websites to exclude from tracking.',           keywords: ['exclusion', 'exclude', 'ignore', 'skip', 'privacy'] },
  // Privacy
  { id: 's-privacymode',       sectionId: 'privacy',       label: 'Privacy Mode',          description: 'Hide window titles from tracking.',                 keywords: ['privacy', 'mode', 'hide', 'window', 'title'] },
  { id: 's-sharestats',        sectionId: 'privacy',       label: 'Share Statistics',      description: 'Contribute anonymized stats to leaderboard.',       keywords: ['share', 'stats', 'leaderboard', 'public', 'community'] },
  { id: 's-publicprofile',     sectionId: 'privacy',       label: 'Public Profile',        description: 'Allow others to see your achievements.',            keywords: ['public', 'profile', 'visible', 'share'] },
  // Focus
  { id: 's-defaultduration',   sectionId: 'focus',         label: 'Default Focus Duration', description: 'Default timer length for sessions.',               keywords: ['duration', 'timer', 'focus', 'length', 'minutes', 'pomodoro'] },
  { id: 's-focusgoal',         sectionId: 'focus',         label: 'Daily Focus Goal',      description: 'Target minutes of deep focus per day.',             keywords: ['goal', 'daily', 'target', 'minutes', 'focus'] },
  { id: 's-autostarttimer',    sectionId: 'focus',         label: 'Auto-Start Timer',      description: 'Auto-begin timer on focus mode entry.',             keywords: ['auto', 'start', 'timer', 'begin'] },
  { id: 's-celebration',       sectionId: 'focus',         label: 'Celebration Screen',    description: 'Animated celebration after sessions.',              keywords: ['celebration', 'animation', 'complete', 'done'] },
  { id: 's-ambient',           sectionId: 'focus',         label: 'Ambient Sound',         description: 'Background sound during focus sessions.',           keywords: ['sound', 'ambient', 'rain', 'classical', 'noise'] },
  // Notifications
  { id: 's-desktopnotif',      sectionId: 'notifications', label: 'Desktop Notifications', description: 'Show system notifications.',                        keywords: ['notification', 'desktop', 'system', 'alert'] },
  { id: 's-breakreminders',    sectionId: 'notifications', label: 'Break Reminders',       description: 'Remind you to take breaks.',                        keywords: ['break', 'reminder', 'rest', 'pause'] },
  { id: 's-missionreminders',  sectionId: 'notifications', label: 'Mission Reminders',     description: 'Get notified about missions.',                      keywords: ['mission', 'reminder', 'task', 'goal'] },
  { id: 's-streakreminders',   sectionId: 'notifications', label: 'Streak Milestones',     description: 'Celebrate streak achievements.',                    keywords: ['streak', 'milestone', 'celebrate', 'consecutive'] },
  { id: 's-achievementalerts', sectionId: 'notifications', label: 'Achievement Alerts',    description: 'Notify on new achievements.',                       keywords: ['achievement', 'alert', 'unlock', 'badge'] },
  { id: 's-idlealerts',        sectionId: 'notifications', label: 'Idle Alerts',           description: 'Warn when idle for too long.',                      keywords: ['idle', 'alert', 'warn', 'inactive'] },
  { id: 's-muteall',           sectionId: 'notifications', label: 'Mute All',              description: 'Suppress all notifications.',                       keywords: ['mute', 'all', 'silence', 'suppress'] },
  // Keyboard
  { id: 's-shortcutsview',     sectionId: 'keyboard',      label: 'Keyboard Shortcuts',    description: 'View and manage all shortcuts.',                    keywords: ['keyboard', 'shortcuts', 'hotkey', 'key'] },
  { id: 's-customshortcuts',   sectionId: 'keyboard',      label: 'Custom Shortcuts',      description: 'Customize your keyboard shortcuts.',                keywords: ['custom', 'shortcuts', 'modify', 'change', 'remap'] },
  // AI Coach
  { id: 's-aiprovider',        sectionId: 'ai-coach',      label: 'AI Provider',           description: 'Choose which AI provider to use.',                  keywords: ['ai', 'provider', 'openai', 'deepseek', 'gemini', 'anthropic', 'ollama'] },
  { id: 's-aiapikey',          sectionId: 'ai-coach',      label: 'API Key',               description: 'API key for external AI providers.',                keywords: ['api', 'key', 'secret', 'credential'] },
  { id: 's-aimodel',           sectionId: 'ai-coach',      label: 'AI Model',              description: 'Select which model to use.',                        keywords: ['model', 'gpt', 'claude', 'llm', 'ai'] },
  { id: 's-coachpersonality',  sectionId: 'ai-coach',      label: 'Coach Personality',     description: 'How your AI coach talks to you.',                   keywords: ['coach', 'personality', 'strict', 'friendly', 'data'] },
  { id: 's-ollamaurl',         sectionId: 'ai-coach',      label: 'Ollama URL',            description: 'URL for self-hosted Ollama server.',                keywords: ['ollama', 'url', 'local', 'self-hosted', 'server'] },
  // Advanced
  { id: 's-debugmode',         sectionId: 'advanced',      label: 'Debug Mode',            description: 'Show debug info and additional logging.',           keywords: ['debug', 'developer', 'log', 'dev'] },
  { id: 's-showapilogs',       sectionId: 'advanced',      label: 'Show API Logs',         description: 'Display API request/response logs.',                keywords: ['api', 'log', 'request', 'response'] },
  { id: 's-reactdevtools',     sectionId: 'advanced',      label: 'React DevTools Info',   description: 'Show React component debug info.',                  keywords: ['react', 'devtools', 'component', 'debug'] },
  { id: 's-clearcache',        sectionId: 'advanced',      label: 'Clear Local Cache',     description: 'Remove cached data from local storage.',            keywords: ['cache', 'clear', 'local', 'storage', 'reset'] },
  { id: 's-forcesync',         sectionId: 'advanced',      label: 'Force Sync',            description: 'Force immediate data synchronization.',             keywords: ['sync', 'force', 'refresh', 'synchronize'] },
  { id: 's-exportsettings',    sectionId: 'advanced',      label: 'Export Settings',       description: 'Download all settings as JSON.',                    keywords: ['export', 'settings', 'download', 'backup'] },
  { id: 's-importsettings',    sectionId: 'advanced',      label: 'Import Settings',       description: 'Upload settings from a JSON file.',                 keywords: ['import', 'settings', 'upload', 'restore'] },
  { id: 's-resetallsettings',  sectionId: 'advanced',      label: 'Reset All Settings',    description: 'Reset all settings to defaults.',                   keywords: ['reset', 'default', 'clear', 'factory'] },
];

// ─── Shared: Setting Row ───

function SettingRow({
  icon,
  iconBg = 'bg-emerald-500/[0.08]',
  iconColor = 'text-emerald-400/80',
  label,
  description,
  defaultValue,
  onReset,
  children,
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  defaultValue?: string;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', iconBg)} aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200">{label}</p>
          {description && <p className="text-xs text-zinc-500">{description}</p>}
          {defaultValue && <p className="text-[10px] text-zinc-600 mt-0.5">Default: {defaultValue}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onReset && (
          <button
            onClick={onReset}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
            aria-label={`Reset ${label} to default`}
            title="Reset to default"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Section Header with Reset ───

function SectionHeader({
  title,
  description,
  sectionId,
  onResetSection,
}: {
  title: string;
  description: string;
  sectionId: SectionId;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onResetSection(sectionId)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
        aria-label={`Reset ${title} section to defaults`}
      >
        <RotateCcw className="h-3 w-3" />
        Reset Section
      </button>
    </div>
  );
}

// ─── Section: General ───

function SettingsGeneral({
  displayName,
  setDisplayName,
  saving,
  saved,
  handleSaveProfile,
  error,
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  displayName: string;
  setDisplayName: (v: string) => void;
  saving: boolean;
  saved: boolean;
  handleSaveProfile: () => void;
  error: string;
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="General" description="Basic preferences for your MindGuard experience." sectionId="general" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <div>
            <Label htmlFor="settings-name" className="mb-1.5 text-xs font-medium text-zinc-400">Display Name</Label>
            <Input
              id="settings-name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-label="Display name"
              className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              aria-label={saving ? 'Saving profile' : 'Save profile changes'}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              size="sm"
            >
              {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : saved ? <Check className="mr-2 h-3.5 w-3.5" aria-hidden="true" /> : null}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
            </Button>
            {error && <span className="text-xs text-red-400" role="alert" aria-live="polite">{error}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Globe className="h-4 w-4 text-emerald-400/80" />}
            label="Language"
            description="Choose your preferred language."
            defaultValue="English"
            onReset={() => setUserSetting('language', 'en')}
          >
            <Select
              value={userSettings?.language ?? 'en'}
              onValueChange={(v) => setUserSetting('language', v)}
              disabled={!userSettings}
            >
              <SelectTrigger className="w-[140px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="Language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="en" className="text-zinc-200 focus:text-zinc-100">English</SelectItem>
                <SelectItem value="es" className="text-zinc-200 focus:text-zinc-100" disabled>Spanish (Soon)</SelectItem>
                <SelectItem value="fr" className="text-zinc-200 focus:text-zinc-100" disabled>French (Soon)</SelectItem>
                <SelectItem value="de" className="text-zinc-200 focus:text-zinc-100" disabled>German (Soon)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Clock className="h-4 w-4 text-emerald-400/80" />}
            label="Timezone"
            description="Used for scheduling and daily statistics."
            defaultValue="UTC"
            onReset={() => setUserSetting('timezone', null)}
          >
            <Select
              value={userSettings?.timezone ?? 'UTC'}
              onValueChange={(v) => setUserSetting('timezone', v)}
              disabled={!userSettings}
            >
              <SelectTrigger className="w-[180px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="Timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="UTC" className="text-zinc-200 focus:text-zinc-100">UTC</SelectItem>
                <SelectItem value="America/New_York" className="text-zinc-200 focus:text-zinc-100">Eastern (ET)</SelectItem>
                <SelectItem value="America/Chicago" className="text-zinc-200 focus:text-zinc-100">Central (CT)</SelectItem>
                <SelectItem value="America/Los_Angeles" className="text-zinc-200 focus:text-zinc-100">Pacific (PT)</SelectItem>
                <SelectItem value="Europe/London" className="text-zinc-200 focus:text-zinc-100">London (GMT)</SelectItem>
                <SelectItem value="Europe/Berlin" className="text-zinc-200 focus:text-zinc-100">Berlin (CET)</SelectItem>
                <SelectItem value="Asia/Shanghai" className="text-zinc-200 focus:text-zinc-100">Shanghai (CST)</SelectItem>
                <SelectItem value="Asia/Tokyo" className="text-zinc-200 focus:text-zinc-100">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Account ───

function SettingsAccount({
  session,
  handleSignOut,
  handleExportData,
  exporting,
  onResetSection,
}: {
  session: { user?: { email?: string | null; name?: string | null } } | null;
  handleSignOut: () => Promise<void>;
  handleExportData: () => Promise<void>;
  exporting: boolean;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Account" description="Manage your account and personal data." sectionId="account" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<User className="h-4 w-4 text-emerald-400/80" />}
            label="Email"
            description="Your login email address (read-only)."
          >
            <Input
              value={session?.user?.email || ''}
              disabled
              aria-label="Email address (read-only)"
              className="border-white/[0.06] bg-white/[0.02] text-zinc-500 h-8 w-[220px]"
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Download className="h-4 w-4 text-emerald-400/80" />}
            label="Export Your Data"
            description="Download all your missions, sessions, and reflections as JSON."
          >
            <Button
              onClick={handleExportData}
              disabled={exporting}
              aria-label={exporting ? 'Exporting data' : 'Export data as JSON'}
              variant="outline"
              className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
              size="sm"
            >
              {exporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="mr-2 h-3.5 w-3.5" aria-hidden="true" />}
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="card-glow border-red-500/[0.08] bg-red-500/[0.02]">
        <CardContent className="p-6">
          <SettingRow
            icon={<LogOut className="h-4 w-4 text-red-400" />}
            iconBg="bg-red-500/[0.08]"
            iconColor="text-red-400"
            label="Sign Out"
            description="End your current session and return to the landing page."
          >
            <Button
              variant="outline"
              onClick={handleSignOut}
              aria-label="Sign out of your account"
              className="border-red-500/20 text-red-400 hover:bg-red-500/[0.06] hover:text-red-300 hover:border-red-500/30"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign Out
            </Button>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Appearance ───

function SettingsAppearance({
  theme,
  setTheme,
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  theme: string | undefined;
  setTheme: (t: string) => void;
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Appearance" description="Customize how MindGuard looks and feels." sectionId="appearance" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-2">Theme</p>
            <p className="text-xs text-zinc-500 mb-3">Choose your preferred color scheme. Changes apply instantly.</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTheme(t); setUserSetting('theme', t); }}
                  aria-label={`Set theme to ${t}`}
                  role="radio"
                  aria-checked={theme === t}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    theme === t
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300'
                  )}
                >
                  {t === 'dark' && <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 ring-1 ring-zinc-700" aria-hidden="true" />}
                  {t === 'light' && <span className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-zinc-300" aria-hidden="true" />}
                  {t === 'system' && <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-zinc-900 to-white ring-1 ring-zinc-500" aria-hidden="true" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Monitor className="h-4 w-4 text-emerald-400/80" />}
            label="Compact Mode"
            description="Reduce spacing and show more content per screen."
            defaultValue="Off"
            onReset={() => setUserSetting('compactMode', false)}
          >
            <Switch
              checked={userSettings?.compactMode ?? false}
              onCheckedChange={(v) => setUserSetting('compactMode', v)}
              disabled={!userSettings}
              aria-label="Compact mode"
            />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Settings className="h-4 w-4 text-emerald-400/80" />}
            label="Sidebar Collapsed"
            description="Start with a collapsed sidebar for more workspace."
            defaultValue="Off"
            onReset={() => setUserSetting('sidebarCollapsed', false)}
          >
            <Switch
              checked={userSettings?.sidebarCollapsed ?? false}
              onCheckedChange={(v) => setUserSetting('sidebarCollapsed', v)}
              disabled={!userSettings}
              aria-label="Sidebar collapsed"
            />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Desktop ───

function SettingsDesktop({ onResetSection }: { onResetSection: (sectionId: SectionId) => void }) {
  const [settings, setSettings] = useState<DesktopSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackerConnected, setTrackerConnected] = useState(false);
  const [newBlockedApp, setNewBlockedApp] = useState('');
  const [newBlockedSite, setNewBlockedSite] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/desktop/settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSettings(data as DesktopSettingsData);
      const statusRes = await fetch('/api/desktop/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTrackerConnected(statusData.connected);
      }
    } catch {
      toast.error('Failed to load desktop settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSetting = async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch('/api/desktop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setSettings(updated as DesktopSettingsData);
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const addToList = async (key: 'blockedApps' | 'blockedWebsites', item: string) => {
    if (!settings || !item.trim()) return;
    const current = settings[key];
    if (current.includes(item.trim())) return;
    await saveSetting(key, [...current, item.trim()]);
  };

  const removeFromList = async (key: 'blockedApps' | 'blockedWebsites', item: string) => {
    if (!settings) return;
    const current = settings[key];
    await saveSetting(key, current.filter((i) => i !== item));
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader title="Desktop" description="Configure the MindGuard Desktop Agent." sectionId="desktop" onResetSection={onResetSection} />
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" aria-label="Loading desktop settings" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Desktop" description="Configure the MindGuard Desktop Agent and its behavior." sectionId="desktop" onResetSection={onResetSection} />

      {/* Tracker Connection */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
              trackerConnected ? 'bg-emerald-500/[0.08]' : 'bg-zinc-500/[0.06]'
            )} aria-hidden="true">
              {trackerConnected ? <Wifi className="h-5 w-5 text-emerald-400" /> : <WifiOff className="h-5 w-5 text-zinc-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-sm font-medium text-zinc-200">Desktop Tracker</p>
              <p className="text-xs text-zinc-500">
                {trackerConnected ? 'Tracker is connected and running' : 'Install the MindGuard Desktop app for real-time activity tracking'}
              </p>
            </div>
            {!trackerConnected && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100 shrink-0"
                onClick={() => window.open('https://github.com/abdul-rehman-s/mindguard/releases', '_blank')}
                aria-label="Download MindGuard Desktop"
              >
                <Download className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Core Desktop Settings */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Monitor className="h-4 w-4 text-emerald-400/80" />}
            label="Auto Start"
            description="Launch MindGuard Desktop with system login."
            defaultValue="Off"
            onReset={() => saveSetting('autoStart', false)}
          >
            <Switch checked={settings.autoStart} onCheckedChange={(v) => saveSetting('autoStart', v)} disabled={saving} aria-label="Auto start on login" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Clock className="h-4 w-4 text-emerald-400/80" />}
            label="Run in Background"
            description="Minimize to system tray instead of closing."
            defaultValue="On"
            onReset={() => saveSetting('runInBackground', true)}
          >
            <Switch checked={settings.runInBackground} onCheckedChange={(v) => saveSetting('runInBackground', v)} disabled={saving} aria-label="Run in background" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<ToggleLeft className="h-4 w-4 text-emerald-400/80" />}
            label="Tracking Enabled"
            description="Record desktop activity and window usage."
            defaultValue="On"
            onReset={() => saveSetting('trackingEnabled', true)}
          >
            <Switch checked={settings.trackingEnabled} onCheckedChange={(v) => saveSetting('trackingEnabled', v)} disabled={saving} aria-label="Enable tracking" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Shield className="h-4 w-4 text-purple-400/80" />}
            iconBg="bg-purple-500/[0.08]"
            iconColor="text-purple-400/80"
            label="Focus Protection"
            description="Block distracting apps and websites during focus sessions."
            defaultValue="Off"
            onReset={() => saveSetting('focusProtection', false)}
          >
            <Switch checked={settings.focusProtection} onCheckedChange={(v) => saveSetting('focusProtection', v)} disabled={saving} aria-label="Focus protection" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Bell className="h-4 w-4 text-emerald-400/80" />}
            label="Mute Notifications"
            description="Suppress all desktop notifications."
            defaultValue="Off"
            onReset={() => saveSetting('muteNotifications', false)}
          >
            <Switch checked={settings.muteNotifications} onCheckedChange={(v) => saveSetting('muteNotifications', v)} disabled={saving} aria-label="Mute notifications" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Clock className="h-4 w-4 text-emerald-400/80" />}
            label="Tracker Interval"
            description="How often the tracker polls for activity (5–120 seconds)."
            defaultValue="30 sec"
            onReset={() => saveSetting('trackerInterval', 30)}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={120}
                value={settings.trackerInterval}
                onChange={(e) => { const val = parseInt(e.target.value, 10); if (val >= 5 && val <= 120) saveSetting('trackerInterval', val); }}
                className="border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8 w-16 text-center"
                aria-label="Tracker interval in seconds"
              />
              <span className="text-xs text-zinc-500">sec</span>
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Blocked Apps */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <AppWindow className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Blocked Apps</h4>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Apps blocked during focus sessions.</p>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="App name (e.g., Spotify)"
              value={newBlockedApp}
              onChange={(e) => setNewBlockedApp(e.target.value)}
              className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 text-xs h-8"
              aria-label="Add blocked app"
            />
            <Button variant="outline" size="sm" className="h-8 border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]" onClick={() => { addToList('blockedApps', newBlockedApp); setNewBlockedApp(''); }} disabled={!newBlockedApp.trim() || saving} aria-label="Add blocked app">
              <Plus className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.blockedApps.map((item) => (
              <Badge key={item} variant="outline" className="border-red-500/20 bg-red-500/[0.06] text-red-400 text-xs gap-1 pr-1">
                {item}
                <button onClick={() => removeFromList('blockedApps', item)} className="text-red-500/60 hover:text-red-300" aria-label={`Remove ${item} from blocked apps`}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {settings.blockedApps.length === 0 && <p className="text-xs text-zinc-600">No apps blocked</p>}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Websites */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Blocked Websites</h4>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Sites blocked during focus sessions.</p>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Domain (e.g., twitter.com)"
              value={newBlockedSite}
              onChange={(e) => setNewBlockedSite(e.target.value)}
              className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 text-xs h-8"
              aria-label="Add blocked website"
            />
            <Button variant="outline" size="sm" className="h-8 border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]" onClick={() => { addToList('blockedWebsites', newBlockedSite); setNewBlockedSite(''); }} disabled={!newBlockedSite.trim() || saving} aria-label="Add blocked website">
              <Plus className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.blockedWebsites.map((item) => (
              <Badge key={item} variant="outline" className="border-red-500/20 bg-red-500/[0.06] text-red-400 text-xs gap-1 pr-1">
                {item}
                <button onClick={() => removeFromList('blockedWebsites', item)} className="text-red-500/60 hover:text-red-300" aria-label={`Remove ${item} from blocked websites`}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {settings.blockedWebsites.length === 0 && <p className="text-xs text-zinc-600">No websites blocked</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Tracking ───

function SettingsTracking({ onResetSection }: { onResetSection: (sectionId: SectionId) => void }) {
  const [settings, setSettings] = useState<DesktopSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExclusion, setNewExclusion] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/desktop/settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSettings(data as DesktopSettingsData);
    } catch {
      toast.error('Failed to load tracking settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSetting = async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch('/api/desktop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setSettings(updated as DesktopSettingsData);
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const addExclusion = async (item: string) => {
    if (!settings || !item.trim()) return;
    const current = settings.trackingExclusions;
    if (current.includes(item.trim())) return;
    await saveSetting('trackingExclusions', [...current, item.trim()]);
  };

  const removeExclusion = async (item: string) => {
    if (!settings) return;
    const current = settings.trackingExclusions;
    await saveSetting('trackingExclusions', current.filter((i) => i !== item));
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader title="Tracking" description="Control what gets tracked on your desktop." sectionId="tracking" onResetSection={onResetSection} />
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" aria-label="Loading tracking settings" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Tracking" description="Control what gets tracked on your desktop." sectionId="tracking" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <SettingRow
            icon={<ToggleLeft className="h-4 w-4 text-emerald-400/80" />}
            label="Desktop Activity Tracking"
            description="Record desktop activity and window usage in real-time."
            defaultValue="On"
            onReset={() => saveSetting('trackingEnabled', true)}
          >
            <Switch checked={settings.trackingEnabled} onCheckedChange={(v) => saveSetting('trackingEnabled', v)} disabled={saving} aria-label="Enable desktop tracking" />
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <EyeOff className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tracking Exclusions</h4>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Apps and websites that won&apos;t be tracked.</p>
          <div className="flex gap-2 mb-3">
            <Input placeholder="App name or website" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 text-xs h-8" aria-label="Add tracking exclusion" />
            <Button variant="outline" size="sm" className="h-8 border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]" onClick={() => { addExclusion(newExclusion); setNewExclusion(''); }} disabled={!newExclusion.trim() || saving} aria-label="Add exclusion">
              <Plus className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.trackingExclusions.map((item) => (
              <Badge key={item} variant="outline" className="border-white/[0.06] bg-white/[0.03] text-zinc-400 text-xs gap-1 pr-1">
                {item}
                <button onClick={() => removeExclusion(item)} className="text-zinc-600 hover:text-zinc-300" aria-label={`Remove ${item} from exclusions`}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {settings.trackingExclusions.length === 0 && <p className="text-xs text-zinc-600">No exclusions set</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Privacy ───

function SettingsPrivacy({
  desktopSettings,
  saveDesktopSetting,
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  desktopSettings: DesktopSettingsData | null;
  saveDesktopSetting: (key: string, value: unknown) => Promise<void>;
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Privacy" description="Control how your data is handled and shared." sectionId="privacy" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-zinc-400">
              MindGuard only tracks <span className="text-amber-400 font-medium">app names and window titles</span> on your own machine.
              No content, keystrokes, or passwords are ever recorded. All data stays local unless you explicitly export it.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={desktopSettings?.privacyMode ? <EyeOff className="h-4 w-4 text-amber-400" /> : <Eye className="h-4 w-4 text-zinc-400" />}
            iconBg={desktopSettings?.privacyMode ? 'bg-amber-500/[0.08]' : 'bg-zinc-500/[0.06]'}
            label="Privacy Mode"
            description="Hide window titles and URLs from tracking data."
            defaultValue="Off"
            onReset={() => saveDesktopSetting('privacyMode', false)}
          >
            <Switch checked={desktopSettings?.privacyMode ?? false} onCheckedChange={(v) => saveDesktopSetting('privacyMode', v)} disabled={!desktopSettings} aria-label="Privacy mode" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Heart className="h-4 w-4 text-emerald-400/80" />}
            label="Share Statistics"
            description="Contribute anonymized focus stats to the community leaderboard."
            defaultValue="Off"
            onReset={() => setUserSetting('shareStats', false)}
          >
            <Switch checked={userSettings?.shareStats ?? false} onCheckedChange={(v) => setUserSetting('shareStats', v)} disabled={!userSettings} aria-label="Share statistics" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<User className="h-4 w-4 text-emerald-400/80" />}
            label="Public Profile"
            description="Allow others to see your focus achievements and streak."
            defaultValue="Off"
            onReset={() => setUserSetting('publicProfile', false)}
          >
            <Switch checked={userSettings?.publicProfile ?? false} onCheckedChange={(v) => setUserSetting('publicProfile', v)} disabled={!userSettings} aria-label="Public profile" />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Focus ───

function SettingsFocus({
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Focus" description="Configure your focus session defaults and goals." sectionId="focus" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Zap className="h-4 w-4 text-emerald-400/80" />}
            label="Default Focus Duration"
            description="Default timer length for new focus sessions."
            defaultValue="25 min"
            onReset={() => setUserSetting('defaultFocusDuration', 25)}
          >
            <Select value={String(userSettings?.defaultFocusDuration ?? 25)} onValueChange={(v) => setUserSetting('defaultFocusDuration', parseInt(v, 10))} disabled={!userSettings}>
              <SelectTrigger className="w-[100px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="Default focus duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="15" className="text-zinc-200 focus:text-zinc-100">15 min</SelectItem>
                <SelectItem value="25" className="text-zinc-200 focus:text-zinc-100">25 min</SelectItem>
                <SelectItem value="45" className="text-zinc-200 focus:text-zinc-100">45 min</SelectItem>
                <SelectItem value="60" className="text-zinc-200 focus:text-zinc-100">60 min</SelectItem>
                <SelectItem value="90" className="text-zinc-200 focus:text-zinc-100">90 min</SelectItem>
                <SelectItem value="120" className="text-zinc-200 focus:text-zinc-100">120 min</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Target className="h-4 w-4 text-emerald-400/80" />}
            label="Daily Focus Goal"
            description="Target minutes of deep focus per day."
            defaultValue="2 hours"
            onReset={() => setUserSetting('focusGoalMinutes', 120)}
          >
            <Select value={String(userSettings?.focusGoalMinutes ?? 120)} onValueChange={(v) => setUserSetting('focusGoalMinutes', parseInt(v, 10))} disabled={!userSettings}>
              <SelectTrigger className="w-[100px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="Daily focus goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="60" className="text-zinc-200 focus:text-zinc-100">1 hour</SelectItem>
                <SelectItem value="120" className="text-zinc-200 focus:text-zinc-100">2 hours</SelectItem>
                <SelectItem value="180" className="text-zinc-200 focus:text-zinc-100">3 hours</SelectItem>
                <SelectItem value="240" className="text-zinc-200 focus:text-zinc-100">4 hours</SelectItem>
                <SelectItem value="360" className="text-zinc-200 focus:text-zinc-100">6 hours</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Clock className="h-4 w-4 text-emerald-400/80" />}
            label="Auto-Start Timer"
            description="Automatically begin the timer when entering focus mode."
            defaultValue="Off"
            onReset={() => setUserSetting('autoStartTimer', false)}
          >
            <Switch checked={userSettings?.autoStartTimer ?? false} onCheckedChange={(v) => setUserSetting('autoStartTimer', v)} disabled={!userSettings} aria-label="Auto-start timer" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Sparkles className="h-4 w-4 text-emerald-400/80" />}
            label="Celebration Screen"
            description="Show an animated celebration after completing a focus session."
            defaultValue="On"
            onReset={() => setUserSetting('showCelebration', true)}
          >
            <Switch checked={userSettings?.showCelebration ?? true} onCheckedChange={(v) => setUserSetting('showCelebration', v)} disabled={!userSettings} aria-label="Show celebration screen" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Volume2 className="h-4 w-4 text-emerald-400/80" />}
            label="Ambient Sound"
            description="Background sound during focus sessions."
            defaultValue="None"
            onReset={() => setUserSetting('ambientSound', null)}
          >
            <Select value={userSettings?.ambientSound ?? 'none'} onValueChange={(v) => setUserSetting('ambientSound', v === 'none' ? null : v)} disabled={!userSettings}>
              <SelectTrigger className="w-[130px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="Ambient sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="none" className="text-zinc-200 focus:text-zinc-100">None</SelectItem>
                <SelectItem value="rain" className="text-zinc-200 focus:text-zinc-100">Rain</SelectItem>
                <SelectItem value="classical" className="text-zinc-200 focus:text-zinc-100">Classical</SelectItem>
                <SelectItem value="deep_focus" className="text-zinc-200 focus:text-zinc-100">Deep Focus</SelectItem>
                <SelectItem value="white_noise" className="text-zinc-200 focus:text-zinc-100">White Noise</SelectItem>
                <SelectItem value="nature" className="text-zinc-200 focus:text-zinc-100">Nature</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Notifications ───

function SettingsNotifications({
  userSettings,
  setUserSetting,
  desktopSettings,
  saveDesktopSetting,
  onResetSection,
}: {
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  desktopSettings: DesktopSettingsData | null;
  saveDesktopSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Notifications" description="Choose which notifications you want to receive." sectionId="notifications" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Bell className="h-4 w-4 text-emerald-400/80" />}
            label="Desktop Notifications"
            description="Show system notifications on your desktop."
            defaultValue="On"
            onReset={() => setUserSetting('desktopNotifications', true)}
          >
            <Switch checked={userSettings?.desktopNotifications ?? true} onCheckedChange={(v) => setUserSetting('desktopNotifications', v)} disabled={!userSettings} aria-label="Desktop notifications" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Clock className="h-4 w-4 text-emerald-400/80" />}
            label="Break Reminders"
            description="Remind you to take breaks after long focus sessions."
            defaultValue="On"
            onReset={() => setUserSetting('breakReminders', true)}
          >
            <Switch checked={userSettings?.breakReminders ?? true} onCheckedChange={(v) => setUserSetting('breakReminders', v)} disabled={!userSettings} aria-label="Break reminders" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Target className="h-4 w-4 text-emerald-400/80" />}
            label="Mission Reminders"
            description="Get notified about your active missions."
            defaultValue="On"
            onReset={() => setUserSetting('missionReminders', true)}
          >
            <Switch checked={userSettings?.missionReminders ?? true} onCheckedChange={(v) => setUserSetting('missionReminders', v)} disabled={!userSettings} aria-label="Mission reminders" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Sparkles className="h-4 w-4 text-emerald-400/80" />}
            label="Streak Milestones"
            description="Celebrate when you hit consecutive focus-day streaks."
            defaultValue="On"
            onReset={() => setUserSetting('streakReminders', true)}
          >
            <Switch checked={userSettings?.streakReminders ?? true} onCheckedChange={(v) => setUserSetting('streakReminders', v)} disabled={!userSettings} aria-label="Streak milestones" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Zap className="h-4 w-4 text-emerald-400/80" />}
            label="Achievement Alerts"
            description="Notify when you unlock a new achievement."
            defaultValue="On"
            onReset={() => setUserSetting('achievementAlerts', true)}
          >
            <Switch checked={userSettings?.achievementAlerts ?? true} onCheckedChange={(v) => setUserSetting('achievementAlerts', v)} disabled={!userSettings} aria-label="Achievement alerts" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<EyeOff className="h-4 w-4 text-amber-400" />}
            iconBg="bg-amber-500/[0.08]"
            label="Idle Alerts"
            description="Warn when you&apos;ve been idle for an extended period."
            defaultValue="On"
            onReset={() => setUserSetting('idleAlerts', true)}
          >
            <Switch checked={userSettings?.idleAlerts ?? true} onCheckedChange={(v) => setUserSetting('idleAlerts', v)} disabled={!userSettings} aria-label="Idle alerts" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Bell className="h-4 w-4 text-red-400" />}
            iconBg="bg-red-500/[0.08]"
            label="Mute All"
            description="Suppress all desktop notifications from MindGuard."
            defaultValue="Off"
            onReset={() => saveDesktopSetting('muteNotifications', false)}
          >
            <Switch checked={desktopSettings?.muteNotifications ?? false} onCheckedChange={(v) => saveDesktopSetting('muteNotifications', v)} disabled={!desktopSettings} aria-label="Mute all notifications" />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Keyboard ───

function SettingsKeyboard({
  showShortcuts,
  setShowShortcuts,
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  const saveCustomShortcuts = useCallback(async (overrides: Record<string, string>) => {
    await setUserSetting('customShortcuts', overrides);
  }, [setUserSetting]);

  const handleImportShortcuts = useCallback((text: string) => {
    try {
      const data = JSON.parse(text);
      const result = shortcutManager.importConfig(data);
      if (result.success) {
        toast.success('Shortcuts imported');
        saveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
      } else {
        toast.error(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch {
      toast.error('Invalid shortcuts file');
    }
  }, [saveCustomShortcuts]);

  // Get all navigation shortcut definitions for the quick reference
  const navDefs = shortcutManager.getByCategory('navigation');

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Keyboard" description="Navigate faster with keyboard commands." sectionId="keyboard" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <SettingRow
            icon={<Keyboard className="h-4 w-4 text-emerald-400/80" />}
            label="Keyboard Shortcuts"
            description="View, customize, and manage all keyboard shortcuts."
          >
            <Button onClick={() => setShowShortcuts(true)} variant="outline" aria-label="View all keyboard shortcuts" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" size="sm">
              View & Customize
            </Button>
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">Quick Reference</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {navDefs.map((def) => {
              const combo = shortcutManager.getResolvedCombo(def.id) ?? def.defaultCombo;
              const displayKeys = formatComboForDisplay(combo);
              return (
                <div key={def.id} className="flex flex-col items-center gap-1.5 rounded-lg bg-white/[0.02] py-2.5" aria-label={`${def.label}: ${displayKeys.join('+')}`}>
                  <kbd className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-medium text-zinc-400" aria-hidden="true">
                    {displayKeys.join('+')}
                  </kbd>
                  <span className="text-[10px] text-zinc-600">{def.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <SettingRow
            icon={<MessageSquare className="h-4 w-4 text-emerald-400/80" />}
            label="Custom Shortcuts"
            description="Create your own key bindings for navigation and actions."
          >
            <Button onClick={() => setShowShortcuts(true)} variant="outline" aria-label="Customize shortcuts" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" size="sm">
              Customize
            </Button>
          </SettingRow>
        </CardContent>
      </Card>

      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onSaveCustomShortcuts={saveCustomShortcuts}
        customShortcuts={userSettings?.customShortcuts ?? null}
      />
    </div>
  );
}

// ─── Section: AI Coach ───

function SettingsAICoach({
  userSettings,
  setUserSetting,
  onResetSection,
}: {
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  onResetSection: (sectionId: SectionId) => void;
}) {
  const [showApiKey, setShowApiKey] = useState(false);

  const provider = userSettings?.aiProvider ?? 'z-ai';
  const apiKey = userSettings?.aiApiKey ?? '';
  const model = userSettings?.aiModel ?? '';
  const personality = userSettings?.coachPersonality ?? 'friendly';
  const ollamaUrl = userSettings?.aiOllamaUrl ?? '';

  // Model options per provider
  const modelOptions: Record<string, string[]> = {
    'z-ai': ['default'],
    'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    'deepseek': ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    'openrouter': ['auto', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'meta-llama/llama-3-70b'],
    'gemini': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    'anthropic': ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    'ollama': ['custom'],
  };

  const personalityDescriptions = {
    strict: 'Direct, disciplined, and tough. Pushes you hard and holds you accountable.',
    friendly: 'Warm, supportive, and encouraging. Celebrates wins and helps gently.',
    data_nerd: 'Analytical and insight-driven. Focuses on patterns, trends, and numbers.',
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="AI Coach" description="Configure your AI productivity coach." sectionId="ai-coach" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <SettingRow
            icon={<Brain className="h-4 w-4 text-emerald-400/80" />}
            label="AI Provider"
            description="Choose which AI service powers your coach."
            defaultValue="z-ai (built-in)"
            onReset={() => setUserSetting('aiProvider', 'z-ai')}
          >
            <Select value={provider} onValueChange={(v) => setUserSetting('aiProvider', v)} disabled={!userSettings}>
              <SelectTrigger className="w-[140px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="AI Provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                <SelectItem value="z-ai" className="text-zinc-200 focus:text-zinc-100">z-ai (Built-in)</SelectItem>
                <SelectItem value="openai" className="text-zinc-200 focus:text-zinc-100">OpenAI</SelectItem>
                <SelectItem value="deepseek" className="text-zinc-200 focus:text-zinc-100">DeepSeek</SelectItem>
                <SelectItem value="openrouter" className="text-zinc-200 focus:text-zinc-100">OpenRouter</SelectItem>
                <SelectItem value="gemini" className="text-zinc-200 focus:text-zinc-100">Gemini</SelectItem>
                <SelectItem value="anthropic" className="text-zinc-200 focus:text-zinc-100">Anthropic</SelectItem>
                <SelectItem value="ollama" className="text-zinc-200 focus:text-zinc-100">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />

          {/* API Key — shown only for external providers */}
          {provider !== 'z-ai' && (
            <>
              <SettingRow
                icon={<Shield className="h-4 w-4 text-emerald-400/80" />}
                label="API Key"
                description={`API key for ${provider}. Stored securely and never shared.`}
                onReset={() => setUserSetting('aiApiKey', null)}
              >
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey ?? ''}
                    onChange={(e) => setUserSetting('aiApiKey', e.target.value)}
                    placeholder="Enter API key..."
                    className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 text-xs h-8 w-[180px]"
                    aria-label="API Key"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </SettingRow>
              <Separator className="bg-white/[0.04]" />
            </>
          )}

          {/* Model selection */}
          <SettingRow
            icon={<Sparkles className="h-4 w-4 text-emerald-400/80" />}
            label="AI Model"
            description="Select which model variant to use."
            defaultValue="Default"
            onReset={() => setUserSetting('aiModel', null)}
          >
            <Select value={model || 'default'} onValueChange={(v) => setUserSetting('aiModel', v === 'default' ? null : v)} disabled={!userSettings}>
              <SelectTrigger className="w-[160px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8" aria-label="AI Model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-zinc-900">
                {(modelOptions[provider] ?? ['default']).map((m) => (
                  <SelectItem key={m} value={m} className="text-zinc-200 focus:text-zinc-100">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />

          {/* Coach personality */}
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-2">Coach Personality</p>
            <p className="text-xs text-zinc-500 mb-3">How your AI coach talks to you.</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Coach personality">
              {(['strict', 'friendly', 'data_nerd'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setUserSetting('coachPersonality', p)}
                  role="radio"
                  aria-checked={personality === p}
                  aria-label={`Set personality to ${p}`}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-xs transition-all text-left',
                    personality === p
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300'
                  )}
                >
                  <span className="font-medium capitalize">{p === 'data_nerd' ? 'Data Nerd' : p}</span>
                  <span className="text-[10px] leading-snug text-zinc-600">{personalityDescriptions[p]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ollama URL — shown only for Ollama */}
          {provider === 'ollama' && (
            <>
              <Separator className="bg-white/[0.04]" />
              <SettingRow
                icon={<Monitor className="h-4 w-4 text-emerald-400/80" />}
                label="Ollama URL"
                description="URL for your self-hosted Ollama server."
                defaultValue="http://localhost:11434"
                onReset={() => setUserSetting('aiOllamaUrl', null)}
              >
                <Input
                  value={ollamaUrl ?? ''}
                  onChange={(e) => setUserSetting('aiOllamaUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                  className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 text-xs h-8 w-[180px]"
                  aria-label="Ollama URL"
                />
              </SettingRow>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Advanced ───

function SettingsAdvanced({
  userSettings,
  setUserSetting,
  handleExportData,
  exporting,
  handleExportSettings,
  handleImportSettings,
  handleResetAllSettings,
  onResetSection,
}: {
  userSettings: UserSettingsData | null;
  setUserSetting: (key: string, value: unknown) => Promise<void>;
  handleExportData: () => Promise<void>;
  exporting: boolean;
  handleExportSettings: () => void;
  handleImportSettings: () => void;
  handleResetAllSettings: () => void;
  onResetSection: (sectionId: SectionId) => void;
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showApiLogs, setShowApiLogs] = useState(false);
  const [showReactInfo, setShowReactInfo] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Advanced" description="Developer tools and data management." sectionId="advanced" onResetSection={onResetSection} />

      {/* Developer Options */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Developer Options</h4>
          </div>
          <SettingRow
            icon={<Bug className="h-4 w-4 text-emerald-400/80" />}
            label="Debug Mode"
            description="Show additional logging and debug information in the UI."
            defaultValue="Off"
            onReset={() => setUserSetting('debugMode', false)}
          >
            <Switch checked={userSettings?.debugMode ?? false} onCheckedChange={(v) => setUserSetting('debugMode', v)} disabled={!userSettings} aria-label="Debug mode" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Code2 className="h-4 w-4 text-emerald-400/80" />}
            label="Show API Logs"
            description="Display API request/response logs in the console."
            defaultValue="Off"
            onReset={() => setShowApiLogs(false)}
          >
            <Switch checked={showApiLogs} onCheckedChange={setShowApiLogs} aria-label="Show API logs" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Info className="h-4 w-4 text-emerald-400/80" />}
            label="React DevTools Info"
            description="Show React component hierarchy and debug info."
            defaultValue="Off"
            onReset={() => setShowReactInfo(false)}
          >
            <Switch checked={showReactInfo} onCheckedChange={setShowReactInfo} aria-label="React DevTools info" />
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Database className="h-4 w-4 text-emerald-400/80" />}
            label="Clear Local Cache"
            description="Remove cached data from local storage."
          >
            <Button
              onClick={() => {
                try {
                  localStorage.clear();
                  toast.success('Local cache cleared');
                } catch {
                  toast.error('Failed to clear cache');
                }
              }}
              variant="outline"
              className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
              size="sm"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<RefreshCcw className="h-4 w-4 text-emerald-400/80" />}
            label="Force Sync"
            description="Force immediate data synchronization with the server."
          >
            <Button
              onClick={() => {
                toast.success('Sync triggered — refreshing data...');
                window.location.reload();
              }}
              variant="outline"
              className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
              size="sm"
            >
              <RefreshCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Sync Now
            </Button>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Data Management</h4>
          </div>
          <SettingRow
            icon={<Download className="h-4 w-4 text-emerald-400/80" />}
            label="Export Data"
            description="Download all your missions, sessions, and reflections as JSON."
          >
            <Button onClick={handleExportData} disabled={exporting} variant="outline" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" size="sm" aria-label="Export data">
              {exporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="mr-2 h-3.5 w-3.5" aria-hidden="true" />}
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Upload className="h-4 w-4 text-emerald-400/80" />}
            label="Export Settings"
            description="Download all your settings configuration as JSON."
          >
            <Button onClick={handleExportSettings} variant="outline" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" size="sm" aria-label="Export settings">
              <Download className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Export
            </Button>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Upload className="h-4 w-4 text-emerald-400/80" />}
            label="Import Settings"
            description="Upload settings from a previously exported JSON file."
          >
            <Button onClick={handleImportSettings} variant="outline" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" size="sm" aria-label="Import settings">
              <Upload className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Import
            </Button>
          </SettingRow>
          <Separator className="bg-white/[0.04]" />
          <SettingRow
            icon={<Trash2 className="h-4 w-4 text-red-400" />}
            iconBg="bg-red-500/[0.08]"
            iconColor="text-red-400"
            label="Reset All Settings"
            description="Reset all settings to their factory defaults."
          >
            {!showResetConfirm ? (
              <Button onClick={() => setShowResetConfirm(true)} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/[0.06] hover:text-red-300" size="sm" aria-label="Reset all settings">
                <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={() => { handleResetAllSettings(); setShowResetConfirm(false); }} className="bg-red-500 text-white hover:bg-red-600" size="sm" aria-label="Confirm reset all settings">
                  Confirm
                </Button>
                <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="border-white/[0.08] text-zinc-300" size="sm" aria-label="Cancel reset">
                  Cancel
                </Button>
              </div>
            )}
          </SettingRow>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03]" aria-hidden="true">
              <Info className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Version Info</p>
              <p className="text-xs text-zinc-500 mt-0.5">MindGuard v4.2 · Desktop Agent · Next.js 16 · Prisma</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: About ───

function SettingsAbout({ onResetSection }: { onResetSection: (sectionId: SectionId) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="About" description="Learn more about MindGuard." sectionId="about" onResetSection={onResetSection} />

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 ring-1 ring-emerald-500/10 shrink-0" aria-hidden="true">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100">MindGuard AI</p>
              <p className="mt-0.5 text-xs text-zinc-500">Your Attention Operating System</p>
              <p className="mt-1 text-[10px] text-zinc-700">Version 4.2 · Built with Next.js, Electron & Prisma</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Globe className="h-4 w-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-zinc-200">Website</p>
            </div>
            <a href="https://mindguard.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
              mindguard.ai <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
          <Separator className="bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Heart className="h-4 w-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-zinc-200">GitHub</p>
            </div>
            <a href="https://github.com/abdul-rehman-s/mindguard" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
              Open Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
          <Separator className="bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Shield className="h-4 w-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-zinc-200">Privacy Policy</p>
            </div>
            <a href="https://mindguard.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
              View Policy <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-zinc-700 py-2">Made with ❤️ for focused minds everywhere.</p>
    </div>
  );
}

// ─── Main SettingsView ───

export function SettingsView() {
  const setUser = useAppStore(s => s.setUser);
  const setView = useAppStore(s => s.setView);
  const setSidebarCollapsed = useAppStore(s => s.setSidebarCollapsed);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<SectionId>('general');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User settings state
  const [userSettings, setUserSettingsState] = useState<UserSettingsData | null>(null);
  const [desktopSettings, setDesktopSettingsState] = useState<DesktopSettingsData | null>(null);

  // Search results
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchIndex.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q))
    );
  }, [searchQuery]);

  // Highlight matched text
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const q = query.toLowerCase();
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q ? <span key={i} className="text-emerald-400 font-medium">{part}</span> : part
    );
  }, []);

  // Fetch profile settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDisplayName(data.displayName || '');
    } catch {
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/user-settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setUserSettingsState(data as UserSettingsData);
      // Apply sidebar collapsed state from settings
      setSidebarCollapsed(data.sidebarCollapsed ?? false);
    } catch {
      toast.error('Failed to load user settings');
    }
  }, [setSidebarCollapsed]);

  const fetchDesktopSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/desktop/settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDesktopSettingsState(data as DesktopSettingsData);
    } catch {
      // Desktop settings may not exist, silently fail
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchUserSettings(), fetchDesktopSettings()]);
  }, [fetchSettings, fetchUserSettings, fetchDesktopSettings]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setSaved(true);
      toast.success('Profile updated');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const setUserSetting = async (key: string, value: unknown) => {
    try {
      const res = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setUserSettingsState(updated as UserSettingsData);
      // Apply sidebar collapsed state change
      if (key === 'sidebarCollapsed') {
        setSidebarCollapsed(updated.sidebarCollapsed ?? false);
      }
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const saveDesktopSetting = async (key: string, value: unknown) => {
    try {
      const res = await fetch('/api/desktop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setDesktopSettingsState(updated as DesktopSettingsData);
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [missionsRes, sessionsRes, reflectionsRes] = await Promise.all([
        fetch('/api/missions'),
        fetch('/api/sessions?limit=1000'),
        fetch('/api/reflections'),
      ]);
      const missions = await missionsRes.json();
      const sessionsData = await sessionsRes.json();
      const reflectionsData = await reflectionsRes.json();
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: { name: session?.user?.name, email: session?.user?.email },
        missions: Array.isArray(missions) ? missions : [],
        sessions: sessionsData.sessions || sessionsData || [],
        reflections: reflectionsData.reflections || reflectionsData || [],
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindguard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully', { description: 'Your data has been downloaded as JSON.' });
    } catch {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSettings = () => {
    if (!userSettings) return;
    const blob = new Blob([JSON.stringify(userSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindguard-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported');
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Apply imported settings via the API
        const res = await fetch('/api/user-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to import');
        const updated = await res.json();
        setUserSettingsState(updated as UserSettingsData);
        toast.success('Settings imported successfully');
      } catch {
        toast.error('Failed to import settings — invalid file format');
      }
    };
    input.click();
  };

  const handleResetAllSettings = async () => {
    try {
      const res = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'en',
          timezone: null,
          theme: 'dark',
          sidebarCollapsed: false,
          compactMode: false,
          defaultFocusDuration: 25,
          focusGoalMinutes: 120,
          autoStartTimer: false,
          showCelebration: true,
          ambientSound: null,
          desktopNotifications: true,
          breakReminders: true,
          missionReminders: true,
          streakReminders: true,
          achievementAlerts: true,
          idleAlerts: true,
          shareStats: false,
          publicProfile: false,
          customShortcuts: null,
          debugMode: false,
          dataExportEnabled: true,
          aiProvider: 'z-ai',
          aiApiKey: null,
          aiModel: null,
          aiOllamaUrl: null,
          coachPersonality: 'friendly',
        }),
      });
      if (!res.ok) throw new Error('Failed to reset');
      const updated = await res.json();
      setUserSettingsState(updated as UserSettingsData);
      setSidebarCollapsed(false);
      setTheme('dark');
      toast.success('All settings reset to defaults');
    } catch {
      toast.error('Failed to reset settings');
    }
  };

  // Section reset handler
  const handleResetSection = useCallback(async (sectionId: SectionId) => {
    const sectionDefaults: Record<SectionId, Record<string, unknown>> = {
      general: { language: 'en', timezone: null },
      account: {}, // No resetable settings in account
      appearance: { theme: 'dark', sidebarCollapsed: false, compactMode: false },
      desktop: {}, // Desktop settings have their own reset per-setting
      tracking: {}, // Same
      privacy: { shareStats: false, publicProfile: false },
      focus: { defaultFocusDuration: 25, focusGoalMinutes: 120, autoStartTimer: false, showCelebration: true, ambientSound: null },
      notifications: { desktopNotifications: true, breakReminders: true, missionReminders: true, streakReminders: true, achievementAlerts: true, idleAlerts: true },
      keyboard: { customShortcuts: null },
      'ai-coach': { aiProvider: 'z-ai', aiApiKey: null, aiModel: null, aiOllamaUrl: null, coachPersonality: 'friendly' },
      advanced: { debugMode: false },
      about: {},
    };

    const defaults = sectionDefaults[sectionId];
    if (!defaults || Object.keys(defaults).length === 0) {
      toast.info('This section has no resetable settings');
      return;
    }

    try {
      const res = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaults),
      });
      if (!res.ok) throw new Error('Failed to reset section');
      const updated = await res.json();
      setUserSettingsState(updated as UserSettingsData);
      if (sectionId === 'appearance') {
        setTheme('dark');
        setSidebarCollapsed(false);
      }
      toast.success(`${sections.find(s => s.id === sectionId)?.label} settings reset to defaults`);
    } catch {
      toast.error('Failed to reset section');
    }
  }, [setSidebarCollapsed, setTheme]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setView('landing');
  };

  // Search shortcut: Cmd+F or Ctrl+F within settings opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !isInputElement(e.target)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" aria-label="Loading settings" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <SettingsGeneral displayName={displayName} setDisplayName={setDisplayName} saving={saving} saved={saved} handleSaveProfile={handleSaveProfile} error={error} userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'account':
        return <SettingsAccount session={session} handleSignOut={handleSignOut} handleExportData={handleExportData} exporting={exporting} onResetSection={handleResetSection} />;
      case 'appearance':
        return <SettingsAppearance theme={theme} setTheme={setTheme} userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'desktop':
        return <SettingsDesktop onResetSection={handleResetSection} />;
      case 'tracking':
        return <SettingsTracking onResetSection={handleResetSection} />;
      case 'privacy':
        return <SettingsPrivacy desktopSettings={desktopSettings} saveDesktopSetting={saveDesktopSetting} userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'focus':
        return <SettingsFocus userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'notifications':
        return <SettingsNotifications userSettings={userSettings} setUserSetting={setUserSetting} desktopSettings={desktopSettings} saveDesktopSetting={saveDesktopSetting} onResetSection={handleResetSection} />;
      case 'keyboard':
        return <SettingsKeyboard showShortcuts={showShortcuts} setShowShortcuts={setShowShortcuts} userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'ai-coach':
        return <SettingsAICoach userSettings={userSettings} setUserSetting={setUserSetting} onResetSection={handleResetSection} />;
      case 'advanced':
        return <SettingsAdvanced userSettings={userSettings} setUserSetting={setUserSetting} handleExportData={handleExportData} exporting={exporting} handleExportSettings={handleExportSettings} handleImportSettings={handleImportSettings} handleResetAllSettings={handleResetAllSettings} onResetSection={handleResetSection} />;
      case 'about':
        return <SettingsAbout onResetSection={handleResetSection} />;
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Header with Search */}
      <motion.div variants={staggerItem} className="mb-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Settings</h2>
            <p className="mt-1.5 text-sm text-zinc-500">Manage your account, preferences, and desktop tracker.</p>
          </div>
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
            aria-label="Search settings"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Search settings...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.03] px-1.5 text-[10px] font-medium text-zinc-500 ml-1">⌘F</kbd>
          </button>
        </div>
      </motion.div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" aria-hidden="true" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings by name, description, or keyword..."
              className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 pl-10 h-10"
              aria-label="Search settings"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 items-center rounded border border-white/[0.08] bg-white/[0.03] px-1.5 text-[10px] font-medium text-zinc-500"
              aria-label="Close search"
            >
              ESC
            </button>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mt-2 rounded-lg border border-white/[0.06] bg-zinc-900/95 backdrop-blur-sm shadow-lg max-h-[300px] overflow-y-auto">
              {filteredSettings.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">No settings found for "{searchQuery}"</div>
              ) : (
                <div className="p-2">
                  {filteredSettings.map((s) => {
                    const sec = sections.find(sec => sec.id === s.sectionId);
                    const Icon = sec?.icon ?? Settings;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setActiveSection(s.sectionId); setSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                        aria-label={`Go to ${s.label} setting`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-200">{highlightText(s.label, searchQuery)}</p>
                          <p className="text-xs text-zinc-500 truncate">{highlightText(s.description, searchQuery)}</p>
                        </div>
                        <Badge variant="outline" className="border-white/[0.06] text-zinc-500 text-[10px] shrink-0">{sec?.label}</Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <motion.div variants={staggerItem}>
        {/* Mobile section selector */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-200"
            aria-label="Select settings section"
            aria-expanded={mobileMenuOpen}
          >
            {(() => {
              const sec = sections.find(s => s.id === activeSection);
              const Icon = sec?.icon ?? Settings;
              return <><Icon className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" /><span>{sec?.label ?? 'Settings'}</span></>;
            })()}
            <ChevronDown className={cn('h-4 w-4 text-zinc-500 ml-auto transition-transform', mobileMenuOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {mobileMenuOpen && (
            <div className="mt-1 rounded-lg border border-white/[0.06] bg-zinc-900/95 backdrop-blur-sm shadow-lg overflow-hidden">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => { setActiveSection(sec.id); setMobileMenuOpen(false); }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors',
                      activeSection === sec.id ? 'text-emerald-400 bg-emerald-500/[0.06]' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                    )}
                    aria-label={`Go to ${sec.label} settings`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop: Left nav + Right content */}
        <div className="flex gap-6">
          {/* Left navigation */}
          <nav className="hidden lg:flex flex-col w-[200px] shrink-0" aria-label="Settings sections">
            <div className="flex flex-col gap-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left',
                      activeSection === sec.id
                        ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                    )}
                    aria-label={`Go to ${sec.label} settings`}
                    aria-current={activeSection === sec.id ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right content area */}
          <main className="flex-1 min-w-0 max-w-2xl">
            {renderSection()}
          </main>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Modal (kept at root level) */}
      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onSaveCustomShortcuts={async (overrides) => { await setUserSetting('customShortcuts', overrides); }}
        customShortcuts={userSettings?.customShortcuts ?? null}
      />
    </motion.div>
  );
}

// ─── Helper for input element detection ───

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

// ─── Import for shortcut display ───

function formatComboForDisplay(combo: { modifiers: string[]; key: string }): string[] {
  const parts: string[] = [];
  for (const mod of combo.modifiers) {
    switch (mod) {
      case 'cmd': parts.push('⌘'); break;
      case 'ctrl': parts.push('⌃'); break;
      case 'alt': parts.push('⌥'); break;
      case 'shift': parts.push('⇧'); break;
    }
  }
  let keyDisplay = combo.key;
  switch (combo.key) {
    case 'space': keyDisplay = 'Space'; break;
    case 'escape': keyDisplay = 'Esc'; break;
    default:
      if (combo.key.length === 1) keyDisplay = combo.key.toUpperCase();
  }
  parts.push(keyDisplay);
  return parts;
}
