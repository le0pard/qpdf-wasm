<script>
  import { browser } from '$app/environment'
  import { getWorker } from '$lib/worker-service'

  import AppComponent from '$lib/components/AppComponent.svelte'
  import AppLoadingComponent from '$lib/components/AppLoadingComponent.svelte'
  import ErrorComponent from '$lib/components/ErrorComponent.svelte'
</script>

{#if browser}
  {#if !window.WebAssembly}
    <ErrorComponent
      title="Your browser do not support WebAssembly"
      message="Your browser do not support WebAssembly"
    />
  {:else if !window.Worker}
    <ErrorComponent
      title="Your browser do not support Web Workers"
      message="Your browser do not support Web Workers"
    />
  {:else}
    {#await getWorker()}
      <AppLoadingComponent />
    {:then webWorkerObject}
      <AppComponent webWorkerObject={webWorkerObject} />
    {:catch error}
      <ErrorComponent title="Error to load web worker" message={error.toString()} />
    {/await}
  {/if}
{:else}
  <AppLoadingComponent />
{/if}
