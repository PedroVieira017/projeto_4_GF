<script>
    /** @type {{modulo?: string, objeto?: string, menu_items?: any[]}} */
    let { modulo = "", objeto = "", menu_items = [] } = $props();
</script>
<style>
.botao-breadcrumb-on {
    display: inline-block !important;
    text-align: center !important;
    white-space: nowrap !important;
    vertical-align: middle !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none!important ;
    user-select: none !important;
    border: 1px solid transparent !important;

    line-height: 1.5 !important;
    border-radius: .35rem !important; 
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out !important;
}

.botao-breadcrumb-on {
    color: #fff !important;
    background-color:#20a8d8 !important;
    background-image: none;
    border-color: #20a8d8 !important;
}

.botao-breadcrumb-on:not(:disabled):not(.disabled).active, .btn-outline-primary:not(:disabled):not(.disabled):active, .show>.btn-outline-primary.dropdown-toggle {
    color: #20a8d8 !important;
    background-color: #fff !important;
    border-color: #fff !important;
}

.botao-breadcrumb-on:hover {
    color: #20a8d8 !important;
    background-color: #fff !important;
    border-color: #20a8d8 !important;
}


</style>


<ol class="breadcrumb mb-0">
    <li class="breadcrumb-item d-flex align-items-center breadcrumb-module-title d-md-down-none">
        {modulo || ""}
    {#if objeto}
        <span class="separator-disc mx-2">&#8226;</span>
        <span class="module-subtitle">{objeto || ""}</span>
    {/if}
    </li>
    <!-- Breadcrumb Menu-->
    <li class="breadcrumb-menu">
    <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
        {#each menu_items as item}
            {#if item.hasOwnProperty("function")}
                <a data-link="#" onclick={item.function} style="" class="btn botao-breadcrumb-on ml-1 py-1" href="#" role="button" aria-haspopup="true" aria-expanded="false"><i class={item.icon_class}></i> &nbsp; {item.designacao}</a>
            {:else}
                <a data-link="#" style="" class="btn botao-breadcrumb-on ml-1 py-1" target={item.target || undefined} href={item.url} role="button" aria-haspopup="true" aria-expanded="false"><i class={item.icon_class}></i> &nbsp; {item.designacao}</a>
            {/if}
            {/each}
        </div>
    </li>
</ol>