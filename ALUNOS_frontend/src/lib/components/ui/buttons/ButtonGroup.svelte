<script>
	/** @type {{
	 * class?: string,
	 * ariaLabel: string,
	 * children?: import('svelte').Snippet, [key: string]: any}}
	 * }}
	 **/
	let {
		class: className,
		ariaLabel,
		children,
		...rest
	} = $props();

</script>

<!--
@component
Exposes a group of buttons to group several buttons together

Usage:
```html
	<ButtonGroup ariaLabel="custom-aria-label">
		<button type="button">Btn 1</button>
		<button type="button">Btn 2</button>
		<button type="button">Btn 3</button>
	</ButtonGroup>
```
-->

<div {...rest}
	 class="btn-group {className}" role="group" aria-label={ariaLabel ? ariaLabel : "button-group"}>
	{@render children?.()}
</div>