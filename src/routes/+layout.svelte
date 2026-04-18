<script>
	import '$lib/styles/globals.css'
	import { onMount } from 'svelte'
	import { updated } from '$app/stores'

	let { children } = $props()

	onMount(() => {
		// Check for a new service worker / version every 1 hour (3600000 ms)
		const interval = setInterval(async () => {
			await updated.check()
		}, 3600000)

		return () => clearInterval(interval)
	})
</script>

<svelte:head>
</svelte:head>

{@render children()}
