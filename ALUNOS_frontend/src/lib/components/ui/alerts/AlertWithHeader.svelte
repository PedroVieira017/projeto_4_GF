<script>
	/**@typedef { "primary" | "secondary" | "sucess" | "danger" | "warning" | "info" | "ligth" | "dark" } AlertType*/
	
	/** @type {{
	 * 		ondismiss?: (event: MouseEvent) => void,
	 * 		title: string,
	 * 		description: string,
	 * 		footer: string,
	 * 		dismissible?: boolean,
	 * 		type?: AlertType
	 * }}
	 **/
	let {
		ondismiss,
		title,
		description,
		footer,
		dismissible = false,
		type = "primary"
	} = $props();

	/**
	 * Handles the dismiss event and calls the `ondismiss` callback if it is defined.
	 *
	 * @param {MouseEvent} event - The event object associated with the dismissal action.
	 */
	function handleOnDismiss(event) {
		if(ondismiss) {
			ondismiss(event);
		}
	}
</script>

{#if dismissible}
	<div class="alert alert-{type} alert-dismissible fade show" role="alert">
		<h4 class="alert-heading">{title}</h4>
		<p>{description}</p>
		{#if footer}
			<hr>
			<p class="mb-0">{footer}</p>
		{/if}
		<button type="button"
						class="close"
						data-dismiss="alert"
						aria-label="Close"
						onclick={handleOnDismiss}>
			<span aria-hidden="true">×</span>
		</button>
	</div>
{:else}
	<div class="alert alert-{type}" role="alert">
		<h4 class="alert-heading">{title}</h4>
		<p>{description}</p>
		{#if footer}
			<hr>
			<p class="mb-0">{footer}</p>
		{/if}
	</div>
{/if}

