'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Timer, BookOpen, BarChart3, Shield, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';
import { registerSchema, loginSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';
import type { SafeUser } from '@/types';

const features = [
  {
    icon: Target,
    title: 'Mission System',
    description: 'One mission at a time. Deep focus on what truly matters.',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description: 'Track your deep work sessions with precision and clarity.',
  },
  {
    icon: BookOpen,
    title: 'Daily Reflection',
    description: 'Reflect, learn, and improve every single day.',
  },
  {
    icon: BarChart3,
    title: 'Smart Statistics',
    description: 'Understand your focus patterns with beautiful analytics.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function LandingPage() {
  const { setView, setUser } = useAppStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const validated = registerSchema.parse(formData);
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Registration failed');
        }
      } else {
        loginSchema.parse(formData);
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      const user: SafeUser = {
        id: 'temp',
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
      };
      setUser(user);
      setView('dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/[0.05] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex h-16 items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-100">
              MindGuard
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-zinc-200"
            onClick={() => {
              const el = document.getElementById('auth-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Sign In
          </Button>
        </motion.nav>

        {/* Hero */}
        <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center lg:py-28">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl"
          >
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Attention Operating System
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl"
            >
              Protect Your Attention.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              MindGuard AI is your premium Attention Operating System. Stay
              focused, track progress, and build better habits — one mission at
              a time.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 sm:w-auto"
                onClick={() => {
                  const el = document.getElementById('auth-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-zinc-400 hover:text-zinc-200 sm:w-auto"
                onClick={() => {
                  const el = document.getElementById('features-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features-section" className="pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Everything you need to stay focused
            </h2>
            <p className="text-zinc-400">
              A complete system designed for deep work and intentional living.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="group border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/50">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/15">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="mb-1.5 text-base font-semibold text-zinc-100">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Auth Form */}
        <section id="auth-section" className="pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-sm"
          >
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-zinc-100">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  {isSignUp
                    ? 'Start protecting your attention today.'
                    : 'Sign in to continue your journey.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="name" className="mb-1.5 text-xs font-medium text-zinc-400">
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                          required={isSignUp}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <Label htmlFor="email" className="mb-1.5 text-xs font-medium text-zinc-400">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="mb-1.5 text-xs font-medium text-zinc-400">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isSignUp ? 'Min. 8 characters' : '••••••••'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className="border-zinc-800 bg-zinc-800/50 pr-10 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      'mt-1 w-full bg-emerald-500 text-white hover:bg-emerald-600',
                      loading && 'opacity-70'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : isSignUp ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <p className="text-center text-xs text-zinc-500">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                      }}
                      className="font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-6 text-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MindGuard AI. Protect your attention.
          </p>
        </footer>
      </div>
    </div>
  );
}
