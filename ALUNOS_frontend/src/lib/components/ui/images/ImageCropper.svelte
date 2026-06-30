<script>
	import 'cropperjs/dist/cropper.css';
	import Cropper from 'cropperjs/dist/cropper.min.js';

	import { onMount } from 'svelte';

	/**@type {{
	 * class?: string,
	 * ready?: () => void,
	 * oncrop?: (blob: Blob) => void,
	 * src: string,
	 * alt?: string,
	 * cropper: any
	 }}*/
	let {
		class: className,
		ready,
		oncrop,
		src,
		alt = 'image to be cropped',
		cropper
	} = $props();

	/**@type {HTMLImageElement}*/
	let image;

	/**@type {boolean}*/
	let isReady = $state(false);

	onMount(() => {
		/**
		 * Set the cropper
		 * When cropping or zooming, the resulting cropped canvas is transformed into a Blob
		 * for displaying an image tag
		 * This Blob is then dispatched as a 'crop' event, capturing the cropped content.
		 * Additionally, upon initialization completion, a 'ready' event is dispatched.
		 * Finally, a flag 'isReady' is toggled to true, indicating the cropper is fully initialized.
		 */
		cropper = new Cropper(image, {
			rotatable: true,
			dragMode: 'move',
			cropend() {
				cropper.getCroppedCanvas().toBlob(
					/**@param blob {Blob}*/
					(blob) => {
						if(oncrop) {
							oncrop(blob);
						}
					},
					"image/jpeg"
				);
			},
			zoom() {
				cropper.getCroppedCanvas().toBlob(
					/**@param blob {Blob}*/
					(blob) => {
						if(oncrop) {
							oncrop(blob);
						}
					},
					"image/jpeg"
				);
			},
			ready() {
				if(ready) {
					ready();
				}
				isReady = true;
			}
		});
	});
</script>

<!--
@component
This component exposes an UI for cropping images

Binding:
- cropper: allows access to the cropper object, which is useful when you need to access cropper properties

Events dispatached:
- ready: sent when the cropper is ready for use
- crop: sent when the image is cropped

Usage:
```html
	<ImageCropper
		class="mw-100 rounded"
		src="path/to/image"
		alt="image alt"
		bind:cropper
		on:ready={() => (editReady = true)}
		on:crop={(event) => (blobSrc = URL.createObjectURL(event.detail))}
	/>
```
-->

<div class="position-relative">
	{#if !isReady}
		<div
			style="background-color: rgba(255,255,255,0.15)"
			class="position-absolute w-100 h-100 d-flex align-items-center">
			<div class="sk-spinner sk-spinner-pulse bg-white" ></div>
		</div>
	{/if}
	<img class={className} {src} {alt} bind:this={image} />
</div>
