import {Controller, Get} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {Service} from "./service";

@ApiTags('Uteis')
@Controller('uteis')
export class controller {
    constructor(private service: Service) {}

    @Get("/getAnosLetivos")
    getAnosLetivos(){
        return this.service.getAnosLetivos();
    }

    @Get("/getUnidadesOrganicas")
    getUnidadesOrganicas(){
        return this.service.getUnidadesOrganicas();
    }

}
