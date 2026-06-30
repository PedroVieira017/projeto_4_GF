import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidacaoService } from './validacao.service';
import { UpdateValidacaoDto } from './dto/update-validacao.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Admin - Validacao')
@Controller('admin/validacoes')
export class ValidacaoController {
  constructor(private readonly service: ValidacaoService) {}

  @Get()
  findPendentes() {
    return this.service.findPendentes();
  }

  @Patch(':id')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValidacaoDto
  ) {
    return this.service.atualizarEstado(id, dto);
  }

  @Get('comprovativo/:id')
  async getComprovativo(
    @Param('id', ParseIntPipe) id: number,
    @Query('download') download: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await this.service.getComprovativoFile(id);
    if (!file?.caminho_armazenamento) {
      throw new NotFoundException('Comprovativo nao encontrado');
    }

    const candidates = [];
    if (file.caminho_armazenamento) {
      candidates.push(file.caminho_armazenamento);
      if (!path.isAbsolute(file.caminho_armazenamento)) {
        candidates.push(path.join(process.cwd(), file.caminho_armazenamento));
        candidates.push(path.join(process.cwd(), 'uploads', 'minhas_formacoes', file.caminho_armazenamento));
      }
    }

    const resolvedPath = candidates.find((p) => p && fs.existsSync(p));
    if (!resolvedPath) {
      throw new NotFoundException('Comprovativo nao encontrado');
    }

    const shouldDownload = download === '1' || download === 'true';
    const disposition = shouldDownload ? 'attachment' : 'inline';
    res.setHeader('Content-Type', file.mime_type || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${file.nome_original ?? 'comprovativo.pdf'}"`
    );
    res.setHeader('Content-Length', file.tamanho_bytes ?? fs.statSync(resolvedPath).size);

    const stream = fs.createReadStream(resolvedPath);
    return new StreamableFile(stream);
  }
}
