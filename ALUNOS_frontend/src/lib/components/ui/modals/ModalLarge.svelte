<script>
	import Modal from '$lib/components/Modal.svelte';

	/** @type {{
	 * onclose?: (event: MouseEvent) => void,
	 * title: string,
	 * open?: boolean,
	 * form?: string | null,
	 * guardar?: boolean,
	 * guardarLoading?: boolean,
	 * cta: {
	 * 	name: string,
	 * 	loading: boolean,
	 * 	disabled: boolean
	 * 	callback: () => void,
	 * 	executed: boolean
	 * }
	 * showBackdrop?: boolean,
	 * modalOptions?: string,
	 * flush?: boolean,
	 * closeOnEscapeKey?: boolean,
	 * children?: import('svelte').Snippet}}
	 **/
	let {
		onclose,
		title,
		open = $bindable(false),
		form = null,
		guardar = true,
		guardarLoading = false,
		cta = null,
		showBackdrop = true,
		modalOptions = '',
		flush = false,
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
</script>

<!--
@component
This component wraps the ```Modal.svelte``` component in order to display a large modal

Events dispatached:
- close: sent when the modal its closed

Usage:
```html
	<ModalLarge
		title="title"
		open={open}
		form="form id"}>
		...
	</ModalLarge>

```
-->

{#if open}
	<Modal
		titulo={title}
		{open}
		onClosed={handleOnClose}
		{showBackdrop}
		{guardar}
		{guardarLoading}
		{cta}
		{form}
		{flush}
		{closeOnEscapeKey}
		modalOptions={`modal-lg ${modalOptions}`}
	>
		{@render children?.()}
	</Modal>
{/if}
