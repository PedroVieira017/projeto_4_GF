<script>
	import { onMount } from 'svelte';
	import { t, locale } from '$lib/translations/translations.js';

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {(data: {name: string, value: string | null})=> void} [onchange]
	 * @property {string} id
	 * @property {boolean} [disabled]
	 * @property {string} name
	 * @property {string | null} [value]
	 * @property {{
	 * 	label: string,
	 * 	options: {
	 * 	  value: string,
	 * 	  label: string
	 * 	}[]|[]
	 * }[]} group
	 **/
	/**@type {Props}*/
	let {
		class: className,
		onchange,
		id,
		disabled = false,
		name,
		value = $bindable(null),
		group
	} = $props()

	onMount(() => {
		//@ts-ignore
		jQuery(`#${id}`).select2({
			theme: "bootstrap",
			language: (locale.get() === "pt" ? "pt" : "en"),
			placeholder: $t('select.options.single.default'),
			allowClear: true,
			width: "100%"
		}).on('change', (event) => {
			value = event.target.value;
			if(onchange) {
				onchange({ name, value });
			}
		});
	});
</script>

<select id={id}
	disabled={disabled}
	name={name}
	value={value}
	class={`form-control ${className}`}
	data-placeholder={$t('select.options.single.default')}>
	{#if group }
		{#each group as {label, options}}
			<optgroup label={label}>
				{#each options as { value, label }}
					<option value={value}>{label}</option>
				{/each}
			</optgroup>
		{/each}
	{/if}
</select>
