// @ts-nocheck

export const certificateFonts = [
	{ value: 'Helvetica', label: 'Helvetica' },
	{ value: 'Helvetica-Bold', label: 'Helvetica Bold' },
	{ value: 'Times-Roman', label: 'Times' },
	{ value: 'Times-Bold', label: 'Times Bold' },
	{ value: 'Courier', label: 'Courier' },
	{ value: 'Courier-Bold', label: 'Courier Bold' }
];

export const defaultCertificateConfig = {
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

export function normalizeCertificateConfig(value) {
	const parsed = parseCertificateConfig(value);
	return toContentCertificateConfig(parsed);
}

export function parseCertificateConfig(value) {
	if (!value) return {};
	if (typeof value === 'object') return value;
	try {
		const parsed = JSON.parse(String(value));
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

export function mergeCertificateConfig(base, override) {
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

export function toContentCertificateConfig(value = {}) {
	const merged = mergeCertificateConfig(defaultCertificateConfig, value ?? {});

	return {
		page: { ...defaultCertificateConfig.page },
		header: {
			...defaultCertificateConfig.header,
			enabled: merged.header?.enabled ?? defaultCertificateConfig.header.enabled,
			backgroundColor:
				merged.header?.backgroundColor ?? defaultCertificateConfig.header.backgroundColor,
			title: merged.header?.title ?? defaultCertificateConfig.header.title,
			subtitle: merged.header?.subtitle ?? defaultCertificateConfig.header.subtitle,
			titleFont: merged.header?.titleFont ?? defaultCertificateConfig.header.titleFont,
			subtitleFont: merged.header?.subtitleFont ?? defaultCertificateConfig.header.subtitleFont,
			titleSize: merged.header?.titleSize ?? defaultCertificateConfig.header.titleSize,
			subtitleSize: merged.header?.subtitleSize ?? defaultCertificateConfig.header.subtitleSize,
			titleColor: merged.header?.titleColor ?? defaultCertificateConfig.header.titleColor,
			subtitleColor: merged.header?.subtitleColor ?? defaultCertificateConfig.header.subtitleColor
		},
		intro: {
			...defaultCertificateConfig.intro,
			text: merged.intro?.text ?? defaultCertificateConfig.intro.text,
			font: merged.intro?.font ?? defaultCertificateConfig.intro.font,
			size: merged.intro?.size ?? defaultCertificateConfig.intro.size,
			color: merged.intro?.color ?? defaultCertificateConfig.intro.color
		},
		participant: {
			...defaultCertificateConfig.participant,
			font: merged.participant?.font ?? defaultCertificateConfig.participant.font,
			size: merged.participant?.size ?? defaultCertificateConfig.participant.size,
			color: merged.participant?.color ?? defaultCertificateConfig.participant.color
		},
		body: {
			...defaultCertificateConfig.body,
			text: merged.body?.text ?? defaultCertificateConfig.body.text,
			font: merged.body?.font ?? defaultCertificateConfig.body.font,
			size: merged.body?.size ?? defaultCertificateConfig.body.size,
			color: merged.body?.color ?? defaultCertificateConfig.body.color
		},
		details: {
			...defaultCertificateConfig.details,
			enabled: merged.details?.enabled ?? defaultCertificateConfig.details.enabled,
			text: merged.details?.text ?? defaultCertificateConfig.details.text,
			font: merged.details?.font ?? defaultCertificateConfig.details.font,
			size: merged.details?.size ?? defaultCertificateConfig.details.size,
			color: merged.details?.color ?? defaultCertificateConfig.details.color
		},
		signature: {
			...defaultCertificateConfig.signature,
			enabled: merged.signature?.enabled ?? defaultCertificateConfig.signature.enabled,
			mode: ['image', 'digital'].includes(merged.signature?.mode) ? 'image' : 'text',
			validationText:
				merged.signature?.validationText ?? defaultCertificateConfig.signature.validationText,
			imageFileId: merged.signature?.imageFileId ?? defaultCertificateConfig.signature.imageFileId,
			title: merged.signature?.title ?? defaultCertificateConfig.signature.title,
			name: merged.signature?.name ?? defaultCertificateConfig.signature.name,
			role: merged.signature?.role ?? defaultCertificateConfig.signature.role,
			font: merged.signature?.font ?? defaultCertificateConfig.signature.font,
			size: merged.signature?.size ?? defaultCertificateConfig.signature.size,
			color: merged.signature?.color ?? defaultCertificateConfig.signature.color
		},
		footer: {
			...defaultCertificateConfig.footer,
			enabled: merged.footer?.enabled ?? defaultCertificateConfig.footer.enabled,
			backgroundColor:
				merged.footer?.backgroundColor ??
				merged.header?.backgroundColor ??
				defaultCertificateConfig.footer.backgroundColor,
			imageFileId: merged.footer?.imageFileId ?? defaultCertificateConfig.footer.imageFileId,
			text: merged.footer?.text ?? defaultCertificateConfig.footer.text,
			textFont: merged.footer?.textFont ?? defaultCertificateConfig.footer.textFont,
			textSize: merged.footer?.textSize ?? defaultCertificateConfig.footer.textSize,
			textColor: merged.footer?.textColor ?? defaultCertificateConfig.footer.textColor
		}
	};
}

export function cloneCertificateConfig(config = defaultCertificateConfig) {
	return normalizeCertificateConfig(JSON.parse(JSON.stringify(config)));
}

export function certificatePlaceholders(source, data = {}) {
	const text = String(source ?? '');
	const values = {
		nome: data.nome ?? 'Nome do Participante',
		acao: data.acao ?? '',
		descricao: data.descricao ?? '',
		entidade: data.entidade ?? '',
		local: data.local ?? data.entidade ?? '',
		data: data.data ?? '',
		data_inicio: data.data_inicio ?? '',
		data_fim: data.data_fim ?? '',
		horas: data.horas ?? '',
		duracao: data.horas ? `${data.horas} horas` : '',
		tipo_formacao: data.tipo_formacao ?? '',
		data_emissao: new Date().toLocaleDateString('pt-PT')
	};

	return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => values[key] ?? '');
}
