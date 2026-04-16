<script>
  import FallbackSvg from './DropFileFallbackSvg.svelte'

  let {
    children,
    hasFiles,
    accept = 'application/pdf',
    multiple = false,
    disabled = false,
    onDrop = () => {},
    onEnter = () => {},
    onLeave = () => {}
  } = $props()

  let isOver = $state(false)
  let input = $state(null)

  const handleEnter = () => {
    isOver = true
    onEnter?.()
  }

  const handleLeave = () => {
    isOver = false
    onLeave?.()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    isOver = false

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const filteredFiles = files.filter(file => file.type === accept)
    if (filteredFiles.length > 0) {
      onDrop(filteredFiles)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    // Required to allow drop
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleChange = (e) => {
    const { files } = e.target
    if (files) {
      onDrop(Array.from(files))
    }
  }

  const onClick = () => {
    if (!disabled) input.click()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }
</script>

<div
  id="zone"
  role="button"
  tabindex="0"
  aria-disabled={disabled}
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragenter={handleEnter}
  ondragleave={handleLeave}
  onclick={onClick}
  onkeydown={onKeyDown}
  class:disabled
>
  {#if children && hasFiles}
    {@render children()}
  {:else}
    <div id="fallback">
      <FallbackSvg over={isOver} />
    </div>
  {/if}
</div>

<input
  id="hidden-input"
  type="file"
  accept={accept}
  bind:this={input}
  onchange={handleChange}
  {multiple}
  {disabled}
/>

<style>
  #zone {
    display: block;
    width: 100%;
    height: 15rem;
    cursor: pointer;
    outline: none;
    border: 1px dashed var(--color-neutral);
    border-radius: 0.25rem;
  }
  #zone.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  #hidden-input {
    display: none;
  }
  #fallback {
    display: grid;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border-color: inherit;
    pointer-events: none;
  }
  #fallback :global(svg) {
    margin: auto;
    max-width: 100%;
    max-height: 100%;
  }
</style>
