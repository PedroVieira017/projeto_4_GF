<script>
	import { t } from '$lib/translations/translations';
	import ButtonLoading from '$lib/components/ui/buttons/ButtonLoading.svelte';
	import { onDestroy, onMount } from 'svelte';

	/** @type {{
   * titulo: string,
   * open?: boolean,
   * form?: any,
   * guardar?: boolean,
   * guardarLoading?: boolean,
   * cta?: {
   *   name: string,
   *   loading: boolean,
   *   callback: () => void,
	 *   disabled: boolean,
	 *   executed: boolean
   * },
   * showBackdrop?: boolean,
   * modalOptions?: string,
   * flush?: boolean,
   * onClosed: () => void,
   * modal_xl?: boolean,
	 * closeOnEscapeKey?: boolean,
   * children?: import('svelte').Snippet}}
   * */
	let {
		titulo,
		open = $bindable(false),
		form = null,
		guardar = true,
		guardarLoading = false,
    cta = null,
		showBackdrop = true,
		modalOptions = '',
		flush = false,
		onClosed,
		modal_xl = false,
		closeOnEscapeKey = false,
		children
	} = $props();

	const modalClose = () => {
		open = false;
		if (onClosed) {
			onClosed();
		}
	};

	function handleEscapeKeyModalClose(e) {
		if (e.key === "Escape" && open) {
			modalClose();
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

<div
	class="modal {open ? 'd-block' : 'd-none'}"
	id="sampleModal"
	tabindex="-1"
	role="dialog"
	aria-labelledby="sampleModalLabel"
	aria-hidden={false}
>
	<div class="modal-dialog {modalOptions}" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="sampleModalLabel">{titulo}</h5>
				<button
					type="button"
					class="close"
					data-dismiss="modal"
					aria-label={$t('modal.actions.close')}
					onclick={modalClose}
				>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body {flush ? 'modal-body-flush' : ''}">
				{@render children?.()}
			</div>
			<div class="modal-footer">
				{#if guardar && cta === null}
					<button type="button" class="btn btn-secondary" data-dismiss="modal" onclick={modalClose}>
						{$t('modal.actions.cancel')}
					</button>
					<ButtonLoading
						isLoading={guardarLoading}
						type={form ? 'submit' : 'button'}
						form={form ? form : ''}
						class="btn btn-primary"
					>
						{$t('modal.actions.save')}
					</ButtonLoading>
				{/if}

        {#if !guardar && cta !== null}
					{#if !cta.executed}
						<button
							disabled={cta.loading}
							type="button"
							class="btn btn-secondary"
							data-dismiss="modal"
							onclick={modalClose}>
							{$t('modal.actions.cancel')}
						</button>

						<ButtonLoading
							disabled={cta.disabled || cta.loading}
							isLoading={cta.loading}
							onclick={cta.callback}
							type="button"
							class="btn btn-primary">
							{cta.name}
						</ButtonLoading>
					{:else}
						<button type="button" class="btn btn-primary" data-dismiss="modal" onclick={modalClose}>
							{$t('modal.actions.close')}
						</button>
					{/if}

        {/if}

        {#if !(guardar && cta === null) && !(!guardar && cta !== null)}
          <button type="button" class="btn btn-primary" data-dismiss="modal" onclick={modalClose}>
            {$t('modal.actions.close')}
          </button>
        {/if}
			</div>
		</div>
	</div>
</div>
{#if showBackdrop}
	<div class="modal-backdrop show {open ? 'd-block' : 'd-none'}"></div>
{/if}

<style>
	.modal-body {
		max-height: 500px;
		overflow-y: auto;
	}

	.modal-body-flush {
		padding: 0;
	}
</style>
