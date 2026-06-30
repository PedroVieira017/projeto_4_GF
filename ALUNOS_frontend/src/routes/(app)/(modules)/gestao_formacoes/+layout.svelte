<script>
	import { sidebarRune } from '$lib/runes/sidebar.rune.svelte';
	import { t } from '$lib/translations/translations';

	/** @type {{ data: { titulo?: string | null, areas?: any[] | false | null, modulos?: any[] | false | null } }} */
	let { data } = $props();

	// Atualiza o sidebarRune com os dados locais
	$effect(() => {
		if (data.areas) {
			sidebarRune.areas = data.areas;
			return;
		}

		sidebarRune.areas = [
			{
				id_area: 1001,
				ativo: true,
				__titleKey: 'sidebar.admin',
				objetos: [
					{ id_objeto: 1001, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/tipos_formacao', descricao: $t('gestao_formacoes.sidebar.tipos_formacao') },
					{ id_objeto: 1002, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/acoes_formacao', descricao: $t('gestao_formacoes.sidebar.acoes_formacao') },
					{ id_objeto: 1003, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/participantes', descricao: $t('gestao_formacoes.sidebar.participantes') },
					{ id_objeto: 1004, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/validacao', descricao: $t('gestao_formacoes.sidebar.validacao') }
				]
			},
			{
				id_area: 1002,
				ativo: true,
				__titleKey: 'sidebar.aluno',
				objetos: [
					{
						id_objeto: 1005,
						ativo: true,
						item_menu: true,
						ficheiro: '/gestao_formacoes/minhas_formacoes',
						descricao: $t('gestao_formacoes.sidebar.minhas_formacoes'),
						role: 'aluno'
					}
				]
			}
		];
	});
</script>

<slot />
