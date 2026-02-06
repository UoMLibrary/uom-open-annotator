<script>
	import Modal from './Modal.svelte';

	export let open = false;
</script>

<Modal {open} title="About this tool" on:close={() => (open = false)}>
	<p>
		Designed for visual comparison, this application allows pairs of images to be overlaid and
		annotated to support detailed analysis.
	</p>

	<p>
		It runs entirely in the browser and can load projects directly from a local folder, with
		annotations saved back to the project file where the browser allows.
	</p>

	<h3>Technologies used</h3>
	<ul>
		<li>
			<a href="https://svelte.dev/docs/kit/introduction" target="_blank" rel="noopener noreferrer">
				SvelteKit
			</a>
			— application framework and UI architecture
		</li>
		<li>
			<a href="https://openseadragon.github.io/" target="_blank" rel="noopener noreferrer">
				OpenSeadragon
			</a>
			— high-resolution image viewing and deep zoom
		</li>
		<li>
			<a href="https://annotorious.dev/" target="_blank" rel="noopener noreferrer"> Annotorious </a>
			— annotation primitives and interaction models
		</li>
	</ul>

	<p>
		Rather than acting as a single, all-in-one solution, the tool is intended to form part of a
		broader workflow. Additional tools are planned to support related stages, such as image
		alignment, comparison preparation, and transformation of annotation outputs for downstream use.
	</p>

	<p class="muted">
		This is an experimental application and a work in progress, intended for research, exploration,
		and prototyping workflows.
	</p>
	<p class="muted">
		For any enquiries or suggestions for further development, please contact Christopher Wilson,
		Artificial Intelligence and Ideas Adoption (AIIA), The University of Manchester.
	</p>
</Modal>
