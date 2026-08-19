<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<tr class={cn('border-b transition-colors hover:bg-muted/30', classname)}>
	{@render children?.()}
</tr>
