<script>
	/** @type {{
	 * onchange?: (data: {name: string, value: string | null}) => void,
	 * name: string,
	 * options: {
	 * 	label: string,
	 * 	value: string | number
	 * }[],
	 * value?:  string | null ,
	 * disabled?:  boolean
	 * }}
	 **/
	let {
		onchange,
		name,
		options = [],
		value = $bindable(null),
		disabled = false
	} = $props();

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

<div class="form-group">
	{#each options as option, i}
		<div class="form-check">
			<input class="form-check-input"
						 type="radio"
						 value={option.value}
						 id={`${name}_${i}`}
						 name={name}
						 disabled={disabled}
						 onchange={handleOnChange}>
			<label class="form-check-label" for={`${name}_${i}`}>
				{option.label}
			</label>
		</div>
	{/each}
</div>