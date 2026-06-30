import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcaoFormacaoDto } from './dto/create-acao_formacao.dto';
import { UpdateAcaoFormacaoDto } from './dto/update-acao_formacao.dto';
import { AddParticipantesDto } from './dto/add-participantes.dto';
import { MOCK_PARTICIPANTES } from '../participantes/mock-participantes.data';
import {
  CertificateLayoutConfig,
  generateTrainingCertificatePdf,
  getCertificateLogoOptions,
  normalizeCertificateConfig,
  normalizeCertificateLogoIds,
  resolveCertificateLogos,
  sanitizePdfFilename,
  toPublicLogoOptions
} from '../certificados/certificados.util';

const uploadDir = path.join(process.cwd(), 'uploads', 'acoes_formacao');

@Injectable()
export class AcoesFormacaoService {
  constructor(private prisma: PrismaService) {}

  private hasAtivoColumnPromise: Promise<boolean> | null = null;
  private ensureAreaPedagogicaColumnPromise: Promise<boolean> | null = null;
  private ensureCertificateConfigColumnsPromise: Promise<boolean> | null = null;

  getLogotiposCertificado() {
    return toPublicLogoOptions(getCertificateLogoOptions());
  }

  // Lista todas as acoes, trazendo o tipo e o numero de participantes.
  async findAll() {
    const formacoes = await this.prisma.fORMACAO.findMany({
      orderBy: { data_inicio: 'desc' },
      include: {
        TIPO_FORMACAO: true,
        PARTICIPACAO: { select: { user_id: true } }
      }
    });
    const inactiveIds = await this.getInactiveFormacaoIds();
    const areaPedagogicaMap = await this.getAreaPedagogicaMap(formacoes.map((formacao) => formacao.id));
    const certificateConfigMap = await this.getCertificateConfigMap(formacoes.map((formacao) => formacao.id));

    return formacoes.map((formacao) => {
      if (inactiveIds.has(formacao.id)) return null;
      const uniqueCount = new Set(formacao.PARTICIPACAO.map((p) => p.user_id)).size;
      const { PARTICIPACAO, ...rest } = formacao;
      return {
        ...rest,
        area_formacao_pedagogica: areaPedagogicaMap.get(formacao.id) ?? false,
        ...this.withCertificateConfigDefaults(certificateConfigMap.get(formacao.id)),
        _count: { PARTICIPACAO: uniqueCount }
      };
    }).filter((formacao): formacao is NonNullable<typeof formacao> => formacao !== null);
  }

  async findOne(id: number) {
    const acao = await this.prisma.fORMACAO.findUnique({
      where: { id },
      include: {
        TIPO_FORMACAO: true,
        PARTICIPACAO: { select: { user_id: true } }
      }
    });

    if (!acao) {
      throw new NotFoundException('Acao de formacao nao encontrada');
    }
    if (!(await this.isFormacaoAtiva(id))) {
      throw new NotFoundException('Acao de formacao nao encontrada');
    }

    const uniqueCount = new Set(acao.PARTICIPACAO.map((p) => p.user_id)).size;
    const areaPedagogicaMap = await this.getAreaPedagogicaMap([acao.id]);
    const certificateConfigMap = await this.getCertificateConfigMap([acao.id]);
    const { PARTICIPACAO, ...rest } = acao;
    return {
      ...rest,
      area_formacao_pedagogica: areaPedagogicaMap.get(acao.id) ?? false,
      ...this.withCertificateConfigDefaults(certificateConfigMap.get(acao.id)),
      _count: { PARTICIPACAO: uniqueCount }
    };
  }

