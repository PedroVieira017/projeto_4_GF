<script>
	import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { locale, t } from "$lib/translations/translations";
	import { onMount } from "svelte";
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import Datepicker from "$lib/components/ui/Datepicker.svelte";
	import { pageTitle } from "$lib/runes/pageTitle.rune.svelte";
	import { sidebarOptions } from "$lib/runes/sidebarOptions.rune.svelte";
	import { pageIds } from "$lib/js/pageIds.conf";

	// titulo da página
	pageTitle.title = $t("base.titulo")

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("base.modulo");
	sidebarOptions.currentObject = $t("base.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.exemplo_2.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.exemplo_2.objectId;

	
    /** @type {{data: import('./$types').PageData, form: any}} */
	let { data } = $props();

	/**
	 * @type {any}
	 */
	let el // table element
	/**
	 * @type {any}
	 */
	let table // table object (API)
	
	/** * @type {any} */
	let anosletivos=$state([])
	/** * @type {any} */
	let unidadesorganicas=$state([])
	/** * @type {any} */
	let graus=$state([])
	/** * @type {any} */
	let cursos=$state([])

	onMount(async () => {
		// @ts-ignore
		table = jQuery(el).DataTable({
			dom: 'Bfrtip',
			responsive: true,
			buttons: [
				'pageLength',
				'pdf',
				'csv',
				'excel',
				'copy',
				'colvis'
			],
			'pageLength': 25,
			'order': [[ 3, 'desc' ]],
			'columnDefs': [
				{ 'visible': true, 'targets': [0, 6] },
				{ 'orderable': false, targets: [] },
				{ 'render': function() {return "<button data-id='12345' class='teste' on:click='{() => console.log(1)}'>aaa</button>"}, targets: [1] }
			],
			'drawCallback': function () {
				jQuery('.datatable-on').parent().removeClass('container-fluid');
				jQuery('#modulepage_content').fadeIn(600);
				setTimeout(function(){
					table.columns.adjust().responsive.recalc()
				}, 100)
			},
			"language": (locale.get() == "pt" ? dt_pt : dt_en)
		})
		table.draw()

		// inicializar selects
		// @ts-ignore
		jQuery(".select2-single").select2({width: "100%", theme:"bootstrap", language: (locale.get() == "pt" ? "pt" : "en")}).on('change', (e) => filtrosChange(e))

		filtrosLoadData("cd_letivo");
		filtrosLoadData("uo");
		filtrosLoadData("cd_curso", {});

		jQuery(document).on("click", ".teste", function(){
			console.log(jQuery(this).data("id"))
			a();
		})
	})

	function a() {
		console.log("a")
	}

	a() 	
	function filtrosChange(/** * @type {any} */ elem){
		const select_id = elem.currentTarget.id;

		//X,a,b,c ==> ids elementos html
		//Pesquisa depende de [a,b,c]
		const dependenciasPesquisa = ["cd_letivo"];
		//X tem como dependentes [a,b,c]
		const dependentes = {
			"cd_letivo": ["cd_curso"],
			"uo": ["cd_curso"]
		}
		//X depende de [a,b,c]
		const dependencias = {
			"cd_curso": ["cd_letivo", "uo"]
		}

		if(dependentes.hasOwnProperty(select_id)){
			dependentes[select_id].forEach((el) => {
				// check query params dependencias
				let queryParams = {}
				clearFilterData(el)
				if(dependencias.hasOwnProperty(el)){
					dependencias[el].forEach(function(key_dep){
						queryParams[key_dep] = jQuery(`#${key_dep}`).val() || "%"
					})
				}
				filtrosLoadData(el, queryParams)
			})
		}


		if(dependenciasPesquisa.includes(select_id)){
			// verificar se todas as dependências para pesquisa possuem valor
			let pesquisavel = true;
			dependenciasPesquisa.forEach(function(dep){
				if(!jQuery(`#${dep}`).val()){
					pesquisavel = false;
				}
			});
			if(pesquisavel) jQuery("#btn_filtros").removeClass("disabled");
			else jQuery("#btn_filtros").addClass("disabled");
		}
	}

	const clearFilterData = (/** * @type {string} */ elem) => {
		switch(elem){
			case "cd_curso":
				cursos = [];
				break;
		}

	}

	async function filtrosLoadData(/** * @type {string} */ elem, /** * @type {any} */queryParams){
		jQuery(".pesquisavel").prop("disabled", true)
		let queryString = "";
		if(queryParams && Object.keys(queryParams)){
			Object.keys(queryParams).forEach(function(key){
				queryString += `&${key}=${queryParams[key]}`
			})
			queryString = encodeURI("?" + queryString.substring(1))
		}

		let promise = null;
		switch(elem){
			case "cd_letivo":
				promise = await fetch(`/ep/exemplos/base/anosletivos${queryString}`)
				if(promise.status == 200)
					anosletivos = await promise.json()
				break;
			case "uo":
				promise = await fetch(`/ep/exemplos/base/unidadesorganicas${queryString}`)
				if(promise.status == 200)
					unidadesorganicas = await promise.json()
				break;
			case "cd_curso":
				promise = await fetch(`/ep/exemplos/base/cursos${queryString}`)
				if(promise.status == 200)
					cursos = await promise.json()
				break;
		}
		jQuery(".pesquisavel").prop("disabled", false)
	}

	function teste(){
		table.rows.add([
			[ "Ashton Cox", "Junior Technical Author", "San Francisco", "1562", "2009/01/12", "$86,000", "$320,800" ],
		]).draw()
	}

	async function pesquisar(){
		jQuery("#conteudo_carregado").css("display", "none")
		jQuery("#loading_area").css("display", "block")
		jQuery("#btn_filtros").addClass("disabled");

		let queryString = "?";
		queryString += "cd_letivo=" + jQuery("#cd_letivo").val();
		queryString += "&uo=" + jQuery("#uo").val();
		queryString += "&cd_curso=" + jQuery("#cd_curso").val();

		table.clear().draw();
		let promise = await fetch(`/ep/exemplos/base/pucs${encodeURI(queryString)}`)
		if(promise.status == 200){
			let pucs = await promise.json()

			/**
			 * @type {any[][]}
			 */
			let dados_tbl = []
			// @ts-ignore
			pucs.forEach(function(p){
				dados_tbl.push([p.cd_curso, p.curso, p.uc, p.grupo_disciplinar, p.ano_curricular, p.periodo_curricular, p.NOME])
			})

			table.rows.add(dados_tbl).draw();
		}

		jQuery("#btn_filtros").removeClass("disabled");
		jQuery("#conteudo_carregado").css("display", "block")
		jQuery("#loading_area").css("display", "none")
	}

	function teste_date_change(ev){
		console.log(ev.target.id, ev.target.value)
	}

	let items_breadcrum = [{icon_class: "icon-doc", url: "#", designacao: $t("base.btn_topo"), function: teste}];
</script>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} menu_items={items_breadcrum} />

	<div class="container-fluid">
		<div class="row filter pb-2" data-collapseFilter="true">
			<div class="col-md-3">
				<label>Ano letivo</label>
				<select id="cd_letivo" class="form-control select2-single">
					<option>Selecione um elemento</option>
					{#each anosletivos as anol}
						<option value={anol.anolectivo}>{anol.anolectivo}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-2">
				<label>Unidade Orgânica</label>
				<select id="uo" class="form-control select2-single">
					{#if !unidadesorganicas || !unidadesorganicas.length}
						<option selected disabled>A carregar..</option>
					{:else}
						{#each unidadesorganicas as uorg}
							<option value={uorg.id}>{uorg.unidade_organica}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div class="col-md-3">
				<label>Curso</label>
				<select id="cd_curso" class="form-control select2-single pesquisavel">
					{#if !cursos || !cursos.length}
						<option selected>A carregar...</option>
					{:else}
						{#each cursos as cr}
							<option value={cr.id}>{cr.descricao}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div class="col-md-1">
				<label>&nbsp;</label>
				<button id="btn_filtros" type="button" class="btn btn-primary btn-sm btn-block get-source disabled" onclick={pesquisar}><i class="fas fa-search"></i></button>
			</div>
		</div>
	</div>	

	<div class="p-2">

		<h1>{$t("base.titulo")}</h1>
		<p>{$t("base.descrição")}</p>

		<div id="conteudo_carregado">
			<div class="row" id="modulepage_content" style="display: none">
				<div class="table-responsive p-3">
					<table id="" bind:this={el} class="datatable-on table-striped hover datatable table-sm nowrap no-footer dtr-inline">
						<thead>
							<tr>
								<th>Cod. Curso</th>
								<th>Curso</th>
								<th>Unidade Curricular</th>
								<th>Grupo Disciplinar</th>
								<th>Ano Curricular</th>
								<th>Periodo Curricular</th>
								<th>Responsável</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>TESTE</td>
								<td>TESTE</td>
								<td>TESTE</td>
								<td>TESTE</td>
								<td>TESTE</td>
								<td>TESTE</td>
								<td>TESTE</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div id="loading_area" style="display: none">
			<div id="loading-on">
				<span class="dot-on">.</span>
				<span class="dot-on2">.</span>
				<span class="dot-on3">.</span>
			</div>
		</div>


		

		<hr>
		
		<p>{$t("base.recebido")} {data.texto}</p>
		<a class="btn btn-primary" href="/exemplos/editoras">TESTE NAVEGAÇÃO href</a>
	</div>

	<hr>
	<div class="container-fluid">
		<div class="row filter pb-2" data-collapseFilter="true">
			<div class="col-md-3">
				<label>Data1</label>
				<Datepicker id="testedata" on:focusout={teste_date_change} />
			</div>
			<div class="col-md-2">
				<label>Data2</label>
				<Datepicker id="testedata2" on:focusout={teste_date_change} />
			</div>
			<div class="col-md-1">
				<label>&nbsp;</label>
				<button id="btn_filtros" type="button" class="btn btn-primary btn-sm btn-block get-source disabled"><i class="fas fa-search"></i></button>
			</div>
		</div>
	</div>
</div>
