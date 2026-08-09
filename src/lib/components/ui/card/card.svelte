<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		title?: Snippet<[]> | string | undefined;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

	let { title, class: className, onclick, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'bg-card text-card-foreground flex flex-col gap-2 rounded-xl border border-gray-200 p-2 shadow-sm',
		onclick && 'cursor-pointer transition hover:bg-accent hover:shadow',
		className,
	)}
	{onclick}
	{...restProps}
>
	{#if title}
		{#if typeof title !== 'string'}
			{@render title()}
		{:else}
			<div class="font-semibold leading-none">{title}</div>
		{/if}
	{/if}

	<div>
		{@render children?.()}
	</div>
</div>
