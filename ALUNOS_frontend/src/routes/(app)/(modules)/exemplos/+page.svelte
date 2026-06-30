<script>
	import { t } from "$lib/translations/translations";
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';

	// titulo da página
	pageTitle.title = $t("exemplos_base.titulo_pagina")

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("exemplos_base.modulo");
	sidebarOptions.currentObject = $t("exemplos_base.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.base.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.base.objectId;
</script>

<div>
	<div class="p-2 mt-4">
		<div class="row">
			<div class="col-12">
				<h4 class="display-3 text-muted text-module-name" style="text-align: center">{$t("exemplos_base.modulo")}</h4>
			</div>
		</div>
	</div>
</div>
