<script>
	import ProjectView from '$lib/project/ProjectView.svelte';

	let project = null;
</script>

<main>
	<ProjectView {project} />
</main>

<svelte:head>
	<title>Image Annotator</title>
	<meta name="description" content="Experimental image annotation and comparison tool" />
</svelte:head>

<style>
	main {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>
