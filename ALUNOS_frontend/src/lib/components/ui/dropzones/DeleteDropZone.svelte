<script>
	/** @type {{
	 *  ondrop?: (event: DragEvent) => void,
	 * 	description: string
	 * }}
	 **/
	let {
		ondrop,
		description
	} = $props();

	/** @type {boolean} */
	let active = $state(false);

	/**
	 * Handles the `drop` event by invoking a drop callback function and disabling the active state.
	 *
	 * @param {DragEvent} event - The custom event triggered during the drop action.
	 *
	 * @description
	 * This function checks if the `drop` callback is defined and, if so, invokes it. After the drop
	 * action is processed, it sets the `active` variable to `false`, indicating that the drop process
	 * is complete and the active state is disabled.
	 *
	 * @requires `ondrop` - A callback function that handles the drop event logic.
	 * @requires `active` - A variable that tracks the active state, which is set to `false` after the drop.
	 */
	function handleOnDrop(event) {
		if(ondrop) {
			ondrop(event);
		}
		active = false;
	}

	/**
	 * Handles the `dragover` event, allowing the drag operation to proceed and enabling the active state.
	 *
	 * @param {DragEvent} event - The dragover event triggered during the drag operation.
	 *
	 * @description
	 * This function prevents the default behavior of the dragover event to allow dropping. It also
	 * sets the `active` variable to `true`, indicating that the drag operation is active and ready to accept the drop.
	 *
	 * @requires `active` - A variable that tracks the active state, which is set to `true` during the dragover event.
	 */
	function handleOnDragOver(event) {
		event.preventDefault()
		active = true;
	}

	/**
	 * Handles the `dragleave` event, preventing the default behavior and disabling the active state.
	 *
	 * @param {DragEvent} event - The dragleave event triggered when the dragged item leaves the drop target.
	 *
	 * @description
	 * This function prevents the default behavior of the dragleave event and sets the `active`
	 * variable to `false`, indicating that the drag operation is no longer active and the drop target
	 * is no longer ready to accept the drop.
	 *
	 * @requires `active` - A variable that tracks the active state, which is set to `false` during the dragleave event.
	 */
	function handleOnDragLeave(event) {
		event.preventDefault()
		active = false;
	}
</script>

{#if active}
	<div class="dropzone-container d-flex flex-column justify-content-center align-items-center bg-danger rounded-lg text-white w-100"
		 role="region"
		 ondragover={handleOnDragOver}
		 ondragleave={handleOnDragLeave}
		 ondrop={handleOnDrop}>
		<i class="icon-trash icons font-xl"></i>
		<p class="m-0 mt-2">{description}</p>
	</div>
{:else}
	<div class="dropzone-container-active d-flex flex-column justify-content-center align-items-center bg-light text-secondary rounded-lg w-100"
		 role="region"
		 ondragover={handleOnDragOver}>
		<i class="icon-trash icons font-xl"></i>
		<p class="m-0 mt-2">{description}</p>
	</div>
{/if}

<style>
	.dropzone-container{
		padding: 20px;
		min-height: 50px;
		opacity: 0.5;
	}

	.dropzone-container-active {
		padding: 20px;
		min-height: 50px;
		border: 1px dashed #a4b7c1;
	}
</style>