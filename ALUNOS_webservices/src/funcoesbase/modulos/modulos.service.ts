import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import { ObterPrivModulosDto } from './dto';

@Injectable()
export class ModulosService {
    constructor(private prisma: PrismaService) {}

    async getPrivModulos(dto: ObterPrivModulosDto){
        const modulos = [
            {
                id_modulo: 1,
                descricao: "Módulo Exemplo",
                prefixo: "exemplo",
                data_ini: "2024-01-01",
                data_fim: null,
                ativo: 1,
                premissao: 1,
                ordem: 1,
                icon: null,
                icone_type: null,
                path: "http://localhost:5173/exemplos"
            }
        ]
        
        return modulos;
    }

}
