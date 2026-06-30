import { Module } from '@nestjs/common';
import { ModulosController } from './modulos/modulos.controller';
import { ObjetosController } from './objetos/objetos.controller';
import { controller as UteisController } from './uteis/controller';
import { controller as NotificacaoController } from './notificacao/controller';
import { ModulosService } from './modulos/modulos.service';
import { ObjetosService } from './objetos/objetos.service';
import { Service as UteisService } from './uteis/service';
import { service as NotificacaoService } from './notificacao/service';


@Module({
  controllers: [ModulosController, ObjetosController, UteisController, NotificacaoController],
  providers: [ModulosService, ObjetosService, UteisService, NotificacaoService]
})
export class FuncoesBaseModule {}
