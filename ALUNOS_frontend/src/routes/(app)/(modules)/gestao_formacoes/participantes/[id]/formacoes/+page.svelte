<script context="module" lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { locale, t } from '$lib/translations/translations';
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	let formacoes = $state([]);
	let isLoading = $state(false);
	let participanteNome = $state('');
	let participanteId = $state('');

	pageTitle.title = $t('gestao_formacoes.participantes_formacoes.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.participantes.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.participantes.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.participantes.objectId;

	async function fetchJson(url: string, init: RequestInit = {}) {
		const res = await fetch(url, {
			...init,
			headers: {
				...(init.headers ?? {}),
				'Content-Type': 'application/json'
			}
		});

		const text = await res.text();
		if (!res.ok) {
			throw new Error(text || res.statusText);
		}
		return text ? JSON.parse(text) : null;
	}

	const formatDate = (value: any) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString('pt-PT');
	};

	const formatEstado = (estado: any) => {
		const raw = String(estado ?? '').trim();
		if (!raw) return '-';
		return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
	};

	const getEstadoBadgeClass = (estado: any) => {
		const normalized = String(estado ?? '').trim().toLowerCase();
		if (normalized == 'validada' || normalized == 'validado') return 'estado-badge estado-validada';
		if (normalized == 'por validar' || normalized == 'pendente') return 'estado-badge estado-por-validar';
		if (normalized == 'rejeitada' || normalized == 'rejeitado') return 'estado-badge estado-rejeitada';
		return 'estado-badge estado-outro';
	};

	function updateTitle() {
		if (participanteNome) {
			pageTitle.title = $t('gestao_formacoes.participantes_formacoes.title');
			return;
		}
		pageTitle.title = $t('gestao_formacoes.participantes_formacoes.title');
	}

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		formacoes.forEach((f: any) => {
			dtInstance.row.add([
				f.designacao ?? '-',
				f.empresa ?? '-',
				formatDate(f.data_inicio),
				formatDate(f.data_fim),
				f.estado_validacao ?? '-'
			]);
		});
		dtInstance.draw();
	}

	async function loadData() {
		participanteId = String($page.params.id ?? '');
		participanteNome = $page.url.searchParams.get('nome') ?? '';
		updateTitle();
		if (!participanteId) return;

		isLoading = true;
		try {
			const data = await fetchJson(`/ep/gestao_formacoes/participantes/${participanteId}/formacoes`);
			formacoes = Array.isArray(data) ? data : [];
			updateTable();
		} catch (err) {
			toastr?.error?.($t('gestao_formacoes.participantes_formacoes.error_load'), $t('gestao_formacoes.toasts.error'));
			console.error(err);
			formacoes = [];
			updateTable();
		} finally {
			isLoading = false;
		}
	}

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
			columnDefs: [
				{
					targets: 4,
					render: function (data: any) {
						const estado = formatEstado(data);
						const badgeClass = getEstadoBadgeClass(String(data));
						return `<span class=\"${badgeClass}\">${estado}</span>`;
					}
				}
			],
			columns: [
				{ title: $t('gestao_formacoes.labels.designation') },
				{ title: $t('gestao_formacoes.labels.company') },
				{ title: $t('gestao_formacoes.labels.start_date') },
				{ title: $t('gestao_formacoes.labels.end_date') },
				{ title: $t('gestao_formacoes.common.status') }
			],
			drawCallback: function () {
				jQuery('.datatable-on').parent().removeClass('container-fluid');
			},
			language: $locale === 'pt' ? dt_pt : dt_en
		});

		loadData();

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
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
			if (dtInstance) {
				dtInstance.destroy();
			}
		};
	});

	let items_breadcrum = $derived([]);
</script>

<div>
	<Breadcrum
		modulo={sidebarOptions.currentModule}
		objeto={sidebarOptions.currentObject}
		menu_items={items_breadcrum}
	/>

	<div class="p-2">
		<div class="d-flex justify-content-between align-items-center mb-3">
			<h4 class="text-muted">
				{participanteNome ? `${$t('gestao_formacoes.participantes_formacoes.title')} - ${participanteNome}` : $t('gestao_formacoes.participantes_formacoes.title')}
			</h4>
		</div>

		{#if isLoading}
			<p>{$t('gestao_formacoes.common.loading')}</p>
		{/if}

		<div class="row tableresponsive">
			<div class="table-responsive p-3">
				<table
					bind:this={tableElement}
					class="datatable-on table-striped hover datatable table-sm no-footer dtr-inline"
				>
					<tbody></tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.estado-badge) {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.3;
		white-space: nowrap;
		color: #fff;
	}
	:global(.estado-validada) { background-color: #2fbf71; }
	:global(.estado-por-validar) { background-color: #f3c300; color: #000; }
	:global(.estado-rejeitada) { background-color: #ff5a5f; }
	:global(.estado-outro) { background-color: #6c757d; }
</style>
