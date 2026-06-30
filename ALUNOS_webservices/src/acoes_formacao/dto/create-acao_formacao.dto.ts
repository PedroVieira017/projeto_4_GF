import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateAcaoFormacaoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  designacao: string;

  @Type(() => Number)
  @IsInt()
  tipo_formacao_id: number;

  @IsString()
  @IsNotEmpty()
  objetivos: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  n_horas: number;

  // “empresa” do formulário → coluna LOCAL na BD
  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  area_formacao_pedagogica?: boolean | string;

  @IsOptional()
  certificado_automatico?: boolean | string;

  @IsOptional()
  certificado_logotipos?: string | string[];

  @IsOptional()
  @IsString()
  @MaxLength(250)
  certificado_titulo?: string;

  @IsOptional()
  @IsString()
  certificado_descricao?: string;

  @IsOptional()
  @IsString()
  certificado_config?: string;
}
