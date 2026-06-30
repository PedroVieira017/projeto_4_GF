import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class LoginSSODto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    id_utilizador: string
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    token_sso: string
}