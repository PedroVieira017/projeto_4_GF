import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMinhaFormacaoDto } from './dto/create-minha-formacao.dto';
import {
  CertificateLayoutConfig,
  generateTrainingCertificatePdf,
  getCertificateLogoOptions,
  normalizeCertificateConfig,
  resolveCertificateLogos,
  sanitizePdfFilename
} from '../certificados/certificados.util';

const acoesFormacaoUploadDir = path.join(process.cwd(), 'uploads', 'acoes_formacao');

@Injectable()
export class MinhasFormacoesService {
  constructor(private prisma: PrismaService) {}

  private ensureAreaPedagogicaColumnPromise: Promise<boolean> | null = null;
  private ensureCertificateConfigColumnsPromise: Promise<boolean> | null = null;

  private getTipoFormacaoDelegate(): any {
    const p: any = this.prisma as any;
    if (p.tipoFormacao) return p.tipoFormacao;
    if (p.tIPO_FORMACAO) return p.tIPO_FORMACAO;
    if (p.TIPO_FORMACAO) return p.TIPO_FORMACAO;
    if (p.tIPOFormacao) return p.tIPOFormacao;
    return null;
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

  async findForUser(userEmail?: string, username?: string) {
    const user = await this.findUserByEmailOrUsername(userEmail, username);
    if (!user) return [];

    const participacoes = await this.prisma.pARTICIPACAO.findMany({
      where: { user_id: user.id },
      include: {
        FORMACAO: { include: { TIPO_FORMACAO: true } },
        FICHEIRO: true
      },
      orderBy: { criado_em: 'desc' }
    });
    const areaPedagogicaMap = await this.getAreaPedagogicaMap(
      participacoes.map((p) => p.formacao_id).filter((id): id is number => typeof id === 'number')
    );
    const certificateConfigMap = await this.getCertificateConfigMap(
      participacoes.map((p) => p.formacao_id).filter((id): id is number => typeof id === 'number')
    );

    return participacoes
      .filter((p) => {
        const isLegacyAdminCreatedAction =
          p.FORMACAO?.criado_por_user_id === user.id &&
          p.user_id === user.id &&
          p.validado_por_user_id === user.id &&
          (p.estado ?? '').toUpperCase() === 'VALIDADO';

        return !isLegacyAdminCreatedAction;
      })
      .map((p) => {
        const certificateConfig = p.formacao_id ? certificateConfigMap.get(p.formacao_id) : null;
        const effectiveEstado = this.getEffectiveParticipationEstado(p);
        const hasAutomaticCertificate =
          !p.FICHEIRO &&
          Number(certificateConfig?.certificado_automatico ?? 0) === 1 &&
          this.isValidated(effectiveEstado);

        return {
          id: p.id,
          designacao: p.FORMACAO?.designacao ?? '',
          tipo: p.FORMACAO?.TIPO_FORMACAO?.designacao ?? '',
          empresa: p.FORMACAO?.local ?? '',
          data_inicio: p.FORMACAO?.data_inicio ?? null,
          data_fim: p.FORMACAO?.data_fim ?? null,
          area_formacao_pedagogica: p.formacao_id ? areaPedagogicaMap.get(p.formacao_id) ?? false : false,
          estado: this.mapEstado(effectiveEstado),
          certificado: p.FICHEIRO?.nome_original ?? (hasAutomaticCertificate ? this.getAutomaticCertificateName(p.FORMACAO?.designacao) : null),
          certificado_id: p.FICHEIRO?.id ?? (hasAutomaticCertificate ? `auto-${p.id}` : null),
          certificado_automatico: hasAutomaticCertificate
        };
      });
  }

  async createForUser(dto: CreateMinhaFormacaoDto, file?: Express.Multer.File) {
    const user = await this.resolveUser(dto.userEmail, dto.username, true);
    if (!user) throw new NotFoundException('Utilizador nao encontrado');
    if (!file) throw new BadRequestException('Certificado obrigatorio');
    this.validateFinishedFormationDates(dto.data_inicio, dto.data_fim);
    await this.ensureAreaPedagogicaColumn();

    const delegate = this.getTipoFormacaoDelegate();
    let tipoExterna = null;

    if (delegate) {
      tipoExterna = await delegate.findFirst({
        where: { designacao: { contains: 'Externa' } },
        orderBy: { id: 'asc' }
      });

      if (!tipoExterna) {
        tipoExterna = await delegate.create({
          data: { designacao: 'Externa', ativo: true }
        });
      }
    }

    const formacao = await this.prisma.fORMACAO.create({
      data: {
        designacao: dto.titulo,
        tipo_formacao_id: tipoExterna?.id ?? 1,
        objetivos: null,
        n_horas: 1,
        local: dto.entidade,
        data_inicio: dto.data_inicio ? this.parseDate(dto.data_inicio) : null,
        data_fim: dto.data_fim ? this.parseDate(dto.data_fim) : null,
        criado_por_user_id: user.id
      }
    });
    await this.updateAreaPedagogica(
      formacao.id,
      this.toBoolean((dto as any).area_formacao_pedagogica)
    );

    const saved = await this.prisma.fICHEIRO.create({
      data: {
        nome_original: file.originalname,
        mime_type: file.mimetype,
        tamanho_bytes: file.size,
        caminho_armazenamento: file.path
      }
    });
    const ficheiroId = saved.id;

    await this.prisma.pARTICIPACAO.create({
      data: {
        formacao_id: formacao.id,
        user_id: user.id,
        estado: 'PENDENTE',
        comprovativo_ficheiro_id: ficheiroId
      }
    });

    return this.findForUser(dto.userEmail, dto.username);
  }

  async getCertificado(identifier: string, userEmail?: string, username?: string) {
    const normalizedIdentifier = String(identifier ?? '').trim();
    if (normalizedIdentifier.startsWith('auto-')) {
      return this.getGeneratedCertificado(normalizedIdentifier, userEmail, username);
    }

    const id = Number(normalizedIdentifier);
    if (!Number.isInteger(id) || id <= 0) return null;
    const file = await this.getCertificadoFile(id);
    return file ? { type: 'file' as const, file } : null;
  }

  async getCertificadoFile(id: number) {
    if (!id) return null;
    return this.prisma.fICHEIRO.findUnique({
      where: { id }
    });
  }

  private async getGeneratedCertificado(identifier: string, userEmail?: string, username?: string) {
    const participacaoId = Number(identifier.replace(/^auto-/, ''));
    if (!Number.isInteger(participacaoId) || participacaoId <= 0) return null;

    const participacao = await this.prisma.pARTICIPACAO.findUnique({
      where: { id: participacaoId },
      include: {
        FORMACAO: { include: { TIPO_FORMACAO: true } },
        UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR: true
      }
    });

    if (!participacao?.FORMACAO || !this.isValidated(this.getEffectiveParticipationEstado(participacao))) {
      return null;
    }

    const participant = participacao.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR;
    if (!this.matchesRequestedUser(participant, userEmail, username)) {
      return null;
    }

    const certificateConfig = (await this.getCertificateConfigMap([participacao.formacao_id])).get(participacao.formacao_id);
    if (Number(certificateConfig?.certificado_automatico ?? 0) !== 1) {
      return null;
    }

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
      candidates.push(path.join(acoesFormacaoUploadDir, storedPath));
      candidates.push(path.join(process.cwd(), 'uploads', 'minhas_formacoes', storedPath));
    }

    return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
  }

