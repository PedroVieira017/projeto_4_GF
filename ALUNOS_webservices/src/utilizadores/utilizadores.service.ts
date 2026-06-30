import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilizadoresService {
  constructor(private prisma: PrismaService) {}

  // Lista todos os utilizadores ativos (para o modal Associar)
  findAllAtivos() {
    return this.prisma.uTILIZADOR.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
  }
}
