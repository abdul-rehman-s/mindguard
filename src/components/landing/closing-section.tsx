'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MindGuardHeroLogo, MindGuardLogo } from '@/components/branding/mindguard-logo';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── CLOSING SECTION — The final invitation ─── */
/* ═══════════════════════════════════════════════════════════════════ */

interface ClosingSectionProps {
  onBegin: () => void;
}

export function ClosingSection({ onBegin }: ClosingSectionProps) {
  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative">
      {/* ═══ THE INVITATION ═══ */}
      <section className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-5xl lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: APPLE_EASE }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/30 bg-gradient-to-br from-emerald-950/30 via-zinc-900/60 to-teal-950/20 px-8 py-20 text-center backdrop-blur-md sm:px-12 sm:py-28 lg:px-20">
              {/* Decorative glows */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-[30%] rounded-full bg-emerald-500/[0.08] blur-[100px]" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/[0.04] blur-[60px]" />
              <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 -translate-x-1/4 translate-y-1/4 rounded-full bg-emerald-500/[0.03] blur-[40px]" />

              <div className="relative z-10">
                <MindGuardHeroLogo className="mx-auto mb-8" />

                <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[4rem] leading-[1.05]">
                  Stop managing your time.
                  <br />
                  <span className="gradient-text">Start mastering your focus.</span>
                </h2>

                <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg">
                  Join 10,000+ focused professionals who&apos;ve already transformed how they work. Free forever. No credit card.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5 justify-center">
                  <Button
                    size="lg"
                    className="cta-primary cursor-pointer group h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={onBegin}
                  >
                    Begin your journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
                  {[
                    { icon: Zap, text: '30 seconds' },
                    { icon: Shield, text: 'No credit card' },
                    { icon: Brain, text: 'AI coach included' },
                  ].map(({ icon: FeatureIcon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <FeatureIcon className="h-3 w-3 text-emerald-500/50" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-auto border-t border-zinc-800/20 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            {/* Brand */}
            <MindGuardLogo size="xs" showText={true} />

            {/* Links */}
            <div className="flex items-center gap-5">
              {[
                { label: 'Features', id: 'features-section' },
                { label: 'Pricing', id: 'pricing-section' },
                { label: 'FAQ', id: 'faq-section' },
              ].map((link) => (
                <button
                  key={link.label}
                  type="button"
                  className="cursor-pointer text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} MindGuard AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
