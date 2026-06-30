<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		certificateFonts,
		certificatePlaceholders,
		cloneCertificateConfig
	} from '$lib/certificates/certificateConfig.js';

	let {
		config = $bindable(cloneCertificateConfig()),
		footerFile = $bindable(null),
		footerFileName = $bindable(''),
		signatureFile = $bindable(null),
		signatureFileName = $bindable(''),
		previewData = {}
	} = $props();

	let footerPreviewUrl = $state('');
	let signaturePreviewUrl = $state('');
	let footerFileError = $state('');
	let signatureFileError = $state('');
	let showMoreOptions = $state(false);
	let showPreview = $state(false);
	let globalFont = $state('Helvetica');
	let globalSize = $state(12);
	let globalColor = $state('#111111');
	let barsColor = $state('#934247');
	let titleColor = $state('#ffffff');
	let subtitleColor = $state('#efe6b8');
	let introColor = $state('#111111');
	let participantColor = $state('#000000');
	let bodyColor = $state('#111111');
	let detailsColor = $state('#333333');
	let signatureColor = $state('#111111');
	let footerTextColor = $state('#ffffff');
	let lastAutomaticTexts = {
		subtitle: '',
		body: '',
		details: ''
	};

	const pageWidth = 842;
	const pageHeight = 595;
	const titleOptions = [
		'certificado de participa\u00e7\u00e3o',
		'certificado de forma\u00e7\u00e3o',
		'declara\u00e7\u00e3o de forma\u00e7\u00e3o'
	];
	const fallbackColors = {
		bars: '#934247',
		title: '#ffffff',
		subtitle: '#efe6b8',
		intro: '#111111',
		participant: '#000000',
		body: '#111111',
		details: '#333333',
		signature: '#111111',
		footerText: '#ffffff'
	};

	function contentOnlyConfig(source: any) {
		const base = cloneCertificateConfig();
		const current = source ?? {};

		return {
			page: { ...base.page },
			header: {
				...base.header,
				enabled: true,
				backgroundColor: current.header?.backgroundColor ?? base.header.backgroundColor,
				title: current.header?.title ?? base.header.title,
				subtitle: current.header?.subtitle ?? base.header.subtitle,
				titleFont: current.header?.titleFont ?? base.header.titleFont,
				subtitleFont: current.header?.subtitleFont ?? base.header.subtitleFont,
				titleSize: current.header?.titleSize ?? base.header.titleSize,
				subtitleSize: current.header?.subtitleSize ?? base.header.subtitleSize,
				titleColor: current.header?.titleColor ?? base.header.titleColor,
				subtitleColor: current.header?.subtitleColor ?? base.header.subtitleColor
			},
			intro: {
				...base.intro,
				text: current.intro?.text ?? base.intro.text,
				font: current.intro?.font ?? base.intro.font,
				size: current.intro?.size ?? base.intro.size,
				color: current.intro?.color ?? base.intro.color
			},
			participant: {
				...base.participant,
				font: current.participant?.font ?? base.participant.font,
				size: current.participant?.size ?? base.participant.size,
				color: current.participant?.color ?? base.participant.color
			},
			body: {
				...base.body,
				text: current.body?.text ?? base.body.text,
				font: current.body?.font ?? base.body.font,
				size: current.body?.size ?? base.body.size,
				color: current.body?.color ?? base.body.color
			},
			details: {
				...base.details,
				enabled: current.details?.enabled ?? base.details.enabled,
				text: current.details?.text ?? base.details.text,
				font: current.details?.font ?? base.details.font,
				size: current.details?.size ?? base.details.size,
				color: current.details?.color ?? base.details.color
			},
			signature: {
				...base.signature,
				enabled: current.signature?.enabled ?? base.signature.enabled,
				mode: ['image', 'digital'].includes(current.signature?.mode) ? 'image' : 'text',
				validationText: current.signature?.validationText ?? base.signature.validationText,
				imageFileId: current.signature?.imageFileId ?? base.signature.imageFileId,
				title: current.signature?.title ?? base.signature.title,
				name: current.signature?.name ?? base.signature.name,
				role: current.signature?.role ?? base.signature.role,
				font: current.signature?.font ?? base.signature.font,
				size: current.signature?.size ?? base.signature.size,
				color: current.signature?.color ?? base.signature.color
			},
			footer: {
				...base.footer,
				enabled: true,
				backgroundColor:
					current.footer?.backgroundColor ??
					current.header?.backgroundColor ??
					base.footer.backgroundColor,
				imageFileId: current.footer?.imageFileId ?? base.footer.imageFileId,
				text: current.footer?.text ?? base.footer.text,
				textFont: current.footer?.textFont ?? base.footer.textFont,
				textSize: current.footer?.textSize ?? base.footer.textSize,
				textColor: current.footer?.textColor ?? base.footer.textColor
			}
		};
	}

	function shouldApplyAutomaticText(currentValue: string, templateValue: string, previousAutomaticValue: string, nextAutomaticValue: string) {
		const value = String(currentValue ?? '');
		return !value || value === templateValue || value === previousAutomaticValue || value === nextAutomaticValue;
	}

	function withAutomaticTextUpdates(source: any) {
		const next = contentOnlyConfig(source);
		const base = cloneCertificateConfig();
		const automaticTexts = {
			subtitle: certificatePlaceholders(base.header.subtitle, previewData),
			body: certificatePlaceholders(base.body.text, previewData),
			details: certificatePlaceholders(base.details.text, previewData)
		};

		if (
			shouldApplyAutomaticText(
				next.header.subtitle,
				base.header.subtitle,
				lastAutomaticTexts.subtitle,
				automaticTexts.subtitle
			)
		) {
			next.header.subtitle = automaticTexts.subtitle;
		}

		if (
			shouldApplyAutomaticText(
				next.body.text,
				base.body.text,
				lastAutomaticTexts.body,
				automaticTexts.body
			)
		) {
			next.body.text = automaticTexts.body;
		}

		if (
			shouldApplyAutomaticText(
				next.details.text,
				base.details.text,
				lastAutomaticTexts.details,
				automaticTexts.details
			)
		) {
			next.details.text = automaticTexts.details;
		}

		lastAutomaticTexts = automaticTexts;
		return next;
	}

	$effect(() => {
		const next = withAutomaticTextUpdates(config);
		if (JSON.stringify(next) !== JSON.stringify(config)) {
			config = next;
		}
	});

	$effect(() => {
		barsColor = normalizeColorInput(config.header?.backgroundColor, fallbackColors.bars);
		titleColor = normalizeColorInput(config.header?.titleColor, fallbackColors.title);
		subtitleColor = normalizeColorInput(config.header?.subtitleColor, fallbackColors.subtitle);
		introColor = normalizeColorInput(config.intro?.color, fallbackColors.intro);
		participantColor = normalizeColorInput(config.participant?.color, fallbackColors.participant);
		bodyColor = normalizeColorInput(config.body?.color, fallbackColors.body);
		detailsColor = normalizeColorInput(config.details?.color, fallbackColors.details);
		signatureColor = normalizeColorInput(config.signature?.color, fallbackColors.signature);
		footerTextColor = normalizeColorInput(config.footer?.textColor, fallbackColors.footerText);
	});

	onDestroy(() => {
		if (footerPreviewUrl) URL.revokeObjectURL(footerPreviewUrl);
		if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
	});

	function updateSection(section: string, key: string, value: any) {
		config = contentOnlyConfig({
			...config,
			[section]: {
				...(config?.[section] ?? {}),
				[key]: value
			}
		});
	}

	function normalizeColorInput(value: any, fallback: string) {
		const color = String(value ?? '').trim();
		return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
	}

	function updateSectionColor(section: string, key: string, value: string, fallback: string) {
		updateSection(section, key, normalizeColorInput(value, fallback));
	}

	function clampNumber(value: any, min: number, max: number, fallback: number) {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return fallback;
		return Math.min(max, Math.max(min, numeric));
	}

	function applyGlobalTextStyle() {
		const font = String(globalFont || 'Helvetica');
		const size = clampNumber(globalSize, 8, 54, 12);
		const color = normalizeColorInput(globalColor, fallbackColors.body);

		config = contentOnlyConfig({
			...config,
			header: {
				...(config.header ?? {}),
				titleFont: font,
				subtitleFont: font,
				titleSize: clampNumber(size, 12, 54, 30),
				subtitleSize: clampNumber(size, 10, 36, 20),
				titleColor: color,
				subtitleColor: color
			},
			intro: {
				...(config.intro ?? {}),
				font,
				size: clampNumber(size, 8, 28, 12),
				color
			},
			participant: {
				...(config.participant ?? {}),
				font,
				size: clampNumber(size, 18, 74, 42),
				color
			},
			body: {
				...(config.body ?? {}),
				font,
				size: clampNumber(size, 8, 24, 12),
				color
			},
			details: {
				...(config.details ?? {}),
				font,
				size: clampNumber(size, 8, 20, 10),
				color
			},
			signature: {
				...(config.signature ?? {}),
				font,
				size: clampNumber(size, 8, 20, 11),
				color
			},
			footer: {
				...(config.footer ?? {}),
				textFont: font,
				textSize: clampNumber(size, 8, 18, 10),
				textColor: color
			}
		});
	}

	function updateSignatureMode(value: string) {
		config = contentOnlyConfig({
			...config,
			signature: {
				...(config.signature ?? {}),
				mode: value
			}
		});
	}

	function updateBarsColor(value: string) {
		const color = normalizeColorInput(value, fallbackColors.bars);
		config = contentOnlyConfig({
			...config,
			header: {
				...(config.header ?? {}),
				backgroundColor: color
			},
			footer: {
				...(config.footer ?? {}),
				backgroundColor: color
			}
		});
	}

	function inputValue(event: Event) {
		return (event.currentTarget as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
	}

	function numberValue(event: Event, fallback: number) {
		const numeric = Number((event.currentTarget as HTMLInputElement).value);
		return Number.isFinite(numeric) ? numeric : fallback;
	}

	function checkedValue(event: Event) {
		return (event.currentTarget as HTMLInputElement).checked;
	}

	function acceptedCertificateImage(file: File) {
		const lowerName = file.name.toLowerCase();
		return (
			file.type === 'image/png' ||
			file.type === 'image/jpeg' ||
			lowerName.endsWith('.png') ||
			lowerName.endsWith('.jpg') ||
			lowerName.endsWith('.jpeg')
		);
	}

	function convertibleCertificateImage(file: File) {
		const lowerName = file.name.toLowerCase();
		return file.type.startsWith('image/') || /\.(webp|gif|bmp|svg)$/.test(lowerName);
	}

	function convertedImageName(fileName: string) {
		const baseName = fileName.replace(/\.[^.]+$/, '').trim() || 'imagem';
		return `${baseName}.png`;
	}

	async function convertImageToPng(file: File) {
		const imageUrl = URL.createObjectURL(file);

		try {
			const image = new Image();
			const loaded = new Promise<void>((resolve, reject) => {
				image.onload = () => resolve();
				image.onerror = () => reject(new Error('Imagem invalida'));
			});
			image.src = imageUrl;
			await loaded;

			const canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			const context = canvas.getContext('2d');
			if (!context || !canvas.width || !canvas.height) {
				throw new Error('Imagem invalida');
			}

			context.drawImage(image, 0, 0);
			const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
			if (!blob) {
				throw new Error('Imagem invalida');
			}

			return new File([blob], convertedImageName(file.name), {
				type: 'image/png',
				lastModified: Date.now()
			});
		} finally {
			URL.revokeObjectURL(imageUrl);
		}
	}

	async function certificateImageFile(file: File) {
		if (acceptedCertificateImage(file)) return file;
		if (convertibleCertificateImage(file)) return convertImageToPng(file);
		throw new Error('Tipo de ficheiro invalido');
	}

	async function handleFooterFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFile = input.files?.[0] ?? null;
		footerFileError = '';
		if (!selectedFile) {
			footerFile = null;
			footerFileName = '';
			if (footerPreviewUrl) URL.revokeObjectURL(footerPreviewUrl);
			footerPreviewUrl = '';
			return;
		}

		try {
			const file = await certificateImageFile(selectedFile);
			footerFile = file;
			footerFileName = file.name;
			if (footerPreviewUrl) URL.revokeObjectURL(footerPreviewUrl);
			footerPreviewUrl = URL.createObjectURL(file);
		} catch {
			footerFile = null;
			footerFileName = '';
			footerFileError = 'Use uma imagem PNG, JPG ou WebP valida.';
			input.value = '';
			if (footerPreviewUrl) URL.revokeObjectURL(footerPreviewUrl);
			footerPreviewUrl = '';
		}
	}

	async function handleSignatureFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFile = input.files?.[0] ?? null;
		signatureFileError = '';
		if (!selectedFile) {
			signatureFile = null;
			signatureFileName = '';
			if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
			signaturePreviewUrl = '';
			return;
		}

		try {
			const file = await certificateImageFile(selectedFile);
			signatureFile = file;
			signatureFileName = file.name;
			if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
			signaturePreviewUrl = URL.createObjectURL(file);
			if (config.signature?.mode !== 'image') {
				updateSignatureMode('image');
			}
		} catch {
			signatureFile = null;
			signatureFileName = '';
			signatureFileError = 'Use uma imagem PNG, JPG ou WebP valida.';
			input.value = '';
			if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
			signaturePreviewUrl = '';
		}
	}

	function pct(value: any, total: number) {
		return `${(Number(value ?? 0) / total) * 100}%`;
	}

	function px(value: any, fallback: number) {
		const numeric = Number(value);
		return `${Number.isFinite(numeric) ? numeric : fallback}px`;
	}

	function fontFamily(font: string) {
		if (String(font).startsWith('Times')) return 'Times New Roman, serif';
		if (String(font).startsWith('Courier')) return 'Courier New, monospace';
		return 'Arial, Helvetica, sans-serif';
	}

	function resolvedPreviewText(value: string) {
		return certificatePlaceholders(value, previewData);
	}

	function signatureTop() {
		return pct(config.signature?.mode === 'image' ? 345 : config.signature.y, pageHeight);
	}
