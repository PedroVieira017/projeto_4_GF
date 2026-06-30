<script context="module" lang="ts">
	// DataTables e jQuery são globais (JS)  declarar aqui para TS não reclamar
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
	import { goto } from '$app/navigation';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();

	pageTitle.title = $t('gestao_formacoes.tipos_formacao.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.tipos_formacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.tipos_formacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.tipos_formacao.objectId;

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;

	// Estado do modal
	let isModalOpen = $state(false);
	let modalMode: 'add' | 'edit' = $state('add');
	let currentTipoId: number | null = $state(null);
	let designacaoInput = $state('');
	let isDeleteModalOpen = $state(false);
	let deleteTipoId: number | null = $state(null);
	let deleteTipoDesignacao = $state('');

	// Lista de tipos (inicia com dados mock)
	let tipos = $state([...data.tipos]);
	let isSaving = $state(false);
	let isDeleting = $state(false);

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

	async function refreshTipos() {
		const data = await fetchJson('/ep/gestao_formacoes/tipos_formacao');
		tipos = Array.isArray(data) ? data : [];
		updateTable();
	}


	onMount(() => {
		if (!tableElement) return;

		// Inicializar DataTable
		dtInstance = jQuery(tableElement).DataTable({
			dom: 'Bfrtip',
			responsive: false,
			scrollX: true,
			autoWidth: false,
			buttons: ['pageLength', 'pdf', 'csv', 'excel', 'copy', 'colvis'],
			pageLength: 25,
			order: [[0, 'asc']],
			columns: [
				{ title: 'ID' },
				{ title: $t('gestao_formacoes.labels.designation') },
				{ title: $t('gestao_formacoes.common.actions'), orderable: false, className: 'dt-body-right' }
			],
			columnDefs: [
				{
					targets: -1,
					width: '88px', // Última coluna (Ações)
					render: function (data: any, type: any, row: any) {
						return `
							<div class="d-flex justify-content-end">
								<button class="btn btn-sm btn-outline-warning editar-tipo" data-id="${row[0]}" title="${$t('gestao_formacoes.common.edit')}">
									<i class="fas fa-edit"></i>
								</button>
								<button class="btn btn-sm btn-outline-danger eliminar-tipo ml-1" data-id="${row[0]}" title="${$t('gestao_formacoes.common.delete')}">
									<i class="fas fa-trash"></i>
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

		// Preencher tabela com dados iniciais
		updateTable();

		const adjustTable = () => {
			if (!dtInstance) return;
			dtInstance.columns.adjust();
		};

		const scheduleAdjust = () => {
			setTimeout(adjustTable, 50);
		};

		// Event listeners para botões (delegated events)
		jQuery(document).on('click', '.editar-tipo', function () {
			const id = parseInt(jQuery(this).data('id'));
			openEditModal(id);
		});

		jQuery(document).on('click', '.eliminar-tipo', function () {
			const id = parseInt(jQuery(this).data('id'));
			openDeleteModal(id);
		});

		jQuery(document).on('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
		window.addEventListener('resize', scheduleAdjust);

		return () => {
			// Cleanup event listeners
			jQuery(document).off('click', '.editar-tipo');
			jQuery(document).off('click', '.eliminar-tipo');
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
		};
	});

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		tipos.forEach((tipo) => {
			dtInstance.row.add([tipo.id, tipo.designacao, null]);
		});
		dtInstance.draw();
	}

	function openAddModal() {
		goto('/gestao_formacoes/tipos_formacao/adicionar_formacao');
	}

	function openEditModal(id: number) {
		if (!id) return;
		goto(`/gestao_formacoes/tipos_formacao/editar_formacao/${id}`);
	}

	function closeModal() {
		isModalOpen = false;
		designacaoInput = '';
		currentTipoId = null;
	}

	function openDeleteModal(id: number) {
		const tipo = tipos.find((t) => t.id === id);
		if (!tipo) return;

		deleteTipoId = id;
		deleteTipoDesignacao = tipo.designacao;
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		deleteTipoId = null;
		deleteTipoDesignacao = '';
	}

	async function handleSave() {
		if (!designacaoInput.trim()) {
			toastr.warning(
				$t('gestao_formacoes.tipos_formacao.toast_missing_designation'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (isSaving) return;
		isSaving = true;

		try {
			if (modalMode === 'add') {
				await fetchJson('/ep/gestao_formacoes/tipos_formacao', {
					method: 'POST',
					body: JSON.stringify({ designacao: designacaoInput.trim() })
				});
				toastr.success(
					$t('gestao_formacoes.tipos_formacao.toast_add_success'),
					$t('gestao_formacoes.toasts.success')
				);
			} else {
				await fetchJson(`/ep/gestao_formacoes/tipos_formacao/${currentTipoId}`, {
					method: 'PATCH',
					body: JSON.stringify({ designacao: designacaoInput.trim() })
				});
				toastr.success(
					$t('gestao_formacoes.tipos_formacao.toast_update_success'),
					$t('gestao_formacoes.toasts.success')
				);
			}

			await refreshTipos();
			closeModal();
		} catch (err) {
			toastr.error(
				$t('gestao_formacoes.tipos_formacao.toast_save_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
		isSaving = false;
		}
	}

	async function eliminarTipo(id: number) {
		if (id === null || id === undefined) return;
		if (isDeleting) return;
		isDeleting = true;

		try {
			await fetchJson(`/ep/gestao_formacoes/tipos_formacao/${id}`, { method: 'DELETE' });
			toastr.success(
				$t('gestao_formacoes.tipos_formacao.toast_delete_success'),
				$t('gestao_formacoes.toasts.success')
			);
			await refreshTipos();
		} catch (err) {
			toastr.error(
				$t('gestao_formacoes.tipos_formacao.toast_delete_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isDeleting = false;
		}
	}

	function handleDeleteConfirm() {
		if (deleteTipoId === null) return;
		eliminarTipo(deleteTipoId);
		closeDeleteModal();
	}

	// Breadcrumb items
	let items_breadcrum = $derived([
		{
			icon_class: 'icon-doc',
			url: '#',
			designacao: $t('gestao_formacoes.common.new'),
			function: openAddModal
		}
	]);
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
					class="datatable-on table-striped hover datatable table-sm nowrap no-footer dtr-inline"
				>
					<tbody></tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<!-- Modal Adicionar/Editar -->
{#if isModalOpen}
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
						{modalMode === 'add' ? $t('gestao_formacoes.tipos_formacao.add_title') : $t('gestao_formacoes.tipos_formacao.edit_title')}
					</h5>
					<button type="button" class="close" onclick={closeModal}>
						<span>&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="designacao">{$t('gestao_formacoes.labels.designation')} <span class="text-danger">*</span></label>
						<input
							type="text"
							class="form-control"
							id="designacao"
							bind:value={designacaoInput}
							placeholder={$t('gestao_formacoes.tipos_formacao.placeholder_designation')}
						/>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeModal}>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="button" class="btn btn-primary" onclick={handleSave}>{$t('gestao_formacoes.common.save')}</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isDeleteModalOpen}
	<div
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
		style="background-color: rgba(0,0,0,0.5);"
	>
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{$t('gestao_formacoes.tipos_formacao.delete_title')}</h5>
					<button type="button" class="close" onclick={closeDeleteModal}>
						<span>&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<p>
						{$t('gestao_formacoes.tipos_formacao.delete_confirm')} 
						<strong>{deleteTipoDesignacao}</strong>?
					</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeDeleteModal}>
						{$t('gestao_formacoes.common.cancel')}
					</button>
					<button type="button" class="btn btn-danger" onclick={handleDeleteConfirm}>
						{$t('gestao_formacoes.common.delete')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
<style>
	/* Garantir que o modal apareça por cima de tudo */
	.modal.show {
		display: block;
	}

	:global(.datatable-on thead th:last-child),
	:global(.datatable-on tbody td:last-child) {
		min-width: 125px;
		width: 125px;
	}
</style>
