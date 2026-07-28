<script lang="ts">
	import { cn } from '$lib/utils';
	let { term, class: classname = '', children } = $props();
</script>

<dt>{term}</dt>
<dd class={cn('', classname)}>{@render children?.()}</dd>
