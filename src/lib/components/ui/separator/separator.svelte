<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();
</script>

<hr class={cn(className, 'h-px my-8 bg-gray-200 border-0 dark:bg-gray-700')} />
