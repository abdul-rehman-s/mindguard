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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function SettingsView() {
  const { setUser, setView } = useAppStore();
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDisplayName(data.displayName || '');
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-500">Manage your account and preferences.</p>
      </motion.div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <motion.div variants={item}>
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-medium text-zinc-200">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label htmlFor="settings-email" className="mb-1.5 text-xs font-medium text-zinc-400">
                  Email
                </Label>
                <Input
                  id="settings-email"
                  value={session?.user?.email || ''}
                  disabled
                  className="border-zinc-800 bg-zinc-800/30 text-zinc-500"
                />
              </div>
              <div>
                <Label htmlFor="settings-name" className="mb-1.5 text-xs font-medium text-zinc-400">
                  Display Name
                </Label>
                <Input
                  id="settings-name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : saved ? (
                    <Check className="mr-2 h-3.5 w-3.5" />
                  ) : null}
                  {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
                </Button>
                {error && <span className="text-xs text-red-400">{error}</span>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme */}
        <motion.div variants={item}>
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-medium text-zinc-200">Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="mb-1.5 text-xs font-medium text-zinc-400">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-48 border-zinc-800 bg-zinc-800/50 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-900">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div variants={item}>
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-500" />
                <CardTitle className="text-sm font-medium text-zinc-200">Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
