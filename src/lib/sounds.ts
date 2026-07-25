const CLICK_WAV = 'data:audio/wav;base64,UklGRqQCAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYACAADoA7EHBAVpAIwBXAatBv4BLQAlBBoHEQQrAOIBLQbGBWEBXABMBHYGNwMKAC4C5wXoBOUAlABcBMoFegIAAG0CjgUYBIgAzgBVBBsF2AEIAJ0CJQVaA0YACAE7BG8EUwEeAL4CsQSuAhwAPQEPBMkD5wA8AM4CNgQYAgYAagHTAywDlABfAM4CuAOXAQAAjQGMA5wCVgCDAL8CPAMqAQUApQE8AxoCLAClAKQCwwLSABIAswHmAqcBEQDCAH0CUQKNACQAtQGOAkQBAwDaAE0C6AFYADkArAE3AvEAAADrABcCiQEyAE0AmwHiAa0AAwD0AN4BNgEZAF4AggGTAXcACgD1AKIB7gAJAGwAYwFJAU4AFADwAGcBsQACAHYAQAEIAS8AHgDlAC4BgAAAAHwAGgHOABoAKADVAPkAWQABAHwA8wCdAAwALwDCAMkAOwAFAHkAzQB0AAQANACrAJ4AJQAJAHIAqgBTAAEANwCUAHkAFQAOAGgAiAA5AAAANwB8AFoACwARAFwAawAmAAAANABmAEEABQATAE8AUQAYAAIAMABRAC0AAQAUAEEAPAAOAAMAKgA+AB4AAAATADQAKgAHAAQAIwAuABMAAAASACgAHQADAAUAHAAgAAsAAAAPAB0AEgABAAUAFQAWAAYAAAAMABQACwAAAAUADwAOAAMAAAAJAA0ABgAAAAQACgAIAAEAAAAGAAgAAwAAAAMABgAEAAAAAAAEAAQAAQAAAAEAAwACAAAAAAACAAIAAAAAAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

let audioCtx: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let lastPlayTime = 0;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

async function getClickBuffer(): Promise<AudioBuffer> {
  if (clickBuffer) return clickBuffer;
  const ctx = getAudioContext();
  const response = await fetch(CLICK_WAV);
  const arrayBuffer = await response.arrayBuffer();
  clickBuffer = await ctx.decodeAudioData(arrayBuffer);
  return clickBuffer;
}

export async function playClick() {
  // Throttle to max 5 clicks per second
  const now = performance.now();
  if (now - lastPlayTime < 200) return;
  lastPlayTime = now;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const buffer = await getClickBuffer();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    // Very low volume — like Notion
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {
    // Silent fail — audio is non-critical
  }
}

export async function playTap() {
  const now = performance.now();
  if (now - lastPlayTime < 150) return;
  lastPlayTime = now;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const buffer = await getClickBuffer();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {
    // Silent fail
  }
}
