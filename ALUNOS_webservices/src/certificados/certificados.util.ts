import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

export interface CertificateLogoOption {
  id: string;
  label: string;
  path: string;
}

export interface PublicCertificateLogoOption {
  id: string;
  label: string;
}

export interface CertificateLayoutConfig {
  page?: {
    backgroundColor?: string;
    marginX?: number;
  };
  header?: {
    enabled?: boolean;
    backgroundColor?: string;
    height?: number;
    title?: string;
    subtitle?: string;
    titleFont?: string;
    subtitleFont?: string;
    titleSize?: number;
    subtitleSize?: number;
    titleColor?: string;
    subtitleColor?: string;
    showCircuit?: boolean;
  };
  intro?: {
    text?: string;
    font?: string;
    size?: number;
    color?: string;
    x?: number;
    y?: number;
  };
  participant?: {
    font?: string;
    size?: number;
    color?: string;
    underline?: boolean;
    x?: number;
    y?: number;
  };
  body?: {
    text?: string;
    font?: string;
    size?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
    x?: number;
    y?: number;
  };
  details?: {
    enabled?: boolean;
    text?: string;
    font?: string;
    size?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
    x?: number;
    y?: number;
  };
  signature?: {
    enabled?: boolean;
    mode?: 'text' | 'image' | 'digital';
    validationText?: string;
    imageFileId?: number | null;
    title?: string;
    name?: string;
    role?: string;
    font?: string;
    size?: number;
    color?: string;
    x?: number;
    y?: number;
  };
  footer?: {
    enabled?: boolean;
    backgroundColor?: string;
    height?: number;
    imageFileId?: number | null;
    imageHeight?: number;
    text?: string;
    textFont?: string;
    textSize?: number;
    textColor?: string;
    showCircuit?: boolean;
  };
}

export interface TrainingCertificatePdfData {
  participantName: string;
  actionTitle: string;
  description?: string | null;
  company?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  hours?: number | null;
  tipoFormacao?: string | null;
  logos: CertificateLogoOption[];
  config?: CertificateLayoutConfig | string | null;
  footerImagePath?: string | null;
  signatureImagePath?: string | null;
}

const standardFonts = new Set([
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Times-Roman',
  'Times-Bold',
  'Times-Italic',
  'Courier',
  'Courier-Bold'
]);

const logoDefinitions = [
  {
    id: 'ipvc',
    label: 'IPVC',
    candidates: [
      ['static_assets', 'logoIPVC.png'],
      ['..', 'ALUNOS_frontend', 'static', 'internal', 'images', 'logo_IPVC.png']
    ]
  },
  {
    id: 'sg',
    label: 'Servi\u00e7os de Gest\u00e3o',
    candidates: [['..', 'ALUNOS_frontend', 'static', 'internal', 'images', 'SG.png']]
  }
];

export const defaultCertificateConfig: CertificateLayoutConfig = {
  page: {
    backgroundColor: '#ffffff',
    marginX: 144
  },
  header: {
    enabled: true,
    backgroundColor: '#934247',
    height: 128,
    title: 'certificado de participa\u00e7\u00e3o',
    subtitle: '{acao}',
    titleFont: 'Helvetica-Bold',
    subtitleFont: 'Helvetica-Bold',
    titleSize: 30,
    subtitleSize: 20,
    titleColor: '#ffffff',
    subtitleColor: '#efe6b8',
    showCircuit: true
  },
  intro: {
    text: 'certificamos que,',
    font: 'Helvetica',
    size: 12,
    color: '#111111',
    x: 150,
    y: 180
  },
  participant: {
    font: 'Helvetica-Bold',
    size: 42,
    color: '#000000',
    underline: true,
    x: 150,
    y: 200
  },
  body: {
    text:
      'participou na a\u00e7\u00e3o de forma\u00e7\u00e3o {acao}, no \u00e2mbito de {descricao}, organizada por {entidade}, no dia {data}.',
    font: 'Helvetica',
    size: 12,
    color: '#111111',
    align: 'left',
    x: 150,
    y: 262
  },
  details: {
    enabled: false,
    text: 'Dura\u00e7\u00e3o: {horas} horas | Tipo: {tipo_formacao}',
    font: 'Helvetica',
    size: 10,
    color: '#333333',
    align: 'center',
    x: 150,
    y: 315
  },
  signature: {
    enabled: true,
    mode: 'text',
    validationText: '',
    imageFileId: null,
    title: 'A Pr\u00f3-Presidente do Instituto Polit\u00e9cnico de Viana do Castelo',
    name: '',
    role: '',
    font: 'Helvetica',
    size: 11,
    color: '#111111',
    x: 150,
    y: 350
  },
  footer: {
    enabled: true,
    backgroundColor: '#934247',
    height: 126,
    imageFileId: null,
    imageHeight: 54,
    text: '',
    textFont: 'Helvetica',
    textSize: 10,
    textColor: '#ffffff',
    showCircuit: true
  }
};

