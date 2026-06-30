<script>
	import { locale, t } from "$lib/translations/translations";
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
    import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";

	// titulo da página
	pageTitle.title = $t("exemplos_editoras_nova.titulo_pagina")

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("exemplos_editoras_nova.modulo");
	sidebarOptions.currentObject = $t("exemplos_editoras_nova.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.editoras_nova.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.editoras_nova.objectId;
    
	/** @type {{data: import('./$types').PageData, form: any}} */
	let { data, form } = $props();

	/** * @type {never[]} */
	let items_breadcrum = []

	let btnSubmissaoAtivo = $state(true);
</script>

<style>
    @import "./editoras.css";
</style>


<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} menu_items={items_breadcrum}/>

	<div class="p-2">
		
		<div class="card">
			<div class="card-header">{$t("exemplos_editoras_nova.form.titulo")}</div>
				<form method="POST" enctype="multipart/form-data" use:enhance={({formElement, formData, action, cancel, submitter}) => {
					switch(action.search){
						case "?/submissao":
							btnSubmissaoAtivo = false;
							break;
					}

					return async ({ result, update }) => {
						// reativar botões (exeto final, apenas em caso de erro)
						switch(action.search){
							case "?/submissao":
								btnSubmissaoAtivo = true;
								break;
						}

						if(result.type == "failure"){
							switch(action.search){
								case "?/submissao":
									break;
							}

							if(result.data?.err_default)
								toastr.error(result.data?.err_default, $t("exemplos_editoras_nova.toastr.erro"), { timeOut: 5000, progressBar: true })
							else
								toastr.error($t("exemplos_editoras_nova.toastr.form_erro"), $t("exemplos_editoras_nova.toastr.erro"), { timeOut: 5000, progressBar: true })

						} else if(result.type == "success"){
							toastr.success($t("exemplos_editoras_nova.toastr.form_sucesso"), $t("exemplos_editoras_nova.toastr.sucesso"), { timeOut: 5000, progressBar: true })
							switch(action.search){							
								case "?/submissao":
									goto("/exemplos/editoras")
									break;
							}
						}
						update({ reset: false, invalidateAll: false });
					};
				}}>
				<div class="card-body">
					<div class="form-group">
						<label for="designacao">{$t("exemplos_editoras_nova.form.designacao")}</label>
						<input type="designacao" id="designacao" name="designacao" class="form-control" placeholder="{$t("exemplos_editoras_nova.form.placeholder_designacao")}" value={data.editora.designacao || ""}>
						{#if form?.erro_designacao}
							<p class="error">{form.erro_designacao}</p>
						{/if}
					</div>
					<div class="form-group">
						<label for="nif">{$t("exemplos_editoras_nova.form.nif")}</label>
						<input type="nif" id="nif" name="nif" class="form-control" placeholder="{$t("exemplos_editoras_nova.form.placeholder_nif")}" value={data.editora.nif || ""}>
						{#if form?.erro_nif}
							<p class="error">{form.erro_nif}</p>
						{/if}
					</div>
				</div>
				<div class="card-footer d-flex justify-content-end">
					<button type="submit" class="mx-1 btn btn-sm btn-primary" disabled={!btnSubmissaoAtivo} formaction="?/submissao"><i class="fa fa-dot-circle"></i> Editar</button>
					<a type="button" href='../editoras' class="btn btn-sm btn-danger" ><i class="fa fa-ban"></i> Cancelar</a>
				</div>
			</form>
		</div>
		
	</div>
</div>