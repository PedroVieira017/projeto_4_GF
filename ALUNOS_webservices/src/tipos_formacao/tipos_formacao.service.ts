import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Ajusta se já tiveres DTOs diferentes
type CreateDto = { designacao: string; ativo?: boolean };
type UpdateDto = { designacao?: string; ativo?: boolean };

@Injectable()
export class TiposFormacaoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve o delegate correto (porque no SQL Server + db pull o nome pode variar
   * e em runtime pode não bater com o que esperas).
   */
  private getDelegate(): any {
    const p: any = this.prisma as any;

    // ✅ o que tu viste no index.d.ts
    if (p.tipoFormacao) return p.tipoFormacao;

    // fallback (casos comuns quando o Prisma gera com casing estranho)
    if (p.tIPO_FORMACAO) return p.tIPO_FORMACAO;
    if (p.TIPO_FORMACAO) return p.TIPO_FORMACAO;
    if (p.tIPOFormacao) return p.tIPOFormacao;

    throw new InternalServerErrorException(
      'Prisma Client não expõe o delegate de TipoFormacao (tipoFormacao). Volta a correr: npx prisma generate'
    );
  }

  async findAll() {
    const delegate = this.getDelegate();
    return delegate.findMany({
      orderBy: { id: 'desc' }
    });
  }

  async findOne(id: number) {
    const delegate = this.getDelegate();
    const item = await delegate.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de formação não encontrado');
    return item;
  }

  async create(dto: CreateDto) {
    const delegate = this.getDelegate();
    return delegate.create({
      data: {
        designacao: dto.designacao,
        ativo: dto.ativo ?? true
      }
    });
  }

  async update(id: number, dto: UpdateDto) {
    // garante que existe
    await this.findOne(id);

    const delegate = this.getDelegate();
    return delegate.update({
      where: { id },
      data: {
        ...(dto.designacao !== undefined ? { designacao: dto.designacao } : {}),
        ...(dto.ativo !== undefined ? { ativo: dto.ativo } : {})
      }
    });
  }

  async remove(id: number) {
    // garante que existe
    await this.findOne(id);

    const delegate = this.getDelegate();
    return delegate.delete({ where: { id } });
  }
}
