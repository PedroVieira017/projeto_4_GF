import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateValidacaoDto } from './dto/update-validacao.dto';

@Injectable()
export class ValidacaoService {
  constructor(private prisma: PrismaService) {}

  private ensureAreaPedagogicaColumnPromise: Promise<boolean> | null = null;

  async findPendentes() {
    const participacoes = await this.prisma.pARTICIPACAO.findMany({
      where: {
        comprovativo_ficheiro_id: {
          not: null
        },
        estado: {
          in: ['PENDENTE', 'POR_VALIDAR']
        }
      },
      include: {
        FORMACAO: {
          include: { TIPO_FORMACAO: true, CERTIFICADO_FICHEIRO: true }
        },
        UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR: true,
        FICHEIRO: true
      },
      orderBy: { criado_em: 'desc' }
    });

    const seen = new Set<string>();
    const unique = participacoes.filter((p) => {
      const key = `${p.user_id}:${p.formacao_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const areaPedagogicaMap = await this.getAreaPedagogicaMap(
      unique.map((p) => p.formacao_id).filter((id): id is number => typeof id === 'number')
    );

    return unique.map((p) => {
      const certFile = p.FICHEIRO ?? p.FORMACAO?.CERTIFICADO_FICHEIRO ?? null;
      return {
        id: p.id,
        titulo: p.FORMACAO?.designacao ?? '',
        empresa: p.FORMACAO?.local ?? '',
        submetido_por: p.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.nome ?? '',
        data_inicio: p.FORMACAO?.data_inicio ?? null,
        data_fim: p.FORMACAO?.data_fim ?? null,
        area_formacao_pedagogica: p.formacao_id ? areaPedagogicaMap.get(p.formacao_id) ?? false : false,
        certificado: certFile?.nome_original ?? null,
        certificado_id: certFile?.id ?? null,
        estado: this.mapEstado(p.estado)
      };
    });
  }

  async atualizarEstado(id: number, dto: UpdateValidacaoDto) {
    const estado = dto.estado;
    const observacao = dto.observacao ?? null;
    const validadoPor = dto.validado_por_user_id ? parseInt(dto.validado_por_user_id, 10) : null;
    const areaFormacaoPedagogica = (dto as any).area_formacao_pedagogica;

    const target = await this.prisma.pARTICIPACAO.findUnique({
      where: { id },
      select: { formacao_id: true, user_id: true }
    });
    if (!target) {
      throw new NotFoundException('Pedido de validacao nao encontrado');
    }

    await this.prisma.pARTICIPACAO.updateMany({
      where: { formacao_id: target.formacao_id, user_id: target.user_id },
      data: {
        estado,
        observacao_validacao: observacao,
        validado_por_user_id: validadoPor,
        data_validacao: new Date()
      }
    });

    if (areaFormacaoPedagogica !== undefined) {
      await this.updateAreaPedagogica(target.formacao_id, this.toBoolean(areaFormacaoPedagogica));
    }

    const updated = await this.prisma.pARTICIPACAO.findFirst({
      where: { formacao_id: target.formacao_id, user_id: target.user_id }
    });

    if (validadoPor) {
      await this.prisma.vALIDACAO_LOG.create({
        data: {
          participacao_id: id,
          acao: estado,
          feito_por_user_id: validadoPor,
          observacao
        }
      });
    }

    return updated;
  }

  private mapEstado(estado?: string | null) {
    if (!estado) return '';
    const normalized = estado.toUpperCase();
    if (normalized === 'PENDENTE' || normalized === 'POR_VALIDAR') return 'Por validar';
    if (normalized === 'VALIDADO') return 'Validada';
    if (normalized === 'REJEITADO') return 'Rejeitada';
    return estado;
  }

  async getComprovativoFile(id: number) {
    if (!id) return null;
    return this.prisma.fICHEIRO.findUnique({
      where: { id }
    });
  }

  private async ensureAreaPedagogicaColumn() {
    if (!this.ensureAreaPedagogicaColumnPromise) {
      this.ensureAreaPedagogicaColumnPromise = this.prisma
        .$executeRawUnsafe(`
          IF COL_LENGTH('dbo.FORMACAO', 'area_formacao_pedagogica') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [area_formacao_pedagogica] BIT NOT NULL
              CONSTRAINT [DF__FORMACAO__area_formacao_pedagogica] DEFAULT ((0));
          END
        `)
        .then(() => true)
        .catch(() => false);
    }

    return this.ensureAreaPedagogicaColumnPromise;
  }

  private async getAreaPedagogicaMap(ids: number[]) {
    const hasColumn = await this.ensureAreaPedagogicaColumn();
    if (!hasColumn) return new Map<number, boolean>();
    if (!ids.length) return new Map<number, boolean>();

    const safeIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id));
    if (!safeIds.length) return new Map<number, boolean>();

    const rows = await this.prisma.$queryRawUnsafe<Array<{ id: number; area_formacao_pedagogica: number }>>(
      `SELECT id, CAST(ISNULL(area_formacao_pedagogica, 0) AS INT) AS area_formacao_pedagogica
       FROM FORMACAO
       WHERE id IN (${safeIds.join(',')})`
    ).catch(() => []);

    return new Map(
      rows.map((row): [number, boolean] => [
        Number(row.id),
        Number(row.area_formacao_pedagogica) === 1
      ])
    );
  }

  private async updateAreaPedagogica(id: number, value: boolean) {
    const hasColumn = await this.ensureAreaPedagogicaColumn();
    if (!hasColumn) return;

    await this.prisma.$executeRaw`
      UPDATE FORMACAO
      SET area_formacao_pedagogica = ${value ? 1 : 0}
      WHERE id = ${id}
    `;
  }

  private toBoolean(value: any) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value ?? '').trim().toLowerCase();
    return ['1', 'true', 'sim', 'yes', 'on'].includes(normalized);
  }
}
