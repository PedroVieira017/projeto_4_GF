<script>
	import { t } from '$lib/translations/translations';
	import ButtonLoading from '$lib/components/ui/buttons/ButtonLoading.svelte';
	import { onDestroy, onMount } from 'svelte';

	/** @type {{
	 * onclose?: (event: MouseEvent) => void,
	 * onconfirmation?: (event: MouseEvent) => void,
	 * title: string,
	 * message: string,
	 * open?: boolean,
	 * form?: string | null,
	 * showBackdrop?: boolean,
	 * modalOptions?: string,
	 * loading?: boolean,
	 * closeOnEscapeKey?: boolean,
	 * children?: import('svelte').Snippet}}
	 **/
	let {
		onclose,
		onconfirmation,
		title,
		message,
		open = $bindable(false),
		form = null,
		showBackdrop = true,
		modalOptions = '',
		loading = $bindable(false),
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

	/**
	 * Handles the confirmation event, updating the `open` state and invoking the `onconfirmation` callback if defined.
	 *
	 * @function handleOnConfirmation
	 * @param {MouseEvent} event - The event object triggered by the confirmation action.
	 */
	function handleOnConfirmation(event) {
		if(onconfirmation) {
			onconfirmation(event);
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
Displays a confirmation modal that can be used when necessary to ensure that a user really wants to perform an action

Bindings:
- open: allows to access the open value from the parent component, usefull to close the modal on the parent component

Events dispatched:
- close: sent when the modal its closed
- confirmation: sent when user confirms the action

Usage:
```html
	<ConfirmationModal
	title="title"
	message="message"
	form="form-id"
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
						<p class="text-justify">{message}</p>
					</div>
					{@render children?.()}
				</div>
				<div class="modal-footer">
					<button
						disabled={loading}
						type="button"
						class="btn btn-block btn-secondary"
						data-dismiss="modal"
						onclick={handleOnClose}>
						{$t('modal.actions.no')}
					</button>

					{#if form}
						<ButtonLoading
							isLoading={loading}
							type="submit"
							form={form}
							class="btn btn-block btn-primary m-0">
							{$t('modal.actions.yes')}
						</ButtonLoading>
					{:else}
						<ButtonLoading
							isLoading={loading}
							type="button"
							class="btn btn-block btn-primary m-0"
							onclick={handleOnConfirmation}>
							{!loading ? $t('modal.actions.yes') : ''}
						</ButtonLoading>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if showBackdrop}
		<div class="modal-backdrop show {open ? 'd-block' : 'd-none'}"></div>
	{/if}
{/if}
