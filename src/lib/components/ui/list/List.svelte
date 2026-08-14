<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<ul class={cn(classname)}>
	{@render children?.()}
</ul>
