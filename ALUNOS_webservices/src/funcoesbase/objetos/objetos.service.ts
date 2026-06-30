import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObterPrivObjetosDto } from './dto';

@Injectable()
export class ObjetosService {
	constructor(private prisma: PrismaService) {}

	async getPrivObjetos(dto: ObterPrivObjetosDto) {
		// aceita vários nomes, caso o DTO não seja exatamente "moduleId"
		const moduleId =
			Number((dto as any)?.moduleId ?? (dto as any)?.id_modulo ?? (dto as any)?.idModulo ?? 1) || 1;

		// -------------------------
		// MÓDULO 50: GESTÃO DE FORMAÇÕES
		// -------------------------
		if (moduleId === 50) {
			return [
				{
					ativo: 1,
					designacao: 'ADMIN',
					id_area: 1,
					id_modulo: 50,
					modulo: 'Gestão de Formações',
					prefixo: 'gestao_formacoes',
					path: '/gestao_formacoes',
					objetos: [
						{
							id_objeto: 1,
							descricao: 'Tipos de Formação',
							ficheiro: '/gestao_formacoes/tipos_formacao',
							data_ini: '2024-01-01',
							item_menu: 1,
							data_fim: null,
							txt_info: null,
							ativo: 1,
							permissao: 1,
							beta: 0
						},
						{
							id_objeto: 2,
							descricao: 'Ações de Formação',
							ficheiro: '/gestao_formacoes/acoes_formacao',
							data_ini: '2024-01-01',
							item_menu: 1,
							data_fim: null,
							txt_info: null,
							ativo: 1,
							permissao: 1,
							beta: 0
						},
						{
							id_objeto: 3,
							descricao: 'Participantes',
							ficheiro: '/gestao_formacoes/participantes',
							data_ini: '2024-01-01',
							item_menu: 1,
							data_fim: null,
							txt_info: null,
							ativo: 1,
							permissao: 1,
							beta: 0
						},
						{
							id_objeto: 4,
							descricao: 'Validação',
							ficheiro: '/gestao_formacoes/validacao',
							data_ini: '2024-01-01',
							item_menu: 1,
							data_fim: null,
							txt_info: null,
							ativo: 1,
							permissao: 1,
							beta: 0
						}
					]
				}
			];
		}

		// -------------------------
		// DEFAULT: EXEMPLOS (o que já tinhas)
		// -------------------------
		return [
			{
				ativo: 1,
				designacao: 'Área Módulo Exemplo',
				id_area: 1,
				id_modulo: 1,
				modulo: 'Módulo Exemplo',
				prefixo: 'exemplo',
				path: '/exemplos',
				objetos: [
					{
						id_objeto: 1,
						descricao: 'Página Inicial Módulo Exemplo',
						ficheiro: '/exemplos',
						data_ini: '2024-01-01',
						item_menu: 1,
						data_fim: null,
						txt_info: null,
						ativo: 1,
						permissao: 1,
						beta: 0
					},
					{
						id_objeto: 2,
						descricao: 'Listagem Editoras',
						ficheiro: '/exemplos/editoras',
						data_ini: '2024-01-01',
						item_menu: 1,
						data_fim: null,
						txt_info: null,
						ativo: 1,
						permissao: 1,
						beta: 0
					},
					{
						id_objeto: 3,
						descricao: 'Nova Editora',
						ficheiro: '/exemplos/editoras/nova',
						data_ini: '2024-01-01',
						item_menu: 1,
						data_fim: null,
						txt_info: null,
						ativo: 1,
						permissao: 1,
						beta: 0
					},
					{
						id_objeto: 4,
						descricao: 'Editora',
						ficheiro: '/exemplos/editoras/{d+}',
						data_ini: '2024-01-01',
						item_menu: 0,
						data_fim: null,
						txt_info: null,
						ativo: 1,
						permissao: 1,
						beta: 0
					}
				]
			},
			{
				ativo: 1,
				designacao: 'Área 2 Módulo Exemplo',
				id_area: 2,
				id_modulo: 1,
				modulo: 'Módulo Exemplo',
				prefixo: 'exemplo',
				path: '/exemplos',
				objetos: [
					{
						id_objeto: 5,
						descricao: 'Página exemplo 2',
						ficheiro: '/exemplos/base',
						data_ini: '2024-01-01',
						item_menu: 1,
						data_fim: null,
						txt_info: null,
						ativo: 1,
						permissao: 1,
						beta: 0
					}
				]
			}
		];
	}
}
