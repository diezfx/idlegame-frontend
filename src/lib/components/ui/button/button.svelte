<script lang="ts">
	import { cn } from '$lib/utils';

	let { style = true, disabled = false, onclick = undefined, class: classname = '', children = undefined } = $props();

	const defaultStyle =
		'bg-primary  py-2 px-4 rounded justify-center  disabled:opacity-50 disabled:pointer-events-none text-primary-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer';
</script>

<button {onclick} {disabled} class={cn(style ? defaultStyle : '', classname)}>{@render children?.()}</button>
