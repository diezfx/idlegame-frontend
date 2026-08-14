<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<li class={cn(classname)}>
	{@render children?.()}
</li>
