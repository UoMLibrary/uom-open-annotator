<script>
	import ProjectView from '$lib/project/ProjectView.svelte';

	let project = null;
</script>

<main>
	<ProjectView {project} />
</main>

<style>
	main {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>
