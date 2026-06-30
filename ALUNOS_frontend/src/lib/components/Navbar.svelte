<!-- @migration-task Error while migrating Svelte code: Event attribute must be a JavaScript expression, not a string -->
<script>
	import { page } from '$app/stores';
	import { PUBLIC_ON_MAIN_URL } from '$env/static/public';
	import { languageChangedTemp } from '$lib/runes/lang.rune.svelte';
    import { t, locale, locales } from '$lib/translations/translations';

  /**
   * @typedef {Object} Props
   * @property {number} [qnt_notificacoes]
   * @property {string} [nome]
   * @property {any} [id_utilizador]
   */

  /** @type {Props} */
  let { qnt_notificacoes = 0, nome = "", id_utilizador = null } = $props();
  
    const handleChange = (/** @type {string} */ val) => {
        document.cookie = `onipvc_lang=${val};path=/`;
        $page.url.searchParams.set('lang', val)
        //goto(`?${$page.url.searchParams.toString()}`);
        //locale.set(val);
        languageChangedTemp.bool = true
        window.location.reload()
    };

    let navuseroptions = $derived([
        {
            "icon": "fa fa-home",
            "titulo": $t("nav.dropdown.menuvoltar"),
            "url": PUBLIC_ON_MAIN_URL
        }, {
            "icon": "fa fa-tasks",
            "titulo": $t("nav.dropdown.terminarsessao"),
            "url": "/logout"
        }
    ])

    let sidebar = $derived(($page.url.pathname !== "/dash"));
</script>

<header class="app-header navbar">
    {#if sidebar}    
        <button id="toggler-module-mobile" class="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button">
            <span class="navbar-toggler-icon"></span>
        </button>
    {/if}
    <a class="navbar-brand" href={PUBLIC_ON_MAIN_URL}>ON.IPVC</a>
    
    {#if sidebar}   
        <button id="toggler-module" class="navbar-toggler sidebar-toggler d-md-down-none" type="button">
            <span class="navbar-toggler-icon"></span>
        </button>
    {/if}
   
    <ul class="nav navbar-nav ml-auto" style="margin-right: 0px;">
        <div class="btn-toolbar pb-1" role="toolbar">   
            <div class="btn-group">
                <button class="btn btn-light btn-sm dropdown-toggle btn-lang" type="button" data-toggle="dropdown" aria-expanded="false">
                    {$t(`lang.${$locale}`)}
                </button>
                <div id="dropdown-menu-lang" data-sveltekit-preload-data="off" class="dropdown-menu">
                    {#each $locales as value}
                        <a class="dropdown-item" href="#" onclick={() => handleChange(value)} data-value="{value}">{$t(`lang.${value}`)}</a>
                    {/each}
                </div>
                
            </div>
        </div>
        
        <li class="nav-item dropdown">
            <a class="nav-link nav-link" href="#" role="button" data-toggle="dropdown" aria-expanded="false">
                <div class="d-none d-md-block" style="font-size: 12px; float: left; margin-top: 9px; float: left">
                    {nome}
                    <div class="d-none" id="on-user" data-onuser="id">id</div>
                </div>
                <img id="nav-photo-user" src={id_utilizador ? `/ep/uteis/getFotoPerfil?id_utilizador=${id_utilizador}` : '/internal/images/nophoto.png'} class="avatar img-avatar" alt="" onerror={() => {this.src='/internal/images/nophoto.png';}}>
            </a>
            <div class="dropdown-menu dropdown-menu-right">
                <div class="dropdown-header text-center">
                    <strong>{$t("nav.dropdown.titulo")}</strong>
                </div>
                {#each navuseroptions as opc}
                <a class="dropdown-item btn-user-item" data-sveltekit-preload-data="off" href="{opc.url}" data-href="" data-action="">
                    <i class="{opc.icon}"></i> {opc.titulo}
                </a>
                {/each}
            </div>
        </li>
    </ul>

    <!--<button class="navbar-toggler aside-menu-toggler" type="button" style="margin-top: 5px; margin-right: 10px;">
        <div class="navbar-toggler-icon">
            <span id="container-notifications-qty" class="badge badge-pill badge-{!qnt_notificacoes ? "success" : "danger"} badge-nav-messages">
                {qnt_notificacoes}
            </span>
        </div>
    </button>-->
</header>