<script>
    import { onMount } from 'svelte';
    import {locale, t} from "$lib/translations/translations.js";
    
    /** @type {{
     * onchange?: (data: {name: string, value: string | null}) => void,
     * id: string,
     * name: string,
     * options?: any,
     * value?:  string | null ,
     * disabled?:  boolean,
     * allow_clear?: boolean
     * }}
     **/
    let {
        onchange,
        id,
        name,
        options = [],
        value = $bindable(null),
        disabled = false,
        allow_clear = true
    } = $props();

    onMount(() => {
        //@ts-ignore
        jQuery(`#${id}`).select2({
            theme: "bootstrap",
            language: (locale.get() === "pt" ? "pt" : "en"),
            placeholder: $t('select.options.single.default'),
            allowClear: allow_clear,
            width: "100%"
        }).on('change', handleOnChange)
    });

    function handleOnChange(event) {
        value = options
            .find(option => String(option.value) === event.currentTarget.value) !== undefined
            ? event.currentTarget.value
            : null;

        if(onchange) {
            onchange({ name, value });
        }
    }
</script>

<select {id}
        {name}
        {disabled}
        class="form-control"
        onchange={handleOnChange}>
    {#if options.length !== 0}
        {#if !value}
            <option selected>{$t('select.options.single.default')}</option>
            {#each options as option}
                <option disabled={option.disabled} value={option.value}>{option.label}</option>
            {/each}
        {:else}
            {#each options as option}
                <option disabled={option.disabled} value={option.value} selected={value === option.value}>{option.label}</option>
            {/each}
        {/if}
    {:else}
        <option selected>{$t('select.options.single.empty')}</option>
    {/if}
</select>



