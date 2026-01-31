import React, { useState } from 'react';
import { Persona, Scenario, SessionConfig } from '../types';
import { ArrowRight, MessageCircle, Heart, Coffee, Video, Utensils } from 'lucide-react';

interface LandingProps {
  onStart: (config: SessionConfig) => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const handleStart = () => {
    if (persona && scenario) {
      onStart({ persona, scenario });
    }
  };

  if (step === 1) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-2xl space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="inline-block p-3 rounded-2xl bg-white shadow-sm mb-4">
                    <span className="text-2xl">🧠 ✨</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
                    Neu<span className="text-indigo-600">Rizz</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
                    A safe space to practice social interactions. 
                    Get real-time feedback on your vibe, tone, and confidence.
                </p>
                <button 
                    onClick={() => setStep(2)}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                    Enter The Lab
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-400 mt-8">
                    Powered by Gemini Live API • Private & Secure
                </p>
            </div>
        </div>
    );
  }

  // Configuration Step
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Left Panel: Persona */}
            <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">1. Choose Partner</h2>
                <div className="space-y-4 flex-1">
                    {[
                        { id: 'male', label: 'Alex', desc: 'Friendly, casual', icon: <UserCard color="bg-blue-100 text-blue-600" /> },
                        { id: 'female', label: 'Sarah', desc: 'Warm, engaging', icon: <UserCard color="bg-rose-100 text-rose-600" /> },
                        { id: 'discord_kitten', label: 'Kitten', desc: 'Chaotic, slang-heavy', icon: <UserCard color="bg-purple-100 text-purple-600" /> },
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPersona(p.id as Persona)}
                            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${persona === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                        >
                            {p.icon}
                            <div>
                                <div className="font-semibold text-slate-800">{p.label}</div>
                                <div className="text-xs text-slate-500">{p.desc}</div>
                            </div>
                            {persona === p.id && <div className="ml-auto text-indigo-600">●</div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Scenario */}
            <div className="flex-1 p-8 md:p-12 flex flex-col bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Set Scene</h2>
                <div className="space-y-4 flex-1">
                    {[
                        { id: 'coffee_shop', label: 'Coffee Shop', icon: <Coffee size={20} /> },
                        { id: 'restaurant', label: 'Dinner Date', icon: <Utensils size={20} /> },
                        { id: 'video_call', label: 'Video Call', icon: <Video size={20} /> },
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setScenario(s.id as Scenario)}
                            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${scenario === s.id ? 'border-emerald-500 bg-emerald-50' : 'border-white bg-white hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-full ${scenario === s.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {s.icon}
                            </div>
                            <span className="font-medium text-slate-700">{s.label}</span>
                             {scenario === s.id && <div className="ml-auto text-emerald-600">●</div>}
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <button
                        disabled={!persona || !scenario}
                        onClick={handleStart}
                        className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        Start Session
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

const UserCard = ({ color }: { color: string }) => (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Heart size={20} className="fill-current" />
    </div>
);
