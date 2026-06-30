<script module lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { locale, t } from '$lib/translations/translations';
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	pageTitle.title = $t('gestao_formacoes.validacao.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.validacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.validacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.validacao.objectId;

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	let pedidos = $state(data.pedidos ?? []);
	let items_breadcrum = $derived([]);
	let isConfirmModalOpen = $state(false);
	let confirmAction = $state('');
	let confirmId: number | null = $state(null);
	let confirmPedagogicalArea = $state('false');
	let isSaving = $state(false);

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
				{ title: $t('gestao_formacoes.labels.title') },
				{ title: $t('gestao_formacoes.labels.company') },
				{ title: $t('gestao_formacoes.labels.submitted_by') },
				{ title: $t('gestao_formacoes.labels.start_date') },
				{ title: $t('gestao_formacoes.labels.end_date') },
				{ title: $t('gestao_formacoes.labels.pedagogical_area') },
				{ title: $t('gestao_formacoes.common.status') },
				{
					title: $t('gestao_formacoes.common.actions'),
					orderable: false,
					className: 'dt-body-right'
				}
			],
			columnDefs: [
				{
					targets: 7,
					render: function (data: any) {
						const estado = formatEstado(data);
						const badgeClass = getEstadoBadgeClass(data);
						return `<span class="${badgeClass}">${estado}</span>`;
					}
				},
				{
					targets: 8,
					render: function (_data: any, _type: any, row: any) {
						const id = row[0];
						return `
							<div class="d-flex justify-content-end">
								<button class="btn btn-sm btn-info mr-2 validacao-action" data-id="${id}" data-action="validar">
									${$t('gestao_formacoes.validacao.validate')}
								</button>
								<button class="btn btn-sm btn-outline-danger validacao-action" data-id="${id}" data-action="rejeitar">
									${$t('gestao_formacoes.validacao.reject')}
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

		jQuery(document).on('click', '.validacao-action', function (this: HTMLElement) {
			const id = parseInt(jQuery(this).data('id'));
			const action = jQuery(this).data('action');
			if (!Number.isNaN(id) && action) {
				openConfirm(action, id);
			}
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
			jQuery(document).off('click', '.validacao-action');
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
		};
	});

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
		const normalized = String(estado ?? '')
			.trim()
			.toLowerCase();
		if (normalized === 'validada' || normalized === 'validado')
			return 'estado-badge estado-validada';
		if (normalized === 'por validar' || normalized === 'pendente')
			return 'estado-badge estado-por-validar';
		if (normalized === 'rejeitada' || normalized === 'rejeitado')
			return 'estado-badge estado-rejeitada';
		return 'estado-badge estado-outro';
	};
	const getAreaPedagogica = (pedido: any) =>
		pedido?.area_formacao_pedagogica === true ||
		pedido?.area_formacao_pedagogica === 1 ||
		pedido?.area_formacao_pedagogica === '1';
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

	async function refreshPedidos() {
		const data = await fetchJson('/ep/gestao_formacoes/validacao');
		pedidos = Array.isArray(data) ? data : [];
		updateTable();
	}

	function openConfirm(action: string, id: number) {
		confirmAction = action;
		confirmId = id;
		const pedido = pedidos.find((item: any) => Number(item?.id) === Number(id));
		confirmPedagogicalArea = getAreaPedagogica(pedido) ? 'true' : 'false';
		isConfirmModalOpen = true;
	}

	function closeConfirm() {
		isConfirmModalOpen = false;
		confirmAction = '';
		confirmId = null;
		confirmPedagogicalArea = 'false';
	}

	async function handleConfirm() {
		if (confirmId === null) return;
		if (isSaving) return;
		isSaving = true;

		try {
			await fetchJson(`/ep/gestao_formacoes/validacao/${confirmId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					estado: confirmAction === 'validar' ? 'VALIDADO' : 'REJEITADO',
					area_formacao_pedagogica: confirmPedagogicalArea
				})
			});

			await refreshPedidos();

			toastr?.success(
				confirmAction === 'validar'
					? $t('gestao_formacoes.validacao.success_validate')
					: $t('gestao_formacoes.validacao.success_reject'),
				$t('gestao_formacoes.toasts.success')
			);
			closeConfirm();
		} catch (err) {
			toastr?.error(
				$t('gestao_formacoes.validacao.error_update'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		pedidos.forEach((pedido: any, idx: number) => {
			const id = pedido.id ?? idx + 1;
			dtInstance.row.add([
				id,
				pedido.titulo ?? '-',
				pedido.empresa ?? '-',
				pedido.submetido_por ?? '-',
				formatDate(pedido.data_inicio),
				formatDate(pedido.data_fim),
				formatYesNo(getAreaPedagogica(pedido)),
				pedido.estado ?? '-',
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
					class="datatable-on table-striped hover datatable table-sm no-footer dtr-inline"
				>
					<tbody></tbody>
				</table>
			</div>
		</div>
	</div>
</div>

{#if isConfirmModalOpen}
	<div
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
		style="background-color: rgba(0,0,0,0.5);"
	>
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">
						{confirmAction === 'validar'
							? $t('gestao_formacoes.validacao.confirm_validate')
							: $t('gestao_formacoes.validacao.confirm_reject')}
					</h5>
					<button type="button" class="close" onclick={closeConfirm}>
						<span>&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<p>
						{confirmAction === 'validar'
							? $t('gestao_formacoes.validacao.confirm_text_validate')
							: $t('gestao_formacoes.validacao.confirm_text_reject')}
					</p>
					<div class="form-group mb-0">
						<label for="validacao-area-pedagogica"
							>{$t('gestao_formacoes.labels.pedagogical_area')}</label
						>
						<select
							id="validacao-area-pedagogica"
							class="form-control"
							bind:value={confirmPedagogicalArea}
						>
							<option value="false">{$t('gestao_formacoes.labels.no')}</option>
							<option value="true">{$t('gestao_formacoes.labels.yes')}</option>
						</select>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeConfirm}
						>{$t('gestao_formacoes.common.cancel')}</button
					>
					<button
						type="button"
						class={confirmAction === 'rejeitar' ? 'btn btn-danger' : 'btn btn-primary'}
						onclick={handleConfirm}
					>
						{$t('gestao_formacoes.common.confirm')}
					</button>
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
