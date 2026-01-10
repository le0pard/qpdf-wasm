<script>
  import SplitView from '$lib/components/SplitView.svelte'
  import QpdfSettings from '$lib/components/QpdfSettings.svelte'
  import PdfView from '$lib/components/PdfView.svelte'

  import { terminateWorker } from '$lib/worker-service'
  import { onDestroy } from 'svelte'
  import { splitState } from '$lib/states/split.svelte'

  let { webWorkerObject } = $props()

  onDestroy(() => {
    splitState.reset()
    terminateWorker()
  })
</script>

<div class="app-view">
  <div class="app-controls" class:app-controls-hidden={splitState.visibleRight()}>
    <QpdfSettings webWorkerObject={webWorkerObject} />
  </div>
  <SplitView />
  <div class="app-pdf-view" class:app-pdf-view-hidden={splitState.visibleLeft()}>
    <PdfView />
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
