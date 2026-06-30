import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ObterPrivObjetosDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    id_utilizador: string
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    id_modulo: string
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    lang: string
}