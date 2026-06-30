<script>
	/**
	 * @typedef { "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" } AlertType
	 * Represents the types of alert variations available.
	 */

	/**
	 * @component
	 * Alert component to display messages with different types and an optional dismiss button.
	 *
	 * @prop {string} title - The text to be displayed as the alert's main content.
	 * @prop {boolean} [dismissible=false] - Determines if the alert can be dismissed by the user. Defaults to `false`.
	 * @prop {AlertType} [type="primary"] - Sets the style of the alert based on the alert type. Default is "primary".
	 *
	 *
	 * @example
	 * <Alert title="Warning!" type="warning" dismissible />
	 *
	 * @example
	 * <Alert title="Information" type="info" />
	 */

	/** @type {{
	 * ondismiss?: (event: MouseEvent) => void,
	 * class?: string,
	 * title: string,
	 * dismissible?: boolean,
	 * type?: AlertType,
	 * [key: string]: any
	 * }}
	 **/
	let {
		ondismiss,
		class: className,
		title,
		dismissible = false,
		type = "primary",
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

<style>
	.alert {
		font-size: inherit;
	}
</style>

{#if dismissible}
	<div class="alert alert-{type} alert-dismissible fade show {className}" role="alert">
		{title}
		<button type="button"
						class="close"
						data-dismiss="alert"
						aria-label="Close"
						onclick={handleOnDismiss}>
			<span aria-hidden="true">×</span>
		</button>
	</div>
{:else}
	<div class="alert alert-{type} {className}" role="alert">
		{title}
	</div>
{/if}

