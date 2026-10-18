"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Background music for invitations. Plays the invite's own track when one is supplied;
 * otherwise synthesises a soft tanpura drone with sparse santoor-like notes in Raag Bhupali,
 * so every demo has sound without shipping audio files.
 */
export function useInviteMusic(src?: string) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ ctx: AudioContext; master: GainNode; timers: number[] } | null>(null);

  const stopSynth = useCallback(() => {
    const s = synthRef.current;
    if (!s) return;
    s.timers.forEach((t) => window.clearInterval(t));
    s.master.gain.setTargetAtTime(0, s.ctx.currentTime, 0.4);
    const ctx = s.ctx;
    window.setTimeout(() => ctx.close(), 1500);
    synthRef.current = null;
  }, []);

  const startSynth = useCallback(() => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);

    // A little room: feedback delay into a lowpass.
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.32;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    delay.connect(fb).connect(delay);
    master.connect(tone);
    delay.connect(tone);
    tone.connect(ctx.destination);

    const sa = 138.59; // C#3
    const pluck = (freq: number, at: number, gain: number, decay: number, type: OscillatorType, bright: number) => {
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(bright, at);
      f.frequency.exponentialRampToValueAtTime(400, at + decay);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(gain, at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      [0, 3].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        o.detune.value = cents;
        o.connect(f);
        o.start(at);
        o.stop(at + decay + 0.1);
      });
      f.connect(g);
      g.connect(master);
      g.connect(delay);
    };

    // Tanpura cycle: Pa, Sa', Sa', Sa
    const cycle = [sa * 0.75, sa, sa, sa * 0.5];
    let step = 0;
    const tanpura = window.setInterval(() => {
      pluck(cycle[step % 4], ctx.currentTime + 0.02, 0.07, 4.2, "sawtooth", 1800);
      step++;
    }, 1050);

    // Bhupali: Sa Re Ga Pa Dha Sa'
    const scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2];
    let idx = 2;
    const melody = window.setInterval(() => {
      if (Math.random() < 0.42) return;
      idx = Math.max(0, Math.min(scale.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
      const at = ctx.currentTime + 0.02;
      pluck(sa * 2 * scale[idx], at, 0.05, 2.2, "triangle", 5000);
      if (Math.random() < 0.3) pluck(sa * 2 * scale[idx], at + 0.12, 0.025, 1.6, "triangle", 4000);
    }, 520);

    synthRef.current = { ctx, master, timers: [tanpura, melody] };
  }, []);

  const play = useCallback(() => {
    if (src) {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.6;
      }
      audioRef.current.play().catch(() => setPlaying(false));
    } else if (!synthRef.current) {
      startSynth();
    }
    setPlaying(true);
  }, [src, startSynth]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    stopSynth();
    setPlaying(false);
  }, [stopSynth]);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  useEffect(() => {
    const onHide = () => document.hidden && pause();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      audioRef.current?.pause();
      stopSynth();
    };
  }, [pause, stopSynth]);

  return { playing, play, pause, toggle };
}