  async create(
    dto: CreateAcaoFormacaoDto,
    file?: Express.Multer.File,
    footerImageFile?: Express.Multer.File,
    signatureImageFile?: Express.Multer.File
  ) {
    const {
      data_inicio,
      data_fim,
      empresa,
      userEmail,
      username,
      area_formacao_pedagogica,
      certificado_automatico,
      certificado_logotipos,
      certificado_titulo,
      certificado_descricao,
      certificado_config,
      ...rest
    } = dto as any;
    this.validateAdminActionDates(data_inicio, data_fim);
    await this.ensureAreaPedagogicaColumn();
    await this.ensureCertificateConfigColumns();

    return this.prisma.$transaction(async (tx) => {
      const user = await this.resolveUser(userEmail, username, false);

      let saved: { id: number } | null = null;
      if (file) {
        saved = await tx.fICHEIRO.create({
          data: {
            nome_original: file.originalname,
            mime_type: file.mimetype,
            tamanho_bytes: file.size,
            caminho_armazenamento: file.path
          }
        });
      }

      let footerSaved: { id: number } | null = null;
      if (footerImageFile) {
        footerSaved = await tx.fICHEIRO.create({
          data: {
            nome_original: footerImageFile.originalname,
            mime_type: footerImageFile.mimetype,
            tamanho_bytes: footerImageFile.size,
            caminho_armazenamento: footerImageFile.path
          }
        });
      }

      let signatureSaved: { id: number } | null = null;
      if (signatureImageFile) {
        signatureSaved = await tx.fICHEIRO.create({
          data: {
            nome_original: signatureImageFile.originalname,
            mime_type: signatureImageFile.mimetype,
            tamanho_bytes: signatureImageFile.size,
            caminho_armazenamento: signatureImageFile.path
          }
        });
      }

      const formacao = await tx.fORMACAO.create({
        data: {
          ...this.normalizeFormacaoNumericFields(rest),
          local: empresa ?? null,
          data_inicio: data_inicio ? this.parseDate(data_inicio) : null,
          data_fim: data_fim ? this.parseDate(data_fim) : null,
          criado_por_user_id: user?.id ?? null
          // Nao definir criado_por_user_id aqui por enquanto.
        }
      });

      // Prisma client atual nao expõe certificado_ficheiro_id nem a relacao.
      // Faz update direto na BD para manter o vínculo do certificado.
      if (saved) {
        await tx.$executeRaw`
          UPDATE FORMACAO
          SET certificado_ficheiro_id = ${saved.id}
          WHERE id = ${formacao.id}
        `;
      }

      await this.updateAreaPedagogica(formacao.id, this.toBoolean(area_formacao_pedagogica), tx);
      await this.updateCertificateConfig(
        formacao.id,
        {
          certificado_automatico,
          certificado_logotipos,
          certificado_titulo: certificado_titulo || rest.designacao,
          certificado_descricao: certificado_descricao || rest.objetivos,
          certificado_config,
          certificado_footer_ficheiro_id: footerSaved?.id ?? undefined,
          certificado_assinatura_ficheiro_id: signatureSaved?.id ?? undefined
        },
        tx
      );

      return formacao;
    });
  }

  async update(
    id: number,
    dto: UpdateAcaoFormacaoDto,
    footerImageFile?: Express.Multer.File,
    signatureImageFile?: Express.Multer.File
  ) {
    await this.ensureExists(id);

    const {
      data_inicio,
      data_fim,
      empresa,
      area_formacao_pedagogica,
      certificado_automatico,
      certificado_logotipos,
      certificado_titulo,
      certificado_descricao,
      certificado_config,
      ...rest
    } = dto as any;
    this.validateAdminActionDates(data_inicio, data_fim);

    const updated = await this.prisma.fORMACAO.update({
      where: { id },
      data: {
        ...this.normalizeFormacaoNumericFields(rest),
        ...(empresa !== undefined && { local: empresa || null }),
        ...(data_inicio !== undefined && {
          data_inicio: data_inicio ? this.parseDate(data_inicio) : null
        }),
        ...(data_fim !== undefined && {
          data_fim: data_fim ? this.parseDate(data_fim) : null
        })
      }
    });

    if (area_formacao_pedagogica !== undefined) {
      await this.updateAreaPedagogica(id, this.toBoolean(area_formacao_pedagogica));
    }

    let footerSaved: { id: number } | null = null;
    if (footerImageFile) {
      footerSaved = await this.prisma.fICHEIRO.create({
        data: {
          nome_original: footerImageFile.originalname,
          mime_type: footerImageFile.mimetype,
          tamanho_bytes: footerImageFile.size,
          caminho_armazenamento: footerImageFile.path
        }
      });
    }

    let signatureSaved: { id: number } | null = null;
    if (signatureImageFile) {
      signatureSaved = await this.prisma.fICHEIRO.create({
        data: {
          nome_original: signatureImageFile.originalname,
          mime_type: signatureImageFile.mimetype,
          tamanho_bytes: signatureImageFile.size,
          caminho_armazenamento: signatureImageFile.path
        }
      });
    }

    await this.updateCertificateConfig(id, {
      certificado_automatico,
      certificado_logotipos,
      certificado_titulo,
      certificado_descricao,
      certificado_config,
      certificado_footer_ficheiro_id: footerSaved?.id ?? undefined,
      certificado_assinatura_ficheiro_id: signatureSaved?.id ?? undefined
    });

    return updated;
  }

