import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMinhaFormacaoDto {
  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  entidade: string;

  @IsOptional()
  @IsString()
  data_inicio?: string;

  @IsOptional()
  @IsString()
  data_fim?: string;

  @IsOptional()
  @IsString()
  certificado?: string;

  @IsOptional()
  area_formacao_pedagogica?: boolean | string;
}
