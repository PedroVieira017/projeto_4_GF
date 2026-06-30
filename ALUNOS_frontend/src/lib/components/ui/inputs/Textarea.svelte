<script>
	/** @type {{
	 * onchange?: (data: {name: string, value: string | null}) => void,
	 * id: string,
	 * name: string,
	 * maxLength?: number | null,
	 * minLength?: number | null,
	 * value: string,
	 * disabled?:  boolean
	 * }}
	 **/
	let {
		onchange,
		id,
		name,
		value = $bindable(""),
		maxLength = null,
		minLength = null,
		disabled = false
	} = $props();

	function handleOnChange() {
		if (onchange) {
			onchange({ name, value });
		}
	}
</script>

<div class="d-flex flex-column">
	<textarea
		{id}
		{name}
		{disabled}
		minlength={minLength}
		maxLength={maxLength}
		bind:value={value}
		onchange={handleOnChange}
		class="form-control">
	</textarea>

	{#if maxLength || minLength}
		<small class="{(minLength && value.length < minLength) ? 'text-danger' : 'text-primary'} align-self-end mt-1">
			{#if maxLength && minLength}
				{value.length}/{maxLength}
			{:else if maxLength}
				{value.length}/{maxLength}
			{:else if minLength && value.length < minLength}
				{value.length}
			{/if}
		</small>
	{/if}
</div>