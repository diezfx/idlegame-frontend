<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		title,
		open = false,
		class: classname = '',
		buttonClass = '',
		buttonStyle = true,
		children,
	}: {
		title: string | Snippet;
		open?: boolean;
		class?: string;
		buttonClass?: string;
		buttonStyle?: boolean;
		children?: Snippet;
	} = $props();
	let isOpen = $derived(open);

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class={classname}>
	<Button onclick={toggle} style={buttonStyle} class={cn('w-full text-xl rounded-sm', buttonClass)}>
		{#if typeof title === 'string'}
			{title}
		{:else}
			{@render title()}
		{/if}
	</Button>
	{#if isOpen}
		<div>
			{@render children?.()}
		</div>
	{/if}
</div>
