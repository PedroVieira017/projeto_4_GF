<script context="module" lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { locale, t } from '$lib/translations/translations';
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	let participantes = $state([]);
	let selectedParticipantIds = $state<string[]>([]);
	let initialParticipantIds = $state<string[]>([]);
	let isSaving = $state(false);
	let actionId = $state(0);
	let actionDesignacao = $state('');
	let viewOnlyAssociated = $state(false);
	let uoOptions = $state<string[]>([]);
	let selectedUo = $state('');
	let isCertModalOpen = $state(false);
	let certUrl = $state('');
	let certNome = $state('');

	let items_breadcrum = $derived(
		viewOnlyAssociated
			? []
			: [
					{
						icon_class: 'fa fa-save',
						url: '#',
						designacao: $t('gestao_formacoes.acoes_participantes.save_action'),
						function: handleAssociate
					}
				]
	);

	pageTitle.title = $t('gestao_formacoes.acoes_participantes.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.acoes_formacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.acoes_formacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.acoes_formacao.objectId;

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

	function updateTitle() {
		if (actionDesignacao) {
			pageTitle.title = `${$t('gestao_formacoes.acoes_participantes.title')} - ${actionDesignacao}`;
			return;
		}
		pageTitle.title = $t('gestao_formacoes.acoes_participantes.title_with_action');
	}


	async function loadData() {
		actionId = Number($page.params.id ?? 0);
		actionDesignacao = $page.url.searchParams.get('designacao') ?? '';
		viewOnlyAssociated = $page.url.searchParams.get('view') === 'associados';
		updateTitle();
		if (!actionId) return;

		try {
			const [all, current] = await Promise.all([
				viewOnlyAssociated ? Promise.resolve([]) : fetchJson('/ep/gestao_formacoes/participantes'),
				fetchJson(`/ep/gestao_formacoes/acoes_formacao/${actionId}/participantes`)
			]);
			const currentList = Array.isArray(current) ? current : [];
			const seen = new Set<string>();
			const currentUnique = currentList.filter((p: any) => {
				const id = String(p?.id ?? '').trim();
				if (!id || seen.has(id)) return false;
				seen.add(id);
				return true;
			});
			participantes = Array.isArray(all) ? all : [];
			initialParticipantIds = currentUnique.map((p: any) => p.id).filter(Boolean);
			selectedParticipantIds = [...initialParticipantIds];
			if (viewOnlyAssociated) {
				participantes = currentUnique;
			}
			selectedUo = '';
			uoOptions = Array.from(
				new Set(
					participantes
						.map((p: any) => (p?.uo ?? '').trim())
						.filter((value: string) => value.length > 0)
				)
			).sort((a, b) => a.localeCompare(b));
			participantes = participantes.sort((a: any, b: any) => {
				const aSelected = initialParticipantIds.includes(a?.id);
				const bSelected = initialParticipantIds.includes(b?.id);
				if (aSelected == bSelected) return 0;
				return aSelected ? -1 : 1;
			});
			initTable();
		} catch (err) {
			toastr.error($t('gestao_formacoes.acoes_participantes.load_error'), $t('gestao_formacoes.toasts.error'));
			console.error(err);
		}
	}

	function initTable() {
		if (!tableElement) return;
		if (dtInstance) {
			dtInstance.destroy();
			dtInstance = null;
		}

		jQuery(tableElement).off('change', '.participant-toggle');
		jQuery(tableElement).off('click', '.acao-certificado-btn');

		dtInstance = jQuery(tableElement).DataTable({
			dom: 'Bfrtip',
			responsive: false,
			scrollX: true,
			autoWidth: false,
			buttons: ['pageLength', 'pdf', 'csv', 'excel', 'copy', 'colvis'],
			pageLength: 25,
			order: [[1, 'asc'], [2, 'asc']],
			columns: [
				{ title: 'ID', visible: false },
				{ title: '', orderable: true, className: 'dt-body-center', visible: !viewOnlyAssociated },
				{ title: $t('gestao_formacoes.participantes.name') },
				{ title: $t('gestao_formacoes.participantes.email') },
				{ title: $t('gestao_formacoes.labels.uo') },
				{ title: $t('gestao_formacoes.common.status'), visible: viewOnlyAssociated },
				{
					title: $t('gestao_formacoes.labels.certificate'),
					orderable: false,
					className: 'dt-body-center',
					visible: viewOnlyAssociated
				},
				{ title: 'Participacao', visible: false },
				{ title: 'Certificado nome', visible: false }
			],
			columnDefs: [
				{
					targets: 1,
					render: function (_data: any, type: any, row: any) {
						const id = String(row[0] ?? '');
						const checked = selectedParticipantIds.includes(id) ? 'checked' : '';
						if (type === 'sort') {
							return checked ? 0 : 1;
						}
						return `<input type="checkbox" class="participant-toggle" data-id="${id}" ${checked} />`;
					}
				},
				{
					targets: 5,
					render: function (data: any) {
						if (!viewOnlyAssociated) return data ?? '';
						const estado = formatEstado(data);
						const badgeClass = getEstadoBadgeClass(data);
						return `<span class="${badgeClass}">${estado}</span>`;
					}
				},
				{
					targets: 6,
					render: function (_data: any, _type: any, row: any) {
						if (!viewOnlyAssociated || !row[7]) return '';
						const label = $t('gestao_formacoes.minhas_formacoes.certificate_button');
						return `
							<button class="btn btn-sm btn-outline-secondary acao-certificado-btn" data-participacao-id="${row[7]}" data-cert-nome="${row[8] ?? ''}" title="${label}">
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

		if (!viewOnlyAssociated) {
		jQuery(tableElement).on('change', '.participant-toggle', function () {
			const id = String(jQuery(this).data('id') ?? '');
			const checked = jQuery(this).is(':checked');
			toggleParticipant(id, checked);
		});
		}

		jQuery(tableElement).on('click', '.acao-certificado-btn', function (this: HTMLElement) {
			const participacaoId = jQuery(this).data('participacaoId');
			const nome = jQuery(this).data('certNome') ?? 'certificado.pdf';
			if (!participacaoId || !actionId) {
				toastr?.warning(
					$t('gestao_formacoes.minhas_formacoes.certificate_unavailable_toast'),
					$t('gestao_formacoes.toasts.certificate')
				);
				return;
			}

			certNome = nome;
			certUrl = `/ep/gestao_formacoes/acoes_formacao/${actionId}/participantes/${participacaoId}/certificado`;
			isCertModalOpen = true;
		});
	}

	function escapeRegex(value: string) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function applyUoFilter() {
		if (!dtInstance) return;
		const value = selectedUo.trim();
		const regex = value ? `^${escapeRegex(value)}$` : '';
		dtInstance.column(4).search(regex, true, false).draw();
	}

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		participantes.forEach((p: any, idx: number) => {
			const id = p.id ?? `p-${idx + 1}`;
			dtInstance.row.add([
				id,
				null,
				p.nome ?? '-',
				p.email ?? '-',
				p.uo ?? '-',
				p.estado ?? '-',
				null,
				p.certificado_disponivel ? p.participacao_id : null,
				p.certificado_nome ?? 'certificado.pdf'
			]);
		});
		dtInstance.draw();
	}

	function formatEstado(estado: any) {
		const raw = String(estado ?? '').trim();
		if (!raw) return '-';
		if (raw.toUpperCase() === 'VALIDADO') return 'Validada';
		if (raw.toUpperCase() === 'PENDENTE' || raw.toUpperCase() === 'POR_VALIDAR') return 'Por validar';
		if (raw.toUpperCase() === 'REJEITADO') return 'Rejeitada';
		return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
	}

	function getEstadoBadgeClass(estado: any) {
		const normalized = String(estado ?? '').trim().toLowerCase();
		if (normalized === 'validada' || normalized === 'validado')
			return 'estado-badge estado-validada';
		if (normalized === 'por validar' || normalized === 'pendente')
			return 'estado-badge estado-por-validar';
		if (normalized === 'rejeitada' || normalized === 'rejeitado')
			return 'estado-badge estado-rejeitada';
		return 'estado-badge estado-outro';
	}

	function closeCertModal() {
		isCertModalOpen = false;
		certUrl = '';
		certNome = '';
	}

	function toggleParticipant(id: string, checked: boolean) {
		if (checked) {
			if (!selectedParticipantIds.includes(id)) {
				selectedParticipantIds = [...selectedParticipantIds, id];
			}
			return;
		}
		selectedParticipantIds = selectedParticipantIds.filter((p) => p !== id);
	}

	async function handleAssociate() {
		if (!actionId) return;
		if (viewOnlyAssociated) {
			goto('/gestao_formacoes/acoes_formacao');
			return;
		}

		const newParticipantIds = selectedParticipantIds.filter(
			(id) => !initialParticipantIds.includes(id)
		);
		if (!newParticipantIds.length) {
			goto('/gestao_formacoes/acoes_formacao');
			return;
		}
		if (isSaving) return;
		isSaving = true;

		try {
			await fetchJson(`/ep/gestao_formacoes/acoes_formacao/${actionId}/participantes`, {
				method: 'POST',
				body: JSON.stringify({ userIds: newParticipantIds })
			});
			toastr.success($t('gestao_formacoes.acoes_participantes.associate_success'), $t('gestao_formacoes.toasts.success'));
			goto('/gestao_formacoes/acoes_formacao');
		} catch (err) {
			toastr.error($t('gestao_formacoes.acoes_participantes.associate_error'), $t('gestao_formacoes.toasts.error'));
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	onMount(() => {
		loadData();

		return () => {
			jQuery(tableElement).off('change', '.participant-toggle');
			jQuery(tableElement).off('click', '.acao-certificado-btn');
			if (dtInstance) {
				dtInstance.destroy();
			}
		};
	});
</script>

<div>
	<Breadcrum
		modulo={sidebarOptions.currentModule}
		objeto={sidebarOptions.currentObject}
		menu_items={items_breadcrum}
	/>

	<div class="p-2">
		<div class="row mb-2">
			<div class="col-md-4">
				<div class="form-group mb-0">
				<label for="uo-filter">{$t('gestao_formacoes.labels.uo')}</label>
					<select
						id="uo-filter"
						class="form-control"
						bind:value={selectedUo}
						onchange={applyUoFilter}
					>
					<option value="">{$t('gestao_formacoes.acoes_participantes.filter_all')}</option>
						{#each uoOptions as uo}
							<option value={uo}>{uo}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

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
						<p class="text-muted mb-0">
							{$t('gestao_formacoes.minhas_formacoes.certificate_unavailable')}
						</p>
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
