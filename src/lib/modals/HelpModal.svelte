<script>
	import Modal from './Modal.svelte';

	export let open = false;
</script>

<Modal {open} title="How to use this tool" on:close={() => (open = false)}>
	<p>
		This tool allows you to compare pairs of images using overlays and add structured annotations
		for visual analysis.
	</p>

	<h3>Basic usage</h3>
	<ul>
		<li>Select an image pair from the left sidebar</li>
		<li>Pan and zoom images in sync</li>
		<li>Add annotations directly in the viewer</li>
		<li>Annotations are saved per image pair</li>
	</ul>

	<h3>Keyboard & mouse controls</h3>
	<ul>
		<li><kbd>[</kbd> — Open image pair sidebar</li>
		<li><kbd>]</kbd> — Open annotations sidebar</li>
		<li><kbd>Escape</kbd> or <kbd>1</kbd> — Pan image mode</li>
		<li><kbd>B</kbd> or <kbd>2</kbd> — Rectangle annotation mode</li>
		<li><kbd>P</kbd> or <kbd>3</kbd> — Polygon annotation mode</li>
		<li><kbd>Mouse wheel</kbd> — Zoom</li>
		<li><kbd>Shift</kbd> + <kbd>Mouse wheel</kbd> — Fade between images</li>
	</ul>
</Modal>
