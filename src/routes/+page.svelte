<script>
  import { browser } from '$app/environment'
  import { getWorker } from '$lib/worker-service'

  import App from '$lib/components/App.svelte'
  import AppLoading from '$lib/components/AppLoading.svelte'
  import Error from '$lib/components/Error.svelte'
</script>

{#if browser}
  {#if !window.WebAssembly}
    <Error
      title="Your browser do not support WebAssembly"
      message="Your browser do not support WebAssembly"
    />
  {:else if !window.Worker}
    <Error
      title="Your browser do not support Web Workers"
      message="Your browser do not support Web Workers"
    />
  {:else}
    {#await getWorker()}
      <AppLoading />
    {:then webWorkerObject}
      <App webWorkerObject={webWorkerObject} />
    {:catch error}
      <Error title="Error to load web worker" message={error.toString()} />
    {/await}
  {/if}
{:else}
  <AppLoading />
{/if}