  private mapEstado(estado: string) {
    const normalized = estado.toUpperCase();
    if (normalized === 'PENDENTE' || normalized === 'POR_VALIDAR') return 'Por validar';
    if (normalized === 'VALIDADO') return 'Validada';
    if (normalized === 'REJEITADO') return 'Rejeitada';
    return estado;
  }

  private isValidated(estado?: string | null) {
    return String(estado ?? '').trim().toUpperCase() === 'VALIDADO';
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

  private getAutomaticCertificateName(designacao?: string | null) {
    const title = String(designacao ?? '').trim() || 'formacao';
    return sanitizePdfFilename(`Certificado_${title}`);
  }

  private matchesRequestedUser(
    user: { id?: number; email?: string | null; username?: string | null } | null | undefined,
    userEmail?: string,
    username?: string
  ) {
    if (!userEmail && !username) return true;
    if (!user) return false;

    const normalizedEmail = String(userEmail ?? '').trim().toLowerCase();
    const normalizedUsername = String(username ?? '').trim().toLowerCase();
    const matchesEmail = normalizedEmail && String(user.email ?? '').trim().toLowerCase() === normalizedEmail;
    const matchesUsername =
      normalizedUsername &&
      (String(user.username ?? '').trim().toLowerCase() === normalizedUsername ||
        String(user.id ?? '').trim().toLowerCase() === normalizedUsername);

    return Boolean(matchesEmail || matchesUsername);
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

  private validateFinishedFormationDates(dataInicio?: string | null, dataFim?: string | null) {
    const start = this.normalizeDate(dataInicio);
    const end = this.normalizeDate(dataFim);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start && start > today) {
      throw new BadRequestException('Nas minhas formacoes apenas sao permitidas datas ja ultrapassadas');
    }

    if (end && end >= today) {
      throw new BadRequestException('A data de fim tem de ser anterior a hoje, porque a formacao ja deve estar terminada');
    }

    if (start && end && end < start) {
      throw new BadRequestException('A data de fim nao pode ser anterior a data de inicio');
    }
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

  private toBoolean(value: any) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value ?? '').trim().toLowerCase();
    return ['1', 'true', 'sim', 'yes', 'on'].includes(normalized);
  }
}
