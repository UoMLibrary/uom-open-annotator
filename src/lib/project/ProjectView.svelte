<script>
	import { loadProjectFromFiles, saveProjectToDownload } from '$lib/project/projectIO';
	import {
		projectStore,
		selectedPairId,
		activePair,
		cleanupProject,
		serialiseProject
	} from '$lib/project/projectStore';
	import { get } from 'svelte/store';

	import Header from '$lib/Header.svelte';
	import SidePanel from '$lib/SidePanel.svelte';
	import ImagePairList from '$lib/images/ImagePairList.svelte';
	import AnnotationsList from '$lib/viewer/AnnotationsList.svelte';
	import ViewerShell from '$lib/viewer/ViewerShell.svelte';
	import Modal from '$lib/components/Modal.svelte';

	import { createImagePairSession } from '$lib/viewer/imagePairSession';

	let showHelp = false;
	let showAbout = false;

	let projectDirHandle = null; // FileSystemDirectoryHandle (if supported)

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

	$: if ($projectStore && !$selectedPairId && $projectStore.imagePairs?.length > 0) {
		selectedPairId.set($projectStore.imagePairs[0].id);
	}

	const prevProject = get(projectStore);
	if (prevProject?.imagePairs) {
		cleanupProject(prevProject);
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

	async function handleLoadProject(event) {
		const { files, dir } = event.detail;

		const prev = get(projectStore);
		if (prev?.imagePairs) cleanupProject(prev);

		projectDirHandle = dir;

		const data = await loadProjectFromFiles(files);
		projectStore.set(data);
		selectedPairId.set(null);
	}

	async function handleSaveProject() {
		const project = get(projectStore);
		const clean = serialiseProject(project);

		if (projectDirHandle) {
			const fileHandle = await projectDirHandle.getFileHandle('project.json', {
				create: true
			});
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(clean, null, 2));
			await writable.close();
		} else {
			await saveProjectToDownload(clean);
		}
	}
</script>

<div class="app">
	<!-- <Header on:load={handleLoad} on:save={handleSave} /> -->
	<Header
		on:load-project={handleLoadProject}
		on:save-project={handleSaveProject}
		on:help={() => (showHelp = true)}
		on:about={() => (showAbout = true)}
	/>
	<div class="workspace">
		<SidePanel side="left" bind:open={imagesOpen}>
			<span slot="header" class="panel-title">Images</span>
			{#if $projectStore}
				<ImagePairList
					imagePairs={$projectStore.imagePairs}
					selectedId={$selectedPairId}
					on:select={(e) => selectedPairId.set(e.detail.id)}
				/>
			{:else}
				<div class="empty">No project loaded</div>
			{/if}
		</SidePanel>

		<div class="viewer">
			{#if $activePair}
				{#key $activePair.id}
					<ViewerShell imageA={$activePair.imageAUrl} imageB={$activePair.imageBUrl} {session} />
				{/key}
			{:else}
				<!-- <div class="empty">Select an image pair</div> -->
			{/if}
		</div>

		<SidePanel side="right" bind:open={annotationsOpen}>
			<span slot="header" class="panel-title">Annotations</span>
			{#if session}
				<AnnotationsList {session} />
			{/if}
		</SidePanel>
	</div>

	<Modal open={showHelp} title="How to use this tool" on:close={() => (showHelp = false)}>
		<ul>
			<li>Select an image pair from the left</li>
			<li>Pan / zoom images in sync</li>
			<li>Add annotations via the viewer</li>
			<li>Annotations are saved per image pair</li>
		</ul>
	</Modal>

	<Modal open={showAbout} title="About this tool" on:close={() => (showAbout = false)}>
		<p>
			This tool is designed for comparing pairs of images using overlays and adding structured
			annotations to support visual analysis.
		</p>

		<p>
			It runs entirely in the browser and can load projects directly from a local folder, with
			annotations saved back to the project file where the browser allows.
		</p>

		<hr />

		<ul>
			<li><strong>Purpose:</strong> Image comparison and annotation</li>
			<li><strong>Built with:</strong> Svelte</li>
			<li><strong>Data:</strong> Local project folder + <code>project.json</code></li>
			<li><strong>Storage:</strong> Browser File System Access API (with fallback)</li>
		</ul>

		<p style="font-size: 0.75rem; color: #555;">
			This is an experimental tool intended for research, exploration, and prototyping workflows.
		</p>
	</Modal>
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
