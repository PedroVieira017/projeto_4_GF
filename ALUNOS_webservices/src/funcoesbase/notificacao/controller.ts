import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { service } from './service';
import { DtoCorpoEmail } from './dto/corpo_email_dto';



@ApiTags('Dashboard:Notificações')
@Controller('notificacao')
export class controller {
    constructor(private service: service){}

    @Post("/enviarNotificacaoEmail")
    @ApiOperation({ summary: 'Envio de email', description: 'Envio de email' })
    enviarNotificacaoEmail(@Body() corpo: DtoCorpoEmail){
        return this.service.enviarNotificacaoEmail(corpo);
    }

}