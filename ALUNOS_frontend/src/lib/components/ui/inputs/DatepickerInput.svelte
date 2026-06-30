<script>
	import { onMount } from 'svelte';
	import * as dp_pt from '$lib/translations/pt/daterangepicker.json';
	import * as dp_en from '$lib/translations/en/daterangepicker.json';
	import { locale } from "$lib/translations/translations";

	/**@type {{
	 * class?: string,
	 * onchange?: (event: Event) => void
	 * id: string,
	 * name: string,
	 * value: string
	 }}*/
	let {
		class: className,
		onchange,
		id,
		name,
		value = $bindable(""),
	} = $props()

	onMount(() => {
		/**
		 * When the component mounts, if the value its empty, the input value its set to the current system date,
		 * also format that date into yyyy-mm-dd, otherwise keeps the value passed to the component
		 * */
		value = value === ""
			? new Date().toISOString().slice(0, 10)
			: value

		/**
		 * Init datepicker to the input and append an event listener for listen to changes on the input
		 * and updates the value variable, this is required because the parent its binding that value and
		 * detecting changes for further processing
		 * */
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
			startDate: value,
			locale: (locale.get() === "pt" ? dp_pt : dp_en)
		})
		.on('change', handleOnChange);

		//@ts-ignore
		jQuery(`#${id}`).data('daterangepicker').setStartDate(value);
	})


	/**
	 * Handles the `change` event, updates the value based on the datepicker,
	 * and invokes a callback function if provided.
	 *
	 * @param {Event} event - The change event triggered when the value of an element changes.
	 *
	 * @description
	 * This function retrieves the value of the element identified by the `id` property using jQuery's `.val()` method.
	 * After updating the value, it checks if a `change` callback function is defined, and if so, calls it with the event.
	 *
	 * @requires jQuery - The function uses jQuery to access the element's value.
	 * @requires `change` - An optional callback function that is invoked after the value change.
	 */
	function handleOnChange(event) {
		//@ts-ignore
		value = jQuery(`#${id}`).val() ? jQuery(`#${id}`).val() : value;

		if (onchange) {
			onchange(event);
		}
	}
</script>

<!--
@component
This component exposes an input for date picking.

Bindings:
- value: allows you to bind the input value from the parent component.

Usage:
```html
  <DatepickerInput
    id="id"
    name="name"
    bind:value={value} />
-->

<input {id}
	   {name}
	   class={`form-control bg-white ${className}`}
	   readonly
	   type="text"
	   data-type="date">