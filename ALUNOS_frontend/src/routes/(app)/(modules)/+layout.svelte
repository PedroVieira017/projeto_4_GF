<script>
	// @ts-nocheck
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { navigating } from '$app/stores';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { invalidate } from '$app/navigation';
	import { languageChangedTemp } from '$lib/runes/lang.rune.svelte';
	import { sidebarRune } from '$lib/runes/sidebar.rune.svelte';

	/** @type {{data: import('./$types').LayoutData, children?: import('svelte').Snippet}} */
	let { data = $bindable(), children } = $props();

	let titulo_sidebar = $state('');

	// ✅ estados RESOLVIDOS (arrays), não Promises
	let resolvedModules = $state(false);
	let resolvedAreas = $state(false);

	$effect(() => {
		if (sidebarOptions.currentModule && sidebarOptions.currentModule !== titulo_sidebar) {
			resolvedAreas = false;
			data.sidebar_areas = false;
			titulo_sidebar = sidebarOptions.currentModule;
		}
	});

	// quando muda moduleId, cookie + reload do layout global
	$effect(() => {
		if (sidebarOptions.currentModuleId) {
			document.cookie = `modid=${sidebarOptions.currentModuleId}; path=/; SameSite=Strict`;
			invalidate('global:layout');
		}
	});

	// ✅ resolve modules (pode vir como Promise)
	$effect(() => {
		(async () => {
			try {
				const m = await sidebarRune.modules;
				resolvedModules = m ?? false;
			} catch {
				resolvedModules = null; // força ramo de erro no Sidebar
			}
		})();
	});

	// ✅ resolve areas (normalmente já é array)
	$effect(() => {
		const pageAreas = $page?.data?.areas;
		resolvedAreas = sidebarRune.areas ?? pageAreas ?? data.sidebar_areas ?? false;
	});

	const sidebarObjId = $derived(() => sidebarOptions.currentObjectId ?? 0);
</script>

<div class="app-body">
	<!-- ✅ 1 Sidebar só -->
	<Sidebar
		areas={resolvedAreas}
		modulos={resolvedModules}
		id_objeto={sidebarObjId}
		titulo={titulo_sidebar}
	/>

	{#if !$navigating && !languageChangedTemp.bool}
		<div class="main" in:fade={{ duration: 300 }}>
			{@render children?.()}
		</div>
	{:else}
		<div class="main">
			<div id="loading-on">
				<span class="dot-on">.</span>
				<span class="dot-on2">.</span>
				<span class="dot-on3">.</span>
			</div>
		</div>
	{/if}
</div>
