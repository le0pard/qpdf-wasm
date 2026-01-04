<script>
  import SplitViewComponent from '$lib/components/SplitViewComponent.svelte'

  import { onDestroy, setContext } from 'svelte'
  import { splitState } from '$lib/stores/split'

  let { webWorkerObject } = $props()

  setContext('ww', {
    getWebWorker: () => webWorkerObject
  })

  onDestroy(() => {
    splitState.reset()
  })
</script>

<div class="app-view">
  <div class="app-controls" class:app-controls-hidden={$splitState.visible === 'right'}>
    <h1>Test</h1>
  </div>
  <SplitViewComponent />
  <div class="app-pdf-view" class:app-pdf-view-hidden={$splitState.visible === 'left'}>
    <h1>Test</h1>
  </div>
</div>

<style>
  .app-view {
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }

  .app-controls {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    position: relative;
  }

  .app-pdf-view {
    height: 100%;
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .app-controls-hidden,
  .app-pdf-view-hidden {
    display: none;
  }
</style>
