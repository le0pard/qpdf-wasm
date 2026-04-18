<script>
  import pdfObject from 'pdfobject'
  import { humanFileSize } from '$lib/utils'
  import { updated } from '$app/stores'
  import { pdfInfoState } from '$lib/states/pdfInfo.svelte'

  const embedPdf = (node, url) => {
    if (url) {
      pdfObject.embed(url, node, {
        height: '100%',
        pdfOpenParams: { view: 'FitV', page: '1' }
      })
    }

    return {
      update(newUrl) {
        if (newUrl) {
          pdfObject.embed(newUrl, node)
        } else {
          node.textContent = ''
        }
      }
    }
  }

  const reloadApp = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration && registration.waiting) {
        // Listen for the new service worker to take control of the page
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true
            window.location.reload()
          }
        })

        // Tell the waiting service worker to activate immediately
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        return // Exit early, the controllerchange listener will handle the reload
      }
    }

    // If no service worker is waiting or supported, just reload normally
    window.location.reload()
  }
</script>

{#if pdfInfoState.url}
  <div class="pdf-results">
    <div
      class="pdf-viewer"
      use:embedPdf={pdfInfoState.url}
    ></div>
    <div class="pdf-actions">
      <a class="pdf-download-link" download={pdfInfoState.name} href={pdfInfoState.url} rel="external">
        Download ({humanFileSize(pdfInfoState.outputBytesize)})
      </a>
    </div>
  </div>
{:else}
  <div class="tool-info-container">
    {#if $updated}
      <div class="update-alert">
        <div class="update-text">
          <strong>🎉 New Update Available</strong>
          <span>A newer version of the tool is ready. Reload to apply.</span>
        </div>
        <button class="update-button" onclick={reloadApp}>
          Reload App
        </button>
      </div>
    {/if}

    <div class="hero-section">
      <h2>PDF Optimizer & Compressor</h2>
      <p class="subtitle">Process your PDFs securely and locally within your browser.</p>
    </div>

    <div class="features-list">
      <div class="feature-card border-blue">
        <h3 class="feature-title text-blue">1. Select a File</h3>
        <p>Drag and drop your PDF or click to browse. Password-protected files are fully supported.</p>
      </div>

      <div class="feature-card border-green">
        <h3 class="feature-title text-green">2. Choose Processing</h3>
        <ul class="feature-list">
          <li><strong>Web Optimize:</strong> Enables Fast Web View for instant browser loading.</li>
          <li><strong>Compress:</strong> Reduces file size using advanced QPDF compression.</li>
        </ul>
      </div>

      <div class="feature-card border-yellow">
        <h3 class="feature-title text-yellow">3. Process & Download</h3>
        <p>Conversion happens instantly on your device via WebAssembly. No data is sent to external servers.</p>
      </div>
    </div>

    <div class="privacy-notice">
      <span class="lock-icon" aria-hidden="true">🔒</span>
      <div>
        <strong>Privacy First:</strong> Your files never leave your computer. All processing is executed safely in your browser.
      </div>
    </div>

    <div class="source-code-link">
      <a href="https://github.com/le0pard/qpdf-wasm" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        View Source Code on GitHub
      </a>
    </div>
  </div>
{/if}

<style>
  .pdf-results {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }

  .pdf-viewer {
    flex-grow: 1;
    width: 100%;
  }

  .pdf-actions {
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
    padding: 0.25rem;
  }

  .pdf-download-link {
    font-size: 1.25rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border: 2px solid #268bd2;
    border-radius: 0.5rem;
    background-color: transparent;
    color: #268bd2;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .pdf-download-link:hover,
  .pdf-download-link:active {
    background-color: #268bd2;
    color: var(--bg-color);
    box-shadow: 0 4px 12px rgba(38, 139, 210, 0.2);
    transform: translateY(-2px);
  }

  .update-alert {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--input-bg);
    border: 2px solid #b58900;
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .update-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .update-text strong {
    color: #b58900;
    font-size: 1.15rem;
  }

  .update-text span {
    color: var(--comment-color);
    font-size: 0.95rem;
  }

  .update-button {
    background-color: #b58900;
    color: var(--bg-color);
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
  }

  .update-button:hover,
  .update-button:active {
    background-color: #cb4b16;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(203, 75, 22, 0.25);
  }

  @media (max-width: 600px) {
    .update-alert {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .update-button {
      width: 100%;
    }
  }

  .tool-info-container {
    display: flex;
    flex-direction: column;
    padding: 2.5rem 1.5rem;
    max-width: 900px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
    color: var(--base-color);
  }

  .hero-section {
    text-align: center;
    margin-bottom: 1rem;
  }

  .hero-section h2 {
    color: var(--emph-color);
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  .subtitle {
    color: var(--comment-color);
    font-size: 1.1rem;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature-card {
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  }

  .border-blue { border-top: 4px solid #268bd2; }
  .border-green { border-top: 4px solid #859900; }
  .border-yellow { border-top: 4px solid #b58900; }

  .text-blue { color: #268bd2; }
  .text-green { color: #859900; }
  .text-yellow { color: #b58900; }

  .feature-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .feature-card p {
    margin: 0;
    line-height: 1.6;
  }

  .feature-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .feature-list li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .feature-list strong {
    color: var(--emph-color);
  }

  .privacy-notice {
    margin-top: 1rem;
    padding: 1.25rem;
    background-color: var(--heads-color);
    border-left: 4px solid #2aa198;
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--emph-color);
  }

  .lock-icon {
    font-size: 1.75rem;
    line-height: 1;
  }

  .source-code-link {
    text-align: center;
    margin-top: 0.5rem;
  }

  .source-code-link a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--emph-color);
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }

  .source-code-link a:hover,
  .source-code-link a:active {
    color: #268bd2;
  }
</style>
