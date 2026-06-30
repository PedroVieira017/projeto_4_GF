import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AcoesFormacaoService } from './acoes_formacao.service';
import { AcoesFormacaoController } from './acoes_formacao.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AcoesFormacaoController],
  providers: [AcoesFormacaoService]
})
export class AcoesFormacaoModule {}
