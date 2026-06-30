import { Body, Controller, Get, Post, Query, Param, Res, UseInterceptors, UploadedFile, StreamableFile, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinhasFormacoesService } from './minhas_formacoes.service';
import { CreateMinhaFormacaoDto } from './dto/create-minha-formacao.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import type { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads', 'minhas_formacoes');

@ApiTags('Admin - Minhas Formacoes')
@Controller('admin/minhas-formacoes')
export class MinhasFormacoesController {
  constructor(private readonly service: MinhasFormacoesService) {}

  @Get()
  findAll(@Query('email') email?: string, @Query('username') username?: string) {
    return this.service.findForUser(email, username);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('certificado', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '').toLowerCase();
          const safeExt = ext && ext.length <= 10 ? ext : '.pdf';
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, unique);
        }
      }),
      fileFilter: (_req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
        cb(isPdf ? null : new Error('Tipo de ficheiro inválido'), isPdf);
      }
    })
  )
  create(@Body() dto: CreateMinhaFormacaoDto, @UploadedFile() file?: Multer.File) {
    return this.service.createForUser(dto, file);
  }

  @Get('certificado/:id')
  async getCertificado(
    @Param('id') id: string,
    @Query('download') download: string,
    @Query('email') email: string,
    @Query('username') username: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const certificado = await this.service.getCertificado(id, email, username);
    if (!certificado) {
      throw new NotFoundException('Certificado nao encontrado');
    }

    const shouldDownload = download === '1' || download === 'true';
    const disposition = shouldDownload ? 'attachment' : 'inline';

    if (certificado.type === 'generated') {
      res.setHeader('Content-Type', certificado.mime_type);
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${certificado.nome_original ?? 'certificado.pdf'}"`
      );
      res.setHeader('Content-Length', certificado.tamanho_bytes);

      return new StreamableFile(certificado.buffer);
    }

    const file = certificado.file;
    if (!file?.caminho_armazenamento) {
      throw new NotFoundException('Certificado nao encontrado');
    }

    const candidates = [file.caminho_armazenamento];
    if (!path.isAbsolute(file.caminho_armazenamento)) {
      candidates.push(path.join(process.cwd(), file.caminho_armazenamento));
      candidates.push(path.join(uploadDir, file.caminho_armazenamento));
    }

    const resolvedPath = candidates.find((candidate) => candidate && fs.existsSync(candidate));

    if (!resolvedPath) {
      throw new NotFoundException('Certificado nao encontrado');
    }

    res.setHeader('Content-Type', file.mime_type || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${file.nome_original ?? 'certificado.pdf'}"`
    );
    res.setHeader('Content-Length', file.tamanho_bytes ?? fs.statSync(resolvedPath).size);

    const stream = fs.createReadStream(resolvedPath);
    return new StreamableFile(stream);
  }
}
