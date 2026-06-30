export const modules = {
	exemplos: 1,
	gestao_formacoes: 50
};

export const pageIds = {
	exemplos: {
		base: { moduleId: modules.exemplos, objectId: 1 },
		exemplo_2: { moduleId: modules.exemplos, objectId: 2 }
	},

	gestao_formacoes: {
		tipos_formacao: { moduleId: modules.gestao_formacoes, objectId: 1 },
		acoes_formacao: { moduleId: modules.gestao_formacoes, objectId: 2 },
		participantes: { moduleId: modules.gestao_formacoes, objectId: 3 },
		validacao: { moduleId: modules.gestao_formacoes, objectId: 4 }
	}
};
