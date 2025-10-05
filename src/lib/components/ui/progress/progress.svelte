<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { class: className, max = 100, value, ...restProps } = $props();
</script>

<div
	class={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
	role="progressbar"
	aria-valuenow={value ?? 0}
	aria-valuemin="0"
	aria-valuemax={max}
	aria-label="Progress"
	{...restProps}
>
	<div
		class="bg-primary h-full w-full flex-1 transition-all"
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
	></div>
</div>
