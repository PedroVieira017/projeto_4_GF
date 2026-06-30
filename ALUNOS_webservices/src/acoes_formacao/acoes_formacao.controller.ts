import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  UploadedFiles,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AcoesFormacaoService } from './acoes_formacao.service';
import { CreateAcaoFormacaoDto } from './dto/create-acao_formacao.dto';
import { UpdateAcaoFormacaoDto } from './dto/update-acao_formacao.dto';
import { AddParticipantesDto } from './dto/add-participantes.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import type { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads', 'acoes_formacao');

@ApiTags('Admin - Ações de Formação')
@Controller('admin/formacoes')
export class AcoesFormacaoController {
  constructor(private readonly service: AcoesFormacaoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('certificados/logotipos')
  findLogotiposCertificado() {
    return this.service.getLogotiposCertificado();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'certificado', maxCount: 1 },
        { name: 'certificado_footer', maxCount: 1 },
        { name: 'certificado_assinatura', maxCount: 1 }
      ],
      {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '').toLowerCase();
          const fallbackExt = file.fieldname === 'certificado' ? '.pdf' : '.png';
          const safeExt = ext && ext.length <= 10 ? ext : fallbackExt;
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, unique);
        }
      }),
      fileFilter: (_req, file, cb) => {
        const name = String(file.fieldname ?? '');
        const lowerName = file.originalname?.toLowerCase() ?? '';
        const isPdf = file.mimetype === 'application/pdf' || lowerName.endsWith('.pdf');
        const isImage =
          ['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype) ||
          lowerName.endsWith('.png') ||
          lowerName.endsWith('.jpg') ||
          lowerName.endsWith('.jpeg');
        const isValid = name === 'certificado' ? isPdf : isImage;
        cb(isValid ? null : new Error('Tipo de ficheiro invalido'), isValid);
      }
    })
  )
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
  create(
    @Body() dto: CreateAcaoFormacaoDto,
    @UploadedFiles() files?: {
      certificado?: Multer.File[];
      certificado_footer?: Multer.File[];
      certificado_assinatura?: Multer.File[];
    }
  ) {
    return this.service.create(
      dto,
      files?.certificado?.[0],
      files?.certificado_footer?.[0],
      files?.certificado_assinatura?.[0]
    );
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'certificado_footer', maxCount: 1 }, { name: 'certificado_assinatura', maxCount: 1 }],
      {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '').toLowerCase();
          const safeExt = ext && ext.length <= 10 ? ext : '.png';
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, unique);
        }
      }),
      fileFilter: (_req, file, cb) => {
        const lowerName = file.originalname?.toLowerCase() ?? '';
        const isImage =
          ['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype) ||
          lowerName.endsWith('.png') ||
          lowerName.endsWith('.jpg') ||
          lowerName.endsWith('.jpeg');
        cb(isImage ? null : new Error('Tipo de ficheiro invalido'), isImage);
      }
    })
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcaoFormacaoDto,
    @UploadedFiles() files?: { certificado_footer?: Multer.File[]; certificado_assinatura?: Multer.File[] }
  ) {
    return this.service.update(id, dto, files?.certificado_footer?.[0], files?.certificado_assinatura?.[0]);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // GET /admin/formacoes/:id/participantes
@Get(':id/participantes')
findParticipantes(@Param('id', ParseIntPipe) id: number) {
  return this.service.findParticipantes(id);
}

@Get(':id/participantes/:participacaoId/certificado')
async getParticipanteCertificado(
  @Param('id', ParseIntPipe) id: number,
  @Param('participacaoId', ParseIntPipe) participacaoId: number,
  @Query('download') download: string,
  @Res({ passthrough: true }) res: Response
) {
  const certificado = await this.service.getParticipanteCertificado(id, participacaoId);
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
    candidates.push(path.join(process.cwd(), 'uploads', 'minhas_formacoes', file.caminho_armazenamento));
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

  return new StreamableFile(fs.createReadStream(resolvedPath));
}

// POST /admin/formacoes/:id/participantes
@Post(':id/participantes')
addParticipantes(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AddParticipantesDto,
) {
  return this.service.addParticipantes(id, dto);
}

// DELETE /admin/formacoes/:id/participantes/:userId
@Delete(':id/participantes/:userId')
removeParticipante(
  @Param('id', ParseIntPipe) id: number,
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.service.removeParticipante(id, userId);
}

}
