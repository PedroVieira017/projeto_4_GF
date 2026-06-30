<script>
	/**
	 * @typedef { "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" } BadgeType
	 * Represents the types of badges variations available.
	 *
	 * @component
	 * Badge component for displaying a label with various styles and an optional pill shape.
	 *
	 * @prop {string} title - The text to be displayed within the badge.
	 * @prop {BadgeType} [type="primary"] - Specifies the visual style of the badge based on predefined types. Default is "primary".
	 * @prop {boolean} [pill=true] - If `true`, displays the badge with a rounded "pill" shape. Default is `true`.
	 *
	 * @example
	 * <Badge title="New" type="success" pill={false} />
	 *
	 * @example
	 * <Badge title="Alert" type="danger" />
	 */

	/** @type {{
	 * class?: string,
	 * style?: string,
	 * title: string,
	 * type: BadgeType,
	 * pill?: boolean,
	 * }} */
	let {
		class: className = "",
		style: styleName = "",
		title,
		type,
		pill = false
	} = $props();
</script>

<span class="badge {pill ? 'badge-pill' : ''} badge-{type} {className}" style={styleName}>{title}</span>