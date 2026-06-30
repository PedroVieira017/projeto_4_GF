import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DtoCorpoEmail } from './dto/corpo_email_dto';
import { TIPOS_EMAIL } from './static/emails_templates';

@Injectable()
export class service {
    constructor(private prisma: PrismaService) {}

    async enviarNotificacaoEmail(corpo: DtoCorpoEmail){
        if(!Object.keys(TIPOS_EMAIL).includes(corpo.tipo)){
            return {status: false, message: "Tipo inválido."}
        }

        let info_tipo = TIPOS_EMAIL[corpo.tipo];
        let cumpre_campos = true;
        Object.values(info_tipo.campos).forEach((campo: any) => {
            if(campo.obrigatorio && !Object.keys(corpo.dados_tipo).includes(campo.nome)){
                cumpre_campos = false;
                return;
            }
            if(campo.com_valor && !corpo.dados_tipo[campo.nome]){
                cumpre_campos = false;
                return;
            }
        });
        /*if(!cumpre_campos){
            return {status: false, message: "Dados em falta para o tipo selecionado."}
        }*/
        let mesagem_enviar = info_tipo.template(...Object.values(corpo.dados_tipo))

        let envio = this.prisma.not_notificacao.create({
            data: {
                data_criacao: new Date(),
                email_destinatario: corpo.email,
                assunto: corpo.assunto,
                mensagem: mesagem_enviar,
                id_tipo_notificacao: 1,
                estado: 1,
                periodicidade: "instantanea"
            }
        })

        return envio;
    }



}
