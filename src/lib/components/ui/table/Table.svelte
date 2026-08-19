<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: classname = '', children } = $props();
</script>

<div class="w-full overflow-x-auto">
	<table class={cn('w-full table-auto border-collapse text-sm', classname)}>
		{@render children?.()}
	</table>
</div>
