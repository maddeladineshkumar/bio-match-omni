"use client";

import { useCallback } from "react";

/**
 * useCyberSound — Web Audio API sound effects for the BIO-MATCH UI.
 * Uses a lazy AudioContext to avoid issues with browser autoplay policy.
 * All sounds are synthetic, zero external files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx || audioCtx.state === "closed") {
        audioCtx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    gain = 0.08,
    fadeOut = true
) {
    try {
        const ctx = getCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        if (fadeOut) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        }

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch {
        // Silently fail — sound is enhancement only
    }
}

export function useCyberSound() {
    /** Short high-pitch blip for button hover */
    const playHover = useCallback(() => {
        playTone(1200, 0.06, "sine", 0.06);
    }, []);

    /** Satisfying click confirmation sound */
    const playClick = useCallback(() => {
        playTone(880, 0.04, "square", 0.04);
        setTimeout(() => playTone(1100, 0.08, "sine", 0.05), 40);
    }, []);

    /** High-compatibility success chime — two ascending tones */
    const playSuccess = useCallback(() => {
        playTone(880, 0.12, "sine", 0.07);
        setTimeout(() => playTone(1320, 0.2, "sine", 0.06), 100);
        setTimeout(() => playTone(1760, 0.3, "sine", 0.05), 200);
    }, []);

    /** Low warning buzz for poor compatibility */
    const playWarning = useCallback(() => {
        playTone(220, 0.15, "sawtooth", 0.05);
        setTimeout(() => playTone(180, 0.2, "sawtooth", 0.04), 120);
    }, []);

    /** Scan initiation: rising sweep */
    const playScan = useCallback(() => {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch {
            // no-op
        }
    }, []);

    return { playHover, playClick, playSuccess, playWarning, playScan };
}
