import { PartialType } from '@nestjs/swagger';
import { CreateAcaoFormacaoDto } from './create-acao_formacao.dto';

export class UpdateAcaoFormacaoDto extends PartialType(CreateAcaoFormacaoDto) {}
