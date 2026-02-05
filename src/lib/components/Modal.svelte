<script>
	import { createEventDispatcher, onMount } from 'svelte';

	export let open = false;
	export let title = '';

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function onKey(e) {
		if (e.key === 'Escape') close();
	}

	onMount(() => {
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if open}
	<div class="backdrop" on:click={close}>
		<div class="modal" on:click|stopPropagation>
			<header class="modal-header">
				<div class="modal-title">
					{#if title}
						{title}
					{/if}
				</div>

				<button class="close-button" aria-label="Close" on:click={close}> × </button>
			</header>

			<div class="modal-body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	/* ---------- Backdrop ---------- */

	.backdrop {
		position: fixed;
		inset: 0;

		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(2px);

		display: grid;
		place-items: center;

		z-index: 1000;
	}

	/* ---------- Modal shell ---------- */

	.modal {
		display: flex;
		flex-direction: column;

		max-width: 520px;
		width: calc(100% - 2rem);
		max-height: calc(100vh - 4rem);

		background: white;
		border-radius: 12px;

		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.2),
			0 2px 8px rgba(0, 0, 0, 0.15);

		overflow: hidden;

		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	/* ---------- Header ---------- */

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		/* compact header */
		padding: 0.5rem 0.75rem;

		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.modal-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: #111827;
	}

	/* ---------- Close button ---------- */

	.close-button {
		all: unset;

		/* visual size */
		font-size: 1.1rem;
		line-height: 1;

		/* large hit area */
		width: 36px;
		height: 36px;

		display: grid;
		place-items: center;

		cursor: pointer;
		color: #444;

		border-radius: 8px;
	}

	.close-button:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	.close-button:active {
		background: rgba(0, 0, 0, 0.12);
	}

	.close-button:focus-visible {
		outline: 2px solid #4c9ffe;
		outline-offset: 2px;
	}

	/* ---------- Body ---------- */

	.modal-body {
		padding: 1rem 1.25rem;
		overflow: auto;
	}
</style>
