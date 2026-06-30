import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    id_utilizador: string
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string
}