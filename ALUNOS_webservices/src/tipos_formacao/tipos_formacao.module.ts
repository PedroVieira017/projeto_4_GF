import { Module } from '@nestjs/common';
import { TiposFormacaoService } from './tipos_formacao.service';
import { TiposFormacaoController } from './tipos_formacao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiposFormacaoController],
  providers: [TiposFormacaoService],
})
export class TiposFormacaoModule {}
