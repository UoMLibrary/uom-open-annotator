<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	async function openFolder(event) {
		const files = Array.from(event.target.files);

		// Map filename → File
		const fileMap = new Map(files.map((f) => [f.name, f]));

		const projectFile = fileMap.get('project.json');
		if (!projectFile) {
			alert('No project.json found in folder');
			return;
		}

		const text = await projectFile.text();
		const project = JSON.parse(text);

		// Resolve image filenames to object URLs
		project.imagePairs = project.imagePairs.map((pair) => ({
			...pair,
			imageA: URL.createObjectURL(fileMap.get(pair.imageA)),
			imageB: URL.createObjectURL(fileMap.get(pair.imageB))
		}));

		dispatch('projectLoaded', project);
	}
</script>

<input type="file" webkitdirectory multiple on:change={openFolder} />
