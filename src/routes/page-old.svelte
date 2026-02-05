<script>
	import { onMount, onDestroy } from 'svelte';
	import OpenSeadragonViewer from '$lib/viewer/OpenSeaDragonViewer.svelte';
	import AnnotationLayer from '$lib/viewer/AnnotationLayer.svelte';
	import { writable } from 'svelte/store';

	const imgA = '/imgA.jpg';
	const imgB = '/imgB.jpg';

	$: console.log(JSON.stringify($annotations)); // reactive dependency

	let osdViewer = null;
	let annoLayer = null;
	let isShiftDown = false;

	const annotations = writable([]);
	let overlayOpacity = 0.5;
	let currentMode = 'pan';

	function handleViewerReady(event) {
		osdViewer = event.detail.viewer;
	}

	function setOverlayOpacity(value) {
		overlayOpacity = Math.min(1, Math.max(0, value));

		if (osdViewer) {
			osdViewer.world.getItemAt(1)?.setOpacity(overlayOpacity);
		}
	}

	function handleOpacityChange(event) {
		setOverlayOpacity(parseFloat(event.target.value));
	}

	function handleAnnotationCreate(annotation) {
		annotations.update((list) => [...list, annotation]);
	}

	function updateMode(mode) {
		currentMode = mode;
	}

	// ─────────────────────────────
	// Keyboard shortcuts
	// ─────────────────────────────
	function handleKeyDown(e) {
		if (!annoLayer) return;

		// Tool switching
		if (e.key === 'b') {
			annoLayer.rectangle();
			updateMode('rectangle');
		}

		if (e.key === 'p') {
			annoLayer.polygon();
			updateMode('polygon');
		}

		if (e.key === 'Escape') {
			annoLayer.pan();
			updateMode('pan');
		}

		// Track Shift
		if (e.key === 'Shift') {
			isShiftDown = true;
			return;
		}
	}

	function handleKeyUp(e) {
		if (e.key === 'Shift') {
			isShiftDown = false;
		}
	}

	function handleWheel(e) {
		if (!isShiftDown) return;

		e.preventDefault();

		// Pick the dominant axis (trackpad-safe)
		const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

		if (rawDelta === 0) return;

		// Tune for feel (trackpads need small values)
		const sensitivity = 0.002;

		const delta = -rawDelta * sensitivity;

		setOverlayOpacity(overlayOpacity + delta);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('wheel', handleWheel, { passive: false });
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
		window.removeEventListener('wheel', handleWheel);
	});
</script>

<main>
	<!-- Toolbar -->
	<div class="toolbar">
		<button
			on:click={() => {
				annoLayer?.rectangle();
				updateMode('rectangle');
			}}
		>
			Draw box (B)
		</button>

		<button
			on:click={() => {
				annoLayer?.polygon();
				updateMode('polygon');
			}}
		>
			Draw polygon (P)
		</button>

		<button
			on:click={() => {
				annoLayer?.pan();
				updateMode('pan');
			}}
		>
			Pan / Zoom (Esc)
		</button>

		<label class="fade">
			Fade
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={overlayOpacity}
				on:input={handleOpacityChange}
			/>
		</label>

		<div class="mode-indicator">
			Mode: <strong>{currentMode}</strong>
		</div>
	</div>

	<!-- Viewer -->
	<OpenSeadragonViewer {imgA} {imgB} on:ready={handleViewerReady} />

	<!-- Annotation overlay -->
	{#if osdViewer}
		<AnnotationLayer bind:this={annoLayer} viewer={osdViewer} />
	{/if}

	<!-- Debug / output -->
	<section class="annotations">
		<h2>Annotations</h2>
		<ul>
			{#each $annotations as a}
				<li>{JSON.stringify(a)}</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		padding: 1rem;
	}

	/* Floating toolbar */
	.toolbar {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		z-index: 1000;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: rgba(255, 255, 255, 0.95);
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.toolbar button {
		padding: 0.3rem 0.6rem;
		cursor: pointer;
	}

	.toolbar .fade {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		margin-left: 0.5rem;
	}

	.annotations {
		margin-top: 2rem;
	}

	.mode-indicator {
		margin-left: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		background: #222;
		color: #fff;
		font-size: 0.8rem;
	}

	/*chnage cursor when shift is held */
	body.shift-fade {
		cursor: ew-resize;
	}
</style>
