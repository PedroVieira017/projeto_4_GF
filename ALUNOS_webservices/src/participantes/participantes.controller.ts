import { Controller, Get, Param } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';

@Controller('admin/participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Get()
  findAll() {
    return this.participantesService.findAll();
  }

  @Get(':id/formacoes')
  findFormacoes(@Param('id') id: string) {
    return this.participantesService.findFormacoes(id);
  }
}
