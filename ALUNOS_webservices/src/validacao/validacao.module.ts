import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidacaoController } from './validacao.controller';
import { ValidacaoService } from './validacao.service';

@Module({
  imports: [PrismaModule],
  controllers: [ValidacaoController],
  providers: [ValidacaoService]
})
export class ValidacaoModule {}
