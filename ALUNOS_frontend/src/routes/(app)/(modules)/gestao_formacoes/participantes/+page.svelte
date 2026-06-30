<script context="module" lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { locale, t } from '$lib/translations/translations';
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	pageTitle.title = $t('gestao_formacoes.participantes.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.participantes.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.participantes.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.participantes.objectId;

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	const participantes = data.participantes ?? [];
	let items_breadcrum = $derived([]);
	onMount(() => {
		if (!tableElement) return;

		dtInstance = jQuery(tableElement).DataTable({
			dom: 'Bfrtip',
			responsive: false,
			scrollX: true,
			autoWidth: false,
			buttons: ['pageLength', 'pdf', 'csv', 'excel', 'copy', 'colvis'],
			pageLength: 25,
			order: [[0, 'asc']],
			columns: [
				{ title: 'ID', visible: false },
				{ title: $t('gestao_formacoes.participantes.name') },
				{ title: $t('gestao_formacoes.participantes.email') },
				{ title: $t('gestao_formacoes.labels.uo') },
				{ title: $t('gestao_formacoes.participantes.formations_count') },
				{ title: $t('gestao_formacoes.common.actions'), orderable: false, className: 'dt-body-right' }
			],
			columnDefs: [
				{
					targets: -1,
					render: function (_data: any, _type: any, row: any) {
						const id = row[0];
						return `
							<div class="d-flex justify-content-end">
								<button class="btn btn-sm btn-outline-info ver-formacoes" data-id="${id}" data-nome="${row[1]}" title="${$t('gestao_formacoes.participantes.view_formations')}">
									<i class="fas fa-search"></i>
								</button>
							</div>
						`;
					}
				}
			],
			drawCallback: function () {
				jQuery('.datatable-on').parent().removeClass('container-fluid');
			},
			language: $locale === 'pt' ? dt_pt : dt_en
		});

		updateTable();

		jQuery(document).on('click', '.ver-formacoes', function () {
			const id = String(jQuery(this).data('id') ?? '');
			const nome = jQuery(this).data('nome') ?? '';
			const query = nome ? `?nome=${encodeURIComponent(nome)}` : '';
			goto(`/gestao_formacoes/participantes/${id}/formacoes${query}`);
		});

		const adjustTable = () => {
			if (!dtInstance) return;
			dtInstance.columns.adjust();
		};

		const scheduleAdjust = () => {
			setTimeout(adjustTable, 50);
		};

		jQuery(document).on('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
		window.addEventListener('resize', scheduleAdjust);

		return () => {
			jQuery(document).off('click', '.ver-formacoes');
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
		};
	});

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		participantes.forEach((p, idx) => {
			const id = p.id ?? idx + 1;
			dtInstance.row.add([
				id,
				p.nome ?? '-',
				p.email ?? '-',
				p.uo ?? '-',
				p.nFormacoes ?? p.n_formacoes ?? 0,
				null
			]);
		});
		dtInstance.draw();
	}

</script>

<div>
	<Breadcrum
		modulo={sidebarOptions.currentModule}
		objeto={sidebarOptions.currentObject}
		menu_items={items_breadcrum}
	/>

	<div class="p-2">
		<div class="row tableresponsive">
			<div class="table-responsive p-3">
				<table
					bind:this={tableElement}
					class="datatable-on table-striped hover datatable table-sm nowrap no-footer dtr-inline"
				>
					<tbody></tbody>
				</table>
			</div>
		</div>
	</div>
</div>
