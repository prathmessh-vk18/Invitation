"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { presets, trackSrc } from "@/config/music";

/**
 * Background music for invitations. `src` is either a recording URL (the couple's upload or a
 * licensed track) or "synth:<preset>", one of Aavjoo's own raga tracks composed live in the
 * browser. With nothing set, the calm Bhupali track plays.
 */
export function useInviteMusic(given?: string) {
  const src = given ? trackSrc(given) : undefined;
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

  const startSynth = useCallback((name: string) => {
    const p = presets[name] ?? presets.bhupali;
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
    fb.gain.value = p.echo;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    delay.connect(fb).connect(delay);
    master.connect(tone);
    delay.connect(tone);
    tone.connect(ctx.destination);

    const sa = p.sa;
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

    // Tanpura drone
    const cycle = p.drone.map((r) => sa * r);
    let step = 0;
    const tanpura = window.setInterval(() => {
      pluck(cycle[step % cycle.length], ctx.currentTime + 0.02, 0.07, 4.2, "sawtooth", 1800);
      step++;
    }, p.droneEvery);

    // A gentle random walk through the raga's notes
    const scale = p.scale;
    const quiet = p.voice === "square" ? 0.025 : 0.05;
    let idx = Math.floor(scale.length / 3);
    const melody = window.setInterval(() => {
      if (Math.random() < p.rest) return;
      idx = Math.max(0, Math.min(scale.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
      const at = ctx.currentTime + 0.02;
      pluck(sa * 2 * scale[idx], at, quiet, p.sustain, p.voice, p.brightness);
      if (Math.random() < 0.3) pluck(sa * 2 * scale[idx], at + 0.12, quiet / 2, p.sustain * 0.7, p.voice, p.brightness * 0.8);
    }, p.noteEvery);

    synthRef.current = { ctx, master, timers: [tanpura, melody] };
  }, []);

  const play = useCallback(() => {
    if (src && !src.startsWith("synth:")) {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.6;
      }
      audioRef.current.play().catch(() => setPlaying(false));
    } else if (!synthRef.current) {
      startSynth(src?.slice("synth:".length) ?? "bhupali");
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
