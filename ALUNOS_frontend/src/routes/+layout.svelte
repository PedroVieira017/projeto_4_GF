<script>
	import { pageTitle } from "$lib/runes/pageTitle.rune.svelte";

    // @ts-nocheck
	import { internalUrls } from "$lib/stores/internalUrls";

    
    /** @type {{data: import('./$types').LayoutData, children?: import('svelte').Snippet}} */
    let { data, children } = $props();
    internalUrls.set(data.urls_internas)

    pageTitle.clear()
</script>
<!-- 
    Tentar sempre modificar layouts o mais perto do nível que se pretende modificar 
    (por exemplo, a nível de página ou grupo) já que o sveltekit herda layouts anteriores
-->

<svelte:head>
    <!-- Título -->
    <title>{pageTitle.title || '• ON.IPVC v3'}</title>
    
    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href={$internalUrls["FAVICON_apple"]}>
    <link rel="icon" type="image/png" sizes="32x32" href={$internalUrls["FAVICON_32"]}>
    <link rel="icon" type="image/png" sizes="16x16" href={$internalUrls["FAVICON_16"]}>
    <link rel="manifest" href={$internalUrls["FAVICON_MANIFEST"]}>
    <link rel="mask-icon" href={$internalUrls["FAVICON_MASKICON"]}>
    <link rel="shortcut icon" href={$internalUrls["FAVICON_ICON"]}>
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="msapplication-config" content={$internalUrls["FAVICON_BROWSERCONFIG"]}>
    <meta name="theme-color" content="#ffffff">
</svelte:head>

{@render children?.()}