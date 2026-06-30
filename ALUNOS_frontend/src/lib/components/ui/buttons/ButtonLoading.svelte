<script>
	/** @type {{
	 * onclick?: any,
	 * isLoading?: boolean,
	 * children?: import('svelte').Snippet,
	 * [key: string]: any
	 * }}
	 * */
	let {
		onclick,
		isLoading = false,
		children,
		...rest
	} = $props();
</script>

<button {onclick}
				disabled={isLoading}
				{...rest}>
		{@render children?.()}
		{#if isLoading}
			<span class="spinner-border spinner-border-sm mr-0" role="status" aria-hidden="true"></span>
		{/if}
</button>