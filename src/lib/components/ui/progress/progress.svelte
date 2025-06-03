<script lang="ts">
	import { cn } from '$lib/utils.js';
	let { max, value, class: className }: { max: number; value: number; class?: string | undefined } = $props();
</script>

<div class={cn('progress-outer', className)}>
	<div class="progress-inner" style={`width: ${(100 * (value ?? 0)) / (max ?? 1)}%`}></div>
	<div class="progress-label">{value}/{max}</div>
</div>

<style>
	.progress-outer {
		background: #e5e7eb;
		height: 1rem;
		width: 100%;
		border-radius: 0.5rem;
		position: relative;
		overflow: hidden;
	}
	.progress-inner {
		background: #26e66c;
		height: 100%;
		transition: width 0.2s;
	}
	.progress-label {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.95rem;
		font-weight: 600;
		color: #1e293b;
		pointer-events: none;
	}
</style>
