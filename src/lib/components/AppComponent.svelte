<script>
  let { webWorkerObject } = $props()

  import { onMount } from 'svelte'

  onMount(() => {
    webWorkerObject.pdfInfo().then(() => {
      // console.log('res', res)
    })
  })
</script>

<h1>App</h1>
