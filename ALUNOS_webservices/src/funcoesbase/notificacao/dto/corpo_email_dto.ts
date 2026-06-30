import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class DtoCorpoEmail {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    assunto: string;

    @IsNotEmpty()
    tipo: string;
    
    dados_tipo: {any};
}