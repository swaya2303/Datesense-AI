import React from 'react';
import { SessionStats } from '../types';
import { RefreshCcw, Download, Sparkles, ArrowUpCircle, CheckCircle2, MessageSquare } from 'lucide-react';

interface RewindProps {
  stats: SessionStats;
  onReset: () => void;
}

export const Rewind: React.FC<RewindProps> = ({ stats, onReset }) => {
  return (
    <div className="min-h-screen bg-pastel-slate p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">The Rewind</h1>
            <p className="text-lg text-slate-500">Here is a breakdown of your social vibe.</p>
        </div>

        {/* Qualitative Feedback Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Glowing ✨</h3>
                </div>
                <ul className="space-y-4">
                    {stats.strengths.map((s, i) => (
                        <li key={i} className="flex gap-4 items-start text-slate-600 leading-relaxed">
                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                            <span>{s}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                        <ArrowUpCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Growing 🌱</h3>
                </div>
                <ul className="space-y-4">
                    {stats.improvements.map((s, i) => (
                        <li key={i} className="flex gap-4 items-start text-slate-600 leading-relaxed">
                            <div className="mt-2 w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            <span>{s}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Transcript Viewer */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <MessageSquare className="text-slate-400" size={20} />
                <h3 className="font-semibold text-slate-700">Full Transcript</h3>
            </div>
            <div className="p-6 md:p-8 space-y-6 max-h-[500px] overflow-y-auto">
                {stats.transcript.length > 0 ? (
                    stats.transcript.map((t, i) => (
                        <div key={i} className={`flex gap-4 ${t.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${t.speaker === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                                {t.speaker === 'user' ? 'ME' : 'AI'}
                            </div>
                            <div className={`py-3 px-5 rounded-3xl text-base leading-relaxed max-w-[85%] shadow-sm ${t.speaker === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                {t.text}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400 italic">No conversation recorded.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-center gap-4 pt-4 pb-12">
            <button 
                onClick={onReset}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
                <RefreshCcw size={20} />
                <span>Practice Again</span>
            </button>
             <button 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-all font-semibold"
            >
                <Download size={20} />
                <span>Save Report</span>
            </button>
        </div>

      </div>
    </div>
  );
};