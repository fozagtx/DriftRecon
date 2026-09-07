<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { Upload, RefreshCw, CheckCircle2 } from 'lucide-svelte';

  let {
    canReconcile = false,
    redirect = false,
  }: { canReconcile?: boolean; redirect?: boolean } = $props();

  let status = $state<'idle' | 'uploading' | 'running' | 'error'>('idle');
  let error = $state('');
  let imported = $state<number | null>(null);
  let dragging = $state(false);
  let elapsed = $state(0);
  let ticker: ReturnType<typeof setInterval> | undefined;

  const busy = $derived(status === 'uploading' || status === 'running');
  const phase = $derived(
    status === 'uploading'
      ? 'Importing files'
      : elapsed < 2
        ? 'Matching references'
        : elapsed < 6
          ? 'Scoring candidates'
          : elapsed < 12
            ? 'Checking payouts'
            : 'Investigating exceptions',
  );

  function startClock() {
    elapsed = 0;
    clearInterval(ticker);
    const started = Date.now();
    ticker = setInterval(() => {
      elapsed = Math.max(0, Math.round((Date.now() - started) / 1000));
    }, 250);
  }

  function stopClock() {
    clearInterval(ticker);
    ticker = undefined;
  }

  onDestroy(stopClock);

  function clockLabel(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  async function readBody(response: Response) {
    try {
      return (await response.json()) as { error?: string; eventCount?: number; events?: unknown[] };
    } catch {
      return {};
    }
  }

  async function holdOverlay(startedAt: number) {
    const wait = Math.max(0, 800 - (Date.now() - startedAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    stopClock();
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const form = new FormData();
    for (const file of files) form.append('files', file);
    status = 'uploading';
    error = '';
    const startedAt = Date.now();
    startClock();
    try {
      const response = await fetch('/api/import', { method: 'POST', body: form });
      const data = await readBody(response);
      if (!response.ok) throw new Error(data.error || 'Import failed');
      imported = data.events?.length ?? data.eventCount ?? null;
      await invalidateAll();
      if (redirect) goto('/dashboard');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Import failed';
      status = 'error';
    } finally {
      await holdOverlay(startedAt);
      if (status === 'uploading') status = 'idle';
    }
  }

  async function run() {
    if (busy) return;
    if (!canReconcile) {
      error = 'Import Stripe, Gumroad, Dodo, or bank files first.';
      status = 'error';
      return;
    }
    status = 'running';
    error = '';
    imported = null;
    const startedAt = Date.now();
    startClock();
    try {
      const response = await fetch('/api/reconcile', { method: 'POST' });
      const data = await readBody(response);
      if (!response.ok) throw new Error(data.error || 'Reconciliation failed');
      await invalidateAll();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Reconciliation failed';
      status = 'error';
    } finally {
      await holdOverlay(startedAt);
      if (status === 'running') status = 'idle';
    }
  }
</script>

<div class="import card">
  <label
    class:dragging
    ondragenter={(e) => {
      e.preventDefault();
      dragging = true;
    }}
    ondragover={(e) => e.preventDefault()}
    ondragleave={() => (dragging = false)}
    ondrop={(e) => {
      e.preventDefault();
      dragging = false;
      upload(e.dataTransfer?.files ?? null);
    }}
  >
    <span class="upload-icon"><Upload size={19} /></span>
    <span class="copy">
      <b>{status === 'uploading' ? 'Importing files…' : 'Drop files or browse'}</b>
      <small>Stripe, Gumroad, Dodo, or bank · CSV and JSON</small>
    </span>
    <span class="choose">Choose files</span>
    <input
      aria-label="Upload source files"
      type="file"
      accept=".csv,.json"
      multiple
      onchange={(e) => {
        upload(e.currentTarget.files);
        e.currentTarget.value = '';
      }}
    />
  </label>
  {#if !redirect}
    <div class="import-actions">
      <p>{canReconcile ? 'Imported events are staged until you run reconciliation.' : 'Upload files, then run reconciliation.'}</p>
      <button class="btn" onclick={run} disabled={busy} aria-busy={status === 'running'}>
        <span class:spin={status === 'running'}><RefreshCw size={15} /></span>
        {status === 'running' ? 'Reconciling…' : 'Run reconciliation'}
      </button>
    </div>
  {/if}
  {#if imported !== null}
    <p class="notice good"><CheckCircle2 size={15} />{imported} events imported. Run reconciliation to match them.</p>
  {/if}
  {#if error}
    <p class="notice bad">{error}</p>
  {/if}
</div>

{#if busy}
  <div class="recon-overlay" role="status" aria-live="assertive" aria-busy="true">
    <div class="recon-card">
      <span class="spinner" aria-hidden="true"></span>
      <strong>{status === 'uploading' ? 'Importing' : 'Reconciling'}</strong>
      <p>{phase}…</p>
      <time datetime={`PT${elapsed}S`}>{clockLabel(elapsed)}</time>
    </div>
  </div>
{/if}

<style>
  .import { overflow: hidden; }
  .import label {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    min-height: 78px;
    cursor: pointer;
  }
  .import label:hover,
  .import label.dragging { background: #f5f8f1; }
  .upload-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    background: #edf3e9;
    border-radius: 9px;
    color: var(--green);
  }
  .copy { display: grid; gap: 4px; flex: 1; }
  .copy b { font-size: 13px; }
  .copy small { font-size: 11px; color: var(--muted); }
  .choose {
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 9px 13px;
    font-size: 11px;
    font-weight: 650;
    background: white;
  }
  .import input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .import-actions {
    padding: 10px 14px;
    border-top: 1px solid var(--line);
    background: #fafbf8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .import-actions p {
    margin: 0;
    font-size: 12px;
    color: var(--muted);
  }
  .import-actions .btn { min-height: 40px; font-size: 12px; }
  .notice {
    margin: 0;
    padding: 9px 16px;
    border-top: 1px solid var(--line);
    display: flex;
    gap: 7px;
    align-items: center;
    font-size: 12px;
  }
  .spin { display: inline-flex; animation: spin 1s linear infinite; }
  .recon-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    background: rgba(248, 248, 244, 0.88);
    backdrop-filter: blur(10px);
  }
  .recon-card {
    width: min(360px, calc(100vw - 32px));
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 28px 24px;
    display: grid;
    justify-items: center;
    gap: 8px;
    text-align: center;
  }
  .spinner {
    width: 42px;
    height: 42px;
    margin-bottom: 8px;
    border: 3px solid #efe8df;
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .recon-card strong { font-size: 18px; }
  .recon-card p { margin: 0; color: var(--muted); font-size: 13px; }
  .recon-card time {
    margin-top: 8px;
    font: 500 20px 'IBM Plex Mono', monospace;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 560px) {
    .choose { display: none; }
    .import-actions { flex-wrap: wrap; }
    .import-actions .btn { width: 100%; }
  }
</style>
