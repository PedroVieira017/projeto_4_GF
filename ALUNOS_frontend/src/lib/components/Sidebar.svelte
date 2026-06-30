<script>
	import { page } from '$app/stores';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
    import { t } from '$lib/translations/translations';
	import { setupTranslations } from './Sidebar_translations';
     
    /** @type {{areas?: any[] | false | null, modulos?: any[] | false | null, titulo?: string | null}} */
    let { areas, modulos, titulo } = $props();

    if(Array.isArray(areas) && areas.length === 0) areas = false;

    const gestaoFormacoesAdmin = [
        { id_objeto: 1, ficheiro: '/gestao_formacoes/tipos_formacao', descricao: 'Tipos de Formação', labelKey: 'gestao_formacoes.sidebar.tipos_formacao' },
        { id_objeto: 2, ficheiro: '/gestao_formacoes/acoes_formacao', descricao: 'Ações de Formação', labelKey: 'gestao_formacoes.sidebar.acoes_formacao' },
        { id_objeto: 3, ficheiro: '/gestao_formacoes/participantes', descricao: 'Participantes', labelKey: 'gestao_formacoes.sidebar.participantes' },
        { id_objeto: 4, ficheiro: '/gestao_formacoes/validacao', descricao: 'Validação', labelKey: 'gestao_formacoes.sidebar.validacao' }
    ];
    const gestaoFormacoesAluno = [
        { id_objeto: 5, ficheiro: '/gestao_formacoes/minhas_formacoes', descricao: 'As Minhas Formações', labelKey: 'gestao_formacoes.sidebar.minhas_formacoes' }
    ];

    const resolvedAreas = $derived(() => {
        const pageAreas = $page?.data?.areas;
        if (Array.isArray(areas)) return areas;
        if (Array.isArray(pageAreas)) return pageAreas;
        return areas;
    });

    const areasForRender = $derived(() => resolvedAreas);
    const isGestaoFormacoes = $derived(() => $page?.url?.pathname?.startsWith('/gestao_formacoes'));

    $effect(() => {
        setupTranslations(modulos, areasForRender);
    });

    const normalizeText = (/** @type {string} */ value) =>
        value
            ? value
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
            : '';

    const normalizeRole = (/** @type {string} */ value) => {
        const normalized = normalizeText(value);
        if (normalized.includes('aluno') || normalized.includes('student')) return 'aluno';
        if (normalized.includes('admin')) return 'admin';
        return '';
    };

    const resolveObjectRole = (/** @type {{ grupo?: string; perfil?: string; role?: string; tipo_perfil?: string; tipoPerfil?: string; descricao?: string }} */ obj) => {
        const explicit =
            obj?.grupo ??
            obj?.perfil ??
            obj?.role ??
            obj?.tipo_perfil ??
            obj?.tipoPerfil ??
            '';
        const normalizedExplicit = normalizeRole(explicit);
        if (normalizedExplicit) return normalizedExplicit;

        const label = normalizeText(obj?.descricao || '');
        if (label.includes('minhas formacoes')) return 'aluno';

        return '';
    };

    const splitAreasByRole = (/** @type {any[]} */ inputAreas) => {
        if (!Array.isArray(inputAreas)) return inputAreas;

        return inputAreas.flatMap((area) => {
            if (!Array.isArray(area?.objetos)) return [area];

            const alunoObjs = area.objetos.filter((obj) => resolveObjectRole(obj) === 'aluno');
            if (!alunoObjs.length) return [area];

            const adminObjs = area.objetos.filter((obj) => resolveObjectRole(obj) !== 'aluno');
            const grouped = [];

            if (adminObjs.length) {
                grouped.push({ ...area, objetos: adminObjs, __titleKey: 'sidebar.admin' });
            }
            if (alunoObjs.length) {
                grouped.push({ ...area, objetos: alunoObjs, __titleKey: 'sidebar.aluno' });
            }

            return grouped;
        });
    };

    const normalizedAreas = $derived(() => splitAreasByRole(areasForRender));

    let idx_area = $state(0);
    /** * @param {number} id */
    function changeObject(id){
        if(normalizedAreas && Array.isArray(normalizedAreas))
            normalizedAreas.forEach((area, idx_a) => {
                if(area.hasOwnProperty("objetos") && area.objetos.length){
                    area.objetos.forEach((/** @type {any} */ obj, /** @type {number} */ idx) => {
                        if(obj.id_objeto == id){
                            idx_area = idx_a;
                            return 2;
                        }
                    })
                }
            });
    }
    $effect(() => {
        changeObject(sidebarOptions.currentObjectId);
    });

</script>

<link rel="stylesheet" href="/internal/css/module_sidebar.css">

