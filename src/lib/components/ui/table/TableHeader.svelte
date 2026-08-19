<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<thead class={cn('border-b bg-muted/40 text-muted-foreground', classname)}>
	{@render children?.()}
</thead>
