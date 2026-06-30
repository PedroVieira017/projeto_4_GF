<script>
	import { dragscroll } from '@svelte-put/dragscroll';

	/** @type {{
	 * children?: import('svelte').Snippet}}
	 * */
  let { children } = $props();
</script>

<!--
@component
Displays a horizontal swipper, this component can be useful when you need to display a horizontal list that allows you to scroll and slide.

Usage:
```html
	<HorizontalSwipper>
		...
	</HorizontalSwipper>
```
-->

<div use:dragscroll>
	{@render children?.()}
</div>

<style>
  div {
      width: 100%;
      display: flex;
      overflow-x: scroll;
      overscroll-behavior: contain;
      scroll-snap-type: x mandatory;
      overflow-y: hidden;
  }

  div::-webkit-scrollbar {
			margin-top:10px;
      background-color: transparent;
      width: 15px;
  }
  div::-webkit-scrollbar-track {
      background-color: transparent;
  }
  div::-webkit-scrollbar-thumb {
      border-radius: 20px;
      border: 4px solid transparent;
      background-color: rgba(0,0,0,0.2);
      background-clip: content-box;
  }
</style>
