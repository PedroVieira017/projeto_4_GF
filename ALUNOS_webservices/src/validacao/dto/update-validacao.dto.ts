import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateValidacaoDto {
  @IsString()
  @IsIn(['VALIDADO', 'REJEITADO'])
  estado: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsString()
  validado_por_user_id?: string;

  @IsOptional()
  area_formacao_pedagogica?: boolean | string;
}
