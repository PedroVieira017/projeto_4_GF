<script>
	/** @type {{
	 * 		onupload: (blob: Blob) => void,
	 * 		children?: import('svelte').Snippet
	 * }}
	 **/
	let {
		onupload,
		children
	} = $props();

	/**@type {HTMLInputElement | undefined}*/
	let input = $state();

	/**
	 * Handles the onChange event.
	 *
	 * @param {Event} event Event object representing the change event.
	 * @returns {void}
	 * @description This function takes in an event object and checks if the target element it's not null.
	 * If it isn't, it dispatches a custom 'click' event, passing a Blob containing the selected file.
	 * The Blob is constructed from the file selected from the input.
	 * Emits a click event with the blob on the event details
	 */
	function handleOnChange(event) {
		if (event.target != null) {
			onupload(new Blob([event.target.files[0]], { type: event.target.files[0].type }));
		}
	}
</script>

<!--
@component
Displays a button that can function as a file entry, useful when you need a button to load a file instead of a file entry.

Usage:
```html
	<ButtonFileUpload on:click={(event) => file = event.details}>
		<i class="icon-cloud-upload"/>
	</ButtonFileUpload>
```
-->

<button onclick={() => input.click()}>
	{@render children?.()}
</button>
<input
	type="file"
	hidden
	onchange={handleOnChange}
	bind:this={input}
/>