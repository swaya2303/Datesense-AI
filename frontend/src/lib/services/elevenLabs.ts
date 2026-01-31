import { env } from '$env/dynamic/public';

export class ElevenLabsService {
    private apiKey: string;
    private baseUrl = "https://api.elevenlabs.io/v1";

    // Standard stable voices
    public static VOICES = {
        FEMALE: "FGY2WhTYpPnrIDTdsKH5", // Rachel
        MALE: "IKne3meq5aSn9XLyUdCD",   // Adam
    };

    /**
     * Pre-processes text to enhance emotional expression and clarity.
     * Tuned for users who benefit from clearer tonal subtext.
     */
    private prepareExpressiveText(text: string): string {
        let processed = text;

        // 1. Pronunciation Fixes
        processed = processed.replace(/DateSense AI/gi, "Date-Sense A-I");

        // 2. Prosody & Pausing
        // Replace standard periods with an ellipsis to force a natural "breath" pause
        processed = processed.replace(/\. /g, "... ");

        // Ensure commas have enough "air" for a rhythmic lift
        processed = processed.replace(/, /g, ",  ");

        // 3. Emotional "Anchoring"
        // Multilingual v2 sets tone based on the first few tokens. 
        // We ensure it starts with a clean, clear token.
        processed = processed.trim();

        return processed;
    }

    constructor(apiKey?: string) {
        this.apiKey = apiKey || env.PUBLIC_ELEVENLABS_API_KEY || import.meta.env.VITE_ELEVENLABS_API_KEY || "";
    }

    setApiKey(key: string) {
        this.apiKey = key;
    }

    hasApiKey(): boolean {
        return !!this.apiKey;
    }

    async convertTextToSpeech(text: string, voiceId: string): Promise<Blob> {
        if (!this.apiKey) {
            throw new Error("Missing ElevenLabs API Key");
        }

        const processedText = this.prepareExpressiveText(text);

        const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": this.apiKey,
            },
            body: JSON.stringify({
                text: processedText,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.45,
                    similarity_boost: 0.8,
                    style: 0.1,
                    use_speaker_boost: true
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail?.message || "Failed to convert text to speech");
        }

        return await response.blob();
    }
}

export const elevenLabsService = new ElevenLabsService();
