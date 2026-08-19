<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<th class={cn('h-10 px-3 text-left align-middle font-medium', classname)}>
	{@render children?.()}
</th>
