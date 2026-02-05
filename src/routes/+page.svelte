<script>
	import ProjectLoader from '$lib/project/ProjectLoader.svelte';
	import ProjectView from '$lib/project/ProjectView.svelte';

	let project = null;
</script>

<main>
	{#if !project}
		<ProjectLoader on:projectLoaded={(e) => (project = e.detail)} />
	{:else}
		<ProjectView {project} />
	{/if}
</main>

<style>
	main {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>
