<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { foreground = 'bg-primary', background = 'bg-primary/20', max = 100, value, ...restProps } = $props();

	if (value > max) {
		value = max;
	}
	if (value < 0) {
		value = 0;
	}
</script>

<div
	class={cn('relative h-2 w-full overflow-hidden rounded-full', background)}
	role="progressbar"
	aria-valuenow={value ?? 0}
	aria-valuemin="0"
	aria-valuemax={max}
	aria-label="Progress"
	{...restProps}
>
	<div
		class={cn('h-full w-full flex-1 transition-all', foreground)}
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
	></div>
</div>
