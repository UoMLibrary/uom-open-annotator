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

	import Toast from '$lib/ui/Toast.svelte';
	import { showToast } from '$lib/ui/toast';
	import HelpModal from '$lib/modals/HelpModal.svelte';
	import AboutModal from '$lib/modals/AboutModal.svelte';
	import Header from '$lib/Header.svelte';
	import SidePanel from '$lib/SidePanel.svelte';
	import ImagePairList from '$lib/images/ImagePairList.svelte';
	import AnnotationsList from '$lib/viewer/AnnotationsList.svelte';
	import ViewerShell from '$lib/viewer/ViewerShell.svelte';

	import { createImagePairSession } from '$lib/viewer/imagePairSession';

	let showHelp = false;
	let showAbout = false;

	let projectDirHandle = null; // FileSystemDirectoryHandle (if supported)

	/* -----------------------------
	   UI state
	----------------------------- */

	let annotationsOpen = false;
	let imagesOpen = false;

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

	/* -----------------------------
	Data handling
	----------------------------- */

	async function handleLoadProject(event) {
		imagesOpen = true;

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

		try {
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

			showToast('Project saved', 'success');
		} catch (err) {
			console.error(err);
			showToast('Failed to save project', 'error', 4000);
		}
	}
</script>

<div class="app">
	<Toast />
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

	<HelpModal bind:open={showHelp} />
	<AboutModal bind:open={showAbout} />
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
