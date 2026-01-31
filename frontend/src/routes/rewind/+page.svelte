<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { jsPDF } from 'jspdf';
	import confetti from 'canvas-confetti';
	import type { SessionStats } from '$lib/types';
	import { sessionStats, sessionConfig } from '$lib/stores/session';
	import { clearTranscript } from '$lib/stores/transcript';
	import Logo from '$lib/components/Logo.svelte';
	import StrengthsList from '$lib/components/StrengthsList.svelte';
	import ImprovementsList from '$lib/components/ImprovementsList.svelte';
	import TranscriptViewer from '$lib/components/TranscriptViewer.svelte';

	let stats = $state<SessionStats | null>(null);

	onMount(() => {
		stats = get(sessionStats);
		if (!stats) {
			goto('/lab');
		} else {
			// Celebration confetti burst
			confetti({
				particleCount: 150,
				spread: 70,
				origin: { y: 0.6 }
			});
		}
	});

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function practiceAgain() {
		sessionStats.set(null);
		sessionConfig.set(null);
		clearTranscript();
		goto('/lab');
	}

	function generatePDF() {
		if (!stats) return;

		const doc = new jsPDF();
		const lineHeight = 10;
		let yPos = 20;
		const margin = 20;
		const pageWidth = doc.internal.pageSize.getWidth();
		const maxLineWidth = pageWidth - margin * 2;

		// Title
		doc.setFontSize(22);
		doc.setFont('helvetica', 'bold');
		doc.text('DateSense AI Session Report', margin, yPos);
		yPos += 12;

		// Metadata
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(100);
		const dateStr = new Date().toLocaleDateString();
		doc.text(`Date: ${dateStr} | Duration: ${formatDuration(stats.duration)}`, margin, yPos);
		yPos += 20;
		doc.setTextColor(0);

		// Helper to check page bounds/add page
		const checkPageBreak = (spaceNeeded: number) => {
			if (yPos + spaceNeeded > doc.internal.pageSize.getHeight() - margin) {
				doc.addPage();
				yPos = 20;
			}
		};

		// Strengths
		checkPageBreak(30);
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Strengths', margin, yPos);
		yPos += 10;
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');

		stats.strengths.forEach((point) => {
			const lines = doc.splitTextToSize(`• ${point}`, maxLineWidth);
			checkPageBreak(lines.length * 7);
			doc.text(lines, margin + 5, yPos);
			yPos += lines.length * 7;
		});
		yPos += 10;

		// Improvements
		checkPageBreak(30);
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Areas for Improvement', margin, yPos);
		yPos += 10;
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');

		stats.improvements.forEach((point) => {
			const lines = doc.splitTextToSize(`• ${point}`, maxLineWidth);
			checkPageBreak(lines.length * 7);
			doc.text(lines, margin + 5, yPos);
			yPos += lines.length * 7;
		});
		yPos += 15;

		// Transcript
		checkPageBreak(20);
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Transcript', margin, yPos);
		yPos += 10;
		doc.setFontSize(11);

		stats.transcript.forEach((entry) => {
			const speaker = entry.speaker === 'user' ? 'You' : 'Mentor';
			const prefix = `${speaker}: `;
			const text = entry.text;

			doc.setFont('helvetica', 'bold');
			const prefixWidth = doc.getTextWidth(prefix);
			checkPageBreak(7);
			doc.text(prefix, margin, yPos);

			doc.setFont('helvetica', 'normal');
			const lines = doc.splitTextToSize(text, maxLineWidth - prefixWidth);
			if (lines.length > 0) {
				doc.text(lines[0], margin + prefixWidth, yPos);
				for (let i = 1; i < lines.length; i++) {
					checkPageBreak(7);
					yPos += 5;
					doc.text(lines[i], margin + prefixWidth, yPos);
				}
			}
			yPos += 8;
			checkPageBreak(10);
		});

		doc.save('datesense-report.pdf');
	}

	function saveReportAndExit() {
		generatePDF();
	}
</script>


{#if stats}
	<div class="min-h-screen bg-slate-50">
		<header class="w-full bg-white px-6 py-4 shadow-sm">
			<a href="/" class="inline-flex items-center">
				<Logo class="h-10 w-auto" />
			</a>
		</header>

		<div class="flex-1 overflow-y-auto p-6 md:p-12">
			<div class="animate-slide-in mx-auto max-w-4xl space-y-8">
				<!-- Header -->
				<div class="mb-10 space-y-2 text-center">
					<h1 class="text-4xl font-extrabold tracking-tight text-slate-800">The Rewind</h1>
					<p class="text-lg text-slate-500">Here is a breakdown of your social vibe.</p>
					<p class="text-sm text-slate-400">Session duration: {formatDuration(stats.duration)}</p>
				</div>

			<!-- Qualitative Feedback Columns -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<StrengthsList strengths={stats.strengths} />
				<ImprovementsList improvements={stats.improvements} />
			</div>

			<!-- Transcript Viewer -->
			<div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-6">
					<!-- Message square icon -->
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
						class="text-slate-400"
					>
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
					<h3 class="font-semibold text-slate-700">Full Transcript</h3>
				</div>
				<TranscriptViewer entries={stats.transcript} />
			</div>

			<!-- Actions -->
			<div class="flex flex-col justify-center gap-4 pb-12 pt-4 md:flex-row">
				<button
					type="button"
					onclick={practiceAgain}
					class="flex transform items-center justify-center gap-2 rounded-full bg-lblue px-8 py-4 font-semibold text-slate-800 shadow-lg transition-all hover:-translate-y-1 hover:bg-mblue hover:shadow-xl"
				>
					<!-- Refresh icon -->
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
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
						<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
						<path d="M8 16H3v5" />
					</svg>
					<span>Practice Again</span>
				</button>
				<button
					type="button"
					onclick={saveReportAndExit}
					class="flex items-center justify-center gap-2 rounded-full border-2 border-mblue bg-white px-8 py-4 font-semibold text-slate-800 shadow-sm transition-all hover:bg-lblue"
				>
					<!-- Download icon -->
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
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" x2="12" y1="15" y2="3" />
					</svg>
					<span>Save Report</span>
				</button>
			</div>
		</div>
	</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-slate-50">
		<div class="text-center">
			<p class="text-slate-500">Loading session data...</p>
		</div>
	</div>
{/if}
