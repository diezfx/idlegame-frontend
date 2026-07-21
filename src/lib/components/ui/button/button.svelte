<script lang="ts">
	import { cn } from '$lib/utils';

	let { style = true, disabled = false, onclick = undefined, class: classname = '', children = undefined } = $props();

	const defaultStyle =
		'bg-primary  py-2 px-4 rounded justify-center  disabled:bg-accent disabled:pointer-events-none text-primary-foreground hover:bg-primary/90 hover:cursor-pointer';
</script>

<button {onclick} {disabled} class={cn(style ? defaultStyle : '', classname)}>{@render children?.()}</button>
