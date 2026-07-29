'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Music, CloudRain, Brain, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const TRACKS = [
  {
    id: 'classical-study',
    label: 'Classical Study',
    icon: Music,
    src: '/audio/classical-study.wav',
  },
  {
    id: 'deep-focus',
    label: 'Deep Focus',
    icon: Brain,
    src: '/audio/deep-focus.wav',
  },
  {
    id: 'rain-ambient',
    label: 'Rain Ambient',
    icon: CloudRain,
    src: '/audio/rain-ambient.wav',
  },
] as const;

type TrackId = (typeof TRACKS)[number]['id'];

function getOrCreateAudio(): HTMLAudioElement {
  if (!audioSingleton) {
    audioSingleton = new Audio();
    audioSingleton.loop = true;
    audioSingleton.preload = 'auto';
  }
  return audioSingleton;
}

let audioSingleton: HTMLAudioElement | null = null;

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<TrackId | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playError, setPlayError] = useState(false);

  // Sync volume to audio element (pure external sync)
  useEffect(() => {
    const audio = getOrCreateAudio();
    audio.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const audio = getOrCreateAudio();
      audio.pause();
      audio.src = '';
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = getOrCreateAudio();
    setPlayError(false);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (!currentTrackId) {
      // Auto-select first track on first play
      const track = TRACKS[0];
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume / 100;
      audio.src = track.src;
      audio.play().then(() => {
        setIsPlaying(true);
        setCurrentTrackId(track.id);
      }).catch(() => {
        // Audio play() can fail due to browser autoplay policy
        setPlayError(true);
        setCurrentTrackId(track.id);
      });
      return;
    }

    if (!audio.src || audio.src === '') {
      const track = TRACKS.find((t) => t.id === currentTrackId);
      if (track) {
        audio.loop = true;
        audio.volume = isMuted ? 0 : volume / 100;
        audio.src = track.src;
      }
    }
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setPlayError(true);
      setIsPlaying(false);
    });
  }, [isPlaying, currentTrackId, volume, isMuted]);

  const selectTrack = useCallback(
    (trackId: TrackId) => {
      if (currentTrackId === trackId) return;
      const audio = getOrCreateAudio();
      const track = TRACKS.find((t) => t.id === trackId);
      if (!track) return;
      setPlayError(false);

      audio.loop = true;
      audio.volume = isMuted ? 0 : volume / 100;
      audio.src = track.src;
      setCurrentTrackId(trackId);

      if (isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setPlayError(true);
          setIsPlaying(false);
        });
      }
    },
    [currentTrackId, isPlaying, volume, isMuted]
  );

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const currentTrack = TRACKS.find((t) => t.id === currentTrackId);
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 40 ? Volume1 : Volume2;

  return (
    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center z-10">
      {/* Play error feedback */}
      {playError && (
        <div className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1.5 text-[10px] text-amber-400" role="alert" aria-live="polite">
          Audio playback blocked. Try clicking play again.
        </div>
      )}

      {/* Compact bar - always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl px-2 py-1.5"
      >
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
            isPlaying
              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200'
          )}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>

        {/* Track name + expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse track selection' : 'Expand track selection'}
          aria-expanded={isExpanded}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-white/[0.06]"
        >
          {currentTrack ? (
            <>
              <currentTrack.icon className="h-3 w-3 text-emerald-400/70" aria-hidden="true" />
              <span className="text-zinc-300 font-medium">{currentTrack.label}</span>
            </>
          ) : (
            <span className="text-zinc-500">No track</span>
          )}
          {isExpanded ? <ChevronDown className="h-3 w-3 text-zinc-600" /> : <ChevronUp className="h-3 w-3 text-zinc-600" />}
        </button>

        {/* Volume control - compact */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <VolumeIcon className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 w-[280px] rounded-2xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/40"
          >
            {/* Track list */}
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Tracks
              </p>
              <div className="flex flex-col gap-1">
                {TRACKS.map((track) => {
                  const isActive = currentTrackId === track.id;
                  const TrackIcon = track.icon;
                  return (
                    <button
                      key={track.id}
                      onClick={() => selectTrack(track.id)}
                      aria-label={`Select track: ${track.label}`}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                        isActive
                          ? 'bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                          isActive ? 'bg-emerald-500/15' : 'bg-white/[0.04]'
                        )}
                        aria-hidden="true"
                      >
                        <TrackIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{track.label}</p>
                        <p className="text-[10px] text-zinc-600">
                          {isActive && isPlaying ? 'Playing' : isActive ? 'Selected' : 'Ambient'}
                        </p>
                      </div>
                      {isActive && isPlaying && (
                        <div className="flex items-end gap-[2px] h-3" aria-hidden="true">
                          <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '6px' }} />
                          <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" style={{ height: '10px' }} />
                          <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" style={{ height: '4px' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Volume slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600" id="volume-label">
                  Volume
                </p>
                <span className="text-[10px] tabular-nums text-zinc-500" aria-live="polite">{effectiveVolume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <VolumeIcon className="h-3.5 w-3.5" />
                </button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  aria-label="Volume slider"
                  aria-labelledby="volume-label"
                  className="flex-1 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:bg-emerald-500/60 [&_[data-slot=slider-thumb]]:border-emerald-500/50 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
