import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipoFormacaoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  designacao: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
