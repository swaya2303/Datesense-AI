import type { Scenario } from '$lib/types';

export interface ScenarioInfo {
	id: Scenario;
	name: string;
	description: string;
	icon: 'coffee' | 'utensils' | 'video';
	systemPrompt: string;
}

export const scenarios: ScenarioInfo[] = [
	{
		id: 'coffee_shop',
		name: 'Coffee Shop',
		description: 'Casual low-pressure intro with gentle ambient noise.',
		icon: 'coffee',
		systemPrompt: `SETTING: A busy, hipster coffee shop.
		
		SENSORY DETAILS:
		- Background noise: Espresso machine hissing, indie music playing softly, muffled chatter.
		- Atmosphere: Casual, low stakes, but public.
		
		SCENARIO EVENTS TO SIMULATE:
		1. The Barista Interrupt: Occasionally pretend to hear a name being called or get distracted by a loud noise. Say: "Sorry, did they just call order 42? That might be me... oh wait, no, never mind. So, what were you saying?"
		2. The "What do you want?" Moment: Early in the chat, ask the user what they are drinking. Judge them playfully if it's overly complicated.
		
		GOAL: Test the user's ability to handle small distractions and maintain flow in a semi-public space.`
	},
	{
		id: 'restaurant',
		name: 'Dinner Date',
		description: 'Seated conversation with pacing and table etiquette cues.',
		icon: 'utensils',
		systemPrompt: `SETTING: A dimly lit, slightly upscale restaurant.
		
		SENSORY DETAILS:
		- Background noise: Clinking silverware, soft jazz, hushed conversations.
		- Atmosphere: Intimate, higher stakes, requires more focus.
		
		SCENARIO EVENTS TO SIMULATE:
		1. Pacing Cues: After the user answers a question, imply that food has arrived. Say: "Oh, give me a sec, this looks amazing... okay, I'm listening. You were talking about..."
		2. The Menu Discussion: Start by asking: "Do you think we should split an appetizer? I'm eyeing the calamari."
		
		GOAL: Coach the user on pacing (taking breaks to 'eat', not monologue) and shared decision making.`
	},
	{
		id: 'video_call',
		name: 'Video Call',
		description: 'Camera framing, eye contact, and virtual presence coaching.',
		icon: 'video',
		systemPrompt: `SETTING: A Zoom/FaceTime call from home.
		
		SENSORY DETAILS:
		- Background noise: Minimal, maybe a fan or distant traffic.
		- Atmosphere: Artificial intimacy, reliant on facial cues.
		
		SCENARIO EVENTS TO SIMULATE:
		1. Technical Check: Start with: "Hey! Can you hear me okay? My wifi has been acting up all day."
		2. Framing Awareness: If the user is silent or looking away, say: "You froze for a second there! Or... were you just thinking really hard?"
		3. Lag Simulation: Occasionally pause for an extra second before responding to simulate feedback delay, forcing the user to stop interrupting.
		
		GOAL: Coach the user on digital etiquette, checking audio/video, and eye contact with the camera lens.`
	}
];

export function getScenarioById(id: Scenario): ScenarioInfo | undefined {
	return scenarios.find((s) => s.id === id);
}

export function getScenarioDisplayName(id: Scenario): string {
	const scenario = getScenarioById(id);
	return scenario?.name ?? id.replace('_', ' ');
}
