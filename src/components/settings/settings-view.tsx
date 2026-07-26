'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  LogOut,
  Loader2,
  AlertCircle,
  Check,
  Shield,
  Download,
  Database,
  Bell,
  Monitor,
  Keyboard,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function SettingsView() {
  const setUser = useAppStore(s => s.setUser);
  const setView = useAppStore(s => s.setView);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" aria-label="Loading settings" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-10 pt-2">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Settings</h2>
        <p className="mt-1.5 text-sm text-zinc-500">Manage your account and preferences.</p>
      </motion.div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Profile</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-5">
                <Label htmlFor="settings-email" className="mb-1.5 text-xs font-medium text-zinc-400">Email</Label>
                <Input
                  id="settings-email"
                  value={session?.user?.email || ''}
                  disabled
                  aria-label="Email address (read-only)"
                  className="border-white/[0.06] bg-white/[0.02] text-zinc-500"
                />
              </div>
              <div className="mb-5">
                <Label htmlFor="settings-name" className="mb-1.5 text-xs font-medium text-zinc-400">Display Name</Label>
                <Input
                  id="settings-name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
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
        </motion.div>

        {/* Appearance */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Appearance</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                  <Monitor className="h-5 w-5 text-emerald-400/80" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-sm font-medium text-zinc-200">Theme</p>
                  <p className="mb-3 text-xs text-zinc-500">Choose your preferred color scheme.</p>
                  <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
                    {(['dark', 'light', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        aria-label={`Set theme to ${t}`}
                        role="radio"
                        aria-checked={theme === t}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          theme === t
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300'
                        }`}
                      >
                        {t === 'dark' && <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 ring-1 ring-zinc-700" aria-hidden="true" />}
                        {t === 'light' && <span className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-zinc-300" aria-hidden="true" />}
                        {t === 'system' && <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-zinc-900 to-white ring-1 ring-zinc-500" aria-hidden="true" />}
                        <span className="capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Keyboard className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Keyboard</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                  <Keyboard className="h-5 w-5 text-emerald-400/80" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-sm font-medium text-zinc-200">Keyboard Shortcuts</p>
                  <p className="mb-3 text-xs text-zinc-500">Navigate faster with keyboard commands.</p>
                </div>
                <Button
                  onClick={() => setShowShortcuts(true)}
                  variant="outline"
                  aria-label="View all keyboard shortcuts"
                  className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100 shrink-0"
                  size="sm"
                >
                  View All
                </Button>
              </div>
              {/* Quick reference */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {[
                  { key: 'D', label: 'Dashboard' },
                  { key: 'M', label: 'Missions' },
                  { key: 'T', label: 'Timer' },
                  { key: 'R', label: 'Reflect' },
                  { key: 'H', label: 'History' },
                  { key: 'S', label: 'Stats' },
                  { key: '⌘K', label: 'Search' },
                ].map((s) => (
                  <div key={s.key} className="flex flex-col items-center gap-1.5 rounded-lg bg-white/[0.02] py-2.5" aria-label={`${s.label}: ${s.key}`}>
                    <kbd className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-medium text-zinc-400" aria-hidden="true">
                      {s.key}
                    </kbd>
                    <span className="text-[10px] text-zinc-600">{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Data</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                  <Download className="h-5 w-5 text-emerald-400/80" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-sm font-medium text-zinc-200">Export Your Data</p>
                  <p className="mb-3 text-xs text-zinc-500">Download all your missions, sessions, and reflections as JSON.</p>
                </div>
                <Button
                  onClick={handleExportData}
                  disabled={exporting}
                  aria-label={exporting ? 'Exporting data' : 'Export data as JSON'}
                  variant="outline"
                  className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100 shrink-0"
                  size="sm"
                >
                  {exporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="mr-2 h-3.5 w-3.5" aria-hidden="true" />}
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications placeholder */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Notifications</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03]" aria-hidden="true">
                  <Bell className="h-5 w-5 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-sm font-medium text-zinc-200">Focus Reminders</p>
                  <p className="text-xs text-zinc-500">Get notified when it&apos;s time for your daily reflection.</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Coming Soon</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">About</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 ring-1 ring-emerald-500/10" aria-hidden="true">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-100">MindGuard AI</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Your Attention Operating System</p>
                  <p className="mt-1 text-[10px] text-zinc-700">Version 1.0.0 · Built with Next.js & Prisma</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account - Sign Out */}
        <motion.div variants={staggerItem}>
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Account</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">Sign Out</p>
                  <p className="mt-0.5 text-xs text-zinc-500">End your current session and return to the landing page.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  aria-label="Sign out of your account"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/[0.06] hover:text-red-300 hover:border-red-500/30 shrink-0"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </motion.div>
  );
}
