<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		foreground = 'bg-primary',
		background = 'bg-primary/20',
		max = 100,
		value,
		showLabel = false,
		class: className = undefined,
		...restProps
	} = $props();

	if (value > max) {
		value = max;
	}
	if (value < 0) {
		value = 0;
	}
</script>

<div
	class={cn('relative w-full overflow-hidden rounded-full', showLabel ? 'h-5' : 'h-2', background, className)}
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
	{#if showLabel}
		<div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
			{value} / {max}
		</div>
	{/if}
</div>
