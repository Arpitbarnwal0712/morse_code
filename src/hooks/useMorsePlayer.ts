// src/hooks/useMorsePlayer.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  buildTimeline,
  type MorseTimeline,
} from "../lib/morse";

export type PlayerState =
  | "idle"
  | "playing"
  | "paused"
  | "stopped";

interface UseMorsePlayerOptions {
  morse: string;
}

interface UseMorsePlayerReturn {
  state: PlayerState;

  wpm: number;
  frequency: number;
  volume: number;

  activeTone: number;
  sounding: boolean;
  progress: number;

  setWpm: (value: number) => void;
  setFrequency: (value: number) => void;
  setVolume: (value: number) => void;

  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useMorsePlayer({
  morse,
}: UseMorsePlayerOptions): UseMorsePlayerReturn {
  const [state, setState] =
    useState<PlayerState>("idle");

  const [wpm, setWpm] = useState(20);
  const [frequency, setFrequency] = useState(650);
  const [volume, setVolume] = useState(0.25);

  const [activeTone, setActiveTone] = useState(-1);
  const [sounding, setSounding] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const oscillatorRef =
    useRef<OscillatorNode | null>(null);

  const gainNodeRef =
    useRef<GainNode | null>(null);

  const animationRef =
    useRef<number | null>(null);

  const timelineRef =
    useRef<MorseTimeline | null>(null);

  const startTimeRef = useRef(0);

  const pausedAtRef = useRef(0);

  const cancelledRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current =
        new AudioContext();
    }

    return audioContextRef.current;
  }, []);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current,
      );

      animationRef.current = null;
    }

    try {
      oscillatorRef.current?.stop();
    } catch {
      // Oscillator may already be stopped.
    }

    oscillatorRef.current?.disconnect();
    gainNodeRef.current?.disconnect();

    oscillatorRef.current = null;
    gainNodeRef.current = null;

    setActiveTone(-1);
    setSounding(false);
    setProgress(0);
  }, []);

  const updatePlayback = useCallback(() => {
    const timeline = timelineRef.current;

    if (!timeline) {
      return;
    }

    const context = audioContextRef.current;

    if (!context) {
      return;
    }

    const elapsedSeconds =
      context.currentTime -
      startTimeRef.current;

    const unitsPerSecond =
      wpm / 1.2;

    const elapsedUnits =
      elapsedSeconds * unitsPerSecond;

    const totalUnits = timeline.totalUnits;

    const percentage =
      totalUnits > 0
        ? Math.min(
            100,
            (elapsedUnits / totalUnits) * 100,
          )
        : 0;

    setProgress(percentage);

    // Find the latest tone that has started.
    let currentTone:
      | (typeof timeline.events)[number]
      | undefined;

    for (const event of timeline.events) {
      if (event.start > elapsedUnits) {
        break;
      }

      if (event.toneIndex >= 0) {
        currentTone = event;
      }
    }

    if (currentTone) {
      setActiveTone(currentTone.toneIndex);

      setSounding(
        elapsedUnits <
          currentTone.start +
            currentTone.duration,
      );
    } else {
      setActiveTone(-1);
      setSounding(false);
    }

    if (elapsedUnits >= totalUnits) {
      setState("idle");
      setProgress(100);
      setActiveTone(-1);
      setSounding(false);

      return;
    }

    animationRef.current =
      requestAnimationFrame(
        updatePlayback,
      );
  }, [wpm]);

  const scheduleTone = useCallback(
    (
      context: AudioContext,
      startAt: number,
      durationUnits: number,
      tone: "." | "-",
    ) => {
      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      const unitDuration =
        1.2 / wpm;

      const duration =
        durationUnits * unitDuration;

      oscillator.frequency.value =
        frequency;

      oscillator.type = "sine";

      const attack = 0.005;
      const release = 0.01;

      gain.gain.setValueAtTime(
        0,
        startAt,
      );

      gain.gain.linearRampToValueAtTime(
        volume,
        startAt + attack,
      );

      gain.gain.setValueAtTime(
        volume,
        Math.max(
          startAt + attack,
          startAt + duration - release,
        ),
      );

      gain.gain.linearRampToValueAtTime(
        0,
        startAt + duration,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration);

      // Keep references to the currently scheduled
      // oscillator/gain for cleanup.
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gain;

      void tone;
    },
    [frequency, volume, wpm],
  );

  const play = useCallback(() => {
    if (!morse.trim()) {
      return;
    }

    const context = getAudioContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    cleanup();

    cancelledRef.current = false;

    const timeline = buildTimeline(morse);

    timelineRef.current = timeline;

    if (timeline.events.length === 0) {
      return;
    }

    const unitDuration =
      1.2 / wpm;

    const now = context.currentTime + 0.05;

    startTimeRef.current = now;

    pausedAtRef.current = 0;

    timeline.events.forEach((event) => {
      if (
        event.type === "tone" &&
        event.tone
      ) {
        scheduleTone(
          context,
          now +
            event.start *
              unitDuration,
          event.duration,
          event.tone,
        );
      }
    });

    setState("playing");
    setProgress(0);

    animationRef.current =
      requestAnimationFrame(
        updatePlayback,
      );
  }, [
    cleanup,
    getAudioContext,
    morse,
    scheduleTone,
    updatePlayback,
    wpm,
  ]);

  const pause = useCallback(() => {
    if (state !== "playing") {
      return;
    }

    const context =
      audioContextRef.current;

    if (!context) {
      return;
    }

    pausedAtRef.current =
      context.currentTime -
      startTimeRef.current;

    context.suspend();

    setState("paused");
  }, [state]);

  const resume = useCallback(() => {
    if (state !== "paused") {
      return;
    }

    const context =
      audioContextRef.current;

    if (!context) {
      return;
    }

    startTimeRef.current =
      context.currentTime -
      pausedAtRef.current;

    void context.resume();

    setState("playing");

    animationRef.current =
      requestAnimationFrame(
        updatePlayback,
      );
  }, [state, updatePlayback]);

  const stop = useCallback(() => {
    cleanup();

    timelineRef.current = null;
    pausedAtRef.current = 0;

    setState("stopped");

    window.setTimeout(() => {
      setState("idle");
    }, 50);
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();

      void audioContextRef.current?.close();
    };
  }, [cleanup]);

  return {
    state,

    wpm,
    frequency,
    volume,

    activeTone,
    sounding,
    progress,

    setWpm,
    setFrequency,
    setVolume,

    play,
    pause,
    resume,
    stop,
  };
}