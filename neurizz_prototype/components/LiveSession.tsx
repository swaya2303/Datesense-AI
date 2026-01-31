import React, { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Eye, User, MicOff } from 'lucide-react';
import { LiveSessionClient } from '../services/liveClient';
import { SessionConfig, FeedbackMetric } from '../types';

interface LiveSessionProps {
  config: SessionConfig;
  onEndSession: (transcript: { speaker: 'user' | 'ai'; text: string }[]) => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ config, onEndSession }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: 'user' | 'ai'; text: string }[]>([]);
  const [feedback, setFeedback] = useState<FeedbackMetric | null>(null);
  const clientRef = useRef<LiveSessionClient | null>(null);
  const [micActive, setMicActive] = useState(true);

  // Initialize Session
  useEffect(() => {
    let mounted = true;
    let videoStream: MediaStream | null = null;

    const initSession = async () => {
      try {
        if (!process.env.API_KEY) {
            console.error("API Key missing");
            return;
        }

        // Setup Video
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // If unmounted during getUserMedia, clean up immediately
        if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }

        videoStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Setup Client
        const client = new LiveSessionClient(process.env.API_KEY);
        clientRef.current = client;
        
        if (videoRef.current) {
            await client.connect(
                config.scenario,
                config.persona,
                videoRef.current,
                (speaker, text) => {
                    if (mounted) {
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            // If the speaker is the same as the last entry, append text to it
                            // instead of creating a new entry. This prevents "individual letter" bubbles.
                            if (last && last.speaker === speaker) {
                                return [
                                    ...prev.slice(0, -1), 
                                    { ...last, text: last.text + text }
                                ];
                            }
                            // Otherwise, start a new speech bubble
                            return [...prev, { speaker, text }];
                        });
                    }
                },
                () => {
                    if (mounted) handleEndSession();
                }
            );
            if (mounted) setIsConnected(true);
        }

      } catch (err) {
        console.error("Failed to init session:", err);
      }
    };

    initSession();

    // Simulated Biometric/Guardrail Feedback Loop
    const feedbackInterval = setInterval(() => {
        if (!mounted || !clientRef.current) return;
        
        const r = Math.random();
        if (r > 0.95) {
            setFeedback({
                timestamp: Date.now(),
                type: 'eye_contact',
                message: 'Gentle reminder: Try to look at the camera.',
                severity: 'info'
            });
        } else if (r > 0.90 && r < 0.92) {
             setFeedback({
                timestamp: Date.now(),
                type: 'pacing',
                message: 'Great pacing! You are speaking clearly.',
                severity: 'success'
            });
        } else if (r < 0.05) {
             setFeedback({
                timestamp: Date.now(),
                type: 'posture',
                message: 'Relax your shoulders, take a deep breath.',
                severity: 'info'
            });
        } else {
            // clear feedback occasionally to reduce noise
            if (Math.random() > 0.7) setFeedback(null);
        }
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(feedbackInterval);
      
      // Stop video stream
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
      }
      
      // Cleanup client
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const handleEndSession = () => {
    onEndSession(transcript);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-sm font-medium tracking-wide uppercase opacity-80">Live Session • {config.scenario.replace('_', ' ')}</span>
        </div>
        <button 
            onClick={handleEndSession}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-100 px-4 py-2 rounded-full backdrop-blur-sm border border-red-500/30 transition-all flex items-center gap-2"
        >
            <PhoneOff size={18} />
            <span className="text-sm font-semibold">End Call</span>
        </button>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center">
         {/* Self View (User) */}
         <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
            muted
            playsInline
         />
         
         {/* Persona Overlay (Abstract Representation) */}
         <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all duration-500 ${isConnected ? 'scale-100 bg-indigo-500/20 border-2 border-indigo-400/50' : 'scale-90 bg-slate-800'}`}>
                {isConnected ? (
                    <div className="space-y-1">
                         <div className="w-16 h-1 bg-indigo-300 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                         <div className="w-10 h-1 bg-indigo-300 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.2s] mx-auto"></div>
                         <div className="w-14 h-1 bg-indigo-300 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.4s]"></div>
                    </div>
                ) : (
                    <User size={48} className="text-slate-500" />
                )}
            </div>
            <h2 className="text-2xl font-light tracking-tight mb-2">
                {config.persona === 'discord_kitten' ? 'Kitten 😺' : config.persona === 'male' ? 'Alex' : 'Sarah'}
            </h2>
            <p className="text-indigo-200/60 text-sm max-w-xs">
                {isConnected ? 'Listening & Analyzing...' : 'Connecting...'}
            </p>
         </div>

         {/* Visual Guardrail / Feedback Banner */}
         {feedback && (
            <div className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-2xl backdrop-blur-md shadow-lg border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4
                ${feedback.severity === 'info' ? 'bg-blue-500/20 border-blue-400/30 text-blue-100' : ''}
                ${feedback.severity === 'warning' ? 'bg-amber-500/20 border-amber-400/30 text-amber-100' : ''}
                ${feedback.severity === 'success' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' : ''}
            `}>
                <div className="flex items-center gap-3">
                    {feedback.type === 'eye_contact' && <Eye size={18} />}
                    {feedback.type === 'posture' && <User size={18} />}
                    <span className="text-sm font-medium">{feedback.message}</span>
                </div>
            </div>
         )}
      </div>

      {/* Controls Bar */}
      <div className="bg-black/80 backdrop-blur-md p-6 flex justify-center items-center gap-6 z-20 border-t border-white/10">
        <button 
            className={`p-4 rounded-full transition-all ${micActive ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-400'}`}
            onClick={() => setMicActive(!micActive)}
        >
            {micActive ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <div className="h-12 w-[1px] bg-white/10 mx-2"></div>
        <div className="text-slate-400 text-xs text-center max-w-[150px]">
            AI is analyzing your tone and facial cues in real-time.
        </div>
      </div>
    </div>
  );
};