export function getCertificateLogoOptions(rootDir = process.cwd()): CertificateLogoOption[] {
  return logoDefinitions
    .map((definition) => {
      const foundPath = definition.candidates
        .map((candidate) => path.resolve(rootDir, ...candidate))
        .find((candidatePath) => fs.existsSync(candidatePath));

      if (!foundPath) return null;
      return {
        id: definition.id,
        label: definition.label,
        path: foundPath
      };
    })
    .filter((option): option is CertificateLogoOption => option !== null);
}

export function toPublicLogoOptions(options: CertificateLogoOption[]): PublicCertificateLogoOption[] {
  return options.map(({ id, label }) => ({ id, label }));
}

export function parseCertificateLogoIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).filter(Boolean);
    }
  } catch {
    // Fallback for legacy comma-separated values.
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeCertificateLogoIds(value: unknown, availableOptions: CertificateLogoOption[]): string[] {
  const availableIds = new Set(availableOptions.map((option) => option.id));
  const selected = parseCertificateLogoIds(value).filter((id) => availableIds.has(id));
  return Array.from(new Set(selected));
}

export function resolveCertificateLogos(value: unknown, availableOptions: CertificateLogoOption[]): CertificateLogoOption[] {
  const selectedIds = normalizeCertificateLogoIds(value, availableOptions);
  const effectiveIds = selectedIds.length ? selectedIds : availableOptions.slice(0, 1).map((option) => option.id);
  const optionMap = new Map(availableOptions.map((option) => [option.id, option]));
  return effectiveIds
    .map((id) => optionMap.get(id))
    .filter((option): option is CertificateLogoOption => option !== undefined);
}

export function parseCertificateConfig(value: unknown): CertificateLayoutConfig {
  if (!value) return {};
  if (typeof value === 'object') return value as CertificateLayoutConfig;
  if (typeof value !== 'string') return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeCertificateConfig(value: unknown): CertificateLayoutConfig {
  return toContentCertificateConfig(parseCertificateConfig(value));
}

export function mergeCertificateConfig(
  base: CertificateLayoutConfig,
  override: CertificateLayoutConfig
): CertificateLayoutConfig {
  return {
    page: { ...(base.page ?? {}), ...(override.page ?? {}) },
    header: { ...(base.header ?? {}), ...(override.header ?? {}) },
    intro: { ...(base.intro ?? {}), ...(override.intro ?? {}) },
    participant: { ...(base.participant ?? {}), ...(override.participant ?? {}) },
    body: { ...(base.body ?? {}), ...(override.body ?? {}) },
    details: { ...(base.details ?? {}), ...(override.details ?? {}) },
    signature: { ...(base.signature ?? {}), ...(override.signature ?? {}) },
    footer: { ...(base.footer ?? {}), ...(override.footer ?? {}) }
  };
}

export function toContentCertificateConfig(value: CertificateLayoutConfig = {}): CertificateLayoutConfig {
  const merged = mergeCertificateConfig(defaultCertificateConfig, value ?? {});

  return {
    page: { ...(defaultCertificateConfig.page ?? {}) },
    header: {
      ...(defaultCertificateConfig.header ?? {}),
      enabled: merged.header?.enabled ?? defaultCertificateConfig.header?.enabled,
      backgroundColor: merged.header?.backgroundColor ?? defaultCertificateConfig.header?.backgroundColor,
      title: merged.header?.title ?? defaultCertificateConfig.header?.title,
      subtitle: merged.header?.subtitle ?? defaultCertificateConfig.header?.subtitle,
      titleFont: merged.header?.titleFont ?? defaultCertificateConfig.header?.titleFont,
      subtitleFont: merged.header?.subtitleFont ?? defaultCertificateConfig.header?.subtitleFont,
      titleSize: merged.header?.titleSize ?? defaultCertificateConfig.header?.titleSize,
      subtitleSize: merged.header?.subtitleSize ?? defaultCertificateConfig.header?.subtitleSize,
      titleColor: merged.header?.titleColor ?? defaultCertificateConfig.header?.titleColor,
      subtitleColor: merged.header?.subtitleColor ?? defaultCertificateConfig.header?.subtitleColor
    },
    intro: {
      ...(defaultCertificateConfig.intro ?? {}),
      text: merged.intro?.text ?? defaultCertificateConfig.intro?.text,
      font: merged.intro?.font ?? defaultCertificateConfig.intro?.font,
      size: merged.intro?.size ?? defaultCertificateConfig.intro?.size,
      color: merged.intro?.color ?? defaultCertificateConfig.intro?.color
    },
    participant: {
      ...(defaultCertificateConfig.participant ?? {}),
      font: merged.participant?.font ?? defaultCertificateConfig.participant?.font,
      size: merged.participant?.size ?? defaultCertificateConfig.participant?.size,
      color: merged.participant?.color ?? defaultCertificateConfig.participant?.color
    },
    body: {
      ...(defaultCertificateConfig.body ?? {}),
      text: merged.body?.text ?? defaultCertificateConfig.body?.text,
      font: merged.body?.font ?? defaultCertificateConfig.body?.font,
      size: merged.body?.size ?? defaultCertificateConfig.body?.size,
      color: merged.body?.color ?? defaultCertificateConfig.body?.color
    },
    details: {
      ...(defaultCertificateConfig.details ?? {}),
      enabled: merged.details?.enabled ?? defaultCertificateConfig.details?.enabled,
      text: merged.details?.text ?? defaultCertificateConfig.details?.text,
      font: merged.details?.font ?? defaultCertificateConfig.details?.font,
      size: merged.details?.size ?? defaultCertificateConfig.details?.size,
      color: merged.details?.color ?? defaultCertificateConfig.details?.color
    },
    signature: {
      ...(defaultCertificateConfig.signature ?? {}),
      enabled: merged.signature?.enabled ?? defaultCertificateConfig.signature?.enabled,
      mode: ['image', 'digital'].includes(String(merged.signature?.mode ?? '')) ? 'image' : 'text',
      validationText: merged.signature?.validationText ?? defaultCertificateConfig.signature?.validationText,
      imageFileId: merged.signature?.imageFileId ?? defaultCertificateConfig.signature?.imageFileId,
      title: merged.signature?.title ?? defaultCertificateConfig.signature?.title,
      name: merged.signature?.name ?? defaultCertificateConfig.signature?.name,
      role: merged.signature?.role ?? defaultCertificateConfig.signature?.role,
      font: merged.signature?.font ?? defaultCertificateConfig.signature?.font,
      size: merged.signature?.size ?? defaultCertificateConfig.signature?.size,
      color: merged.signature?.color ?? defaultCertificateConfig.signature?.color
    },
    footer: {
      ...(defaultCertificateConfig.footer ?? {}),
      enabled: merged.footer?.enabled ?? defaultCertificateConfig.footer?.enabled,
      backgroundColor:
        merged.footer?.backgroundColor ??
        merged.header?.backgroundColor ??
        defaultCertificateConfig.footer?.backgroundColor,
      imageFileId: merged.footer?.imageFileId ?? defaultCertificateConfig.footer?.imageFileId,
      text: merged.footer?.text ?? defaultCertificateConfig.footer?.text,
      textFont: merged.footer?.textFont ?? defaultCertificateConfig.footer?.textFont,
      textSize: merged.footer?.textSize ?? defaultCertificateConfig.footer?.textSize,
      textColor: merged.footer?.textColor ?? defaultCertificateConfig.footer?.textColor
    }
  };
}

export function sanitizePdfFilename(value: string) {
  const normalized = String(value || 'certificado')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${normalized || 'certificado'}.pdf`;
}

export function formatTrainingDateRange(startDate?: Date | string | null, endDate?: Date | string | null) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const formatter = new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  if (start && end && start.getTime() !== end.getTime()) {
    return `${formatter.format(start)} a ${formatter.format(end)}`;
  }
  if (start) return formatter.format(start);
  if (end) return formatter.format(end);
  return 'data n\u00e3o indicada';
}

export async function generateTrainingCertificatePdf(data: TrainingCertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const config = normalizeCertificateConfig(data.config);
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `Certificado - ${safeText(data.actionTitle)}`,
        Author: 'IPVC'
      }
    });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;
    const marginX = clampNumber(config.page?.marginX, 72, 220, 144);
    const contentWidth = width - marginX * 2;
    const backgroundColor = '#ffffff';

    doc.rect(0, 0, width, height).fill(backgroundColor);

    drawHeader(doc, config, data, width);
    drawIntro(doc, config, data, marginX, contentWidth);
    drawParticipant(doc, config, data, marginX, contentWidth);
    drawBody(doc, config, data, marginX, contentWidth);
    drawDetails(doc, config, data, marginX, contentWidth);
    drawSignature(doc, config, data, marginX, contentWidth);
    drawFooter(doc, config, data, width, height);

    doc.end();
  });
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  width: number
) {
  const header = config.header ?? {};
  if (header.enabled === false) return;

  const headerHeight = clampNumber(header.height, 70, 190, 128);
  doc.rect(0, 0, width, headerHeight).fill(normalizeColor(header.backgroundColor, '#934247'));

  if (header.showCircuit !== false) {
    drawCircuitCorners(doc, 0, 0, width, headerHeight, '#ffffff');
  }

  const title = applyCertificatePlaceholders(header.title || '', data);
  const subtitle = applyCertificatePlaceholders(header.subtitle || '', data);

  doc
    .fillColor(normalizeColor(header.titleColor, '#ffffff'))
    .font(resolveFont(header.titleFont, 'Helvetica-Bold'))
    .fontSize(clampNumber(header.titleSize, 12, 54, 30))
    .text(title, 60, 36, {
      width: width - 120,
      align: 'center',
      lineBreak: false
    });

  if (subtitle) {
    doc
      .fillColor(normalizeColor(header.subtitleColor, '#efe6b8'))
      .font(resolveFont(header.subtitleFont, 'Helvetica-Bold'))
      .fontSize(clampNumber(header.subtitleSize, 10, 36, 20))
      .text(subtitle, 70, 90, {
        width: width - 140,
        align: 'center',
        lineBreak: false,
        ellipsis: true
      });
  }
}

function drawIntro(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  marginX: number,
  contentWidth: number
) {
  const intro = config.intro ?? {};
  const text = applyCertificatePlaceholders(intro.text || '', data);
  if (!text) return;

  const x = clampNumber(intro.x, 0, 760, marginX);
  const y = clampNumber(intro.y, 140, 460, 180);
  doc
    .fillColor(normalizeColor(intro.color, '#111111'))
    .font(resolveFont(intro.font, 'Helvetica'))
    .fontSize(clampNumber(intro.size, 8, 28, 12))
    .text(text, x, y, {
      width: Math.min(contentWidth, 620),
      align: 'left'
    });
}

function drawParticipant(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  marginX: number,
  contentWidth: number
) {
  const participant = config.participant ?? {};
  const x = clampNumber(participant.x, 0, 760, marginX);
  const y = clampNumber(participant.y, 150, 470, 200);
  const fontSize = clampNumber(participant.size, 18, 74, 42);
  const textWidth = Math.min(contentWidth, 680);
  const name = safeText(data.participantName) || 'Utilizador';

  doc
    .fillColor(normalizeColor(participant.color, '#000000'))
    .font(resolveFont(participant.font, 'Helvetica-Bold'))
    .fontSize(fontSize)
    .text(name, x, y, {
      width: textWidth,
      align: 'left',
      lineBreak: false,
      ellipsis: true
    });

  if (participant.underline !== false) {
    const lineY = y + fontSize + 8;
    doc
      .moveTo(x, lineY)
      .lineTo(x + Math.min(textWidth, Math.max(260, doc.widthOfString(name))), lineY)
      .lineWidth(3)
      .strokeColor(normalizeColor(participant.color, '#000000'))
      .stroke();
  }
}

function drawBody(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  marginX: number,
  contentWidth: number
) {
  const body = config.body ?? {};
  const text = applyCertificatePlaceholders(body.text || '', data);
  if (!text) return;

  const x = clampNumber(body.x, 0, 760, marginX);
  const y = clampNumber(body.y, 180, 500, 262);
  doc
    .fillColor(normalizeColor(body.color, '#111111'))
    .font(resolveFont(body.font, 'Helvetica'))
    .fontSize(clampNumber(body.size, 8, 24, 12))
    .text(text, x, y, {
      width: Math.min(contentWidth, 620),
      height: config.details?.enabled === true ? 48 : 70,
      align: body.align || 'left',
      ellipsis: true
    });
}

function drawDetails(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  marginX: number,
  contentWidth: number
) {
  const details = config.details ?? {};
  if (details.enabled !== true) return;

  const text = applyCertificatePlaceholders(details.text || '', data);
  if (!text) return;

  const x = clampNumber(details.x, 0, 760, marginX);
  const y = clampNumber(details.y, 250, 430, 315);
  doc
    .fillColor(normalizeColor(details.color, '#333333'))
    .font(resolveFont(details.font, 'Helvetica'))
    .fontSize(clampNumber(details.size, 8, 20, 10))
    .text(text, x, y, {
      width: Math.min(contentWidth, 620),
      height: 26,
      align: details.align || 'center',
      ellipsis: true
    });
}

function drawSignature(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  marginX: number,
  contentWidth: number
) {
  const signature = config.signature ?? {};
  if (signature.enabled === false) return;

  const isImage = ['image', 'digital'].includes(String(signature.mode ?? ''));
  const title = applyCertificatePlaceholders(signature.title || '', data);
  const name = applyCertificatePlaceholders(signature.name || '', data);
  const role = applyCertificatePlaceholders(signature.role || '', data);
  const lines = [title, name, role].filter(Boolean);

  if (!lines.length && !(isImage && data.signatureImagePath)) return;

  const x = clampNumber(signature.x, 0, 760, marginX);
  const blockWidth = Math.min(contentWidth, 620);
  const y = isImage ? 345 : clampNumber(signature.y, 300, 430, 350);
  let textY = y;

  if (isImage && data.signatureImagePath && fs.existsSync(data.signatureImagePath)) {
    try {
      const imageWidth = 180;
      const imageHeight = 34;
      doc.image(data.signatureImagePath, x + (blockWidth - imageWidth) / 2, y, {
        fit: [imageWidth, imageHeight],
        align: 'center',
        valign: 'center'
      });
      textY = y + imageHeight + 6;
    } catch {
      textY = y;
    }
  }

  if (lines.length) {
    doc
      .fillColor(normalizeColor(signature.color, '#111111'))
      .font(resolveFont(signature.font, 'Helvetica'))
      .fontSize(clampNumber(signature.size, 8, 20, 11))
      .text(lines.join('\n'), x, textY, {
        width: blockWidth,
        height: isImage ? 42 : 54,
        align: 'center',
        ellipsis: true
      });
  }
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  config: CertificateLayoutConfig,
  data: TrainingCertificatePdfData,
  width: number,
  height: number
) {
  const footer = config.footer ?? {};
  if (footer.enabled === false) return;

  const footerHeight = clampNumber(footer.height, 60, 170, 126);
  const y = height - footerHeight;
  doc.rect(0, y, width, footerHeight).fill(normalizeColor(footer.backgroundColor, '#934247'));

  if (footer.showCircuit !== false) {
    drawCircuitCorners(doc, 0, y, width, footerHeight, '#ffffff');
  }

  const imageHeight = clampNumber(footer.imageHeight, 20, footerHeight - 22, 54);
  if (data.footerImagePath && fs.existsSync(data.footerImagePath)) {
    try {
      doc.image(data.footerImagePath, 160, y + (footerHeight - imageHeight) / 2, {
        fit: [width - 320, imageHeight],
        align: 'center',
        valign: 'center'
      });
      return;
    } catch {
      // Fall back to selected static logos below.
    }
  }

  if (data.logos?.length) {
    drawLogos(doc, data.logos, 180, y + (footerHeight - 48) / 2, width - 360);
  }

  const footerText = applyCertificatePlaceholders(footer.text || '', data);
  if (footerText) {
    doc
      .fillColor(normalizeColor(footer.textColor, '#ffffff'))
      .font(resolveFont(footer.textFont, 'Helvetica'))
      .fontSize(clampNumber(footer.textSize, 8, 18, 10))
      .text(footerText, 160, y + footerHeight - 26, {
        width: width - 320,
        align: 'center',
        lineBreak: false,
        ellipsis: true
      });
  }
}

function drawLogos(
  doc: PDFKit.PDFDocument,
  logos: CertificateLogoOption[],
  x: number,
  y: number,
  width: number
) {
  if (!logos.length) return;

  const logoBoxWidth = 112;
  const gap = 18;
  const totalWidth = logos.length * logoBoxWidth + Math.max(logos.length - 1, 0) * gap;
  let currentX = x + (width - totalWidth) / 2;

  logos.forEach((logo) => {
    try {
      doc.image(logo.path, currentX, y, {
        fit: [logoBoxWidth, 48],
        align: 'center',
        valign: 'center'
      });
    } catch {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#ffffff')
        .text(logo.label, currentX, y + 14, {
          width: logoBoxWidth,
          align: 'center'
        });
    }
    currentX += logoBoxWidth + gap;
  });
}

function drawCircuitCorners(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  const stroke = normalizeColor(color, '#ffffff');
  drawCircuitCorner(doc, x + 10, y + 10, 1, 1, stroke);
  drawCircuitCorner(doc, x + width - 10, y + 10, -1, 1, stroke);
  drawCircuitCorner(doc, x + 10, y + height - 10, 1, -1, stroke);
  drawCircuitCorner(doc, x + width - 10, y + height - 10, -1, -1, stroke);
}

function drawCircuitCorner(
  doc: PDFKit.PDFDocument,
  originX: number,
  originY: number,
  dirX: 1 | -1,
  dirY: 1 | -1,
  color: string
) {
  const tracks = [
    [0, 14, 44, 14, 44, 34, 74, 34],
    [0, 34, 28, 34, 28, 58, 60, 58],
    [12, 0, 12, 24, 92, 24],
    [34, 0, 34, 42, 112, 42],
    [0, 72, 62, 72],
    [60, 0, 60, 16, 86, 16]
  ];

  doc.strokeColor(color).lineWidth(1.2);
  tracks.forEach((track) => {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = track;
    doc.moveTo(originX + dirX * x1, originY + dirY * y1);
    doc.lineTo(originX + dirX * x2, originY + dirY * y2);
    if (x3 !== undefined && y3 !== undefined) {
      doc.lineTo(originX + dirX * x3, originY + dirY * y3);
    }
    if (x4 !== undefined && y4 !== undefined) {
      doc.lineTo(originX + dirX * x4, originY + dirY * y4);
    }
    doc.stroke();
  });

  const nodes = [
    [44, 14],
    [74, 34],
    [60, 58],
    [92, 24],
    [112, 42],
    [62, 72],
    [86, 16]
  ];
  nodes.forEach(([nx, ny]) => {
    doc.circle(originX + dirX * nx, originY + dirY * ny, 2.5).fill(color);
  });
}

export function applyCertificatePlaceholders(text: string, data: TrainingCertificatePdfData) {
  const dateRange = formatTrainingDateRange(data.startDate, data.endDate);
  const start = formatSingleDate(data.startDate);
  const end = formatSingleDate(data.endDate);
  const hours = Number(data.hours ?? 0);
  const placeholders: Record<string, string> = {
    nome: safeText(data.participantName),
    acao: safeText(data.actionTitle),
    descricao: safeText(data.description),
    entidade: safeText(data.company),
    local: safeText(data.company),
    data: dateRange,
    data_inicio: start,
    data_fim: end,
    horas: hours > 0 ? String(hours) : '',
    duracao: hours > 0 ? `${hours} ${hours === 1 ? 'hora' : 'horas'}` : '',
    tipo_formacao: safeText(data.tipoFormacao),
    data_emissao: formatTrainingDateRange(new Date(), new Date())
  };

  return String(text ?? '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => placeholders[key] ?? '');
}

function parseDate(value?: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatSingleDate(value?: Date | string | null) {
  const parsed = parseDate(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed);
}

function safeText(value?: string | null) {
  return String(value ?? '').trim();
}

function resolveFont(value: unknown, fallback: string) {
  const font = String(value ?? '').trim();
  return standardFonts.has(font) ? font : fallback;
}

function normalizeColor(value: unknown, fallback: string) {
  const color = String(value ?? '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}
