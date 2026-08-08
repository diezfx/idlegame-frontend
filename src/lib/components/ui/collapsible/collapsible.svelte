<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	let { title, open = false, class: classname, children } = $props();
	let isOpen = $state(open);

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class={classname}>
	<Button
		onclick={toggle}
		class="w-full text-xl rounded-sm">{title}</Button
	>
	{#if isOpen}
		<div>
			{@render children?.()}
		</div>
	{/if}
</div>
