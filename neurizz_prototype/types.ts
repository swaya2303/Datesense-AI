export type Persona = 'male' | 'female' | 'discord_kitten';
export type Scenario = 'coffee_shop' | 'restaurant' | 'video_call';

export interface SessionConfig {
  persona: Persona;
  scenario: Scenario;
}

export interface FeedbackMetric {
  timestamp: number;
  type: 'posture' | 'eye_contact' | 'tone' | 'pacing';
  message: string;
  severity: 'info' | 'warning' | 'success';
}

export interface SessionStats {
  duration: number; // seconds
  strengths: string[];
  improvements: string[];
  transcript: { speaker: 'user' | 'ai'; text: string }[];
}