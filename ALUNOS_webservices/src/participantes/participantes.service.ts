import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MOCK_PARTICIPANTES } from './mock-participantes.data';

@Injectable()
export class ParticipantesService {
  constructor(private prisma: PrismaService) {}

  private getPlaceholderEmail(username: string) {
    return `${username}@ipvc.pt`;
  }

  private getDisplayEmail(username: string, email?: string | null) {
    if (!email || email === this.getPlaceholderEmail(username)) return '-';
    return email;
  }

  // Lista de participantes com numero de formacoes.
  async findAll() {
    const usernames = MOCK_PARTICIPANTES.map((p) => p.id_utilizador);
    const users = await this.prisma.uTILIZADOR.findMany({
      where: { username: { in: usernames } },
      include: {
        PARTICIPACAO_PARTICIPACAO_user_idToUTILIZADOR: { select: { formacao_id: true } },
      },
    });

    const userMap = new Map(users.map((u) => [u.username, u]));

    return [...MOCK_PARTICIPANTES]
      .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
      .map((p) => {
        const user = userMap.get(p.id_utilizador);
        const email = this.getDisplayEmail(p.id_utilizador, user?.email);
        return {
          id: p.id_utilizador,
          nome: p.nome_completo,
          email: email === '-' ? p.email_interno : email,
          uo: user?.uo ?? p.uo_nome ?? null,
          nFormacoes:
            new Set(
              user?.PARTICIPACAO_PARTICIPACAO_user_idToUTILIZADOR.map((item) => item.formacao_id) ?? []
            ).size || p.n_formacoes || 0,
        };
      });
  }

  // Formacoes de um participante.
  async findFormacoes(participanteId: string) {
    const user = await this.prisma.uTILIZADOR.findFirst({
      where: {
        OR: [
          { username: participanteId },
          ...(/^\d+$/.test(participanteId) ? [{ id: parseInt(participanteId, 10) }] : []),
        ],
      },
    });
    if (!user) return [];

    const participacoes = await this.prisma.pARTICIPACAO.findMany({
      where: { user_id: user.id },
      include: {
        FORMACAO: true,
        FICHEIRO: true,
      },
      orderBy: { criado_em: 'desc' },
    });

    const seen = new Set<number>();
    return participacoes
      .filter((p) => {
        const id = p.formacao_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((p) => ({
        id: p.formacao_id,
        designacao: p.FORMACAO?.designacao ?? '',
        empresa: p.FORMACAO?.local ?? null,
        data_inicio: p.FORMACAO?.data_inicio ?? null,
        data_fim: p.FORMACAO?.data_fim ?? null,
        natureza: null,
        estado_validacao: this.getEffectiveParticipationEstado(p),
        certificadoDisponivel: !!p.FICHEIRO,
      }));
  }

  private getEffectiveParticipationEstado(participacao: {
    estado?: string | null;
    comprovativo_ficheiro_id?: number | null;
  }) {
    const estado = String(participacao.estado ?? '').trim().toUpperCase();
    if (
      (estado === 'PENDENTE' || estado === 'POR_VALIDAR') &&
      !participacao.comprovativo_ficheiro_id
    ) {
      return 'VALIDADO';
    }
    return participacao.estado ?? '';
  }
}
