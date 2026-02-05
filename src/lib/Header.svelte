<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<header class="header">
	<div class="actions">
		<button on:click={() => dispatch('load')}>Load</button>
		<button on:click={() => dispatch('save')}>Save</button>
	</div>

	<div class="title">Image Annotation Project</div>
</header>

<style>
	/* ---------- Header shell ---------- */

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		height: 48px;
		padding: 0 1rem;

		background: rgba(255, 255, 255, 0.97);
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);

		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	/* ---------- Title ---------- */

	.title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #111827;
		letter-spacing: 0.01em;
	}

	/* ---------- Action group ---------- */

	.actions {
		display: flex;
		align-items: stretch;

		background: rgba(0, 0, 0, 0.04);
		border-radius: 8px;
		overflow: hidden;
	}

	/* ---------- Action buttons (toolbar-style) ---------- */

	.actions button {
		all: unset;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 0 0.9rem;
		height: 32px;

		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;

		color: #222;
		cursor: pointer;
	}

	/* Subtle segment separator */
	.actions button + button {
		border-left: 1px solid rgba(0, 0, 0, 0.08);
	}

	.actions button:hover {
		background: rgba(0, 0, 0, 0.06);
	}

	.actions button:active {
		background: rgba(0, 0, 0, 0.12);
	}

	.actions button:focus-visible {
		outline: 2px solid #4c9ffe;
		outline-offset: -2px;
	}
</style>
