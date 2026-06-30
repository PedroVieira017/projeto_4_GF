import { Controller, Get } from '@nestjs/common';
import { UtilizadoresService } from './utilizadores.service';

@Controller('admin/utilizadores')
export class UtilizadoresController {
  constructor(private readonly service: UtilizadoresService) {}

  @Get()
  findAllAtivos() {
    return this.service.findAllAtivos();
  }
}
