import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FuncoesBaseModule } from "./funcoesbase/module";
import { AuthModule } from "./auth/auth.module";
import { PassportModule } from '@nestjs/passport';
import { TiposFormacaoModule } from './tipos_formacao/tipos_formacao.module';
import { AcoesFormacaoModule } from './acoes_formacao/acoes_formacao.module';
import { UtilizadoresModule } from './utilizadores/utilizadores.module';
import { ParticipantesModule } from './participantes/participantes.module';
import { ValidacaoModule } from './validacao/validacao.module';
import { MinhasFormacoesModule } from './minhas_formacoes/minhas_formacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PassportModule,
    AuthModule,
    // Funções Base
    FuncoesBaseModule,

    TiposFormacaoModule,
    AcoesFormacaoModule,
    UtilizadoresModule,
    ParticipantesModule,
    ValidacaoModule,
    MinhasFormacoesModule,

    // Outros Módulos
    //...
    
  ]
})
export class AppModule {}
