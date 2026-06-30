<script module lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
	declare const toastr: any;
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

	pageTitle.title = $t('gestao_formacoes.minhas_formacoes.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.minhas_formacoes.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.validacao.moduleId;
	sidebarOptions.currentObjectId = 5;

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	let formacoes = $state([...(data.formacoes ?? [])]);
	let items_breadcrum = $derived([
		{
			icon_class: 'icon-doc',
			url: '#',
			designacao: $t('gestao_formacoes.common.new'),
			function: openAddModal
		}
	]);
	let isAddModalOpen = $state(false);
	let tituloInput = $state('');
	let entidadeIdInput = $state('');
	let dataInicioInput = $state('');
	let dataFimInput = $state('');
	let certificadoInput = $state('');
	let isLoadingEmpresas = $state(false);
	let empresas: any[] = $state([]);
	let isSaving = $state(false);
	let isCertModalOpen = $state(false);
	let certUrl = $state('');
	let certNome = $state('');
	const formatDate = (value: any) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString('pt-PT');
	};
	const getEstadoBadgeClass = (estado: string) => {
		const normalized = (estado || '').trim().toLowerCase();
		if (normalized === 'validada' || normalized === 'validado') return 'estado-badge estado-validada';
		if (normalized === 'por validar' || normalized === 'pendente') return 'estado-badge estado-por-validar';
		if (normalized === 'rejeitada' || normalized === 'rejeitado') return 'estado-badge estado-rejeitada';
		return 'estado-badge estado-outro';
	};
	const getAreaPedagogica = (formacao: any) =>
		formacao?.area_formacao_pedagogica === true ||
		formacao?.area_formacao_pedagogica === 1 ||
		formacao?.area_formacao_pedagogica === '1';
	const formatYesNo = (value: boolean) =>
		value ? $t('gestao_formacoes.labels.yes') : $t('gestao_formacoes.labels.no');

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

	async function refreshFormacoes() {
		const data = await fetchJson('/ep/gestao_formacoes/minhas_formacoes');
		formacoes = Array.isArray(data) ? data : [];
		updateTable();
	}

	async function loadEmpresas() {
		isLoadingEmpresas = true;
		try {
			const data = await fetchJson('/ep/gestao_formacoes/empresas?page=1&pageSize=5000');
			empresas = Array.isArray(data?.data) ? data.data : [];
		} catch (err) {
			empresas = [];
			toastr?.error(
				$t('gestao_formacoes.companies.load_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isLoadingEmpresas = false;
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
			columns: [
				{ title: $t('gestao_formacoes.labels.designation') },
				{ title: $t('gestao_formacoes.labels.type') },
				{ title: $t('gestao_formacoes.labels.company') },
				{ title: $t('gestao_formacoes.labels.start_date') },
				{ title: $t('gestao_formacoes.labels.end_date') },
				{ title: $t('gestao_formacoes.labels.pedagogical_area') },
				{ title: $t('gestao_formacoes.common.status') },
				{ title: $t('gestao_formacoes.common.actions'), orderable: false, className: 'dt-body-center' }
			],
			columnDefs: [
				{
					targets: 6,
					render: function (data: any) {
						const estado = data ?? '-';
						const badgeClass = getEstadoBadgeClass(String(estado));
						return `<span class="${badgeClass}">${estado}</span>`;
					}
				},
				{
					targets: -1,
					render: function (_data: any, _type: any, row: any) {
						if (!row[8]) return '';
						const label = $t('gestao_formacoes.minhas_formacoes.certificate_button');
						return `
							<button class="btn btn-sm btn-outline-secondary certificado-btn" data-cert-id="${row[8]}" data-cert-nome="${row[9] ?? ''}" title="${label}">
								<i class="fas fa-search"></i>
							</button>
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
		loadEmpresas();

		jQuery(document).on('click', '.certificado-btn', function (this: HTMLElement) {
			const certId = jQuery(this).data('certId');
			const nome = jQuery(this).data('certNome') ?? 'certificado.pdf';
			if (!certId) {
				toastr?.warning($t('gestao_formacoes.minhas_formacoes.certificate_unavailable_toast'), $t('gestao_formacoes.toasts.certificate'));
				return;
			}
			certNome = nome;
			certUrl = `/ep/gestao_formacoes/minhas_formacoes/certificado/${certId}`;
			isCertModalOpen = true;
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
			jQuery(document).off('click', '.certificado-btn');
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
		};
	});

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		formacoes.forEach((f) => {
			dtInstance.row.add([
				f.designacao ?? '-',
				f.tipo ?? '-',
				f.empresa ?? '-',
				formatDate(f.data_inicio),
				formatDate(f.data_fim),
				formatYesNo(getAreaPedagogica(f)),
				f.estado ?? '-',
				null,
				f.certificado_id ?? null,
				f.certificado ?? ''
			]);
		});
		dtInstance.draw();
	}

	function openAddModal() {
		goto('/gestao_formacoes/minhas_formacoes/adicionar_formacao');
	}

	function closeAddModal() {
		isAddModalOpen = false;
	}

	function closeCertModal() {
		isCertModalOpen = false;
		certUrl = '';
		certNome = '';
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		certificadoInput = file?.name ?? '';
	}

	async function handleSave() {
		if (!tituloInput.trim() || !entidadeIdInput || !dataInicioInput.trim() || !dataFimInput.trim()) {
			toastr?.warning(
				$t('gestao_formacoes.minhas_formacoes.toast_fill_required'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (isSaving) return;
		isSaving = true;

		try {
			const entidadeSelecionada = empresas.find((empresa) => String(empresa.id) === entidadeIdInput);
			await fetchJson('/ep/gestao_formacoes/minhas_formacoes', {
				method: 'POST',
				body: JSON.stringify({
					titulo: tituloInput.trim(),
					entidade: entidadeSelecionada?.designation ?? '',
					data_inicio: dataInicioInput.trim(),
					data_fim: dataFimInput.trim(),
					certificado: certificadoInput || null
				})
			});
			await refreshFormacoes();
			toastr?.success(
				$t('gestao_formacoes.minhas_formacoes.toast_added'),
				$t('gestao_formacoes.toasts.success')
			);
			closeAddModal();
		} catch (err) {
			toastr?.error(
				$t('gestao_formacoes.minhas_formacoes.toast_add_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

</script>

<div>
	<Breadcrum
		modulo={sidebarOptions.currentModule}
		objeto={sidebarOptions.currentObject}
		menu_items={items_breadcrum}
	/>

	<div class="p-2">
		<!-- Tabela -->
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

{#if isCertModalOpen}
	<div
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
		style="background-color: rgba(0,0,0,0.5);"
	>
		<div class="modal-dialog modal-dialog-centered modal-xl" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{$t('gestao_formacoes.minhas_formacoes.certificate_title')}</h5>
					<button type="button" class="close" onclick={closeCertModal}>
						<span>&times;</span>
					</button>
				</div>
				<div class="modal-body">
					{#if certUrl}
						<embed type="application/pdf" src={certUrl} style="width: 100%; height: 70vh;" />
					{:else}
						<p class="text-muted mb-0">{$t('gestao_formacoes.minhas_formacoes.certificate_unavailable')}</p>
					{/if}
				</div>
				<div class="modal-footer d-flex justify-content-end">
					<button type="button" class="btn btn-secondary mr-2" onclick={closeCertModal}>
						{$t('gestao_formacoes.common.close')}
					</button>
					{#if certUrl}
						<a
							class="btn btn-primary"
							href={`${certUrl}?download=1`}
							download={certNome || 'certificado.pdf'}
						>{$t('gestao_formacoes.minhas_formacoes.download')}</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isAddModalOpen}
	<div
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
		style="background-color: rgba(0,0,0,0.5);"
	>
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{$t('gestao_formacoes.minhas_formacoes.add_external_title')}</h5>
					<button type="button" class="close" onclick={closeAddModal}>
						<span>&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="titulo">{$t('gestao_formacoes.minhas_formacoes.form_title')} <span class="text-danger">*</span></label>
						<input
							id="titulo"
							class="form-control"
							type="text"
							placeholder={$t('gestao_formacoes.minhas_formacoes.placeholder_title')}
							bind:value={tituloInput}
						/>
					</div>
					<div class="form-group">
						<label for="entidade">{$t('gestao_formacoes.minhas_formacoes.form_entity')} <span class="text-danger">*</span></label>
						<select
							id="entidade"
							class="form-control"
							bind:value={entidadeIdInput}
							disabled={isLoadingEmpresas}
						>
							<option value="">{$t('gestao_formacoes.common.select')}</option>
							{#each empresas as empresa}
								<option value={String(empresa.id)}>{empresa.designation}</option>
							{/each}
						</select>
					</div>
					<div class="form-row">
						<div class="form-group col-md-6">
							<label for="data_inicio">{$t('gestao_formacoes.labels.start_date_label')} <span class="text-danger">*</span></label>
							<input
								id="data_inicio"
								class="form-control"
								type="date"
								bind:value={dataInicioInput}
							/>
						</div>
						<div class="form-group col-md-6">
							<label for="data_fim">{$t('gestao_formacoes.labels.end_date_label')} <span class="text-danger">*</span></label>
							<input
								id="data_fim"
								class="form-control"
								type="date"
								bind:value={dataFimInput}
							/>
						</div>
					</div>
					<div class="form-group">
						<label for="certificado">{$t('gestao_formacoes.minhas_formacoes.form_cert')}</label>
						<input id="certificado" class="form-control-file" type="file" onchange={handleFileChange} />
						<small class="form-text text-muted">
							{$t('gestao_formacoes.minhas_formacoes.form_cert_hint')}
						</small>
					</div>
					<div class="alert alert-warning">
						{$t('gestao_formacoes.minhas_formacoes.form_warning')}
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeAddModal}>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="button" class="btn btn-primary" onclick={handleSave}>{$t('gestao_formacoes.common.save')}</button>
				</div>
			</div>
		</div>
	</div>
{/if}

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
	:global(.estado-validada) {
		background-color: #2fbf71;
	}
	:global(.estado-por-validar) {
		background-color: #f3c300;
		color: #000;
	}
	:global(.estado-rejeitada) {
		background-color: #ff5a5f;
	}
	:global(.estado-outro) {
		background-color: #6c757d;
	}
</style>
