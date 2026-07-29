'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check } from 'lucide-react';

// ─── Brand-style SVG Icons ───────────────────────────────────────────────
// These are stylized category representations, not exact brand logos.
// Each has a distinct shape and brand-hinting color for quick recognition.

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="4" fill="currentColor" opacity="0.15" />
      <polygon points="10,8 10,16 16,12" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12V4a3 3 0 0 1 3-3h1v8a3 3 0 0 1-3 3H9z" />
      <path d="M12 9v9a4 4 0 0 1-4 4 4 4 0 0 1-4-4" strokeLinecap="round" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 4.5c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3zm5 0c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3z" opacity="0.9" />
      <path d="M18.3 5.7c-1.4-.6-2.9-1-4.5-1.2l-.2.4c1.5.3 2.9.8 4.2 1.5-1.8-.9-3.8-1.4-5.8-1.4s-4 .5-5.8 1.4c1.3-.7 2.7-1.2 4.2-1.5l-.2-.4c-1.6.2-3.1.6-4.5 1.2-2.3 3.9-2.9 7.7-2.6 11.5 1.5 1.1 3 1.8 4.5 2.2l.5-.7c-1.3-.5-2.5-1.1-3.6-2 .3.2.6.4.9.5 2.7 1.3 5.8 1.7 8.9.7.6-.2 1.2-.4 1.7-.7.3-.1.6-.3.9-.5-1.1.9-2.3 1.5-3.6 2l.5.7c1.5-.4 3-1.1 4.5-2.2.3-3.8-.3-7.6-2.6-11.5z" opacity="0.7" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" opacity="0.8" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8.5" cy="14" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14" r="1.5" fill="currentColor" />
      <path d="M9 17c1.5 1 3 1 6 0" strokeLinecap="round" />
      <circle cx="17" cy="6" r="2" />
      <path d="M17 8L12 12" strokeLinecap="round" />
    </svg>
  );
}

function SteamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="14" r="5" />
      <path d="M12 9v-2" strokeLinecap="round" />
      <path d="M10 7h4" strokeLinecap="round" />
      <path d="M7 18l-2-1" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21l1.5-4.5A9 9 0 1 1 12 21a9 9 0 0 1-4.5-1.2L3 21z" />
      <path d="M8 14c.5-.5 1.5-.5 2 0s1.5.5 2 0" strokeLinecap="round" />
    </svg>
  );
}

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="20" y1="17" x2="14.5" y2="14" />
      <line x1="4" y1="17" x2="9.5" y2="14" />
    </svg>
  );
}

function VSCodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 5l10 7-10 7V5z" strokeLinejoin="round" />
      <path d="M3 2l4 3v14l-4 3V2z" strokeLinejoin="round" />
      <path d="M17 9l4-3v12l-4-3V9z" strokeLinejoin="round" />
    </svg>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M7 10c3-1.5 7-1.5 10 0" strokeLinecap="round" />
      <path d="M8 13c2.5-1 6-1 8.5 0" strokeLinecap="round" />
      <path d="M9 16c2-.8 4.5-.8 6.5 0" strokeLinecap="round" />
    </svg>
  );
}

function NetflixIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="2" width="4" height="20" rx="1" opacity="0.9" />
      <rect x="16" y="2" width="4" height="20" rx="1" opacity="0.9" />
      <path d="M8 2l8 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 22L16 2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <path d="M7 7h.01" strokeLinecap="round" />
      <line x1="7" y1="11" x2="7" y2="17" strokeLinecap="round" />
      <path d="M11 11v6" strokeLinecap="round" />
      <path d="M11 14a3 3 0 0 1 6 0v3" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
      <line x1="20" y1="4" x2="4" y2="20" strokeLinecap="round" />
    </svg>
  );
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="2" width="6" height="6" rx="2" />
      <rect x="2" y="9" width="6" height="6" rx="2" />
      <rect x="9" y="16" width="6" height="6" rx="2" />
      <rect x="16" y="9" width="6" height="6" rx="2" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 5 10-5" />
    </svg>
  );
}

function MeetingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    </svg>
  );
}

function GamingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 12h4M8 10v4" strokeLinecap="round" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
      <circle cx="19" cy="13" r="1" fill="currentColor" />
      <path d="M2 17c0 3 2 5 5 5h10c3 0 5-2 5-5v-5c0-3-2-5-5-5H7c-3 0-5 2-5 5v5z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function ProcrastinationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  );
}

function OverthinkingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M8 14c0 3 2 6 4 6s4-3 4-6" />
      <path d="M6 4c-1-1-2-1-3 0M18 4c1-1 2-1 3 0" strokeLinecap="round" />
    </svg>
  );
}

// ─── Distraction data ──────────────────────────────────────────────────────

const DISTRACTIONS = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon, color: 'text-pink-400' },
  { id: 'youtube', label: 'YouTube', Icon: YouTubeIcon, color: 'text-red-400' },
  { id: 'tiktok', label: 'TikTok', Icon: TikTokIcon, color: 'text-cyan-400' },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon, color: 'text-indigo-400' },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon, color: 'text-blue-400' },
  { id: 'reddit', label: 'Reddit', Icon: RedditIcon, color: 'text-orange-400' },
  { id: 'twitter', label: 'X / Twitter', Icon: XIcon, color: 'text-zinc-300' },
  { id: 'slack', label: 'Slack', Icon: SlackIcon, color: 'text-purple-400' },
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, color: 'text-green-400' },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, color: 'text-sky-400' },
  { id: 'spotify', label: 'Spotify', Icon: SpotifyIcon, color: 'text-green-400' },
  { id: 'netflix', label: 'Netflix', Icon: NetflixIcon, color: 'text-red-400' },
  { id: 'steam', label: 'Steam', Icon: SteamIcon, color: 'text-gray-400' },
  { id: 'chrome', label: 'Chrome', Icon: ChromeIcon, color: 'text-yellow-400' },
  { id: 'vscode', label: 'VS Code', Icon: VSCodeIcon, color: 'text-blue-400' },
  { id: 'email', label: 'Email', Icon: EmailIcon, color: 'text-zinc-400' },
  { id: 'meetings', label: 'Meetings', Icon: MeetingsIcon, color: 'text-zinc-400' },
  { id: 'gaming', label: 'Gaming', Icon: GamingIcon, color: 'text-emerald-400' },
  { id: 'phone', label: 'Phone', Icon: PhoneIcon, color: 'text-zinc-400' },
  { id: 'procrastination', label: 'Procrastination', Icon: ProcrastinationIcon, color: 'text-amber-400' },
  { id: 'overthinking', label: 'Overthinking', Icon: OverthinkingIcon, color: 'text-violet-400' },
  { id: 'other', label: 'Other', Icon: () => <span className="text-lg">🔍</span>, color: 'text-zinc-400' },
];

export const DISTRACTIONS_LIST = DISTRACTIONS;

const itemStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

// ─── Sortable ranking item ──────────────────────────────────────────────────

function SortableRankItem({ id, label, Icon, color, rank }: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  rank: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200',
        isDragging ? 'border-emerald-500/40 bg-emerald-500/[0.12] shadow-lg shadow-emerald-500/10 z-50' : 'border-emerald-500/20 bg-emerald-500/[0.04]',
      )}
    >
      <button
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-zinc-500 hover:text-emerald-400 transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white',
      )}>
        {rank + 1}
      </div>
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <span className="text-sm text-emerald-300">{label}</span>
      <span className="ml-auto text-xs text-emerald-400/50">
        {rank === 0 ? 'Most distracting' : rank === 1 ? '2nd biggest' : '3rd'}
      </span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

