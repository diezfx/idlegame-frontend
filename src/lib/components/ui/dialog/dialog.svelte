<script lang="ts">
	let { open = false, onClose = undefined, class: classname = '', children } = $props();
	let isOpen = $derived(open);

	$effect(() => {
		console.log('isOpen changed', isOpen);
		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
	let dialog: HTMLDialogElement;
</script>

<dialog
	class="fixed top-0 left-0 right-0 bottom-0 w-full h-full m-0 p-0 border-none bg-transparent overflow-hidden pointer-events-none"
	closedby="any"
	bind:this={dialog}
	onclose={onClose}
>
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black opacity-60 z-40 pointer-events-none"></div>

	<!-- Dialog content -->
	<div class="relative z-50 m-4 p-4 rounded-lg bg-background shadow-sm pointer-events-auto mx-auto mt-24">
		{@render children?.()}
	</div>
</dialog>