  async remove(id: number) {
    await this.ensureExists(id);

    const participantsCount = await this.prisma.pARTICIPACAO.count({
      where: { formacao_id: id }
    });
    if (participantsCount > 0) {
      throw new ConflictException('Não é possivel apagar uma ação de formação com participantes associados');
    }

    if (!(await this.hasFormacaoAtivoColumn())) {
      return this.prisma.fORMACAO.delete({
        where: { id }
      });
    }

    await this.prisma.$executeRaw`
      UPDATE FORMACAO
      SET ativo = 0
      WHERE id = ${id}
    `;

    return {
      id,
      softDelete: true,
      ativo: false
    };
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.fORMACAO.findUnique({ where: { id } });
    if (!exists || !(await this.isFormacaoAtiva(id))) {
      throw new NotFoundException('Acao de formacao nao encontrada');
    }
  }

  private async isFormacaoAtiva(id: number) {
    if (!(await this.hasFormacaoAtivoColumn())) return true;

    const rows = await this.prisma.$queryRaw<Array<{ ativo: number | boolean }>>`
      SELECT CAST(ISNULL(ativo, 1) AS INT) AS ativo
      FROM FORMACAO
      WHERE id = ${id}
    `;

    if (!rows.length) return false;
    return Number(rows[0].ativo) === 1;
  }

