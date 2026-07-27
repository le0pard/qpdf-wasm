<script>
	import '$lib/styles/globals.css'
	import { page } from '$app/state'
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
	<link rel="canonical" href={`${page.url.origin}${page.url.pathname}`} />
</svelte:head>

{@render children()}
