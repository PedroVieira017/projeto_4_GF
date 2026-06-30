import { PartialType } from '@nestjs/swagger';
import { CreateTipoFormacaoDto } from './create-tipo_formacao.dto';

export class UpdateTipoFormacaoDto extends PartialType(CreateTipoFormacaoDto) {}
