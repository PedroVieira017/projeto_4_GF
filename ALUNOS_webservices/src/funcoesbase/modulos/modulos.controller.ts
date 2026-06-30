import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {ModulosService} from "./modulos.service";
import { ObterPrivModulosDto } from './dto';

@ApiTags('Dashboard:Funções Base:Modulos')
@Controller('modulos')
export class ModulosController {
    constructor(private modulosService: ModulosService) {}

    @Post()
    getPrivModulos(@Body() dto: ObterPrivModulosDto){
        return this.modulosService.getPrivModulos(dto);
    }


}
