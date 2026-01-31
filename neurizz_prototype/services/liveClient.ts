import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio configuration constants
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const SCENARIO_PROMPTS = {
  coffee_shop: "We are meeting for a casual coffee. Ambient noise is moderate.",
  restaurant: "We are at a nice dinner date. The atmosphere is intimate.",
  video_call: "We are on a Facetime/Zoom call. It's a first remote date.",
};

const PERSONA_PROMPTS = {
  male: "You are a friendly, slightly nervous but charming guy named Alex.",
  female: "You are a confident, warm, and engaging woman named Sarah.",
  discord_kitten: "You are a playful, internet-savvy, slightly chaotic personality using internet slang.",
};

// --- Audio Utilities ---

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --- Live Client Class ---

export class LiveSessionClient {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private sessionPromise: Promise<any> | null = null;
  private videoInterval: number | null = null;
  private audioStream: MediaStream | null = null;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(
    scenario: keyof typeof SCENARIO_PROMPTS,
    persona: keyof typeof PERSONA_PROMPTS,
    videoElement: HTMLVideoElement,
    onTranscription: (speaker: 'user' | 'ai', text: string) => void,
    onClose: () => void
  ) {
    // Initialize Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
    
    if (!this.outputAudioContext) throw new Error("Audio Context not supported");
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    // Get Microphone Stream
    this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // System Instruction
    const systemInstruction = `
      ${PERSONA_PROMPTS[persona]}
      Context: ${SCENARIO_PROMPTS[scenario]}
      Role: You are a date preparation mentor for a neurodivergent user. 
      Your goal is to have a natural conversation. 
      Be supportive but realistic.
      Do not be overly robotic. 
      If the user is silent for too long, gently prompt them.
      Keep your responses relatively concise (under 20 seconds) to allow for back-and-forth.
    `;

    // Connect to Gemini Live
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: persona === 'male' ? 'Puck' : 'Kore' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Session Opened");
          if (this.audioStream) {
            this.startAudioInput(this.audioStream);
          }
          this.startVideoInput(videoElement);
        },
        onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.inputTranscription?.text) {
                onTranscription('user', message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.outputTranscription?.text) {
                onTranscription('ai', message.serverContent.outputTranscription.text);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && this.outputAudioContext && this.outputNode) {
                 this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                 const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    this.outputAudioContext,
                    OUTPUT_SAMPLE_RATE,
                    1
                 );
                 
                 const source = this.outputAudioContext.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(this.outputNode);
                 source.addEventListener('ended', () => {
                    this.sources.delete(source);
                 });
                 source.start(this.nextStartTime);
                 this.nextStartTime += audioBuffer.duration;
                 this.sources.add(source);
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
                this.sources.forEach(src => {
                    try { src.stop(); } catch (e) {}
                });
                this.sources.clear();
                this.nextStartTime = 0;
            }
        },
        onclose: () => {
            console.log("Session closed");
            onClose();
        },
        onerror: (err) => {
            console.error("Session error", err);
            onClose();
        }
      }
    });

    await this.sessionPromise;
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;
    
    this.sourceNode = this.inputAudioContext.createMediaStreamSource(stream);
    // Use ScriptProcessor for raw PCM access (legacy but robust for this demo)
    this.inputNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.inputNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        
        this.sessionPromise?.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
    };

    this.sourceNode.connect(this.inputNode);
    this.inputNode.connect(this.inputAudioContext.destination); // Required for script processor to run
  }

  private startVideoInput(videoElement: HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const FRAME_RATE = 1; // 1 FPS is sufficient for context

    this.videoInterval = window.setInterval(() => {
        if (!ctx || videoElement.paused || videoElement.ended) return;

        canvas.width = videoElement.videoWidth / 4; // Downscale for bandwidth
        canvas.height = videoElement.videoHeight / 4;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (blob) {
                const base64 = await blobToBase64(blob);
                this.sessionPromise?.then(session => {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: 'image/jpeg',
                            data: base64
                        }
                    });
                });
            }
        }, 'image/jpeg', 0.6);

    }, 1000 / FRAME_RATE);
  }

  async disconnect() {
    // Clear intervals
    if (this.videoInterval) clearInterval(this.videoInterval);
    
    // Stop Audio Nodes
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
    }
    if (this.inputNode) {
      try { this.inputNode.disconnect(); } catch (e) {}
    }
    
    // Stop Audio Stream Tracks
    if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
    }

    // Safely close contexts
    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      try { await this.inputAudioContext.close(); } catch (e) {}
    }
    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      try { await this.outputAudioContext.close(); } catch (e) {}
    }
    
    // Note: session.close() is not explicitly available in all versions of the client prototype,
    // but cleaning up contexts stops the stream.
    this.sources.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    this.sources.clear();
  }
}