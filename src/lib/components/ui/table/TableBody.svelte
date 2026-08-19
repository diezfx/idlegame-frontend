<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', classname)}>
	{@render children?.()}
</tbody>
