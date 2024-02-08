<script>
	import Konva from 'konva';
	import { Layer, Rect, Stage, Image as ConvImage } from 'svelte-konva';

	let img = new Image();
	img.src = 'https://cdn.pixabay.com/photo/2024/01/18/16/54/leaves-8517219_1280.jpg';
</script>

<Stage config={{ width: 1000, height: 1000 }}>
	<Layer>
		{#each [1, 2, 3] as i}
			<Rect config={{ x: 100 * i, y: 100, width: 50, height: 200, fill: 'blue' }} />
		{/each}
		<ConvImage
			config={{
				x: 0,
				y: 0,
				image: img,
				width: 100,
				height: 100
			}}
		/>
	</Layer>
</Stage>
