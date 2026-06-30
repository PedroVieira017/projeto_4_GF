import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	const titulo = 'Gestão de Formações';

	// Estrutura que o Sidebar.svelte espera
	const areas = [
		{
			id_area: 7,
			ativo: true,
			designacao: 'Gestão de Formações',
			objetos: [
				{ id_objeto: 1, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/tipos_formacao', descricao: 'Tipos de Formação' },
				{ id_objeto: 2, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/acoes_formacao', descricao: 'Ações de Formação' },
				{ id_objeto: 3, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/participantes', descricao: 'Participantes' },
				{ id_objeto: 4, ativo: true, item_menu: true, ficheiro: '/gestao_formacoes/validacao', descricao: 'Validação' },
				{
					id_objeto: 5,
					ativo: true,
					item_menu: true,
					ficheiro: '/gestao_formacoes/minhas_formacoes',
					descricao: 'As Minhas Formações',
					role: 'aluno'
				}
			]
		}
	];

	// “Outros módulos” (podes preencher mais tarde)
	const modulos: any[] = [];

	return { titulo, areas, modulos };
};
