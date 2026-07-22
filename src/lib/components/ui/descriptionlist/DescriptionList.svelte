<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<dl class={cn('grid grid-cols-2', classname)}>
	{@render children?.()}
</dl>
