<script lang="ts">
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { t } from '$lib/translations/translations';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { goto } from '$app/navigation';

	declare const toastr: any;

	pageTitle.title = $t('gestao_formacoes.tipos_formacao.new_title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.tipos_formacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.tipos_formacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.tipos_formacao.objectId;

	let designacaoInput = $state('');
	let isSaving = $state(false);

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
			await fetchJson('/ep/gestao_formacoes/tipos_formacao', {
				method: 'POST',
				body: JSON.stringify({ designacao: designacaoInput.trim() })
			});
			toastr.success(
				$t('gestao_formacoes.tipos_formacao.toast_add_success'),
				$t('gestao_formacoes.toasts.success')
			);
			goto('/gestao_formacoes/tipos_formacao');
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

</script>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} />

	<div class="p-2">
		<div class="card">
			<div class="card-header">{$t('gestao_formacoes.tipos_formacao.add_title')}</div>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					handleSave();
				}}
			>
				<div class="card-body">
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
				<div class="card-footer d-flex justify-content-end">
					<button
						type="button"
						class="btn btn-sm btn-secondary mr-2"
						onclick={() => goto('/gestao_formacoes/tipos_formacao')}
					>
						{$t('gestao_formacoes.common.cancel')}
					</button>
					<button type="submit" class="btn btn-sm btn-primary" disabled={isSaving}>
						{$t('gestao_formacoes.common.save')}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
