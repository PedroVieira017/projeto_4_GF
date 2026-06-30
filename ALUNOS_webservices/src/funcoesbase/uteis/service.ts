import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class Service {
    constructor(private prisma: PrismaService) {}

    async getAnosLetivos(){
        let devolver = [
            {
                anolectivo: '202526',
                ordenacao: 16
            },
            {
                anolectivo: '202425',
                ordenacao: 15
            }
        ];
        

        return devolver;
    }

    async getUnidadesOrganicas(){
        let devolver = [{
            id: 1,
            unidade_organica: 'Escola Superior Agrária',
            sigla: 'ESA',
            id_rh: '03',
            cd_ministerio: '3161'
        },{
            id: 2,
            unidade_organica: 'Escola Superior de Educação',
            sigla: 'ESE',
            id_rh: '02',
            cd_ministerio: '3162'
        },{
            id: 3,
            unidade_organica: 'Escola Superior de Tecnologia e Gestão',
            sigla: 'ESTG',
            id_rh: '04',
            cd_ministerio: '3163'
        },{
            id: 4,
            unidade_organica: 'Escola Superior de Ciências Empresariais',
            sigla: 'ESCE',
            id_rh: '06',
            cd_ministerio: '3164'
        },{
            id: 5,
            unidade_organica: 'Escola Superior de Saúde',
            sigla: 'ESS',
            id_rh: '05',
            cd_ministerio: '7075'
        },{
            id: 6,
            unidade_organica: 'Escola Superior de Desporto e Lazer',
            sigla: 'ESDL',
            id_rh: '10',
            cd_ministerio: null
        }];

        return devolver;
    }

}
