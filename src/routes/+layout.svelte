<script>
	import { setUserContext } from '$lib/stores/user';
	import Nav from '$lib/widgets/nav.svelte';
	import '../app.css';

	setUserContext({ isLoggedIn: true, userId: 1, username: 'test' });
</script>

<div class="container">
	<Nav />
	<slot />
</div>