  private async getInactiveFormacaoIds() {
    if (!(await this.hasFormacaoAtivoColumn())) {
      return new Set<number>();
    }

    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM FORMACAO
      WHERE ISNULL(ativo, 1) = 0
    `;

    return new Set(rows.map((row) => Number(row.id)));
  }

  private async hasFormacaoAtivoColumn() {
    if (!this.hasAtivoColumnPromise) {
      this.hasAtivoColumnPromise = this.prisma
        .$queryRaw<Array<{ has_column: number }>>`
          SELECT CASE WHEN COL_LENGTH('dbo.FORMACAO', 'ativo') IS NULL THEN 0 ELSE 1 END AS has_column
        `
        .then((rows) => Number(rows?.[0]?.has_column ?? 0) === 1)
        .catch(() => false);
    }

    return this.hasAtivoColumnPromise;
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

  private async updateAreaPedagogica(id: number, value: boolean, tx: any = this.prisma) {
    const hasColumn = await this.ensureAreaPedagogicaColumn();
    if (!hasColumn) return;

    await tx.$executeRaw`
      UPDATE FORMACAO
      SET area_formacao_pedagogica = ${value ? 1 : 0}
      WHERE id = ${id}
    `;
  }

  private async ensureCertificateConfigColumns() {
    if (!this.ensureCertificateConfigColumnsPromise) {
      this.ensureCertificateConfigColumnsPromise = this.prisma
        .$executeRawUnsafe(`
          IF COL_LENGTH('dbo.FORMACAO', 'certificado_automatico') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [certificado_automatico] BIT NOT NULL
              CONSTRAINT [DF__FORMACAO__certificado_automatico] DEFAULT ((0));
          END

          IF COL_LENGTH('dbo.FORMACAO', 'certificado_logotipos') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [certificado_logotipos] NVARCHAR(MAX) NULL;
          END

          IF COL_LENGTH('dbo.FORMACAO', 'certificado_titulo') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [certificado_titulo] NVARCHAR(250) NULL;
          END

          IF COL_LENGTH('dbo.FORMACAO', 'certificado_descricao') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [certificado_descricao] NVARCHAR(MAX) NULL;
          END

          IF COL_LENGTH('dbo.FORMACAO', 'certificado_config') IS NULL
          BEGIN
            ALTER TABLE [dbo].[FORMACAO]
            ADD [certificado_config] NVARCHAR(MAX) NULL;
          END
        `)
        .then(() => true)
        .catch(() => false);
    }

    return this.ensureCertificateConfigColumnsPromise;
  }

  private async getCertificateConfigMap(ids: number[]) {
    const hasColumns = await this.ensureCertificateConfigColumns();
    if (!hasColumns) return new Map<number, any>();
    if (!ids.length) return new Map<number, any>();

    const safeIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id));
    if (!safeIds.length) return new Map<number, any>();

    const rows = await this.prisma.$queryRawUnsafe<Array<{
      id: number;
      certificado_automatico: number;
      certificado_logotipos: string | null;
      certificado_titulo: string | null;
      certificado_descricao: string | null;
      certificado_config: string | null;
    }>>(
      `SELECT id,
              CAST(ISNULL(certificado_automatico, 0) AS INT) AS certificado_automatico,
              certificado_logotipos,
              certificado_titulo,
              certificado_descricao,
              certificado_config
       FROM FORMACAO
       WHERE id IN (${safeIds.join(',')})`
    ).catch(() => []);

    return new Map<number, any>(rows.map((row): [number, any] => [Number(row.id), row]));
  }

  private withCertificateConfigDefaults(config?: any) {
    return {
      certificado_automatico: Number(config?.certificado_automatico ?? 0) === 1,
      certificado_logotipos: config?.certificado_logotipos ?? null,
      certificado_titulo: config?.certificado_titulo ?? null,
      certificado_descricao: config?.certificado_descricao ?? null,
      certificado_config: config?.certificado_config ?? null
    };
  }

  private async updateCertificateConfig(
    id: number,
    config: {
      certificado_automatico?: boolean | string;
      certificado_logotipos?: string | string[];
      certificado_titulo?: string | null;
      certificado_descricao?: string | null;
      certificado_config?: string | CertificateLayoutConfig | null;
      certificado_footer_ficheiro_id?: number | null;
      certificado_assinatura_ficheiro_id?: number | null;
    },
    tx: any = this.prisma
  ) {
    const hasAnyConfig = Object.values(config).some((value) => value !== undefined);
    if (!hasAnyConfig) return;

    const hasColumns = await this.ensureCertificateConfigColumns();
    if (!hasColumns) return;

    const shouldUpdateAuto = config.certificado_automatico !== undefined;
    const shouldUpdateLogos = config.certificado_logotipos !== undefined;
    const shouldUpdateTitle = config.certificado_titulo !== undefined;
    const shouldUpdateDescription = config.certificado_descricao !== undefined;
    const shouldUpdateLayoutConfig = config.certificado_config !== undefined;
    const shouldUpdateFooterFile = config.certificado_footer_ficheiro_id !== undefined;
    const shouldUpdateSignatureFile = config.certificado_assinatura_ficheiro_id !== undefined;
    const normalizedLogos = shouldUpdateLogos
      ? JSON.stringify(normalizeCertificateLogoIds(config.certificado_logotipos, getCertificateLogoOptions()))
      : null;
    const normalizedTitle = shouldUpdateTitle ? String(config.certificado_titulo ?? '').trim() || null : null;
    const normalizedDescription = shouldUpdateDescription
      ? String(config.certificado_descricao ?? '').trim() || null
      : null;
    let normalizedConfig: string | null = null;
    if (shouldUpdateLayoutConfig || shouldUpdateFooterFile || shouldUpdateSignatureFile) {
      const existingConfig = shouldUpdateLayoutConfig
        ? config.certificado_config
        : (await this.getCertificateConfigMap([id])).get(id)?.certificado_config;
      const layoutConfig = normalizeCertificateConfig(existingConfig);
      if (shouldUpdateFooterFile) {
        layoutConfig.footer = {
          ...(layoutConfig.footer ?? {}),
          imageFileId: config.certificado_footer_ficheiro_id ?? null
        };
      }
      if (shouldUpdateSignatureFile) {
        layoutConfig.signature = {
          ...(layoutConfig.signature ?? {}),
          mode: 'image',
          imageFileId: config.certificado_assinatura_ficheiro_id ?? null
        };
      }
      normalizedConfig = JSON.stringify(layoutConfig);
    }

    await tx.$executeRaw`
      UPDATE FORMACAO
      SET certificado_automatico =
            CASE WHEN ${shouldUpdateAuto ? 1 : 0} = 1
              THEN ${shouldUpdateAuto && this.toBoolean(config.certificado_automatico) ? 1 : 0}
              ELSE certificado_automatico
            END,
          certificado_logotipos =
            CASE WHEN ${shouldUpdateLogos ? 1 : 0} = 1 THEN ${normalizedLogos} ELSE certificado_logotipos END,
          certificado_titulo =
            CASE WHEN ${shouldUpdateTitle ? 1 : 0} = 1 THEN ${normalizedTitle} ELSE certificado_titulo END,
          certificado_descricao =
            CASE WHEN ${shouldUpdateDescription ? 1 : 0} = 1 THEN ${normalizedDescription} ELSE certificado_descricao END,
          certificado_config =
            CASE WHEN ${shouldUpdateLayoutConfig || shouldUpdateFooterFile || shouldUpdateSignatureFile ? 1 : 0} = 1
              THEN ${normalizedConfig}
              ELSE certificado_config
            END
      WHERE id = ${id}
    `;
  }

  private toBoolean(value: any) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value ?? '').trim().toLowerCase();
    return ['1', 'true', 'sim', 'yes', 'on'].includes(normalized);
  }

  private normalizeFormacaoNumericFields(data: any) {
    const normalized = { ...data };
    if (normalized.tipo_formacao_id !== undefined) {
      normalized.tipo_formacao_id = Number(normalized.tipo_formacao_id);
    }
    if (normalized.n_horas !== undefined) {
      normalized.n_horas = Number(normalized.n_horas);
    }
    return normalized;
  }

  private async findUserByEmailOrUsername(userEmail?: string, username?: string) {
    const ors: any[] = [];
    if (userEmail) ors.push({ email: userEmail });
    if (username) ors.push({ username });

    if (username && /^\d+$/.test(username)) {
      ors.push({ id: parseInt(username, 10) });
    }

    if (ors.length === 0) {
      return null;
    }

    return this.prisma.uTILIZADOR.findFirst({
      where: { OR: ors },
      orderBy: { id: 'asc' }
    });
  }

  private async resolveUser(
    userEmail?: string,
    username?: string,
    createIfMissing = false
  ) {
    const user = await this.findUserByEmailOrUsername(userEmail, username);
    if (user || !createIfMissing) return user;

    if (!userEmail && !username) return null;

    const safeUsername = username ?? (userEmail ? userEmail.split('@')[0] : 'utilizador');
    const safeEmail = userEmail ?? `${safeUsername}@ipvc.pt`;

    return this.prisma.uTILIZADOR.create({
      data: {
        username: safeUsername,
        nome: safeUsername,
        email: safeEmail,
        ativo: true
      }
    });
  }

  private parseDate(value: string) {
    if (!value) return null;
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return new Date(`${yyyy}-${mm}-${dd}`);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private normalizeDate(value?: string | null) {
    if (!value) return null;
    const parsed = this.parseDate(value);
    if (!parsed) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  private validateAdminActionDates(dataInicio?: string | null, dataFim?: string | null) {
    const start = this.normalizeDate(dataInicio);
    const end = this.normalizeDate(dataFim);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start && start < today) {
      throw new BadRequestException('A data de inicio da acao de formacao nao pode ser anterior a hoje');
    }

    if (end && end < today) {
      throw new BadRequestException('A data de fim da acao de formacao nao pode ser anterior a hoje');
    }

    if (start && end && end < start) {
      throw new BadRequestException('A data de fim da acao de formacao nao pode ser anterior a data de inicio');
    }
  }

  // Lista participantes de uma determinada acao.
  async findParticipantes(formacaoId: number) {
    const certificateConfig = (await this.getCertificateConfigMap([formacaoId])).get(formacaoId);
    const hasAutomaticCertificate = Number(certificateConfig?.certificado_automatico ?? 0) === 1;

    return this.prisma.pARTICIPACAO.findMany({
      where: { formacao_id: formacaoId },
      include: {
        UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR: true,
        FICHEIRO: true,
        FORMACAO: {
          include: { CERTIFICADO_FICHEIRO: true }
        }
      },
      orderBy: { criado_em: 'asc' },
    }).then((rows) => {
      const seen = new Set<number>();
      return rows.filter((row) => {
        const id = row.user_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      }).map((row) => {
        const certFile = row.FICHEIRO ?? row.FORMACAO?.CERTIFICADO_FICHEIRO ?? null;
        const estado = this.getEffectiveParticipationEstado(row);
        return {
          ...row,
          estado,
          certificadoDisponivel: Boolean(certFile || hasAutomaticCertificate),
          certificadoNome: certFile?.nome_original ?? (hasAutomaticCertificate ? this.getAutomaticCertificateName(row.FORMACAO?.designacao) : null)
        };
      });
    });
  }

  async getParticipanteCertificado(formacaoId: number, participacaoId: number) {
    const participacao = await this.prisma.pARTICIPACAO.findFirst({
      where: {
        id: participacaoId,
        formacao_id: formacaoId
      },
      include: {
        FICHEIRO: true,
        FORMACAO: {
          include: {
            TIPO_FORMACAO: true,
            CERTIFICADO_FICHEIRO: true
          }
        },
        UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR: true
      }
    });

    if (!participacao?.FORMACAO) {
      throw new NotFoundException('Certificado nao encontrado');
    }

    const file = participacao.FICHEIRO ?? participacao.FORMACAO.CERTIFICADO_FICHEIRO ?? null;
    if (file) {
      return {
        type: 'file' as const,
        file
      };
    }

    const certificateConfig = (await this.getCertificateConfigMap([formacaoId])).get(formacaoId);
    if (Number(certificateConfig?.certificado_automatico ?? 0) !== 1) {
      throw new NotFoundException('Certificado nao encontrado');
    }

    const participant = participacao.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR;
    const title = certificateConfig?.certificado_titulo || participacao.FORMACAO.designacao;
    const description = certificateConfig?.certificado_descricao || participacao.FORMACAO.objetivos;
    const logos = resolveCertificateLogos(certificateConfig?.certificado_logotipos, getCertificateLogoOptions());
    const layoutConfig = normalizeCertificateConfig(certificateConfig?.certificado_config);
    const footerImagePath = await this.getCertificateFooterImagePath(layoutConfig);
    const signatureImagePath = await this.getCertificateSignatureImagePath(layoutConfig);
    const buffer = await generateTrainingCertificatePdf({
      participantName: participant?.nome ?? participant?.username ?? 'Utilizador',
      actionTitle: title,
      description,
      company: participacao.FORMACAO.local,
      startDate: participacao.FORMACAO.data_inicio,
      endDate: participacao.FORMACAO.data_fim,
      hours: participacao.FORMACAO.n_horas,
      tipoFormacao: participacao.FORMACAO.TIPO_FORMACAO?.designacao,
      logos,
      config: layoutConfig,
      footerImagePath,
      signatureImagePath
    });

    return {
      type: 'generated' as const,
      buffer,
      mime_type: 'application/pdf',
      nome_original: sanitizePdfFilename(`Certificado_${participant?.nome ?? 'utilizador'}_${title}`),
      tamanho_bytes: buffer.length
    };
  }

  // Associa varios utilizadores a acao.
  async addParticipantes(formacaoId: number, dto: AddParticipantesDto) {
    const { userIds } = dto;

    if (!userIds || userIds.length === 0) {
      return this.findParticipantes(formacaoId);
    }

    const formacao = await this.prisma.fORMACAO.findUnique({
      where: { id: formacaoId },
      select: { criado_por_user_id: true }
    });
    if (!formacao) {
      throw new NotFoundException('Acao de formacao nao encontrada');
    }

    const resolvedUserIds = (
      await Promise.all(userIds.map((userId) => this.resolveUserByParticipantId(userId)))
    )
      .map((user) => user?.id)
      .filter((id): id is number => typeof id === 'number');

    const existing = await this.prisma.pARTICIPACAO.findMany({
      where: { formacao_id: formacaoId },
      select: { user_id: true }
    });
    const existingIds = new Set(existing.map((e) => e.user_id));
    const toCreate = resolvedUserIds.filter((userId) => !existingIds.has(userId));

    if (toCreate.length) {
      await this.prisma.pARTICIPACAO.createMany({
        data: toCreate.map((userId) => ({
          formacao_id: formacaoId,
          user_id: userId,
          estado: 'VALIDADO',
          validado_por_user_id: formacao.criado_por_user_id ?? null,
          data_validacao: new Date(),
          criado_em: new Date(),
        })),
      });
    }

    return this.findParticipantes(formacaoId);
  }

  // Remove um participante da acao.
  removeParticipante(formacaoId: number, userId: number) {
    return this.prisma.pARTICIPACAO.deleteMany({
      where: { formacao_id: formacaoId, user_id: userId },
    });
  }

  private async getCertificateFooterImagePath(config?: CertificateLayoutConfig | null) {
    const fileId = Number(config?.footer?.imageFileId ?? 0);
    if (!Number.isInteger(fileId) || fileId <= 0) return null;

    const file = await this.prisma.fICHEIRO.findUnique({ where: { id: fileId } });
    return this.resolveStoredFilePath(file?.caminho_armazenamento);
  }

  private async getCertificateSignatureImagePath(config?: CertificateLayoutConfig | null) {
    const fileId = Number(config?.signature?.imageFileId ?? 0);
    if (!Number.isInteger(fileId) || fileId <= 0) return null;

    const file = await this.prisma.fICHEIRO.findUnique({ where: { id: fileId } });
    return this.resolveStoredFilePath(file?.caminho_armazenamento);
  }

  private resolveStoredFilePath(storedPath?: string | null) {
    if (!storedPath) return null;

    const candidates = [storedPath];
    if (!path.isAbsolute(storedPath)) {
      candidates.push(path.join(process.cwd(), storedPath));
      candidates.push(path.join(uploadDir, storedPath));
      candidates.push(path.join(process.cwd(), 'uploads', 'minhas_formacoes', storedPath));
    }

    return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
  }

  private getAutomaticCertificateName(designacao?: string | null) {
    const title = String(designacao ?? '').trim() || 'formacao';
    return sanitizePdfFilename(`Certificado_${title}`);
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

  private async resolveUserByParticipantId(participantId: string) {
    if (!participantId) return null;

    const existing = await this.prisma.uTILIZADOR.findFirst({
      where: { username: participantId }
    });
    if (existing) return existing;

    const mock = MOCK_PARTICIPANTES.find((item) => item.id_utilizador === participantId);
    if (!mock) return null;

    return this.prisma.uTILIZADOR.create({
      data: {
        username: mock.id_utilizador,
        nome: mock.nome_completo,
        email: mock.email_interno,
        uo: mock.uo_nome,
        ativo: true
      }
    });
  }
}
