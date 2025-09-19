<script lang="ts">
	let { title, open = false, class: classname, children } = $props();
	let isOpen = $state(open);

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class={classname}>
	<button
		onclick={toggle}
		class="w-full py-2 px-4 text-primary-foreground bg-primary text-xl rounded-sm hover:cursor-pointer">{title}</button
	>
	{#if isOpen}
		<div>
			{@render children?.()}
		</div>
	{/if}
</div>