</script>

<div class="certificate-simple">
	<div class="simple-grid">
		<div class="form-group">
			<label for="cert-header-title">Tipo de documento</label>
			<input
				id="cert-header-title"
				class="form-control form-control-sm"
				type="text"
				list="cert-title-options"
				value={config.header.title}
				oninput={(event) => updateSection('header', 'title', inputValue(event))}
			/>
			<datalist id="cert-title-options">
				{#each titleOptions as option}
					<option value={option}></option>
				{/each}
			</datalist>
		</div>

		<div class="form-group">
			<label for="cert-footer-file">Logotipos do rodap&eacute;</label>
			<input
				id="cert-footer-file"
				class="form-control-file compact-file"
				type="file"
				accept="image/png,image/jpeg,image/webp"
				onchange={handleFooterFileChange}
			/>
			{#if footerFileName}
				<small class="form-text text-muted">{footerFileName}</small>
			{:else if footerFileError}
				<small class="form-text text-danger">{footerFileError}</small>
			{:else if config.footer.imageFileId}
				<small class="form-text text-muted">Imagem j&aacute; carregada</small>
			{/if}
		</div>
	</div>

	<p class="auto-text-note">
		O nome, a&ccedil;&atilde;o, entidade, datas e horas s&atilde;o preenchidos automaticamente no certificado.
	</p>

	<div class="form-group">
		<label for="cert-intro-text">Texto inicial</label>
		<input
			id="cert-intro-text"
			class="form-control form-control-sm"
			type="text"
			value={config.intro.text}
			oninput={(event) => updateSection('intro', 'text', inputValue(event))}
		/>
	</div>

	<div class="form-group">
		<label for="cert-signature-title">Assinatura/cargo</label>
		<input
			id="cert-signature-title"
			class="form-control form-control-sm"
			type="text"
			value={config.signature.title}
			oninput={(event) => updateSection('signature', 'title', inputValue(event))}
		/>
	</div>

	<div class="simple-grid signature-grid">
		<div class="form-group">
			<label for="cert-signature-mode">Tipo de assinatura</label>
			<select
				id="cert-signature-mode"
				class="form-control form-control-sm"
				value={config.signature.mode}
				disabled={!config.signature.enabled}
				onchange={(event) => updateSignatureMode((event.currentTarget as HTMLSelectElement).value)}
			>
				<option value="text">Texto apenas</option>
				<option value="image">Imagem da assinatura</option>
			</select>
		</div>

		{#if config.signature.enabled && config.signature.mode === 'image'}
			<div class="form-group">
				<label for="cert-signature-file">Imagem da assinatura</label>
				<input
					id="cert-signature-file"
					class="form-control-file compact-file"
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onchange={handleSignatureFileChange}
				/>
				{#if signatureFileName}
					<small class="form-text text-muted">{signatureFileName}</small>
				{:else if signatureFileError}
					<small class="form-text text-danger">{signatureFileError}</small>
				{:else if config.signature.imageFileId}
					<small class="form-text text-muted">Imagem j&aacute; carregada</small>
				{/if}
			</div>
		{/if}
	</div>

	<div class="certificate-actions">
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			onclick={() => (showMoreOptions = !showMoreOptions)}
			aria-expanded={showMoreOptions}
		>
			{showMoreOptions ? 'Ocultar letra e op\u00e7\u00f5es' : 'Tipo de letra e tamanho'}
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-primary"
			onclick={() => (showPreview = !showPreview)}
			aria-expanded={showPreview}
		>
			{showPreview ? 'Ocultar pr\u00e9-visualiza\u00e7\u00e3o' : 'Ver pr\u00e9-visualiza\u00e7\u00e3o'}
		</button>
	</div>

	{#if showMoreOptions}
		<div class="more-options">
			<div class="form-group">
				<label for="cert-header-subtitle">Subt&iacute;tulo</label>
				<input
					id="cert-header-subtitle"
					class="form-control form-control-sm"
					type="text"
					value={config.header.subtitle}
					oninput={(event) => updateSection('header', 'subtitle', inputValue(event))}
				/>
			</div>

			<div class="form-group">
				<label for="cert-body-text">Texto principal</label>
				<textarea
					id="cert-body-text"
					class="form-control form-control-sm"
					rows="2"
					value={config.body.text}
					oninput={(event) => updateSection('body', 'text', inputValue(event))}
				></textarea>
				<small class="form-text text-muted">
					Pode usar campos autom&aacute;ticos como {`{acao}`}, {`{descricao}`}, {`{entidade}`} e {`{data}`}.
				</small>
			</div>

			<div class="typography-options">
				<div class="options-title">Letra e cores</div>
				<div class="typography-grid">
					<div class="typography-row typography-row-global">
						<label for="cert-global-font">Todos os textos</label>
						<select
							id="cert-global-font"
							class="form-control form-control-sm"
							bind:value={globalFont}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="54"
							bind:value={globalSize}
							aria-label="Tamanho para todos os textos"
						/>
						<input
							id="cert-global-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={globalColor}
							aria-label="Cor para todos os textos"
						/>
						<button
							type="button"
							class="btn btn-sm btn-outline-primary typography-apply"
							onclick={applyGlobalTextStyle}
						>
							Aplicar
						</button>
					</div>

					<div class="typography-row">
						<label for="cert-bars-color">Barras</label>
						<div class="typography-static">Cabe&ccedil;alho e rodap&eacute;</div>
						<span class="typography-empty"></span>
						<input
							id="cert-bars-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={barsColor}
							aria-label="Cor das barras"
							oninput={(event) => updateBarsColor(inputValue(event))}
							onchange={(event) => updateBarsColor(inputValue(event))}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-title-font">Tipo de documento</label>
						<select
							id="cert-title-font"
							class="form-control form-control-sm"
							value={config.header.titleFont}
							onchange={(event) => updateSection('header', 'titleFont', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="12"
							max="54"
							value={config.header.titleSize}
							aria-label="Tamanho do tipo de documento"
							oninput={(event) => updateSection('header', 'titleSize', numberValue(event, 30))}
						/>
						<input
							id="cert-title-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={titleColor}
							aria-label="Cor do tipo de documento"
							oninput={(event) => updateSectionColor('header', 'titleColor', inputValue(event), fallbackColors.title)}
							onchange={(event) => updateSectionColor('header', 'titleColor', inputValue(event), fallbackColors.title)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-subtitle-font">Subt&iacute;tulo</label>
						<select
							id="cert-subtitle-font"
							class="form-control form-control-sm"
							value={config.header.subtitleFont}
							onchange={(event) => updateSection('header', 'subtitleFont', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="10"
							max="36"
							value={config.header.subtitleSize}
							aria-label="Tamanho do subt&iacute;tulo"
							oninput={(event) => updateSection('header', 'subtitleSize', numberValue(event, 20))}
						/>
						<input
							id="cert-subtitle-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={subtitleColor}
							aria-label="Cor do subt&iacute;tulo"
							oninput={(event) => updateSectionColor('header', 'subtitleColor', inputValue(event), fallbackColors.subtitle)}
							onchange={(event) => updateSectionColor('header', 'subtitleColor', inputValue(event), fallbackColors.subtitle)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-intro-font">Texto inicial</label>
						<select
							id="cert-intro-font"
							class="form-control form-control-sm"
							value={config.intro.font}
							onchange={(event) => updateSection('intro', 'font', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="28"
							value={config.intro.size}
							aria-label="Tamanho do texto inicial"
							oninput={(event) => updateSection('intro', 'size', numberValue(event, 12))}
						/>
						<input
							id="cert-intro-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={introColor}
							aria-label="Cor do texto inicial"
							oninput={(event) => updateSectionColor('intro', 'color', inputValue(event), fallbackColors.intro)}
							onchange={(event) => updateSectionColor('intro', 'color', inputValue(event), fallbackColors.intro)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-name-font">Nome do participante</label>
						<select
							id="cert-name-font"
							class="form-control form-control-sm"
							value={config.participant.font}
							onchange={(event) => updateSection('participant', 'font', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="18"
							max="74"
							value={config.participant.size}
							aria-label="Tamanho do nome do participante"
							oninput={(event) => updateSection('participant', 'size', numberValue(event, 42))}
						/>
						<input
							id="cert-name-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={participantColor}
							aria-label="Cor do nome do participante"
							oninput={(event) => updateSectionColor('participant', 'color', inputValue(event), fallbackColors.participant)}
							onchange={(event) => updateSectionColor('participant', 'color', inputValue(event), fallbackColors.participant)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-body-font">Texto principal</label>
						<select
							id="cert-body-font"
							class="form-control form-control-sm"
							value={config.body.font}
							onchange={(event) => updateSection('body', 'font', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="24"
							value={config.body.size}
							aria-label="Tamanho do texto principal"
							oninput={(event) => updateSection('body', 'size', numberValue(event, 12))}
						/>
						<input
							id="cert-body-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={bodyColor}
							aria-label="Cor do texto principal"
							oninput={(event) => updateSectionColor('body', 'color', inputValue(event), fallbackColors.body)}
							onchange={(event) => updateSectionColor('body', 'color', inputValue(event), fallbackColors.body)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-details-font">Detalhes</label>
						<select
							id="cert-details-font"
							class="form-control form-control-sm"
							value={config.details.font}
							onchange={(event) => updateSection('details', 'font', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="20"
							value={config.details.size}
							aria-label="Tamanho dos detalhes"
							oninput={(event) => updateSection('details', 'size', numberValue(event, 10))}
						/>
						<input
							id="cert-details-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={detailsColor}
							aria-label="Cor dos detalhes"
							oninput={(event) => updateSectionColor('details', 'color', inputValue(event), fallbackColors.details)}
							onchange={(event) => updateSectionColor('details', 'color', inputValue(event), fallbackColors.details)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-signature-font">Assinatura</label>
						<select
							id="cert-signature-font"
							class="form-control form-control-sm"
							value={config.signature.font}
							disabled={!config.signature.enabled}
							onchange={(event) => updateSection('signature', 'font', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="20"
							value={config.signature.size}
							disabled={!config.signature.enabled}
							aria-label="Tamanho da assinatura"
							oninput={(event) => updateSection('signature', 'size', numberValue(event, 11))}
						/>
						<input
							id="cert-signature-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={signatureColor}
							disabled={!config.signature.enabled}
							aria-label="Cor da assinatura"
							oninput={(event) => updateSectionColor('signature', 'color', inputValue(event), fallbackColors.signature)}
							onchange={(event) => updateSectionColor('signature', 'color', inputValue(event), fallbackColors.signature)}
						/>
					</div>

					<div class="typography-row">
						<label for="cert-footer-font">Rodap&eacute;</label>
						<select
							id="cert-footer-font"
							class="form-control form-control-sm"
							value={config.footer.textFont}
							onchange={(event) => updateSection('footer', 'textFont', inputValue(event))}
						>
							{#each certificateFonts as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<input
							class="form-control form-control-sm"
							type="number"
							min="8"
							max="18"
							value={config.footer.textSize}
							aria-label="Tamanho do rodap&eacute;"
							oninput={(event) => updateSection('footer', 'textSize', numberValue(event, 10))}
						/>
						<input
							id="cert-footer-color"
							class="form-control form-control-sm color-input"
							type="color"
							bind:value={footerTextColor}
							aria-label="Cor do texto no rodap&eacute;"
							oninput={(event) => updateSectionColor('footer', 'textColor', inputValue(event), fallbackColors.footerText)}
							onchange={(event) => updateSectionColor('footer', 'textColor', inputValue(event), fallbackColors.footerText)}
						/>
					</div>
				</div>
				<small class="form-text text-muted">O fundo central do certificado mant&eacute;m-se sempre branco.</small>
			</div>

			<div class="custom-control custom-checkbox mb-2">
				<input
					id="cert-details-enabled"
					class="custom-control-input"
					type="checkbox"
					checked={config.details.enabled}
					onchange={(event) => updateSection('details', 'enabled', checkedValue(event))}
				/>
				<label class="custom-control-label" for="cert-details-enabled">Mostrar detalhes adicionais</label>
			</div>
			{#if config.details.enabled}
				<p class="auto-text-note mb-3">Os detalhes mostram apenas a dura&ccedil;&atilde;o e o tipo de forma&ccedil;&atilde;o.</p>
				<div class="form-group">
					<label for="cert-details-text">Texto dos detalhes</label>
					<input
						id="cert-details-text"
						class="form-control form-control-sm"
						type="text"
						value={config.details.text}
						oninput={(event) => updateSection('details', 'text', inputValue(event))}
					/>
				</div>
			{/if}

			<div class="custom-control custom-checkbox mb-2">
				<input
					id="cert-signature-enabled"
					class="custom-control-input"
					type="checkbox"
					checked={config.signature.enabled}
					onchange={(event) => updateSection('signature', 'enabled', checkedValue(event))}
				/>
				<label class="custom-control-label" for="cert-signature-enabled">Mostrar assinatura</label>
			</div>
			<div class="form-row">
				<div class="form-group col-md-6">
					<label for="cert-signature-name">Nome da assinatura</label>
					<input
						id="cert-signature-name"
						class="form-control form-control-sm"
						type="text"
						value={config.signature.name}
						disabled={!config.signature.enabled}
						oninput={(event) => updateSection('signature', 'name', inputValue(event))}
					/>
				</div>
				<div class="form-group col-md-6">
					<label for="cert-signature-role">Fun&ccedil;&atilde;o</label>
					<input
						id="cert-signature-role"
						class="form-control form-control-sm"
						type="text"
						value={config.signature.role}
						disabled={!config.signature.enabled}
						oninput={(event) => updateSection('signature', 'role', inputValue(event))}
					/>
				</div>
			</div>
			<div class="form-group mb-0">
				<label for="cert-footer-text">Texto no rodap&eacute;</label>
				<input
					id="cert-footer-text"
					class="form-control form-control-sm"
					type="text"
					value={config.footer.text}
					oninput={(event) => updateSection('footer', 'text', inputValue(event))}
				/>
			</div>
		</div>
	{/if}

	{#if showPreview}
		<div class="preview-title">Pr&eacute;-visualiza&ccedil;&atilde;o</div>
		<div class="certificate-preview">
			<div
				class="preview-header"
				style={`height:${pct(config.header.height, pageHeight)};background:${config.header.backgroundColor};`}
			>
				{#if config.header.showCircuit}
					<div class="preview-circuit left-top"></div>
					<div class="preview-circuit right-top"></div>
				{/if}
				<div
					class="preview-header-title"
					style={`color:${config.header.titleColor};font-family:${fontFamily(config.header.titleFont)};font-size:${px(config.header.titleSize, 30)};`}
				>
					{resolvedPreviewText(config.header.title)}
				</div>
				<div
					class="preview-header-subtitle"
					style={`color:${config.header.subtitleColor};font-family:${fontFamily(config.header.subtitleFont)};font-size:${px(config.header.subtitleSize, 20)};`}
				>
					{resolvedPreviewText(config.header.subtitle)}
				</div>
			</div>

			<div
				class="preview-intro"
				style={`left:${pct(config.intro.x, pageWidth)};top:${pct(config.intro.y, pageHeight)};color:${config.intro.color};font-family:${fontFamily(config.intro.font)};font-size:${px(config.intro.size, 12)};`}
			>
				{resolvedPreviewText(config.intro.text)}
			</div>
			<div
				class:underlined-name={config.participant.underline}
				class="preview-name"
				style={`left:${pct(config.participant.x, pageWidth)};top:${pct(config.participant.y, pageHeight)};color:${config.participant.color};font-family:${fontFamily(config.participant.font)};font-size:${px(config.participant.size, 42)};`}
			>
				{previewData.nome ?? 'Nome do Participante'}
			</div>
			<div
				class="preview-body"
				style={`left:${pct(config.body.x, pageWidth)};top:${pct(config.body.y, pageHeight)};color:${config.body.color};font-family:${fontFamily(config.body.font)};font-size:${px(config.body.size, 12)};text-align:${config.body.align};`}
			>
				{resolvedPreviewText(config.body.text)}
			</div>
			{#if config.details.enabled}
				<div
					class="preview-details"
					style={`left:${pct(config.details.x, pageWidth)};top:${pct(config.details.y, pageHeight)};color:${config.details.color};font-family:${fontFamily(config.details.font)};font-size:${px(config.details.size, 10)};text-align:${config.details.align};`}
				>
					{resolvedPreviewText(config.details.text)}
				</div>
			{/if}
			{#if config.signature.enabled}
				<div
					class="preview-signature"
					class:image-signature={config.signature.mode === 'image'}
					style={`left:${pct(config.signature.x, pageWidth)};top:${signatureTop()};color:${config.signature.color};font-family:${fontFamily(config.signature.font)};font-size:${px(config.signature.size, 11)};`}
				>
					{#if config.signature.mode === 'image'}
						<div class="signature-image-box">
							{#if signaturePreviewUrl}
								<img src={signaturePreviewUrl} alt="" />
							{:else if config.signature.imageFileId}
								<span>Imagem da assinatura</span>
							{:else}
								<span>Carregar assinatura</span>
							{/if}
						</div>
						{#if config.signature.title}
							<div>{resolvedPreviewText(config.signature.title)}</div>
						{/if}
						{#if config.signature.name}
							<div>{resolvedPreviewText(config.signature.name)}</div>
						{/if}
						{#if config.signature.role}
							<div>{resolvedPreviewText(config.signature.role)}</div>
						{/if}
					{:else}
						{#if config.signature.title}
							<div>{resolvedPreviewText(config.signature.title)}</div>
						{/if}
						{#if config.signature.name}
							<div>{resolvedPreviewText(config.signature.name)}</div>
						{/if}
						{#if config.signature.role}
							<div>{resolvedPreviewText(config.signature.role)}</div>
						{/if}
					{/if}
				</div>
			{/if}
			<div
				class="preview-footer"
				style={`height:${pct(config.footer.height, pageHeight)};background:${config.footer.backgroundColor};`}
			>
				{#if config.footer.showCircuit}
					<div class="preview-circuit left-bottom"></div>
					<div class="preview-circuit right-bottom"></div>
				{/if}
				{#if footerPreviewUrl}
					<img src={footerPreviewUrl} alt="" style={`max-height:${px(config.footer.imageHeight, 54)};`} />
				{:else}
					<div class="footer-placeholder">Logotipos</div>
				{/if}
				{#if config.footer.text}
					<div
						class="preview-footer-text"
						style={`color:${config.footer.textColor};font-family:${fontFamily(config.footer.textFont)};font-size:${px(config.footer.textSize, 10)};`}
					>
						{resolvedPreviewText(config.footer.text)}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.certificate-simple {
		border: 1px solid #d8e2ea;
		background: #fff;
		padding: 0.85rem;
		max-width: 980px;
	}

	.simple-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(260px, 0.55fr);
		column-gap: 1rem;
	}

	.signature-grid {
		margin-bottom: 0.25rem;
	}

	.certificate-simple label {
		display: block;
		font-size: 0.76rem;
		color: #526a78;
		margin-bottom: 0.2rem;
		text-transform: uppercase;
	}

	.compact-file {
		font-size: 0.82rem;
	}

	.auto-text-note {
		color: #526a78;
		font-size: 0.82rem;
		margin-bottom: 0.85rem;
	}

	.certificate-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.25rem;
	}

	.more-options {
		border-top: 1px solid #edf2f6;
		margin-top: 0.85rem;
		padding-top: 0.85rem;
	}

	.options-title {
		color: #314b5c;
		font-size: 0.8rem;
		font-weight: 700;
		margin-bottom: 0.45rem;
		text-transform: uppercase;
	}

	.typography-options {
		border-top: 1px solid #edf2f6;
		border-bottom: 1px solid #edf2f6;
		margin: 0.85rem 0;
		padding: 0.85rem 0;
	}

	.typography-grid {
		display: grid;
		gap: 0.45rem;
	}

	.typography-row {
		display: grid;
		grid-template-columns: minmax(150px, 0.9fr) minmax(160px, 1fr) 90px 54px auto;
		gap: 0.5rem;
		align-items: center;
	}

	.typography-row label {
		margin-bottom: 0;
	}

	.typography-row-global {
		background: #f8fcff;
		border: 1px solid #e1edf5;
		padding: 0.45rem;
	}

	.typography-apply {
		white-space: nowrap;
	}

	.typography-static {
		color: #526a78;
		font-size: 0.82rem;
	}

	.typography-empty {
		min-height: 1px;
	}

	.color-input {
		height: 30px;
		min-width: 46px;
		padding: 0.12rem;
	}

	.preview-title {
		color: #314b5c;
		font-size: 0.86rem;
		font-weight: 700;
		margin: 1rem 0 0.5rem;
		text-transform: uppercase;
	}

	.certificate-preview {
		position: relative;
		width: 100%;
		max-width: 760px;
		aspect-ratio: 842 / 595;
		background: #fff;
		border: 1px solid #cfd8df;
		overflow: hidden;
		box-shadow: 0 10px 28px rgba(20, 45, 60, 0.12);
	}

	.preview-header,
	.preview-footer {
		position: absolute;
		left: 0;
		right: 0;
		overflow: hidden;
	}

	.preview-header {
		top: 0;
	}

	.preview-footer {
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-header-title,
	.preview-header-subtitle {
		position: relative;
		z-index: 2;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 3rem;
	}

	.preview-header-title {
		margin-top: 2.3rem;
		line-height: 1.05;
	}

	.preview-header-subtitle {
		margin-top: 1.2rem;
		line-height: 1.1;
	}

	.preview-intro,
	.preview-name,
	.preview-body,
	.preview-details,
	.preview-signature {
		position: absolute;
		z-index: 2;
	}

	.preview-name {
		max-width: 68%;
		line-height: 1.05;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.underlined-name {
		border-bottom: 4px solid currentColor;
		padding-bottom: 0.12em;
	}

	.preview-body {
		max-width: 62%;
		line-height: 1.35;
		max-height: 4.55rem;
		overflow: hidden;
	}

	.preview-details,
	.preview-signature {
		width: 62%;
		line-height: 1.3;
	}

	.preview-details {
		max-height: 2rem;
		overflow: hidden;
	}

	.preview-signature {
		text-align: center;
		max-height: 3.8rem;
		overflow: hidden;
	}

	.preview-signature.image-signature {
		max-height: 5rem;
	}

	.signature-image-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2rem;
		margin-bottom: 0.2rem;
	}

	.signature-image-box img {
		max-width: 12rem;
		max-height: 2rem;
		object-fit: contain;
	}

	.signature-image-box span {
		color: #637889;
		border: 1px dashed #b7c5cf;
		padding: 0.2rem 1.2rem;
		font-size: 0.78rem;
	}

	.preview-footer img {
		position: relative;
		z-index: 2;
		max-width: 62%;
		object-fit: contain;
	}

	.footer-placeholder {
		position: relative;
		z-index: 2;
		color: rgba(255, 255, 255, 0.85);
		border: 1px dashed rgba(255, 255, 255, 0.55);
		padding: 0.35rem 2.5rem;
		font-size: 0.85rem;
	}

	.preview-footer-text {
		position: absolute;
		left: 18%;
		right: 18%;
		bottom: 0.5rem;
		z-index: 2;
		text-align: center;
	}

	.preview-circuit {
		position: absolute;
		z-index: 1;
		width: 120px;
		height: 82px;
		opacity: 0.55;
		background:
			linear-gradient(#fff, #fff) 0 16px / 72px 2px no-repeat,
			linear-gradient(#fff, #fff) 28px 36px / 96px 2px no-repeat,
			linear-gradient(#fff, #fff) 12px 56px / 64px 2px no-repeat,
			radial-gradient(circle, #fff 0 3px, transparent 4px) 72px 10px / 14px 14px no-repeat,
			radial-gradient(circle, #fff 0 3px, transparent 4px) 96px 30px / 14px 14px no-repeat,
			radial-gradient(circle, #fff 0 3px, transparent 4px) 64px 50px / 14px 14px no-repeat;
	}

	.left-top {
		left: 0.45rem;
		top: 0.45rem;
	}

	.right-top {
		right: 0.45rem;
		top: 0.45rem;
		transform: scaleX(-1);
	}

	.left-bottom {
		left: 0.45rem;
		bottom: 0.45rem;
		transform: scaleY(-1);
	}

	.right-bottom {
		right: 0.45rem;
		bottom: 0.45rem;
		transform: scale(-1);
	}

	@media (max-width: 767px) {
		.simple-grid {
			grid-template-columns: 1fr;
		}

		.typography-row {
			grid-template-columns: 1fr;
		}

	}
</style>
