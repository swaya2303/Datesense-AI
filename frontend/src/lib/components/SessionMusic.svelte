<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    // State
    let isMuted = $state(true);
    let isPlaying = $state(false);

    // Web Audio Context
    let audioContext: AudioContext | null = null;
    let masterGain: GainNode | null = null;
    let oscillators: OscillatorNode[] = [];

    // Sound configuration - "Focused" profile (triangle waves + pink noise)
    const BASE_FREQ = 220; // A3
    const HARMONICS = [1, 1.5, 2]; // Fundamental, Fifth, Octave

    function initAudio() {
        if (!browser || audioContext) return;

        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();

        masterGain = audioContext.createGain();
        masterGain.gain.value = 0; // Start muted
        masterGain.connect(audioContext.destination);
    }

    function startAudio() {
        if (!audioContext || !masterGain) initAudio();
        if (!audioContext) return;

        // Resume context if suspended (browser requirement)
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        stopOscillators();

        const now = audioContext.currentTime;

        // Create drone layers
        HARMONICS.forEach((ratio, i) => {
            if (!audioContext || !masterGain) return;

            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            // Slight detuning for warmth
            const detune = (Math.random() - 0.5) * 4;

            osc.type = i === 1 ? "sine" : "triangle";
            osc.frequency.value = BASE_FREQ * ratio;
            osc.detune.value = detune;

            // LFO for movement
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.type = "sine";
            lfo.frequency.value = 0.05 + Math.random() * 0.02; // Very slow
            lfoGain.gain.value = 2; // subtle vibrato
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            oscillators.push(lfo);

            // Filtering to soften the sound
            const filter = audioContext.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 400 + i * 200;

            // Fade in
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.08 / (i + 1), now + 2); // Lower volume for higher harmonics

            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(masterGain);

            osc.start(now);
            oscillators.push(osc);
        });

        isPlaying = true;
    }

    function stopOscillators() {
        oscillators.forEach((osc) => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                /* ignore */
            }
        });
        oscillators = [];
    }

    function toggleMute() {
        if (!audioContext) initAudio();

        isMuted = !isMuted;

        if (!isMuted && !isPlaying) {
            startAudio();
        }

        if (masterGain && audioContext) {
            const now = audioContext.currentTime;
            if (isMuted) {
                // Fade out
                masterGain.gain.cancelScheduledValues(now);
                masterGain.gain.setTargetAtTime(0, now, 0.5);
            } else {
                // Fade in
                masterGain.gain.cancelScheduledValues(now);
                masterGain.gain.setTargetAtTime(0.3, now, 1);
            }
        }
    }

    onDestroy(() => {
        stopOscillators();
        if (audioContext && audioContext.state !== "closed") {
            audioContext.close();
        }
    });
</script>

<div class="fixed bottom-6 left-6 z-[120]">
    <button
        onclick={toggleMute}
        class="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 {isMuted
            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            : 'bg-lblue text-slate-800 hover:bg-mblue'}"
        aria-label={isMuted ? "Turn on session music" : "Mute session music"}
        title="Session Focus Music"
    >
        {#if isMuted}
            <!-- Muted Speaker Icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
        {:else}
            <!-- Sound Wave Icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
        {/if}
    </button>
</div>
