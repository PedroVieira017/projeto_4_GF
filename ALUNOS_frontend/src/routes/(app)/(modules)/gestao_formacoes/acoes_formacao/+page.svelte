<script module lang="ts">
	declare const DataTable: any;
	declare const jQuery: any;
	declare const toastr: any;
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Breadcrum from '$lib/components/Breadcrum.svelte';
	import { locale, t } from '$lib/translations/translations';
	import * as dt_pt from '$lib/translations/pt/datatables.json';
	import * as dt_en from '$lib/translations/en/datatables.json';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
	import { goto } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	pageTitle.title = $t('gestao_formacoes.acoes_formacao.title');
	sidebarOptions.currentModule = $t('gestao_formacoes.module');
	sidebarOptions.currentObject = $t('gestao_formacoes.acoes_formacao.title');
	sidebarOptions.currentModuleId = pageIds.gestao_formacoes.acoes_formacao.moduleId;
	sidebarOptions.currentObjectId = pageIds.gestao_formacoes.acoes_formacao.objectId;

	let tableElement: HTMLTableElement | null = null;
	let dtInstance: any = null;
	let typeChartElement: HTMLCanvasElement | null = $state(null);
	let pedagogicalAreaChartElement: HTMLCanvasElement | null = $state(null);
	let companyChartElement: HTMLCanvasElement | null = $state(null);
	let chartJs: any = null;
	let typeChart: any = null;
	let pedagogicalAreaChart: any = null;
	let companyChart: any = null;
	let showCharts = $state(true);

	let acoes = $state(Array.isArray(data.acoes) ? data.acoes : []);
	let tiposFormacao = $state(Array.isArray(data.tipos_formacao) ? data.tipos_formacao : []);
	let selectedTipoFilter = $state('');
	let selectedEmpresaFilter = $state('');
	let selectedPedagogicalAreaFilter = $state('all');
	let draftTipoFilter = $state('');
	let draftEmpresaFilter = $state('');
	let draftPedagogicalAreaFilter = $state('all');
	let items_breadcrum = $derived([
		{
			icon_class: 'icon-doc',
			url: '#',
			designacao: $t('gestao_formacoes.common.new'),
			function: openAddModal
		}
	]);

	let isEditModalOpen = $state(false);
	let editMode: 'add' | 'edit' = $state('add');
	let editId: number | null = $state(null);
	let designacaoInput = $state('');
	let tipoFormacaoId = $state('');
	let objetivosInput = $state('');
	let nHorasInput = $state('');
	let empresaIdInput = $state('');
	let dataInicioInput = $state('');
	let dataFimInput = $state('');
	let isLoadingEmpresas = $state(false);
	let empresas: any[] = $state([]);

	let isDeleteModalOpen = $state(false);
	let deleteId: number | null = $state(null);
	let deleteTitle = $state('');

	const formatDate = (value: any) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString('pt-PT');
	};

	const getTipoNome = (acao: any) =>
		acao?.TIPO_FORMACAO?.designacao ?? acao?.tipo_formacao_nome ?? acao?.tipo ?? '-';

	const getEmpresa = (acao: any) => acao?.local ?? acao?.empresa ?? '-';
	const getNParticipantes = (acao: any) =>
		acao?._count?.PARTICIPACAO ?? acao?.n_participantes ?? 0;
	const getAreaPedagogica = (acao: any) =>
		acao?.area_formacao_pedagogica === true ||
		acao?.area_formacao_pedagogica === 1 ||
		acao?.area_formacao_pedagogica === '1';
	const formatYesNo = (value: boolean) =>
		value ? $t('gestao_formacoes.labels.yes') : $t('gestao_formacoes.labels.no');
	const sanitizeLabel = (value: any) => {
		const text = String(value ?? '').trim();
		return text.length ? text : $t('gestao_formacoes.dashboard.not_informed');
	};
	const getDurationInDays = (acao: any) => {
		if (!acao?.data_inicio || !acao?.data_fim) return null;
		const start = new Date(acao.data_inicio);
		const end = new Date(acao.data_fim);
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
		const diff = end.getTime() - start.getTime();
		if (diff < 0) return null;
		return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
	};
	const formatMetric = (value: number) =>
		new Intl.NumberFormat($locale === 'pt' ? 'pt-PT' : 'en-US', {
			maximumFractionDigits: 1,
			minimumFractionDigits: Number.isInteger(value) ? 0 : 1
		}).format(value);
	const aggregateCounts = (items: string[]) => {
		const counts = new Map<string, number>();
		items.forEach((item) => {
			counts.set(item, (counts.get(item) ?? 0) + 1);
		});
		return Array.from(counts.entries())
			.sort(
				(a, b) =>
					b[1] - a[1] ||
					a[0].localeCompare(b[0], $locale === 'pt' ? 'pt-PT' : 'en-US', {
						numeric: true,
						sensitivity: 'base'
					})
			)
			.map(([label, value]) => ({ label, value }));
	};
	const typeChartLimit = 5;
	const companyChartLimit = 15;
	function buildLimitedChartDataset(items: Array<{ label: string; value: number }>, limit: number) {
		if (!items.length) return [];
		return items.slice(0, Math.max(limit, 1));
	}
	const tipoFilterOptions = $derived.by(() =>
		aggregateCounts(acoes.map((acao) => sanitizeLabel(getTipoNome(acao)))).map((item) => item.label)
	);
	const empresaFilterOptions = $derived.by(() =>
		aggregateCounts(acoes.map((acao) => sanitizeLabel(getEmpresa(acao)))).map((item) => item.label)
	);
	const filteredAcoes = $derived.by(() =>
		acoes.filter((acao) => {
			const tipo = sanitizeLabel(getTipoNome(acao));
			const empresa = sanitizeLabel(getEmpresa(acao));
			const areaPedagogica = getAreaPedagogica(acao);

			if (selectedTipoFilter && tipo !== selectedTipoFilter) return false;
			if (selectedEmpresaFilter && empresa !== selectedEmpresaFilter) return false;
			if (selectedPedagogicalAreaFilter === 'yes' && !areaPedagogica) return false;
			if (selectedPedagogicalAreaFilter === 'no' && areaPedagogica) return false;
			return true;
		})
	);
	const dashboardStats = $derived.by(() => {
		const totalFormacoes = filteredAcoes.length;
		const participantCounts = filteredAcoes.map((acao) => getNParticipantes(acao));
		const totalParticipants = participantCounts.reduce((sum, count) => sum + count, 0);
		const avgParticipants = totalFormacoes ? totalParticipants / totalFormacoes : 0;
		const durations = filteredAcoes
			.map((acao) => getDurationInDays(acao))
			.filter((value): value is number => value !== null);
		const avgDuration = durations.length
			? durations.reduce((sum, value) => sum + value, 0) / durations.length
			: 0;
		const distinctCompanies = new Set(
			filteredAcoes
				.map((acao) => sanitizeLabel(getEmpresa(acao)))
				.filter((value) => value !== $t('gestao_formacoes.dashboard.not_informed'))
		).size;

		return {
			totalFormacoes,
			avgParticipants,
			avgDuration,
			distinctCompanies
		};
	});
	const typeChartData = $derived.by(() =>
		buildLimitedChartDataset(
			aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getTipoNome(acao)))),
			typeChartLimit
		)
	);
	const companyChartData = $derived.by(() =>
		buildLimitedChartDataset(
			aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getEmpresa(acao)))),
			companyChartLimit
		)
	);
	const pedagogicalAreaChartData = $derived.by(() =>
		aggregateCounts(filteredAcoes.map((acao) => formatYesNo(getAreaPedagogica(acao))))
	);
	type InsightTone = 'primary' | 'success' | 'warning' | 'muted';
	type DashboardInsight = {
		title: string;
		value: string;
		text: string;
		recommendation: string;
		confidence: string;
		icon: string;
		tone: InsightTone;
	};
	type DashboardAiSummary = {
		title: string;
		text: string;
		confidence: string;
	};
	const translate = (pt: string, en: string) => ($locale === 'pt' ? pt : en);
	const formatPercent = (value: number) =>
		new Intl.NumberFormat($locale === 'pt' ? 'pt-PT' : 'en-US', {
			maximumFractionDigits: 0
		}).format(value);
	const formatSingularPlural = (value: number, singular: string, plural: string) =>
		value === 1 ? singular : plural;
	const getInsightConfidence = (total: number, count: number) => {
		const ratio = total ? count / total : 0;
		if (total >= 15 && ratio >= 0.45) return translate('Confiança alta', 'High confidence');
		if (total >= 8 || ratio >= 0.35) return translate('Confiança média', 'Medium confidence');
		return translate('Confiança baixa', 'Low confidence');
	};
	const dashboardAiSummary = $derived.by((): DashboardAiSummary => {
		const total = filteredAcoes.length;

		if (!total) {
			return {
				title: translate('Análise indisponível', 'Analysis unavailable'),
				text: translate(
					'Não existem ações suficientes nos filtros atuais para gerar uma recomendação.',
					'There are not enough actions in the current filters to generate a recommendation.'
				),
				confidence: translate('Sem confiança', 'No confidence')
			};
		}

		const types = aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getTipoNome(acao))));
		const companies = aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getEmpresa(acao))));
		const topType = types[0];
		const topCompany = companies[0];
		const withoutParticipants = filteredAcoes.filter((acao) => getNParticipantes(acao) === 0).length;
		const confidence = getInsightConfidence(total, Math.max(topType?.value ?? 0, topCompany?.value ?? 0));

		if (withoutParticipants > 0) {
			return {
				title: translate('Recomendação principal', 'Main recommendation'),
				text: translate(
					`Foram analisadas ${total} ações. O sistema detetou concentração no tipo ${topType?.label ?? '-'} e identificou ${withoutParticipants} ações sem participantes, pelo que recomenda rever a divulgação ou associação de participantes antes de criar novas formações semelhantes.`,
					`${total} actions were analysed. The system detected concentration in the ${topType?.label ?? '-'} type and identified ${withoutParticipants} actions without participants, so it recommends reviewing communication or participant assignment before creating similar training actions.`
				),
				confidence
			};
		}

		return {
			title: translate('Recomendação principal', 'Main recommendation'),
			text: translate(
				`Foram analisadas ${total} ações. O padrão mais forte está no tipo ${topType?.label ?? '-'} e na empresa ${topCompany?.label ?? '-'}, sugerindo que estas áreas devem ser consideradas prioritárias no planeamento de próximas formações.`,
				`${total} actions were analysed. The strongest pattern is in the ${topType?.label ?? '-'} type and ${topCompany?.label ?? '-'} company, suggesting these areas should be prioritised when planning future training actions.`
			),
			confidence
		};
	});
	const dashboardInsights = $derived.by((): DashboardInsight[] => {
		const total = filteredAcoes.length;

		if (!total) {
			return [
				{
					title: translate('Sem dados para analisar', 'No data to analyse'),
					value: '0',
					text: translate(
						'Altere os filtros para gerar padrões automáticos sobre as ações de formação.',
						'Change the filters to generate automatic patterns for the training actions.'
					),
					recommendation: translate(
						'Remova ou ajuste os filtros para permitir uma análise mais completa.',
						'Remove or adjust the filters to allow a more complete analysis.'
					),
					confidence: translate('Sem confiança', 'No confidence'),
					icon: 'fas fa-info-circle',
					tone: 'muted'
				}
			];
		}

		const types = aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getTipoNome(acao))));
		const companies = aggregateCounts(filteredAcoes.map((acao) => sanitizeLabel(getEmpresa(acao))));
		const pedagogicalAreas = aggregateCounts(
			filteredAcoes.map((acao) => formatYesNo(getAreaPedagogica(acao)))
		);
		const topType = types[0];
		const topCompany = companies[0];
		const topPedagogicalArea = pedagogicalAreas[0];
		const topAction = filteredAcoes.reduce((currentTop, acao) => {
			return getNParticipantes(acao) > getNParticipantes(currentTop) ? acao : currentTop;
		}, filteredAcoes[0]);
		const topParticipants = getNParticipantes(topAction);
		const withoutParticipants = filteredAcoes.filter((acao) => getNParticipantes(acao) === 0).length;

		const insights: DashboardInsight[] = [];

		if (topPedagogicalArea) {
			const percentage = Math.round((topPedagogicalArea.value / total) * 100);
			insights.push({
				title: translate('Padrão por área pedagógica', 'Pedagogical area pattern'),
				value: `${topPedagogicalArea.label} (${formatPercent(percentage)}%)`,
				text: translate(
					`A categoria ${topPedagogicalArea.label} domina os dados filtrados, o que indica uma tendência relevante nesta dimensão.`,
					`The ${topPedagogicalArea.label} category dominates the filtered data, indicating a relevant trend in this dimension.`
				),
				recommendation: translate(
					'Usar esta informação para equilibrar a oferta ou reforçar a área com maior procura.',
					'Use this information to balance the offer or reinforce the area with higher demand.'
				),
				confidence: getInsightConfidence(total, topPedagogicalArea.value),
				icon: 'fas fa-chart-pie',
				tone: 'primary'
			});
		}

		if (topType) {
			insights.push({
				title: translate('Tipo mais frequente', 'Most frequent type'),
				value: topType.label,
				text: translate(
					`O tipo ${topType.label} concentra ${topType.value} ${formatSingularPlural(topType.value, 'ação', 'ações')}, mostrando uma preferência clara nos registos atuais.`,
					`The ${topType.label} type has ${topType.value} training ${formatSingularPlural(topType.value, 'action', 'actions')}, showing a clear preference in the current records.`
				),
				recommendation: translate(
					'Considerar este tipo no planeamento futuro e verificar se os restantes tipos estão sub-representados.',
					'Consider this type in future planning and check whether the remaining types are underrepresented.'
				),
				confidence: getInsightConfidence(total, topType.value),
				icon: 'fas fa-layer-group',
				tone: 'success'
			});
		}

		if (topCompany) {
			insights.push({
				title: translate('Empresa com maior procura', 'Company with highest demand'),
				value: topCompany.label,
				text: translate(
					`${topCompany.label} surge associada a ${topCompany.value} ${formatSingularPlural(topCompany.value, 'formação', 'formações')}, destacando-se face às restantes empresas.`,
					`${topCompany.label} is associated with ${topCompany.value} ${formatSingularPlural(topCompany.value, 'training action', 'training actions')}, standing out from the other companies.`
				),
				recommendation: translate(
					'Priorizar esta empresa na análise de necessidades e na preparação de novas ações.',
					'Prioritise this company when analysing needs and preparing new actions.'
				),
				confidence: getInsightConfidence(total, topCompany.value),
				icon: 'fas fa-building',
				tone: 'primary'
			});
		}

		insights.push({
			title:
				withoutParticipants > 0
					? translate('Possível baixa adesão', 'Possible low engagement')
					: translate('Maior participação', 'Highest participation'),
			value: withoutParticipants > 0 ? String(withoutParticipants) : String(topParticipants),
			text:
				withoutParticipants > 0
					? translate(
							`Foram detetadas ${withoutParticipants} ${formatSingularPlural(withoutParticipants, 'ação sem participantes', 'ações sem participantes')}, o que pode indicar baixa adesão ou falta de associação de alunos.`,
							`${withoutParticipants} ${formatSingularPlural(withoutParticipants, 'action without participants was', 'actions without participants were')} detected, which may indicate low engagement or missing student assignment.`
						)
					: translate(
							`${sanitizeLabel(topAction?.designacao)} destaca-se com ${topParticipants} ${formatSingularPlural(topParticipants, 'participante', 'participantes')}, sugerindo maior interesse nesta ação.`,
							`${sanitizeLabel(topAction?.designacao)} stands out with ${topParticipants} ${formatSingularPlural(topParticipants, 'participant', 'participants')}, suggesting higher interest in this action.`
						),
			recommendation:
				withoutParticipants > 0
					? translate(
							'Rever estas ações e reforçar a divulgação ou a associação de participantes.',
							'Review these actions and reinforce communication or participant assignment.'
						)
					: translate(
							'Usar esta ação como referência para definir próximas formações com maior potencial de adesão.',
							'Use this action as a reference to define future training actions with higher engagement potential.'
						),
			confidence: getInsightConfidence(
				total,
				withoutParticipants > 0 ? withoutParticipants : topParticipants
			),
			icon: withoutParticipants > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-users',
			tone: withoutParticipants > 0 ? 'warning' : 'success'
		});

		return insights;
	});

	const chartValueLabelsPlugin = {
		afterDatasetsDraw(chart: any) {
			const ctx = chart.ctx;
			ctx.save();
			ctx.fillStyle = '#24455c';
			ctx.font = '600 13px Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';

			chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
				const meta = chart.getDatasetMeta(datasetIndex);
				if (meta.hidden) return;

				meta.data.forEach((element: any, index: number) => {
					const value = dataset.data[index];
					if (value === null || value === undefined) return;
					const position = element.tooltipPosition();
					ctx.fillText(String(value), position.x, position.y - 8);
				});
			});

			ctx.restore();
		}
	};

	function createBarGradient(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return '#7ecdf3';
		const height = canvas.getBoundingClientRect().height || 360;
		const gradient = ctx.createLinearGradient(0, 56, 0, height - 44);
		gradient.addColorStop(0, '#8bd3f5');
		gradient.addColorStop(1, '#6bc3ec');
		return gradient;
	}

	function buildBarChartConfig(
		canvas: HTMLCanvasElement,
		title: string,
		data: Array<{ label: string; value: number }>,
		options: { rotateLabels?: boolean } = {}
	) {
		const rotateLabels = options.rotateLabels ?? data.length > 6;

		return {
			type: 'bar',
			data: {
				labels: data.map((item) => item.label),
				datasets: [
					{
						label: title,
						data: data.map((item) => item.value),
						backgroundColor: createBarGradient(canvas),
						borderColor: '#55bcea',
						borderWidth: 1,
						hoverBackgroundColor: '#9addf7',
						barPercentage: data.length > 10 ? 0.62 : 0.55,
						categoryPercentage: data.length > 10 ? 0.8 : 0.7
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: {
						top: 14,
						right: 18,
						bottom: rotateLabels ? 22 : 8,
						left: 8
					}
				},
				title: {
					display: true,
					text: title,
					fontColor: '#333333',
					fontSize: 22,
					fontStyle: '600',
					padding: 22
				},
				legend: {
					display: false
				},
				tooltips: {
					backgroundColor: 'rgba(36, 69, 92, 0.9)',
					callbacks: {
						label: (tooltipItem: any) => `${tooltipItem.yLabel}`
					}
				},
				scales: {
					xAxes: [
						{
							gridLines: {
								color: 'rgba(0, 0, 0, 0.08)',
								zeroLineColor: 'rgba(0, 0, 0, 0.18)'
							},
							ticks: {
								autoSkip: false,
								fontColor: '#707070',
								fontSize: 12,
								maxRotation: rotateLabels ? 45 : 0,
								minRotation: rotateLabels ? 35 : 0,
								padding: 10
							}
						}
					],
					yAxes: [
						{
							gridLines: {
								color: 'rgba(0, 0, 0, 0.08)',
								zeroLineColor: 'rgba(0, 0, 0, 0.18)'
							},
							ticks: {
								beginAtZero: true,
								precision: 0,
								fontColor: '#707070',
								fontSize: 12,
								padding: 8
							}
						}
					]
				}
			},
			plugins: [chartValueLabelsPlugin]
		};
	}

	function buildDoughnutChartConfig(title: string, data: Array<{ label: string; value: number }>) {
		return {
			type: 'doughnut',
			data: {
				labels: data.map((item) => `${item.label} (${item.value})`),
				datasets: [
					{
						data: data.map((item) => item.value),
						backgroundColor: ['#6bc3ec', '#f08da8', '#f3c34d', '#6ec6a8'],
						borderColor: '#ffffff',
						borderWidth: 2,
						hoverBorderColor: '#ffffff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutoutPercentage: 58,
				layout: {
					padding: {
						top: 14,
						right: 16,
						bottom: 8,
						left: 16
					}
				},
				title: {
					display: true,
					text: title,
					fontColor: '#333333',
					fontSize: 22,
					fontStyle: '600',
					padding: 22
				},
				legend: {
					display: true,
					position: 'bottom',
					labels: {
						fontColor: '#707070',
						boxWidth: 22,
						padding: 14
					}
				},
				tooltips: {
					backgroundColor: 'rgba(36, 69, 92, 0.9)'
				}
			}
		};
	}

	function createChart(canvas: HTMLCanvasElement, config: any) {
		const ctx = canvas.getContext('2d');
		if (!ctx || !chartJs) return null;
		return new chartJs(ctx, config);
	}

	function renderCharts() {
		if (!chartJs || !typeChartElement || !pedagogicalAreaChartElement || !companyChartElement) return;

		disposeCharts();

		typeChart = createChart(
			typeChartElement,
			buildBarChartConfig(
				typeChartElement,
				$t('gestao_formacoes.dashboard.charts_by_type'),
				typeChartData
			)
		);
		pedagogicalAreaChart = createChart(
			pedagogicalAreaChartElement,
			buildDoughnutChartConfig(
				$t('gestao_formacoes.dashboard.charts_by_pedagogical_area'),
				pedagogicalAreaChartData
			)
		);
		companyChart = createChart(
			companyChartElement,
			buildBarChartConfig(
				companyChartElement,
				$t('gestao_formacoes.dashboard.charts_by_company'),
				companyChartData,
				{ rotateLabels: companyChartData.length > 6 }
			)
		);
	}

	async function scheduleRenderCharts() {
		if (!showCharts) return;
		await tick();
		renderCharts();
	}

	function disposeCharts() {
		typeChart?.destroy();
		pedagogicalAreaChart?.destroy();
		companyChart?.destroy();
		typeChart = null;
		pedagogicalAreaChart = null;
		companyChart = null;
	}

	async function fetchJson(url: string, init: RequestInit = {}) {
		const res = await fetch(url, {
			...init,
			headers: {
				...(init.headers ?? {}),
				'Content-Type': 'application/json'
			}
		});

		const text = await res.text();
		if (!res.ok) {
			throw new Error(text || res.statusText);
		}
		return text ? JSON.parse(text) : null;
	}

	function getRequestErrorMessage(err: unknown, fallback: string) {
		if (!(err instanceof Error) || !err.message) return fallback;

		try {
			const parsed = JSON.parse(err.message);
			if (typeof parsed === 'string') return parsed;
			if (typeof parsed?.message === 'string') return parsed.message;
			if (Array.isArray(parsed?.message) && parsed.message.length) return String(parsed.message[0]);
		} catch {
			return err.message || fallback;
		}

		return err.message || fallback;
	}

	async function refreshAcoes() {
		const data = await fetchJson('/ep/gestao_formacoes/acoes_formacao');
		acoes = Array.isArray(data) ? data : [];
		updateTable();
		scheduleRenderCharts();
	}

	function applyFilters() {
		selectedTipoFilter = draftTipoFilter;
		selectedEmpresaFilter = draftEmpresaFilter;
		selectedPedagogicalAreaFilter = draftPedagogicalAreaFilter;
		updateTable();
		scheduleRenderCharts();
	}

	function clearFilters() {
		draftTipoFilter = '';
		draftEmpresaFilter = '';
		draftPedagogicalAreaFilter = 'all';
		applyFilters();
	}

	async function loadEmpresas() {
		isLoadingEmpresas = true;
		try {
			const data = await fetchJson('/ep/gestao_formacoes/empresas?page=1&pageSize=5000');
			empresas = Array.isArray(data?.data) ? data.data : [];
		} catch (err) {
			empresas = [];
			toastr?.error(
				$t('gestao_formacoes.companies.load_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		} finally {
			isLoadingEmpresas = false;
		}
	}

	onMount(() => {
		if (!tableElement) return;

		dtInstance = jQuery(tableElement).DataTable({
			dom: 'Bfrtip',
			responsive: false,
			scrollX: true,
			autoWidth: false,
			buttons: ['pageLength', 'pdf', 'csv', 'excel', 'copy', 'colvis'],
			pageLength: 25,
			order: [[1, 'asc']],
			columns: [
				{ title: 'ID', visible: false },
				{ title: $t('gestao_formacoes.labels.designation') },
				{ title: $t('gestao_formacoes.labels.type') },
				{ title: $t('gestao_formacoes.labels.company') },
				{ title: $t('gestao_formacoes.labels.start_date') },
				{ title: $t('gestao_formacoes.labels.end_date') },
				{ title: $t('gestao_formacoes.labels.pedagogical_area') },
				{ title: $t('gestao_formacoes.acoes_formacao.participants_count') },
				{ title: $t('gestao_formacoes.common.actions'), orderable: false, className: 'dt-body-right' }
			],
			columnDefs: [
				{
					targets: -1,
					render: function (_data: any, _type: any, row: any) {
						const id = row[0];
						return `
							<div class="d-flex justify-content-end">
								<button class="btn btn-sm btn-outline-primary acao-ver-participantes" data-id="${id}" title="${$t('gestao_formacoes.acoes_formacao.view_participants')}">
									<i class="fas fa-eye"></i>
								</button>
								<button class="btn btn-sm btn-outline-info ml-1 acao-associar" data-id="${id}" title="${$t('gestao_formacoes.acoes_formacao.associate_participants')}">
									<i class="fas fa-user-plus"></i>
								</button>
								<button class="btn btn-sm btn-outline-warning ml-1 acao-editar" data-id="${id}" title="${$t('gestao_formacoes.common.edit')}">
									<i class="fas fa-edit"></i>
								</button>
								<button class="btn btn-sm btn-outline-danger ml-1 acao-eliminar" data-id="${id}" title="${$t('gestao_formacoes.common.delete')}">
									<i class="fas fa-trash"></i>
								</button>
							</div>
						`;
					}
				}
			],
			drawCallback: function () {
				jQuery('.datatable-on').parent().removeClass('container-fluid');
			},
			language: $locale === 'pt' ? dt_pt : dt_en
		});

		updateTable();
		loadEmpresas();
		import('chart.js').then((module) => {
			chartJs = module.default ?? module;
			scheduleRenderCharts();
		});

		jQuery(document).on('click', '.acao-ver-participantes', function (event: any) {
			const id = parseInt(jQuery(event.currentTarget).data('id'));
			openParticipantsPage(id);
		});
		jQuery(document).on('click', '.acao-associar', function (event: any) {
			const id = parseInt(jQuery(event.currentTarget).data('id'));
			openAssociatePage(id);
		});
		jQuery(document).on('click', '.acao-editar', function (event: any) {
			const id = parseInt(jQuery(event.currentTarget).data('id'));
			openEditModal(id);
		});
		jQuery(document).on('click', '.acao-eliminar', function (event: any) {
			const id = parseInt(jQuery(event.currentTarget).data('id'));
			openDeleteModal(id);
		});

		const adjustLayout = () => {
			if (dtInstance) {
				dtInstance.columns.adjust();
			}
			if (showCharts) {
				scheduleRenderCharts();
			}
		};

		const scheduleAdjust = () => {
			setTimeout(adjustLayout, 50);
		};

		jQuery(document).on('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
		window.addEventListener('resize', scheduleAdjust);

		return () => {
			jQuery(document).off('click', '.acao-ver-participantes');
			jQuery(document).off('click', '.acao-associar');
			jQuery(document).off('click', '.acao-editar');
			jQuery(document).off('click', '.acao-eliminar');
			jQuery(document).off('click', '.sidebar-toggler, .mobile-sidebar-toggler', scheduleAdjust);
			window.removeEventListener('resize', scheduleAdjust);
			if (dtInstance) {
				dtInstance.destroy();
			}
			disposeCharts();
		};
	});

	async function toggleDashboard() {
		showCharts = !showCharts;
		if (!showCharts) {
			disposeCharts();
			return;
		}
		await scheduleRenderCharts();
	}

	function updateTable() {
		if (!dtInstance) return;

		dtInstance.clear();
		filteredAcoes.forEach((acao) => {
			dtInstance.row.add([
				acao.id,
				acao.designacao ?? '-',
				getTipoNome(acao),
				getEmpresa(acao),
				formatDate(acao.data_inicio),
				formatDate(acao.data_fim),
				formatYesNo(getAreaPedagogica(acao)),
				getNParticipantes(acao),
				null
			]);
		});
		dtInstance.draw();
	}

	function openAssociatePage(id: number) {
		if (!id) {
			toastr.warning(
				$t('gestao_formacoes.acoes_formacao.invalid_action'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		const acao = acoes.find((a) => a.id === id);
		const designacao = acao?.designacao ?? '';
		const query = designacao ? `?designacao=${encodeURIComponent(designacao)}` : '';
		goto(`/gestao_formacoes/acoes_formacao/${id}/participantes${query}`);
	}

	function openParticipantsPage(id: number) {
		if (!id) {
			toastr.warning(
				$t('gestao_formacoes.acoes_formacao.invalid_action'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}
		const acao = acoes.find((a) => a.id === id);
		const designacao = acao?.designacao ?? '';
		const query = designacao
			? `?designacao=${encodeURIComponent(designacao)}&view=associados`
			: '?view=associados';
		goto(`/gestao_formacoes/acoes_formacao/${id}/participantes${query}`);
	}

	function openAddModal() {
		goto('/gestao_formacoes/acoes_formacao/nova_acao');
	}

	function openEditModal(id: number) {
		if (!id) return;
		goto(`/gestao_formacoes/acoes_formacao/editar_acao/${id}`);
	}

	function closeEditModal() {
		isEditModalOpen = false;
	}

	async function handleSave() {
		if (!designacaoInput.trim() || !tipoFormacaoId || !objetivosInput.trim() || !nHorasInput) {
			toastr.warning(
				$t('gestao_formacoes.acoes_formacao.fill_required'),
				$t('gestao_formacoes.toasts.warning')
			);
			return;
		}

		const empresaSelecionada = empresas.find((empresa) => String(empresa.id) === empresaIdInput);
		const payload = {
			designacao: designacaoInput.trim(),
			tipo_formacao_id: Number(tipoFormacaoId),
			objetivos: objetivosInput.trim(),
			n_horas: Number(nHorasInput),
			empresa: empresaSelecionada?.designation ?? null,
			data_inicio: dataInicioInput || null,
			data_fim: dataFimInput || null
		};

		try {
			if (editMode === 'add') {
				await fetchJson('/ep/gestao_formacoes/acoes_formacao', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				toastr.success(
					$t('gestao_formacoes.acoes_formacao.action_added'),
					$t('gestao_formacoes.toasts.success')
				);
			} else {
				await fetchJson(`/ep/gestao_formacoes/acoes_formacao/${editId}`, {
					method: 'PATCH',
					body: JSON.stringify(payload)
				});
				toastr.success(
					$t('gestao_formacoes.acoes_formacao.action_updated'),
					$t('gestao_formacoes.toasts.success')
				);
			}
			await refreshAcoes();
			closeEditModal();
		} catch (err) {
			toastr.error(
				$t('gestao_formacoes.acoes_formacao.action_saved_error'),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		}
	}

	function openDeleteModal(id: number) {
		const acao = acoes.find((a) => a.id === id);
		if (!acao) return;

		deleteId = id;
		deleteTitle = acao.designacao ?? '';
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		deleteId = null;
		deleteTitle = '';
	}

	async function handleDelete() {
		if (deleteId === null) return;
		try {
			await fetchJson(`/ep/gestao_formacoes/acoes_formacao/${deleteId}`, { method: 'DELETE' });
			await refreshAcoes();
			closeDeleteModal();
			toastr.success(
				$t('gestao_formacoes.acoes_formacao.action_deleted'),
				$t('gestao_formacoes.toasts.success')
			);
		} catch (err) {
			toastr.error(
				getRequestErrorMessage(err, $t('gestao_formacoes.acoes_formacao.action_deleted_error')),
				$t('gestao_formacoes.toasts.error')
			);
			console.error(err);
		}
	}
</script>

<div>
	<Breadcrum
		modulo={sidebarOptions.currentModule}
		objeto={sidebarOptions.currentObject}
		menu_items={items_breadcrum}
	/>

	<div class="p-2">
		<div class="filters-panel mb-4">
			<div class="filters-grid filters-grid-actions">
				<div class="form-group mb-0">
					<label for="filter-tipo" class="filters-label">{$t('gestao_formacoes.dashboard.filter_type')}</label>
					<select id="filter-tipo" class="form-control filters-select" bind:value={draftTipoFilter}>
						<option value="">{$t('gestao_formacoes.common.all')}</option>
						{#each tipoFilterOptions as tipo}
							<option value={tipo}>{tipo}</option>
						{/each}
					</select>
				</div>
				<div class="form-group mb-0">
					<label for="filter-empresa" class="filters-label">{$t('gestao_formacoes.dashboard.filter_company')}</label>
					<select id="filter-empresa" class="form-control filters-select" bind:value={draftEmpresaFilter}>
						<option value="">{$t('gestao_formacoes.common.all')}</option>
						{#each empresaFilterOptions as empresa}
							<option value={empresa}>{empresa}</option>
						{/each}
					</select>
				</div>
				<div class="form-group mb-0">
					<label for="filter-area-pedagogica" class="filters-label">{$t('gestao_formacoes.labels.pedagogical_area')}</label>
					<select id="filter-area-pedagogica" class="form-control filters-select" bind:value={draftPedagogicalAreaFilter}>
						<option value="all">{$t('gestao_formacoes.common.all')}</option>
						<option value="yes">{$t('gestao_formacoes.labels.yes')}</option>
						<option value="no">{$t('gestao_formacoes.labels.no')}</option>
					</select>
				</div>
				<div class="form-group mb-0 filters-submit-wrap">
					<span class="filters-label filters-label-placeholder">Aplicar</span>
					<button
						type="button"
						class="btn filters-search-btn"
						onclick={applyFilters}
						aria-label="Aplicar filtros"
					>
						<i class="fas fa-search"></i>
					</button>
				</div>
			</div>

		</div>

		<div class="dashboard-grid mb-4">
			<div class="stat-card">
				<div class="stat-label">{$t('gestao_formacoes.dashboard.total_formacoes')}</div>
				<div class="stat-value">{formatMetric(dashboardStats.totalFormacoes)}</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">{$t('gestao_formacoes.dashboard.avg_participants')}</div>
				<div class="stat-value">{formatMetric(dashboardStats.avgParticipants)}</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">{$t('gestao_formacoes.dashboard.avg_duration_days')}</div>
				<div class="stat-value">{formatMetric(dashboardStats.avgDuration)}</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">{$t('gestao_formacoes.dashboard.distinct_companies')}</div>
				<div class="stat-value">{formatMetric(dashboardStats.distinctCompanies)}</div>
			</div>
		</div>

		<div class="ai-insights-panel mb-4">
			<div class="ai-insights-header">
				<div>
					<div class="ai-kicker">{translate('Deteção de padrões', 'Pattern detection')}</div>
					<h3>{translate('Análise inteligente', 'Intelligent analysis')}</h3>
					<p>{translate('Interpretação automática dos padrões encontrados nos dados filtrados.', 'Automatic interpretation of patterns found in the filtered data.')}</p>
				</div>
				<div class="ai-badge" aria-label={translate('Inteligência artificial', 'Artificial intelligence')}>
					<i class="fas fa-chart-line" aria-hidden="true"></i>
					<span>IA</span>
				</div>
			</div>
			<div class="ai-summary">
				<div>
					<div class="ai-summary-label">{dashboardAiSummary.title}</div>
					<p>{dashboardAiSummary.text}</p>
				</div>
				<span>{dashboardAiSummary.confidence}</span>
			</div>
			<div class="ai-insights-grid">
				{#each dashboardInsights as insight}
					<div class={`ai-insight-card ai-insight-${insight.tone}`}>
						<div class="ai-insight-icon" aria-hidden="true">
							<i class={insight.icon}></i>
						</div>
						<div class="ai-insight-content">
							<div class="ai-insight-title">{insight.title}</div>
							<div class="ai-insight-value">{insight.value}</div>
							<p><strong>{translate('Conclusão:', 'Conclusion:')}</strong> {insight.text}</p>
							<p><strong>{translate('Recomendação:', 'Recommendation:')}</strong> {insight.recommendation}</p>
							<div class="ai-confidence">{insight.confidence}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="dashboard-toggle-wrap mb-4">
			<button
				type="button"
				class={`btn btn-onipvc-dashboard ${showCharts ? 'is-active' : ''}`}
				onclick={toggleDashboard}
			>
				{$t('gestao_formacoes.dashboard.toggle_dashboard')}
				<span class="btn-caret"></span>
			</button>
		</div>

		{#if showCharts}
			<div class="chart-grid mb-4">
				<div class="chart-card">
					<div class="chart-icon" aria-hidden="true"><i class="fas fa-chart-pie"></i></div>
					<div class="chart-help" aria-label="Informação do gráfico">?</div>
					<div class="chart-host">
						<canvas class="chart-canvas" bind:this={typeChartElement}></canvas>
					</div>
				</div>
				<div class="chart-card">
					<div class="chart-icon" aria-hidden="true"><i class="fas fa-chart-pie"></i></div>
					<div class="chart-help" aria-label="Informação do gráfico">?</div>
					<div class="chart-host">
						<canvas class="chart-canvas" bind:this={pedagogicalAreaChartElement}></canvas>
					</div>
				</div>
				<div class="chart-card chart-card-wide">
					<div class="chart-icon" aria-hidden="true"><i class="fas fa-chart-pie"></i></div>
					<div class="chart-help" aria-label="Informação do gráfico">?</div>
					<div class="chart-host">
						<canvas class="chart-canvas" bind:this={companyChartElement}></canvas>
					</div>
				</div>
			</div>
		{/if}

		<div class="row tableresponsive">
			<div class="table-responsive p-3">
				<table
					bind:this={tableElement}
					class="datatable-on table-striped hover datatable table-sm nowrap no-footer dtr-inline"
				>
					<tbody></tbody>
				</table>
			</div>
		</div>
	</div>
</div>

{#if isEditModalOpen}
	<div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{editMode === 'add' ? $t('gestao_formacoes.acoes_formacao.new_title') : $t('gestao_formacoes.acoes_formacao.edit_title')}</h5>
					<button type="button" class="close" onclick={closeEditModal}><span>&times;</span></button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="designacao">{$t('gestao_formacoes.labels.designation')} <span class="text-danger">*</span></label>
						<input class="form-control" id="designacao" type="text" bind:value={designacaoInput} />
					</div>
					<div class="form-group">
						<label for="tipo_formacao">{$t('gestao_formacoes.labels.type')} <span class="text-danger">*</span></label>
						<select class="form-control" id="tipo_formacao" bind:value={tipoFormacaoId}>
							<option value="">{$t('gestao_formacoes.common.select')}</option>
							{#each tiposFormacao as tipo}
								<option value={String(tipo.id)}>{tipo.designacao}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="objetivos">{$t('gestao_formacoes.labels.objectives')} <span class="text-danger">*</span></label>
						<textarea class="form-control" id="objetivos" rows="2" bind:value={objetivosInput}></textarea>
					</div>
					<div class="form-group">
						<label for="n_horas">{$t('gestao_formacoes.labels.hours')} <span class="text-danger">*</span></label>
						<input class="form-control" id="n_horas" type="number" min="1" bind:value={nHorasInput} />
					</div>
					<div class="form-group">
						<label for="empresa">{$t('gestao_formacoes.labels.company')}</label>
						<select class="form-control" id="empresa" bind:value={empresaIdInput} disabled={isLoadingEmpresas}>
							<option value="">{$t('gestao_formacoes.common.select')}</option>
							{#each empresas as empresa}
								<option value={String(empresa.id)}>{empresa.designation}</option>
							{/each}
						</select>
					</div>
					<div class="form-row">
						<div class="form-group col-md-6">
							<label for="data_inicio">{$t('gestao_formacoes.labels.start_date_label')}</label>
							<input class="form-control" id="data_inicio" type="date" bind:value={dataInicioInput} />
						</div>
						<div class="form-group col-md-6">
							<label for="data_fim">{$t('gestao_formacoes.labels.end_date_label')}</label>
							<input class="form-control" id="data_fim" type="date" bind:value={dataFimInput} />
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeEditModal}>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="button" class="btn btn-primary" onclick={handleSave}>{$t('gestao_formacoes.common.save')}</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isDeleteModalOpen}
	<div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{$t('gestao_formacoes.acoes_formacao.delete_title')}</h5>
					<button type="button" class="close" onclick={closeDeleteModal}><span>&times;</span></button>
				</div>
				<div class="modal-body">
					<p>{$t('gestao_formacoes.acoes_formacao.delete_confirm')} <strong>{deleteTitle}</strong>?</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onclick={closeDeleteModal}>{$t('gestao_formacoes.common.cancel')}</button>
					<button type="button" class="btn btn-danger" onclick={handleDelete}>{$t('gestao_formacoes.common.delete')}</button>
				</div>
			</div>
		</div>
	</div>
{/if}

	<style>
		.filters-panel {
			background:
				radial-gradient(circle at 78% 96%, rgba(117, 214, 191, 0.18), transparent 18%),
				linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
			border: 1px solid #e5edf3;
			border-radius: 0;
			box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.04);
			padding: 0.45rem 0.45rem 0.85rem;
		}

		.filters-grid {
			display: grid;
			grid-template-columns: repeat(5, minmax(0, 1fr));
			gap: 1rem;
		}

		.filters-grid-actions {
			grid-template-columns: repeat(3, minmax(160px, 1fr)) 100px;
			align-items: end;
			gap: 0.8rem;
		}

		.filters-label {
			color: #9cd7ee;
			font-size: 0.76rem;
			font-weight: 600;
			margin-bottom: 0.32rem;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			display: block;
		}

		.filters-label-placeholder {
			opacity: 0;
			user-select: none;
		}

		.filters-panel .form-control,
		.filters-search-btn {
			height: 34px;
			border: 1px solid #c8d3db;
			border-radius: 2px;
			box-shadow: none;
			font-size: 0.88rem;
			color: #657b89;
			font-weight: 400;
		}

		.filters-panel .form-control:focus {
			border-color: #63c0e3;
			box-shadow: 0 0 0 0.12rem rgba(99, 192, 227, 0.1);
		}

		.filters-select {
			appearance: none;
			background:
				linear-gradient(45deg, transparent 50%, #6a7d89 50%) calc(100% - 18px) 54% / 6px 6px no-repeat,
				linear-gradient(135deg, #6a7d89 50%, transparent 50%) calc(100% - 13px) 54% / 6px 6px no-repeat,
				linear-gradient(to right, #ffffff, #ffffff);
			padding-right: 2rem;
		}

		.filters-submit-wrap {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
		}

		.filters-search-btn {
			width: 100%;
			background: #59bee4;
			border-color: #59bee4;
			color: #fff;
			font-size: 1rem;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0;
		}

		.filters-search-btn:hover,
		.filters-search-btn:focus {
			background: #43afd9;
			border-color: #43afd9;
			color: #fff;
		}

		.btn-onipvc-dashboard,
		.btn-onipvc-secondary {
			height: 36px;
			padding: 0.4rem 0.9rem;
			font-size: 0.86rem;
			font-weight: 600;
			background: #fff;
			box-shadow: none;
		}

		.btn-onipvc-dashboard {
			border: 1px solid #bfcbd3;
			border-radius: 4px;
			color: #516774;
		}

		.btn-onipvc-dashboard:hover,
		.btn-onipvc-dashboard:focus {
			background: #f5fbfe;
			color: #26323a;
		}

		.btn-onipvc-dashboard.is-active {
			border: 2px solid #2f3b44;
			color: #2f3b44;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		}

		.btn-onipvc-secondary {
			border: 1px solid #c0ccd3;
			border-radius: 3px;
			color: #5b717f;
		}

		.btn-onipvc-secondary:hover,
		.btn-onipvc-secondary:focus {
			background: #f7fbfd;
			color: #47697d;
		}

		.btn-caret {
			display: inline-block;
			margin-left: 0.45rem;
			width: 0;
			height: 0;
			border-left: 4px solid transparent;
			border-right: 4px solid transparent;
			border-top: 6px solid currentColor;
			vertical-align: middle;
		}

		.dashboard-toggle-wrap {
			display: flex;
			justify-content: flex-start;
			margin-bottom: 2.2rem !important;
		}

		.dashboard-toggle-wrap .btn-onipvc-dashboard {
			height: 42px;
			padding: 0.45rem 1rem;
		}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: linear-gradient(180deg, #ffffff 0%, #ccecfb 100%);
		border: 1px solid #d9e6ee;
		border-radius: 4px;
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
		padding: 1.2rem 1.35rem;
		min-height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition:
			border-color 0.18s ease,
			box-shadow 0.18s ease,
			transform 0.18s ease;
		cursor: default;
	}

	.stat-card:hover {
		border: 2px solid #2f3b44;
		box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
		transform: translateY(-1px);
	}

		.stat-label {
			color: #5d7280;
			font-size: 0.9rem;
			font-weight: 500;
		}

		.stat-value {
			color: #425f70;
			font-size: 1.95rem;
			font-weight: 700;
			line-height: 1;
		}

	.ai-insights-panel {
		background: #ffffff;
		border: 1px solid #c9d6df;
		border-radius: 4px;
		box-shadow: 0 6px 14px rgba(47, 67, 82, 0.12);
		padding: 1.2rem;
	}

	.ai-insights-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.ai-kicker {
		color: #36b7cf;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.ai-insights-header h3 {
		margin: 0.15rem 0 0.25rem;
		color: #24455c;
		font-size: 1.1rem;
		font-weight: 700;
	}

	.ai-insights-header p {
		margin: 0;
		color: #687f8d;
		font-size: 0.88rem;
	}

	.ai-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		border-radius: 4px;
		background: #e8f8fc;
		color: #247a8c;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.45rem 0.65rem;
		white-space: nowrap;
	}

	.ai-summary {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		border: 1px solid #cdeaf3;
		border-left: 4px solid #36b7cf;
		border-radius: 4px;
		background: #f3fbfe;
		padding: 0.95rem 1rem;
		margin-bottom: 1rem;
	}

	.ai-summary-label {
		color: #24455c;
		font-size: 0.88rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.ai-summary p {
		margin: 0.25rem 0 0;
		color: #496474;
		font-size: 0.9rem;
		line-height: 1.45;
	}

	.ai-summary span {
		flex: 0 0 auto;
		border-radius: 4px;
		background: #ffffff;
		color: #247a8c;
		font-size: 0.78rem;
		font-weight: 700;
		padding: 0.35rem 0.55rem;
		white-space: nowrap;
	}

	.ai-insights-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.ai-insight-card {
		display: flex;
		gap: 0.75rem;
		min-height: 172px;
		border: 1px solid #dbe6ec;
		border-left: 4px solid #36b7cf;
		border-radius: 4px;
		background: #fbfdfe;
		padding: 0.9rem;
	}

	.ai-insight-icon {
		width: 34px;
		height: 34px;
		flex: 0 0 34px;
		border-radius: 4px;
		background: #36b7cf;
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.95rem;
	}

	.ai-insight-title {
		color: #5d7280;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.ai-insight-value {
		color: #24455c;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
		margin: 0.2rem 0;
		word-break: break-word;
	}

	.ai-insight-content p {
		margin: 0.25rem 0 0;
		color: #526b79;
		font-size: 0.82rem;
		line-height: 1.35;
	}

	.ai-insight-content p strong {
		color: #24455c;
		font-weight: 700;
	}

	.ai-confidence {
		display: inline-flex;
		margin-top: 0.55rem;
		border-radius: 4px;
		background: #eef7fb;
		color: #247a8c;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.45rem;
	}

	.ai-insight-success {
		border-left-color: #5bbf91;
	}

	.ai-insight-success .ai-insight-icon {
		background: #5bbf91;
	}

	.ai-insight-warning {
		border-left-color: #f0b84d;
	}

	.ai-insight-warning .ai-insight-icon {
		background: #f0b84d;
	}

	.ai-insight-muted {
		border-left-color: #95a9b5;
	}

	.ai-insight-muted .ai-insight-icon {
		background: #95a9b5;
	}

	.chart-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.1rem 1.5rem;
	}

	.chart-card {
		position: relative;
		background: #ffffff;
		border: 1px solid #c9d6df;
		border-radius: 4px;
		box-shadow: 0 6px 14px rgba(47, 67, 82, 0.16);
		padding: 2.7rem 1.1rem 1rem;
		min-height: 410px;
	}

	.chart-card-wide {
		grid-column: 1 / -1;
	}

	.chart-icon {
		position: absolute;
		top: -20px;
		left: 1.2rem;
		width: 58px;
		height: 58px;
		border-radius: 3px;
		background: #36b7cf;
		box-shadow: 0 8px 16px rgba(54, 183, 207, 0.28);
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.7rem;
	}

	.chart-help {
		position: absolute;
		top: -1px;
		right: 1rem;
		width: 36px;
		height: 34px;
		border: 1px solid #e3e8ec;
		border-radius: 2px;
		background: #f6f8fa;
		color: #111111;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1;
	}

	.chart-host {
		width: 100%;
		height: 360px;
	}

	.chart-card-wide .chart-host {
		height: 430px;
	}

	.chart-canvas {
		width: 100% !important;
		height: 100% !important;
	}

		@media (max-width: 1199px) {
			.filters-grid-actions {
				grid-template-columns: repeat(3, minmax(0, 1fr));
			}

			.dashboard-grid {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}

			.ai-insights-grid {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
	}

	@media (max-width: 767px) {
		.filters-grid,
		.dashboard-grid,
		.ai-insights-grid,
		.chart-grid {
			grid-template-columns: 1fr;
		}

			.ai-insights-header {
				flex-direction: column;
			}

			.ai-summary {
				flex-direction: column;
			}

			.dashboard-toggle-wrap {
				justify-content: stretch;
			}

		.chart-host {
			height: 320px;
		}
	}
</style>