<div class="sidebar">
  <nav class="sidebar-nav">
    <ul class="nav">
        <li class="nav-title">
            {$t("sidebar.modulo")}
            <div style="font-weight: bolder;"><a id="link-module-dashboard" href="#">{@html isGestaoFormacoes ? $t('gestao_formacoes.module') : (titulo || "<br>")}</div>
        </li>
        
        {#if isGestaoFormacoes}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle" href="#"><b>{$t("sidebar.admin")}</b></a>
                <ul class="nav-dropdown-items striped-list show">
                    {#each gestaoFormacoesAdmin as obj}
                        <li class="nav-item nav-item-module" style="padding: 0; margin: 0; overflow-y: hidden;">
                            <a href="{obj.ficheiro}" class="nav-link link-other-modules {obj.id_objeto == sidebarOptions.currentObjectId ? 'active' : ''}" data-sveltekit-preload-data="off" data-version="">
                                <i class="fa fa-circle dot-op-module"></i> {obj.labelKey ? $t(obj.labelKey) : obj.descricao}
                            </a>
                        </li>
                    {/each}
                </ul>
            </li>
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle" href="#"><b>{$t("sidebar.aluno")}</b></a>
                <ul class="nav-dropdown-items striped-list show">
                    {#each gestaoFormacoesAluno as obj}
                        <li class="nav-item nav-item-module" style="padding: 0; margin: 0; overflow-y: hidden;">
                            <a href="{obj.ficheiro}" class="nav-link link-other-modules {obj.id_objeto == sidebarOptions.currentObjectId ? 'active' : ''}" data-sveltekit-preload-data="off" data-version="">
                                <i class="fa fa-circle dot-op-module"></i> {obj.labelKey ? $t(obj.labelKey) : obj.descricao}
                            </a>
                        </li>
                    {/each}
                </ul>
            </li>
        {:else if !normalizedAreas && normalizedAreas === null || (Array.isArray(normalizedAreas) && normalizedAreas.length === 0)}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.sem_opcs")}</a>
            </li>
        {:else if !normalizedAreas && normalizedAreas === false}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.a_carregar")}</a>
            </li>
        {:else if Array.isArray(normalizedAreas)}
            {#each normalizedAreas as area, idx}
                {#if area.ativo}
                <li class="nav-item nav-dropdown nav-item-module-title {idx == idx_area ? 'open' : ''}">
                    <a class="nav-link nav-dropdown-toggle" href="#"><b>{area.__titleKey ? $t(area.__titleKey) : $t("sidebar_dyn.area_" + area.id_area)}</b></a>
                    <ul class="nav-dropdown-items striped-list {idx == idx_area ? 'show' : ''}">
                        {#if area.hasOwnProperty("objetos") && area.objetos.length}
                            {#each area.objetos as obj}
                                {#if obj.item_menu && obj.ativo}
                                <li class="nav-item nav-item-module" style="padding: 0; margin: 0; overflow-y: hidden;">
                                    <a href="{obj.ficheiro || "#"}" class="nav-link link-other-modules {obj.id_objeto == sidebarOptions.currentObjectId ? 'active' : ''}"  data-sveltekit-preload-data="off" data-version=""><i class="fa fa-circle dot-op-module"></i> {$t("sidebar_dyn.obj_" + obj.id_objeto)} {#if obj.hasOwnProperty("beta") && obj.beta}<span class="badge badge-info">Beta</span>{/if}</a>
                                </li>
                                {/if}
                            {/each}
                        {/if}
                    </ul>
                </li>
                {/if}
            {/each}
        {:else}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.sem_opcs")}</a>
            </li>
        {/if}

        <li style="height: 20px;"></li>

        {#if !modulos && modulos === null || Array.isArray(modulos) && modulos.length === 0 || !Array.isArray(modulos)}
            <li class="nav-item nav-dropdown nav-item-module-title2">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
                <ul class="nav-dropdown-items striped-list">
                    <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                        <a href="#" class="nav-link link-other-modules" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar.sem_opcs")}</a>
                    </li>   
                </ul>
            </li>
        {:else if !modulos && (modulos === false)}
            <li class="nav-item nav-dropdown nav-item-module-title2">
            <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
            <ul class="nav-dropdown-items striped-list">
                <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                    <a href="#" class="nav-link link-other-modules" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar.a_carregar")}</a>
                </li>   
            </ul>
        </li>
        {:else}
            <li class="nav-item nav-dropdown nav-item-module-title2">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
                <ul class="nav-dropdown-items striped-list">
                    {#each modulos as modulo}
                        {#if modulo.ativo && !$page.url.pathname.includes(modulo.link || "#")}
                            <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                                <a href="{modulo.link || "#"}" class="nav-link link-other-modules" data-sveltekit-preload-data="off" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar_dyn.mod_" + modulo.id_modulo) || "."} {#if modulo.hasOwnProperty("beta") && modulo.beta}<span class="badge badge-info">Beta</span>{/if}</a>
                            </li> 
                        {/if}  
                    {/each}
                </ul>
            </li>
        {/if}
    </ul>
  </nav>
</div>
