<script>
    import { run } from 'svelte/legacy';

    import { PUBLIC_ON_MAIN_URL, PUBLIC_ON_MAIN_URL_BASE } from '$env/static/public';
import { t } from '$lib/translations/translations';
	import { setupTranslations } from './Aside_translations';
    
    /** @type {{modulos?:  any[] | false | null}} */
    let { modulos = [] } = $props();

    run(() => {
        setupTranslations(modulos);
    });
</script>

<aside class="aside-menu" style="margin-top: 53px;">
    <!-- Tab panes -->
    <div class="tab-content">
        <div class="tab-pane active" id="panel-notifications" role="tabpanel">
            {#if !modulos && modulos === null || Array.isArray(modulos) && modulos.length === 0}
                <div class="callout m-0 py-2 text-muted text-center bg-light text-uppercase">
                    <small><b>{$t("aside.sem_opcoes")}</b></small>
                </div>
            {:else if !modulos && modulos === false}
                <div class="callout m-0 py-2 text-muted text-center bg-light text-uppercase">
                    <small><b>{$t("aside.a_carregar")}</b></small>
                </div>
            {:else if Array.isArray(modulos)}
                {#each modulos as modulo}
                    <div class="callout m-0 py-2 text-muted text-center bg-light text-uppercase">
                        <small><b>{$t("aside_dyn.aside_area_" + modulo.designacao.replace(" ", "_"))}</b></small>
                    </div>
                    <hr class="transparent mx-3 my-0">
                    {#each modulo.entradas as opc}
                        <div class="callout callout-{opc.state || "info"} m-0 p-0">
                            <a class="dropdown-item" href="{PUBLIC_ON_MAIN_URL_BASE + opc.url || PUBLIC_ON_MAIN_URL ||"/dash"}">
                                <i class="{opc.icon || "fa fa-info"}"></i> {$t("aside_dyn.aside_opc" + opc.opt.replace(" ", "_"))} <span class='badge badge-{opc.state || "info"}'>{opc.qty || "0"}</span>
                            </a>
                        </div>
                        <hr class="mx-3 my-0">
                    {/each}
                {/each}
            {/if}
            
        </div>
    </div>
</aside>