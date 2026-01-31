import { json, type RequestEvent } from '@sveltejs/kit';
import { SignJWT, importPKCS8 } from 'jose';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { GoogleGenAI } from '@google/genai';

// Models to try in order of preference (widest availability last)
const SNOWFLAKE_MODELS = ['mistral-large', 'snowflake-arctic', 'llama3-8b', 'gemma-7b'];

const SYSTEM_PROMPT = `You are an expert social coach for neurodivergent individuals. Analyze this date transcript and return a JSON object with 3 short strings: 'pivot', 'joke', and 'question'. 

- 'pivot': A smooth way to change the topic if the conversation is awkward
- 'joke': A light, appropriate joke or humorous observation related to the context
- 'question': An engaging open-ended question to keep the conversation flowing

Return ONLY valid JSON, no markdown or explanation.`;

// Randomized Fallbacks (for when all APIs fail)
const FALLBACK_OPTIONS = [
    {
        pivot: "Speaking of hobbies, what's something you're really passionate about?",
        joke: "I'd tell you a chemistry joke, but I know I wouldn't get a reaction.",
        question: "What's the best trip you've ever taken?"
    },
    {
        pivot: "That reminds me - have you seen any good movies lately?",
        joke: "Why don't skeletons fight each other? They don't have the guts.",
        question: "If you could have dinner with any historical figure, who would it be?"
    },
    {
        pivot: "On a totally different note, do you have any pets?",
        joke: "What do you call a fake noodle? A wash-impasta.",
        question: "What's a skill you've always wanted to learn?"
    },
    {
        pivot: "By the way, how was your weekend?",
        joke: "I'm reading a book on anti-gravity. It's impossible to put down!",
        question: "What's the most spontaneous thing you've ever done?"
    },
    {
        pivot: "I was just thinking - what's your favorite type of music?",
        joke: "Why did the scarecrow win an award? Because he was outstanding in his field.",
        question: "What's your idea of a perfect Sunday?"
    }
];

function getRandomFallback() {
    return FALLBACK_OPTIONS[Math.floor(Math.random() * FALLBACK_OPTIONS.length)];
}

// Helper to safely format private key
function formatPrivateKey(key: string): string {
    let formatted = key.replace(/^"|"$/g, '');
    if (formatted.includes('\\n')) {
        formatted = formatted.replace(/\\n/g, '\n');
    }
    return formatted;
}

/**
 * Generate a JWT token for Snowflake authentication
 */
async function generateSnowflakeJWT(): Promise<string> {
    const accountId = env.SNOWFLAKE_ACCOUNT_ID?.replace(/"/g, '');
    const user = env.SNOWFLAKE_USER?.replace(/"/g, '');
    const publicKeyFp = env.SNOWFLAKE_PUBLIC_KEY_FP?.replace(/"/g, '');
    const rawPrivateKey = env.SNOWFLAKE_PRIVATE_KEY;

    if (!accountId || !user || !publicKeyFp || !rawPrivateKey) {
        throw new Error('Missing Snowflake credentials');
    }

    const privateKeyPem = formatPrivateKey(rawPrivateKey);
    const qualifiedUsername = `${accountId.toUpperCase()}.${user.toUpperCase()}`;
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    return await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(`${qualifiedUsername}.${publicKeyFp}`)
        .setSubject(qualifiedUsername)
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(privateKey);
}

/**
 * Call Snowflake Cortex API with model fallback
 */
async function callCortex(transcript: string): Promise<any> {
    const accountId = env.SNOWFLAKE_ACCOUNT_ID?.replace(/"/g, '');
    if (!accountId) throw new Error('Missing SNOWFLAKE_ACCOUNT_ID');

    const jwt = await generateSnowflakeJWT();
    const url = `https://${accountId}.snowflakecomputing.com/api/v2/cortex/inference:complete`;

    let lastError;

    // Try models sequentially
    for (const model of SNOWFLAKE_MODELS) {
        console.log(`[Wingman] Trying Snowflake model: ${model}...`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                    'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `Current transcript:\n\n${transcript}\n\nProvide JSON options.` }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const err = await response.text();
                // console.warn(`[Wingman] Model ${model} failed: ${response.status} - ${err}`);
                lastError = new Error(`Snowflake Model ${model} Failed (${response.status}): ${err}`);

                // If Auth error (401/403), no point trying other models
                if (response.status === 401 || response.status === 403) {
                    throw lastError;
                }
                continue;
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || data.message?.content || '';

            // Parse JSON
            try {
                return JSON.parse(content);
            } catch {
                const match = content.match(/\{[\s\S]*\}/);
                if (match) return JSON.parse(match[0]);
                throw new Error('Invalid JSON from Snowflake');
            }

        } catch (e) {
            console.warn(`[Wingman] Error with ${model}:`, e);
            lastError = e;
            // Retrying next model...
        }
    }

    throw lastError || new Error('All Snowflake models failed');
}

/**
 * Call Gemini Flash API (Fallback)
 */
async function callGeminiFallback(transcript: string): Promise<any> {
    console.log('[Wingman] Calling Gemini Fallback...');
    const apiKey = env.PUBLIC_GEMINI_API_KEY || publicEnv.PUBLIC_GEMINI_API_KEY;

    if (!apiKey) throw new Error('Missing Gemini API Key');

    const ai = new GoogleGenAI({ apiKey });

    // Using correct SDK syntax for @google/genai
    const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT + `\n\nTranscript:\n${transcript}` }] }
        ],
        config: {
            responseMimeType: 'application/json'
        }
    });

    const text = result.text;
    if (!text) throw new Error('Empty Gemini response');
    return JSON.parse(text);
}

export async function POST({ request }: RequestEvent) {
    try {
        const body = await request.json();
        let { transcript } = body;

        if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
            transcript = "User: (Silence)\nDate: (Silence)";
        }

        try {
            // Priority 1: Snowflake Cortex (Try all models)
            const options = await callCortex(transcript);
            return json(options);
        } catch (snowError) {
            console.error('[Wingman] Snowflake failed, switching to Gemini:', snowError);

            try {
                // Priority 2: Gemini Flash
                const options = await callGeminiFallback(transcript);
                console.log('[Wingman] Gemini Success');
                return json(options);
            } catch (geminiError) {
                console.error('[Wingman] Gemini failed, using static fallback:', geminiError);

                // Priority 3: Randomized Static Fallback
                return json(getRandomFallback());
            }
        }
    } catch (fatalError) {
        console.error('[Wingman] Fatal error:', fatalError);
        return json(getRandomFallback());
    }
}
