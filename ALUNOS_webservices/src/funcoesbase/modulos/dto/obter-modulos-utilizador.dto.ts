import { IsNotEmpty, IsString } from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ObterPrivModulosDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    id_utilizador: string
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    lang: string
}