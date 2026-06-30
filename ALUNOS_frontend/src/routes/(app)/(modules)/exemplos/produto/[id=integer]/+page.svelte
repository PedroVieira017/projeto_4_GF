<script>
	import { pageIds } from "$lib/js/pageIds.conf";
	import { pageTitle } from "$lib/runes/pageTitle.rune.svelte";
	import { sidebarOptions } from "$lib/runes/sidebarOptions.rune.svelte";
	import { title } from "$lib/stores/pageTitle";
	import { t } from "$lib/translations/translations";

	// titulo da página
	pageTitle.title = $t("produtos.titulo_pagina")

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("produtos.modulo");
	sidebarOptions.currentObject = $t("produtos.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.produto.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.produto.objectId;


	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();

  	title.set("Produto")
</script>


<h1>{$t("produto.titulo_pag")}</h1>

{#await data.produto.data}
	<p>{$t("produto.a_carregar")}</p>
{:then produto}
	{title.set(produto.title) || ""}
	<div class="border b-1 border-primary my-1 p-2">
		<p><b>{produto.title}</b> {produto.price || "-"}€</p>
		<p>{produto.description}</p>
		<p>{produto.discountPercentage}</p>
		<p style="color: red">Restam: {produto.stock}</p>
	</div>
{:catch}
	<p>{$t("produto.erro_carregar")}</p>
{/await}

<a class="btn btn-primary" href="/produtos">Voltar à lista de produtos</a>