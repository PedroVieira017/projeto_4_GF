<script>
	/**
	 * @typedef { "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" } FlagType
	 * Represents the types of flags variations available.
	 */

	/** @type {{
		 * 		steps: {
		 * 		 value: string,
		 * 		 title: string,
		 * 		 description: string,
		 * 		 flag?: {
		 * 		   title: string,
		 * 		   type: FlagType
		 * 		 }
		 * 		},
		 * 		currentStep: string
		 * }}
		 **/
    let {
			steps,
			currentStep
		} = $props();
</script>

<div>
	{#each steps as {value, title, description, flag}, index}
		<div class="position-relative py-4 px-3 {index <= steps.findIndex(step => step.value === currentStep) ? 'step' : 'step-pending'}">
			<div class="step-icon {value === currentStep ? 'status-current blinker' : 'status-intransit'}">
				<svg class="svg-inline--fa fa-circle fa-w-16"
						 aria-hidden="true"
						 data-prefix="fas"
						 data-icon="circle"
						 role="img"
						 xmlns="http://www.w3.org/2000/svg"
						 viewBox="0 0 512 512"
						 data-fa-i2svg="">
					<path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path>
				</svg>
			</div>

			<div class="step-content">{title}
				{#if description}
					<span class="text-sm">{description}</span>
				{/if}

				{#if flag}
					<span class={`text-sm text-${flag.type}`}>{flag.title}</span>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
    .step {
        border-left: 4px solid #20a8d8;
    }
    .step-content span {
        display: block;
        color: #767676;
    }
    .step .step-icon {
        position: absolute;
        left: -0.7rem;
        width: 1.1rem;
        height: 1.1rem;
        text-align: center;
        border-radius: 50%;
        font-size: 1.1rem;
        background-color: #fff;
        color: #fff;
    }

    .step-pending {
        border-left: 4px solid #d6d6d6;
    }
    .step-pending .step-icon {
        line-height: 2.6rem;
        position: absolute;
        left: -0.7rem;
        width: 1.1rem;
        height: 1.1rem;
        text-align: center;
        border-radius: 50%;
        font-size: 1.1rem;
        color: #d6d6d6;
    }
    .step .step-icon.status-current {
        width: 1.9rem;
        height: 1.9rem;
        left: -1.1rem;
    }
    .step .step-icon.status-intransit {
        color: #20a8d8;
        font-size: 0.6rem;
    }
    .step .step-icon.status-current {
        color: #20a8d8;
        font-size: 0.6rem;
    }

    .blinker {
        border: 7px solid #ebf6fa;
        animation: blink 1s;
        animation-iteration-count: infinite;
    }
    @keyframes blink { 50% { border-color:#fff ; }  }

</style>