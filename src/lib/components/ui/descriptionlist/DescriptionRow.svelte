<script lang="ts">
	import { cn } from '$lib/utils';
	let { term, class: classname = '', children } = $props();
</script>

<dt class={cn('', classname)}>{term}</dt>
<dd>{@render children?.()}</dd>
