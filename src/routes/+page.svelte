<script>
  import { onMount } from 'svelte'
  import { getWorker } from '$lib/worker-service'

  onMount(() => {
    getWorker().then((worker) => {
      worker.pdfInfo().then(() => {
        // console.log('res', res)
      })
    })
  })
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
