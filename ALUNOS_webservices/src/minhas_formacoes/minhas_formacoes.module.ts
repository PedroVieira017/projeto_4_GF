import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MinhasFormacoesController } from './minhas_formacoes.controller';
import { MinhasFormacoesService } from './minhas_formacoes.service';

@Module({
  imports: [PrismaModule],
  controllers: [MinhasFormacoesController],
  providers: [MinhasFormacoesService]
})
export class MinhasFormacoesModule {}
