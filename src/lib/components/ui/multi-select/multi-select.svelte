<script lang="ts">
	type Option = { value: number; label: string; count?: number };

	let {
		label = 'Filter',
		options,
		selected = $bindable<number[]>([]),
	}: {
		label?: string;
		options: Option[];
		selected?: number[];
	} = $props();

	function toggle(value: number): void {
		selected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
	}
</script>

<details class="relative w-fit text-xs">
	<summary class="cursor-pointer rounded-md border border-border bg-card px-3 py-2 font-medium">
		{label}: {selected.length === 0 ? 'All' : `${selected.length} selected`}
	</summary>
	<div class="absolute z-50 mt-1 min-w-52 space-y-1 rounded-md border border-border bg-card p-2 shadow-lg">
		{#each options as option (option.value)}
			<label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted">
				<input type="checkbox" checked={selected.includes(option.value)} onchange={() => toggle(option.value)} />
				<span class="flex-1">{option.label}</span>
				{#if option.count !== undefined}<span class="text-muted-foreground">{option.count}</span>{/if}
			</label>
		{/each}
		{#if selected.length > 0}
			<button type="button" class="w-full rounded px-2 py-1 text-left hover:bg-muted" onclick={() => (selected = [])}>
				Clear
			</button>
		{/if}
	</div>
</details>
