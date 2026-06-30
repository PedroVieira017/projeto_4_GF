<script>
	import { t } from '$lib/translations/translations';
	import { onDestroy, onMount } from 'svelte';

	/** @type {{
	 * onclose?: (event: MouseEvent) => void,
	 * title: string,
	 * message: string,
	 * open?: boolean,
	 * showBackdrop?: boolean,
	 * modalOptions?: string,
	 * closeOnEscapeKey?: boolean,
	 * children?: import('svelte').Snippet}}
	 **/
	let {
		onclose,
		title,
		message,
		open = $bindable(false),
		showBackdrop = true,
		modalOptions = '',
		closeOnEscapeKey = false,
		children
	} = $props();

	/**
	 * Handles the close event, updating the `open` state and invoking the `onclose` callback if defined.
	 *
	 * @function handleOnClose
	 * @param {MouseEvent} event - The event object triggered by the close action.
	 */
	function handleOnClose(event) {
		open = false;
		if(onclose) {
			onclose(event);
		}
	}

	function handleEscapeKeyModalClose(e) {
		if (e.key === "Escape" && open) {
			handleOnClose();
		}
	}

	onMount(() => {
		if(closeOnEscapeKey) {
			document.addEventListener("keydown", handleEscapeKeyModalClose);
		}
	});

	onDestroy(() => {
		if(closeOnEscapeKey) {
			document.removeEventListener("keydown", handleEscapeKeyModalClose);
		}
	});
</script>

<style>
    .modal-body {
        max-height: 500px;
        overflow-y: auto;
    }
</style>

<!--
@component
Displays an error modal that can be used to display a detailed error

Bindings:
- open: allows to access the open value from the parent component, usefull to close the modal on the parent component

Events dispatached:
- close: sent when the modal its closed

Usage:
```html
	<ErrorModal
	title="title"
	message="message"
	bind:open={open} />
```
-->

{#if open}
	<div
		class="modal d-block"
		id="confirmation-modal"
		tabindex="-1"
		role="dialog"
		aria-labelledby="confirmation-modal-label"
		aria-hidden={false}
	>
		<div class="modal-dialog modal-dialog-centered {modalOptions}" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="confirmation-modal-label">{title}</h5>
					<button
						type="button"
						class="close"
						data-dismiss="modal"
						aria-label={$t('modal.actions.close')}
						onclick={handleOnClose}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="d-flex justify-content-center align-items-center w-100 h-100">
						<p>{message}</p>
					</div>
					{@render children?.()}
				</div>
				<div class="modal-footer">
					<button
						type='button'
						class="btn btn-block btn-danger m-0"
						onclick={handleOnClose}>
						{$t('modal.actions.close')}
					</button>
				</div>
			</div>
		</div>
	</div>
	{#if showBackdrop}
		<div class="modal-backdrop show {open ? 'd-block' : 'd-none'}"></div>
	{/if}
{/if}
