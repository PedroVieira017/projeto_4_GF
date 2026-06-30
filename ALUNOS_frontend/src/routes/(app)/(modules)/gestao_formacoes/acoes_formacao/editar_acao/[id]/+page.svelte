<script module lang="ts">
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { t } from '$lib/translations/translations';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { goto } from '$app/navigation';
	import CertificateDesigner from '$lib/components/CertificateDesigner.svelte';
	import { normalizeCertificateConfig } from '$lib/certificates/certificateConfig.js';

	pageTitle.title = $t('gestao_formacoes.acoes_formacao.edit_title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.acoes_formacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.acoes_formacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.acoes_formacao.objectId;

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const acaoId = data?.acao?.id ?? null;
	let tiposFormacao = $state(Array.isArray(data.tipos_formacao) ? data.tipos_formacao : []);
	let logotiposCertificado = $state(
		Array.isArray(data.logotipos_certificado) ? data.logotipos_certificado : []
	);

	const toInputDate = (value: any) => {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		return date.toISOString().slice(0, 10);
	};
	const parseLogoSelection = (value: any) => {
		if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
		if (!value) return [];
		try {
			const parsed = JSON.parse(String(value));
			if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
		} catch {
			return String(value)
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
		}
		return [];
	};

	let designacaoInput = $state(data?.acao?.designacao ?? '');
	let tipoFormacaoId = $state(data?.acao?.tipo_formacao_id ? String(data.acao.tipo_formacao_id) : '');
	let objetivosInput = $state(data?.acao?.objetivos ?? '');
	let nHorasInput = $state(data?.acao?.n_horas ? String(data.acao.n_horas) : '');
	const empresaAtual = data?.acao?.local ?? data?.acao?.empresa ?? '';
	let empresaIdInput = $state('');
	let dataInicioInput = $state(toInputDate(data?.acao?.data_inicio));
	let dataFimInput = $state(toInputDate(data?.acao?.data_fim));
	let areaPedagogicaInput = $state(data?.acao?.area_formacao_pedagogica ? 'true' : 'false');
	let certificadoAutomaticoInput = $state(Boolean(data?.acao?.certificado_automatico));
	let certificadoLogotiposInput: string[] = $state(
		parseLogoSelection(data?.acao?.certificado_logotipos).length
			? parseLogoSelection(data?.acao?.certificado_logotipos)
			: logotiposCertificado.length
				? [String(logotiposCertificado[0].id)]
				: []
	);
	let certificadoConfig = $state(normalizeCertificateConfig(data?.acao?.certificado_config));
	let certificadoFooterFile: File | null = $state(null);
	let certificadoFooterFileName = $state('');
	let certificadoSignatureFile: File | null = $state(null);
	let certificadoSignatureFileName = $state('');
	let isSaving = $state(false);
	let isLoadingEmpresas = $state(false);
	let empresas: any[] = $state([]);
	const certificadoPreviewData = $derived.by(() => {
		const empresaSelecionada = empresas.find((empresa) => String(empresa.id) === empresaIdInput);
		const formatDate = (value: string) => {
			if (!value) return '';
			const date = new Date(value);
			return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-PT');
		};
		const dataInicio = formatDate(dataInicioInput);
		const dataFim = formatDate(dataFimInput);
		return {
			nome: 'Nome do Participante',
			acao: designacaoInput.trim(),
			descricao: objetivosInput.trim(),
			entidade: empresaSelecionada?.designation ?? empresaAtual ?? '',
			data_inicio: dataInicio,
			data_fim: dataFim,
			data: dataInicio && dataFim && dataInicio !== dataFim ? `${dataInicio} a ${dataFim}` : dataInicio || dataFim,
			horas: nHorasInput,
			tipo_formacao:
				tiposFormacao.find((tipo) => String(tipo.id) === String(tipoFormacaoId))?.designacao ?? ''
		};
	});

	async function fetchJson(url: string, init: RequestInit = {}) {
		const isFormData = init.body instanceof FormData;
		const res = await fetch(url, {
			...init,
			headers: {
				...(isFormData ? {} : { 'Content-Type': 'application/json' }),
				...(init.headers ?? {})
			}
		});

		const text = await res.text();
		if (!res.ok) {
			throw new Error(text || res.statusText);
		}
		return text ? JSON.parse(text) : null;
	}

	async function handleSave() {
		if (!acaoId) {
			toastr.error(
				$t('gestao_formacoes.acoes_formacao.action_not_found'),
				$t('gestao_formacoes.toasts.error')
			);
			return;
		}
		if (!designacaoInput.trim() || !tipoFormacaoId || !objetivosInput.trim() || !nHorasInput) {
			toastr.warning(
				$t('gestao_formacoes.acoes_formacao.fill_required'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		if (isSaving) return;
		isSaving = true;

		const empresaSelecionada = empresas.find((empresa) => String(empresa.id) === empresaIdInput);
		const formData = new FormData();
		formData.append('designacao', designacaoInput.trim());
		formData.append('tipo_formacao_id', String(tipoFormacaoId));
		formData.append('objetivos', objetivosInput.trim());
		formData.append('n_horas', String(nHorasInput));
		formData.append('empresa', empresaSelecionada?.designation ?? empresaAtual ?? '');
		formData.append('data_inicio', dataInicioInput || '');
		formData.append('data_fim', dataFimInput || '');
		formData.append('area_formacao_pedagogica', areaPedagogicaInput);
		formData.append('certificado_automatico', String(certificadoAutomaticoInput));
		formData.append('certificado_logotipos', JSON.stringify(certificadoLogotiposInput));
		formData.append('certificado_titulo', designacaoInput.trim());
		formData.append('certificado_descricao', objetivosInput.trim());
		formData.append('certificado_config', JSON.stringify(normalizeCertificateConfig(certificadoConfig)));
		if (certificadoAutomaticoInput && certificadoFooterFile) {
			formData.append('certificado_footer', certificadoFooterFile, certificadoFooterFile.name);
		}
		if (certificadoAutomaticoInput && certificadoSignatureFile) {
			formData.append('certificado_assinatura', certificadoSignatureFile, certificadoSignatureFile.name);
		}

		try {
			await fetchJson(`/ep/gestao_formacoes/acoes_formacao/${acaoId}`, {
				method: 'PATCH',
				headers: {},
				body: formData
			});
			toastr.success(
				$t('gestao_formacoes.acoes_formacao.action_updated'),
				$t('gestao_formacoes.toasts.success')
			);
			goto('/gestao_formacoes/acoes_formacao');
		} catch (err) {
			toastr.error(
				$t('gestao_formacoes.acoes_formacao.action_saved_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	async function loadEmpresas() {
		isLoadingEmpresas = true;
		try {
			const data = await fetchJson('/ep/gestao_formacoes/empresas?page=1&pageSize=5000');
			empresas = Array.isArray(data?.data) ? data.data : [];
			if (empresaAtual && !empresaIdInput) {
				const found = empresas.find(
					(empresa) =>
						String(empresa.designation ?? '').trim().toLowerCase() ===
						String(empresaAtual).trim().toLowerCase()
				);
				if (found?.id !== undefined && found?.id !== null) {
					empresaIdInput = String(found.id);
				}
			}
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
		loadEmpresas();
	});

	function toggleCertificateLogo(id: string, checked: boolean) {
		if (checked) {
			certificadoLogotiposInput = Array.from(new Set([...certificadoLogotiposInput, id]));
			return;
		}

		certificadoLogotiposInput = certificadoLogotiposInput.filter((item) => item !== id);
	}

</script>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} />

	<div class="p-2">
		<div class="card">
			<div class="card-header">{$t('gestao_formacoes.acoes_formacao.edit_title')}</div>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					handleSave();
				}}
			>
				<div class="card-body">
					{#if !acaoId}
						<p class="text-muted mb-0">{$t('gestao_formacoes.acoes_formacao.action_not_found')}.</p>
					{:else}
						<div class="form-group">
							<label for="designacao">{$t('gestao_formacoes.labels.designation')} <span class="text-danger">*</span></label>
							<input class="form-control" id="designacao" type="text" bind:value={designacaoInput} />
						</div>
						<div class="form-group">
							<label for="tipo_formacao">{$t('gestao_formacoes.labels.type')} <span class="text-danger">*</span></label>
							<select class="form-control" id="tipo_formacao" bind:value={tipoFormacaoId}>
								<option value="">{$t('gestao_formacoes.common.select')}</option>
								{#each tiposFormacao as tipo}
									<option value={String(tipo.id)}>{tipo.designacao}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label for="objetivos">{$t('gestao_formacoes.labels.objectives')} <span class="text-danger">*</span></label>
							<textarea
								class="form-control"
								id="objetivos"
								rows="2"
								bind:value={objetivosInput}
							></textarea>
						</div>
						<div class="form-group">
							<label for="n_horas">{$t('gestao_formacoes.labels.hours')} <span class="text-danger">*</span></label>
							<input class="form-control" id="n_horas" type="number" min="1" bind:value={nHorasInput} />
						</div>
						<div class="form-group">
							<label for="empresa">{$t('gestao_formacoes.labels.company')}</label>
							<select class="form-control" id="empresa" bind:value={empresaIdInput} disabled={isLoadingEmpresas}>
								<option value="">{$t('gestao_formacoes.common.select')}</option>
								{#each empresas as empresa}
									<option value={String(empresa.id)}>{empresa.designation}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label for="area_pedagogica">{$t('gestao_formacoes.labels.pedagogical_area')}</label>
							<select class="form-control" id="area_pedagogica" bind:value={areaPedagogicaInput}>
								<option value="false">{$t('gestao_formacoes.labels.no')}</option>
								<option value="true">{$t('gestao_formacoes.labels.yes')}</option>
							</select>
						</div>
						<div class="form-row">
							<div class="form-group col-md-6">
								<label for="data_inicio">{$t('gestao_formacoes.labels.start_date_label')}</label>
								<input class="form-control" id="data_inicio" type="date" bind:value={dataInicioInput} />
							</div>
							<div class="form-group col-md-6">
								<label for="data_fim">{$t('gestao_formacoes.labels.end_date_label')}</label>
								<input class="form-control" id="data_fim" type="date" bind:value={dataFimInput} />
							</div>
						</div>
						<hr />
						<div class="form-group">
							<div class="custom-control custom-checkbox">
								<input
									id="certificado_automatico"
									class="custom-control-input"
									type="checkbox"
									checked={certificadoAutomaticoInput}
									onchange={(event) =>
										(certificadoAutomaticoInput = (event.currentTarget as HTMLInputElement).checked)}
								/>
								<label class="custom-control-label" for="certificado_automatico">
									{$t('gestao_formacoes.acoes_formacao.certificate_auto')}
								</label>
							</div>
						</div>
						{#if certificadoAutomaticoInput}
							<CertificateDesigner
								bind:config={certificadoConfig}
								bind:footerFile={certificadoFooterFile}
								bind:footerFileName={certificadoFooterFileName}
								bind:signatureFile={certificadoSignatureFile}
								bind:signatureFileName={certificadoSignatureFileName}
								previewData={certificadoPreviewData}
							/>
						{/if}
					{/if}
				</div>
				<div class="card-footer d-flex justify-content-end">
					<button
						type="button"
						class="btn btn-sm btn-secondary mr-2"
						onclick={() => goto('/gestao_formacoes/acoes_formacao')}
					>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="submit" class="btn btn-sm btn-primary" disabled={isSaving || !acaoId}>{$t('gestao_formacoes.common.save')}</button>
				</div>
			</form>
		</div>
	</div>
</div>
