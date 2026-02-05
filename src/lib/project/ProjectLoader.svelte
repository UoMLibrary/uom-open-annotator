<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let explode = false;

	function createDemoProject() {
		return {
			id: 'demo-project',
			name: 'Demo Project',
			basePath: '/',

			imagePairs: [
				{
					id: 'pair-art',
					label: 'Art comparison',
					imageA: '/art1.png',
					imageB: '/art2.png',
					annotations: []
				},
				{
					id: 'pair-epicoene',
					label: 'Epicoene comparison',
					imageA: '/epicoene1.png',
					imageB: '/epicoene2.png',
					annotations: []
				},
				{
					id: 'pair-img',
					label: 'Image comparison',
					imageA: '/imgA.jpg',
					imageB: '/imgB.jpg',
					annotations: []
				},
				{
					id: 'pair-map',
					label: 'Map comparison',
					imageA: '/map1.png',
					imageB: '/map2.png',
					annotations: []
				},
				{
					id: 'pair-music',
					label: 'Music manuscript comparison',
					imageA: '/music1.png',
					imageB: '/music2.png',
					annotations: []
				},
				{
					id: 'pair-photo',
					label: 'Photograph comparison',
					imageA: '/photo1.png',
					imageB: '/photo2.png',
					annotations: []
				},
				{
					id: 'pair-puzzle',
					label: 'Puzzle comparison',
					imageA: '/puzzle1.png',
					imageB: '/puzzle2.png',
					annotations: []
				}
			]
		};
	}

	function openProject() {
		explode = true;
		const project = createDemoProject();
		setTimeout(() => (explode = false), 600);
		dispatch('projectLoaded', project);
	}
</script>

<div class="universe">
	<div class="stars"></div>

	<button class="god-button {explode ? 'explode' : ''}" on:click={openProject}>
		<span class="core">OPEN PROJECT</span>

		<span class="ring ring-a"></span>
		<span class="ring ring-b"></span>
		<span class="ring ring-c"></span>
	</button>
</div>

<style>
	/* ===== Universe ===== */
	.universe {
		position: relative;
		min-height: 100vh;
		background: radial-gradient(circle at center, #05010a, #000);
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	/* ===== Stars ===== */
	.stars {
		position: absolute;
		inset: 0;
		background:
			repeating-radial-gradient(circle at 20% 30%, white 0 1px, transparent 2px 80px),
			repeating-radial-gradient(circle at 80% 60%, white 0 1px, transparent 2px 120px);
		opacity: 0.25;
		animation: drift 120s linear infinite;
	}

	@keyframes drift {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-2000px);
		}
	}

	/* ===== Button ===== */
	.god-button {
		position: relative;
		width: 260px;
		height: 260px;
		border-radius: 50%;
		border: none;
		background: conic-gradient(from 0deg, #ff00cc, #3333ff, #00ffee, #ffcc00, #ff00cc);
		cursor: pointer;
		animation:
			spin 8s linear infinite,
			breathe 3s ease-in-out infinite;
		box-shadow:
			0 0 60px rgba(255, 0, 255, 0.8),
			0 0 120px rgba(0, 255, 255, 0.6),
			inset 0 0 40px rgba(255, 255, 255, 0.3);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes breathe {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
	}

	/* ===== Core ===== */
	.core {
		position: absolute;
		inset: 20%;
		background: radial-gradient(circle, #111, #000);
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: white;
		font-size: 1.3rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-shadow:
			0 0 10px #00ffee,
			0 0 25px #ff00cc;
		z-index: 2;
	}

	/* ===== Rings ===== */
	.ring {
		position: absolute;
		inset: -25%;
		border-radius: 50%;
		border: 2px solid transparent;
		pointer-events: none;
	}

	.ring-a {
		border-top-color: #ff00cc;
		animation: orbit 6s linear infinite;
	}

	.ring-b {
		inset: -35%;
		border-right-color: #00ffee;
		animation: orbitReverse 10s linear infinite;
	}

	.ring-c {
		inset: -45%;
		border-left-color: #ffcc00;
		animation: orbit 14s linear infinite;
	}

	@keyframes orbit {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes orbitReverse {
		to {
			transform: rotate(-360deg);
		}
	}

	/* ===== Hover: magnetic pull ===== */
	.god-button:hover {
		filter: brightness(1.3) saturate(1.4);
	}

	/* ===== Click explosion ===== */
	.explode {
		animation: explode 0.6s ease-out forwards;
	}

	@keyframes explode {
		0% {
			transform: scale(1);
			filter: brightness(1);
		}
		60% {
			transform: scale(1.6);
			filter: brightness(2);
		}
		100% {
			transform: scale(1);
			filter: brightness(1);
		}
	}

	/* ===== Accessibility ===== */
	.god-button:focus-visible {
		outline: 3px solid #00ffee;
		outline-offset: 6px;
	}
</style>