interface DistractionStepProps {
  selectedDistractions: string[];
  onToggleDistraction: (id: string) => void;
  distractionRanking: string[];
  onSetRanking: (ranking: string[]) => void;
  direction: number;
}

export function DistractionStep({
  selectedDistractions,
  onToggleDistraction,
  distractionRanking,
  onSetRanking,
  direction,
}: DistractionStepProps) {
  const [localRanking, setLocalRanking] = useState<string[]>(distractionRanking);
  const [showRanking, setShowRanking] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localRanking.indexOf(active.id as string);
    const newIndex = localRanking.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newRanking = arrayMove(localRanking, oldIndex, newIndex);
    setLocalRanking(newRanking);
    onSetRanking(newRanking);
  }, [localRanking, onSetRanking]);

  // Initialize ranking when first selections happen
  const handleSelectionChange = (id: string) => {
    const newSelected = selectedDistractions.includes(id)
      ? selectedDistractions.filter((d) => d !== id)
      : [...selectedDistractions, id];

    onToggleDistraction(id);

    // Auto-build ranking from first 3 selections
    if (!selectedDistractions.includes(id)) {
      // Adding new selection
      const newRanking = [...localRanking, id].slice(0, 3);
      setLocalRanking(newRanking);
      onSetRanking(newRanking);
      if (newSelected.length >= 1 && !showRanking) {
        setShowRanking(true);
      }
    } else {
      // Removing selection
      const newRanking = localRanking.filter((r) => r !== id);
      setLocalRanking(newRanking);
      onSetRanking(newRanking);
      if (newSelected.length === 0) {
        setShowRanking(false);
      }
    }
  };

  // Ranked items for DnD context
  const rankedItems = localRanking.map((id) => {
    const d = DISTRACTIONS.find((dd) => dd.id === id);
    if (!d) return null;
    return { id: d.id, label: d.label, Icon: d.Icon, color: d.color };
  }).filter(Boolean) as { id: string; label: string; Icon: React.ComponentType<{ className?: string }>; color: string }[];

  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        What pulls your attention away?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Select all that apply. We&apos;ll help you manage the biggest ones.
      </p>

      {/* Distraction grid with SVG icons */}
      <motion.div
        variants={itemStagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5"
        role="group"
        aria-label="Select distractions"
      >
        {DISTRACTIONS.map((d) => {
          const isSelected = selectedDistractions.includes(d.id);
          const rankIndex = localRanking.indexOf(d.id);
          return (
            <motion.button
              key={d.id}
              variants={itemFade}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectionChange(d.id)}
              aria-pressed={isSelected}
              aria-label={d.label}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 transition-all duration-200',
                isSelected
                  ? rankIndex !== -1
                    ? 'border-emerald-500/40 bg-emerald-500/[0.12] ring-1 ring-emerald-500/30'
                    : 'border-emerald-500/20 bg-emerald-500/[0.06] ring-1 ring-emerald-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04]'
              )}
            >
              {/* Rank badge */}
              {rankIndex !== -1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/30"
                >
                  #{rankIndex + 1}
                </motion.div>
              )}
              <d.Icon className={cn('h-5 w-5 shrink-0', isSelected ? d.color : 'text-zinc-500')} />
              <span className={cn('text-xs font-medium', isSelected ? 'text-emerald-300' : 'text-zinc-400')}>
                {d.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {selectedDistractions.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-zinc-500"
        >
          {selectedDistractions.length} selected · Drag to rank your top 3 below
        </motion.p>
      )}

      {/* Drag-and-drop ranking */}
      <AnimatePresence>
        {showRanking && rankedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <GripVertical className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-zinc-300">Rank your top 3 distractions</span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localRanking}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {rankedItems.map((item, index) => (
                    <SortableRankItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      Icon={item.Icon}
                      color={item.color}
                      rank={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {localRanking.length < 3 && (
              <p className="mt-2 text-xs text-zinc-500">
                Select more distractions above to fill your top 3.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
