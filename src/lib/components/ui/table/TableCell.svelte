<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<td class={cn('px-3 py-2 align-middle', classname)}>
	{@render children?.()}
</td>
