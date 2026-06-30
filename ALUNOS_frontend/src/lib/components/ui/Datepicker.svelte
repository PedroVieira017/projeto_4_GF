<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { onMount } from "svelte";
	import * as dp_pt from '$lib/translations/pt/daterangepicker.json';
	import * as dp_en from '$lib/translations/en/daterangepicker.json';
	import { locale } from "$lib/translations/translations";

	/** @type {{id?: string, name?: string}} */
	let { id = "", name = "" } = $props();
    /**
	 * @type {null}
	 */

    onMount(function(){
        // @ts-ignore
		jQuery(`#${id}`).daterangepicker({
			singleDatePicker: true,
			showDropdowns: true,
			minYear: 1901,
			maxYear: new Date().getFullYear(),
			timePicker: false,
			timePicker24Hour: false,
			timePickerIncrement: 1,
			timePickerSeconds: false,
			startDate:  new Date(),
			locale: (locale.get() == "pt" ? dp_pt : dp_en)
		});
    })
</script>

<input id={id} class="filtro_datas data_filter form-control" readonly type="text" data-type="date" style="background-color: #fff;" onfocusout={bubble('focusout')} name={name}>