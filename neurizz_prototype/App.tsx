import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { LiveSession } from './components/LiveSession';
import { Rewind } from './components/Rewind';
import { SessionConfig, SessionStats } from './types';

// Mock stats generator helper
const generateMockStats = (transcript: { speaker: 'user' | 'ai'; text: string }[]): SessionStats => {
    // In a real app, you would send the transcript to Gemini to get this analysis using `generateContent`
    const potentialStrengths = [
        "Maintained a warm and inviting tone throughout the conversation.",
        "Demonstrated active listening by pausing before responding.",
        "Responded to questions with detailed, thoughtful answers.",
        "Stayed calm and composed, even during moments of silence.",
        "Used positive language that encouraged the conversation forward."
    ];
    const potentialImprovements = [
        "Try to ask more open-ended questions to keep the flow going.",
        "Briefly lost eye contact during the middle section—try to hold gaze longer.",
        "Speak slightly slower when explaining complex ideas to improve clarity.",
        "Don't be afraid to take a moment to think before answering; silence is okay.",
        "Watch out for interrupting the other person when you are excited."
    ];

    return {
        duration: 300,
        strengths: potentialStrengths.sort(() => 0.5 - Math.random()).slice(0, 3),
        improvements: potentialImprovements.sort(() => 0.5 - Math.random()).slice(0, 2),
        transcript: transcript
    };
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'session' | 'rewind'>('landing');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setView('session');
  };

  const handleEndSession = (transcript: { speaker: 'user' | 'ai'; text: string }[]) => {
    const stats = generateMockStats(transcript);
    setSessionStats(stats);
    setView('rewind');
  };

  const handleReset = () => {
    setSessionConfig(null);
    setSessionStats(null);
    setView('landing');
  };

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {view === 'landing' && <Landing onStart={handleStartSession} />}
      
      {view === 'session' && sessionConfig && (
        <LiveSession 
          config={sessionConfig} 
          onEndSession={handleEndSession} 
        />
      )}
      
      {view === 'rewind' && sessionStats && (
        <Rewind stats={sessionStats} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;