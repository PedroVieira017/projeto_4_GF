<script>
	/** @type {{
	 * src: string,
	 * download: string,
	 * children?: import('svelte').Snippet, [key: string]: any}}
	 */
	let { src, download, children, ...rest } = $props();

	async function handleFileDownload() {
		const response = await fetch(src);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		const temporaryLink = document.createElement("a");
		temporaryLink.href = url;
		temporaryLink.download = download;
		document.body.appendChild(temporaryLink);
		temporaryLink.click();
		document.body.removeChild(temporaryLink);

		URL.revokeObjectURL(url);
	}
</script>

<button {...rest} onclick={handleFileDownload}>
	{@render children?.()}
</button>