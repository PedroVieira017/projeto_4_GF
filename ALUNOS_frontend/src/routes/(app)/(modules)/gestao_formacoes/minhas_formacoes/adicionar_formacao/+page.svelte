<script module lang="ts">
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations/translations';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	pageTitle.title = $t('gestao_formacoes.minhas_formacoes.add_external_title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.minhas_formacoes.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.validacao.moduleId;
	sidebarOptions.currentObjectId = 5;

	let tituloInput = $state('');
	let entidadeIdInput = $state('');
	let dataInicioInput = $state('');
	let dataFimInput = $state('');
	let areaPedagogicaInput = $state('false');
	let certificadoInput = $state('');
	let certificadoFile: any = $state(null);
	let isSaving = $state(false);
	let isLoadingEmpresas = $state(false);
	let empresas: any[] = $state([]);
	const today = new Date().toISOString().split('T')[0];

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

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		certificadoInput = file?.name ?? '';
		certificadoFile = file ?? null;
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

	async function handleSave() {
		if (!tituloInput.trim() || !entidadeIdInput || !dataInicioInput.trim() || !dataFimInput.trim()) {
			toastr?.warning(
				$t('gestao_formacoes.minhas_formacoes.toast_fill_required'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (dataInicioInput > today) {
			toastr?.warning(
				'A data de início tem de ser anterior ou igual a hoje.',
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (dataFimInput >= today) {
			toastr?.warning(
				'A data de fim tem de ser anterior a hoje, porque a formação já deve estar terminada.',
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (dataFimInput < dataInicioInput) {
			toastr?.warning(
				'A data de fim não pode ser anterior à data de início.',
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (!certificadoFile) {
			toastr?.warning(
				$t('gestao_formacoes.minhas_formacoes.toast_cert_required'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (isSaving) return;
		isSaving = true;

		try {
			const entidadeSelecionada = empresas.find((empresa) => String(empresa.id) === entidadeIdInput);
			const formData = new FormData();
			formData.append('titulo', tituloInput.trim());
			formData.append('entidade', entidadeSelecionada?.designation ?? '');
			formData.append('data_inicio', dataInicioInput.trim());
			formData.append('data_fim', dataFimInput.trim());
			formData.append('area_formacao_pedagogica', areaPedagogicaInput);
			if (certificadoFile) {
				formData.append('certificado', certificadoFile, certificadoFile.name);
			}

			const res = await fetch('/ep/gestao_formacoes/minhas_formacoes', {
				method: 'POST',
				body: formData
			});
			const text = await res.text();
			if (!res.ok) {
				throw new Error(text || res.statusText);
			}
			toastr?.success(
				$t('gestao_formacoes.minhas_formacoes.toast_added'),
				$t('gestao_formacoes.toasts.success')
			);
			goto('/gestao_formacoes/minhas_formacoes');
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

	onMount(() => {
		loadEmpresas();
	});

</script>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} />

	<div class="p-2">
		<div class="card">
			<div class="card-header">{$t('gestao_formacoes.minhas_formacoes.add_external_title')}</div>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					handleSave();
				}}
			>
				<div class="card-body">
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
								max={today}
								bind:value={dataInicioInput}
							/>
						</div>
						<div class="form-group col-md-6">
							<label for="data_fim">{$t('gestao_formacoes.labels.end_date_label')} <span class="text-danger">*</span></label>
							<input
								id="data_fim"
								class="form-control"
								type="date"
								max={today}
								bind:value={dataFimInput}
							/>
						</div>
					</div>
					<div class="form-group">
						<label for="area_pedagogica">{$t('gestao_formacoes.labels.pedagogical_area')}</label>
						<select class="form-control" id="area_pedagogica" bind:value={areaPedagogicaInput}>
							<option value="false">{$t('gestao_formacoes.labels.no')}</option>
							<option value="true">{$t('gestao_formacoes.labels.yes')}</option>
						</select>
					</div>
					<div class="form-group">
						<label for="certificado">
							{$t('gestao_formacoes.minhas_formacoes.form_cert')} <span class="text-danger">*</span>
						</label>
						<input
							id="certificado"
							class="form-control-file"
							type="file"
							required
							onchange={handleFileChange}
						/>
						<small class="form-text text-muted">
							{$t('gestao_formacoes.minhas_formacoes.form_cert_hint')}</small>
					</div>
					<div class="alert alert-warning">
						{$t('gestao_formacoes.minhas_formacoes.form_warning')}
					</div>
				</div>
				<div class="card-footer d-flex justify-content-end">
					<button
						type="button"
						class="btn btn-sm btn-secondary mr-2"
						onclick={() => goto('/gestao_formacoes/minhas_formacoes')}
					>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="submit" class="btn btn-sm btn-primary" disabled={isSaving}>{$t('gestao_formacoes.common.save')}</button>
				</div>
			</form>
		</div>
	</div>
</div>


