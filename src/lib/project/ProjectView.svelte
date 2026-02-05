<script>
	import { writable, derived, get } from 'svelte/store';

	import ViewerShell from '$lib/viewer/ViewerShell.svelte';
	import SidePanel from '$lib/SidePanel.svelte';
	import ImagePairList from '$lib/images/ImagePairList.svelte';
	import AnnotationsList from '$lib/viewer/AnnotationsList.svelte';
	import Header from '$lib/Header.svelte';
	import { createImagePairSession } from '$lib/viewer/imagePairSession';

	export let project;

	/* -----------------------------
	   Project-level state
	----------------------------- */

	const projectStore = writable(project);
	const selectedPairId = writable(null);

	const activePair = derived([projectStore, selectedPairId], ([$project, $id]) =>
		$project.imagePairs.find((p) => p.id === $id)
	);

	/* -----------------------------
	   UI state
	----------------------------- */

	let annotationsOpen = false;
	let imagesOpen = true;

	/* -----------------------------
	   Session state
	----------------------------- */

	let session;
	let annotations;
	let meta;

	let unsubAnnotations;
	let unsubViewState;

	// UI-only: track annotation count changes
	let prevAnnotationCount = 0;

	/* -----------------------------
	   Select first image pair
	----------------------------- */

	$: if (!$selectedPairId && $projectStore?.imagePairs?.length > 0) {
		selectedPairId.set($projectStore.imagePairs[0].id);
	}

	/* -----------------------------
	   Create session from ImagePair
	----------------------------- */

	$: if ($activePair) {
		// Clean up old subscriptions
		unsubAnnotations?.();
		unsubViewState?.();

		session = createImagePairSession({
			annotations: $activePair.annotations,
			overlayOpacity: $activePair.viewState?.overlayOpacity ?? 0.5,
			pan: $activePair.viewState?.pan ?? null,
			zoom: $activePair.viewState?.zoom ?? null
		});

		({ annotations, meta } = session);

		prevAnnotationCount = $activePair.annotations?.length ?? 0;

		/* -----------------------------
		   Persist session → ImagePair
		----------------------------- */

		unsubAnnotations = session.annotations.subscribe((list) => {
			projectStore.update((p) => {
				const pair = p.imagePairs.find((x) => x.id === $activePair.id);
				pair.annotations = list;
				return p;
			});
		});

		unsubViewState = session.viewState.subscribe((viewState) => {
			projectStore.update((p) => {
				const pair = p.imagePairs.find((x) => x.id === $activePair.id);
				pair.viewState = viewState;
				return p;
			});
		});
	}

	/* -----------------------------
   	Auto-open / close annotations panel
	----------------------------- */

	$: if (annotations) {
		annotationsOpen = $annotations.length > 0;
	}

	// Data handling
	function handleSave() {
		const data = get(projectStore);
		console.log(data);

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'project.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleLoad() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = async () => {
			const file = input.files[0];
			if (!file) return;
			const text = await file.text();
			const data = JSON.parse(text);
			console.log(data);
		};
		input.click();
	}
</script>

<div class="app">
	<Header on:load={handleLoad} on:save={handleSave} />
	<div class="workspace">
		<SidePanel side="left" bind:open={imagesOpen}>
			<span slot="header" class="panel-title">Images</span>
			<ImagePairList
				imagePairs={$projectStore.imagePairs}
				selectedId={$selectedPairId}
				on:select={(e) => selectedPairId.set(e.detail.id)}
			/>
		</SidePanel>

		<div class="viewer">
			{#if $activePair}
				{#key $activePair.id}
					<ViewerShell imageA={$activePair.imageA} imageB={$activePair.imageB} {session} />
				{/key}
			{:else}
				<div class="empty">Select an image pair</div>
			{/if}
		</div>

		<SidePanel side="right" bind:open={annotationsOpen}>
			<span slot="header" class="panel-title">Annotations</span>
			{#if session}
				<AnnotationsList {session} />
			{/if}
		</SidePanel>
	</div>
</div>

<style>
	.app {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100vh;
	}

	.workspace {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: 1fr;
		overflow: hidden;
	}

	.panel-title {
		display: block;

		padding: 0.5rem 0.75rem;

		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;

		color: #444;

		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;

		user-select: none;
	}
</style>
