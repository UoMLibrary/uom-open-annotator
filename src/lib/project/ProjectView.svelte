<script>
	import { writable, derived, get } from 'svelte/store';

	import ViewerShell from '$lib/viewer/ViewerShell.svelte';
	import SidePanel from '$lib/SidePanel.svelte';
	import ImagePairList from '$lib/images/ImagePairList.svelte';
	import AnnotationsList from '$lib/viewer/AnnotationsList.svelte';
	import Header from '$lib/Header.svelte';
	import { createImagePairSession } from '$lib/viewer/imagePairSession';

	export let project = null;
	let showHelp = false;
	let showAbout = false;

	const EMPTY_PROJECT = {
		id: null,
		name: null,
		imagePairs: []
	};

	let projectDirHandle = null; // FileSystemDirectoryHandle (if supported)

	/* -----------------------------
	   Project-level state
	----------------------------- */

	const projectStore = writable(EMPTY_PROJECT);
	const selectedPairId = writable(null);

	const activePair = derived([projectStore, selectedPairId], ([$project, $id]) => {
		if (!$project || !$id) return null;
		return $project.imagePairs.find((p) => p.id === $id) ?? null;
	});

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

	async function handleLoadProject() {
		// Clean up previous project (important)
		if ($projectStore) {
			cleanupProject(get(projectStore));
		}

		if (supportsFileSystemAccess()) {
			await loadViaDirectoryPicker();
		} else {
			await loadViaFileInput();
		}

		async function loadViaDirectoryPicker() {
			const dir = await window.showDirectoryPicker();
			projectDirHandle = dir;

			const files = new Map();

			for await (const entry of dir.values()) {
				if (entry.kind === 'file') {
					const file = await entry.getFile();
					files.set(file.name, file);
				}
			}

			await loadProjectFromFiles(files);
		}
	}

	async function loadViaFileInput() {
		return new Promise((resolve) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.webkitdirectory = true;
			input.multiple = true;

			input.onchange = async () => {
				const files = new Map(Array.from(input.files).map((f) => [f.name, f]));
				projectDirHandle = null; // no write-back
				await loadProjectFromFiles(files);
				resolve();
			};

			input.click();
		});
	}

	async function loadProjectFromFiles(fileMap) {
		const projectFile = fileMap.get('project.json');
		if (!projectFile) {
			alert('No project.json found');
			return;
		}

		const text = await projectFile.text();
		const data = JSON.parse(text);

		data.imagePairs = data.imagePairs.map((pair) => ({
			...pair,
			imageA: URL.createObjectURL(fileMap.get(pair.imageA)),
			imageB: URL.createObjectURL(fileMap.get(pair.imageB))
		}));

		projectStore.set(data);
		selectedPairId.set(null);
	}

	// SAVE

	async function handleSaveProject() {
		const data = get(projectStore);

		if (projectDirHandle) {
			await saveViaFileSystemAccess(data);
		} else {
			saveViaDownload(data);
		}
	}

	async function saveViaFileSystemAccess(data) {
		let fileHandle;

		try {
			fileHandle = await projectDirHandle.getFileHandle('project.json');
		} catch {
			// Optional: prompt user
			fileHandle = await projectDirHandle.getFileHandle('project.json', {
				create: true
			});
		}

		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(data, null, 2));
		await writable.close();
	}

	function saveViaDownload(data) {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json'
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'project.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function cleanupProject(project) {
		project.imagePairs.forEach((p) => {
			URL.revokeObjectURL(p.imageA);
			URL.revokeObjectURL(p.imageB);
		});
	}

	function supportsFileSystemAccess() {
		return 'showDirectoryPicker' in window;
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

	{#if showHelp}
		<div class="modal-backdrop" on:click={() => (showHelp = false)}>
			<div class="modal" on:click|stopPropagation>
				<h2>How to use this tool</h2>
				<ul>
					<li>Select an image pair from the left</li>
					<li>Pan / zoom images in sync</li>
					<li>Add annotations via the viewer</li>
					<li>Annotations are saved per image pair</li>
				</ul>
				<button on:click={() => (showHelp = false)}>Close</button>
			</div>
		</div>
	{/if}
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
