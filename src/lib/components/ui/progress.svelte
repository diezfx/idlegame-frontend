<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { max, value, class: className }: { max: number; value: number; class?: string | undefined } = $props();
</script>

<div class={cn('bg-gray-200 relative h-4 w-full overflow-hidden rounded-full', className)}>
	<div
		class="bg-green-400 h-full w-full flex-1 transition-all"
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
	<div class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-black">
		{value}/{max}
	</div>
</div>
