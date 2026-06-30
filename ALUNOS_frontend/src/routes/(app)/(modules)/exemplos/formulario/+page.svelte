<script>
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { t } from '$lib/translations/translations';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';

	// titulo da página
	pageTitle.title = $t('formulario.titulo');

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t('formulario.modulo');
	sidebarOptions.currentObject = $t('formulario.objeto');
	sidebarOptions.currentModuleId = pageIds.exemplos.formulario.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.formulario.objectId;
</script>

<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} />
</div>
<div class="col-sm-12" style="margin-top: 10px;">
	<form method="">
		<div class="card">
			<div class="card-header">
				<b>{$t('formulario.formulario')}</b>: {$t('formulario.exemplo')}
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<div class="form-group mb-0">
							<label for="name" style="color: #000;">{$t('formulario.nome')}</label>
							<input id="nome" name="nome" type="text" class="form-control" />
						</div>
						<div class="form-group mb-0">
							<label for="idade" style="color: #000;">{$t('formulario.idade')}</label>
							<input id="idade" name="idade" type="text" class="form-control" />
						</div>
						<div class="form-group mb-0">
							<label for="name" style="color: #000;"
								>{$t('formulario.assunto')}<i class="fas fa-asterisk text-danger"></i></label
							>
							<input id="assunto" name="assunto" type="text" class="form-control" />
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group mb-0">
							<label for="descricao" style="color: #000;"
								>{$t('formulario.descricao_novo')}<i class="fas fa-asterisk text-danger"></i></label
							>
							<textarea id="descricao" name="descricao" rows="9" class="form-control"></textarea>
						</div>
					</div>
				</div>
			</div>
			<div class="card-footer">
				<button type="submit" class="btn btn-sm btn-primary btn-module-save">Guardar</button>
			</div>
		</div>
	</form>
</div>
