<script lang="ts">
 import { invalidateAll, goto } from '$app/navigation';
 import { Upload, RefreshCw, CheckCircle2 } from 'lucide-svelte';
 let { compact=false, canReconcile=false, redirect=false }:{compact?:boolean;canReconcile?:boolean;redirect?:boolean}=$props();
 let state=$state<'idle'|'uploading'|'running'|'error'>('idle'); let error=$state(''); let imported=$state<number|null>(null); let dragging=$state(false);
 async function submit(body:FormData){state='uploading';error='';try{const r=await fetch('/api/import',{method:'POST',body});const data=await r.json();if(!r.ok)throw new Error(data.error||'Import failed');imported=data.events?.length??data.eventCount??null;state='idle';await invalidateAll();if(redirect)goto('/dashboard')}catch(e){error=e instanceof Error?e.message:'Import failed';state='error'}}
 function upload(files:FileList|null){if(!files?.length)return;const form=new FormData();for(const f of files)form.append('files',f);void submit(form)}
 async function run(){state='running';error='';try{const r=await fetch('/api/reconcile',{method:'POST'});if(!r.ok)throw new Error('Reconciliation failed');state='idle';imported=null;await invalidateAll()}catch(e){error=e instanceof Error?e.message:'Reconciliation failed';state='error'}}
</script>
<div class:compact class="import card">
 <div class="processors" aria-hidden="true"><img src="/logos/stripe.svg" alt=""/><img class="dodo" src="/logos/dodo.webp" alt=""/><img class="icon" src="/logos/gumroad.svg" alt=""/><img src="/logos/chase.svg" alt=""/></div>
 <label class:dragging ondragenter={(e)=>{e.preventDefault();dragging=true}} ondragover={(e)=>e.preventDefault()} ondragleave={()=>dragging=false} ondrop={(e)=>{e.preventDefault();dragging=false;upload(e.dataTransfer?.files??null)}}>
  <span class="upload-icon"><Upload size={19}/></span>
  <span class="copy"><b>{state==='uploading'?'Importing files…':'Drop files or browse'}</b><small><code>data/judges-test.json</code> · Stripe · Dodo Payments</small></span>
  <span class="choose">Choose files</span>
  <input aria-label="Upload source files" type="file" accept=".csv,.json" multiple onchange={(e)=>{upload(e.currentTarget.files);e.currentTarget.value=''}}/>
 </label>
 {#if !redirect}<div class="import-actions"><button class="btn" onclick={run} disabled={!canReconcile||state==='running'}><span class:spin={state==='running'}><RefreshCw size={15}/></span>{state==='running'?'Reconciling…':'Run reconciliation'}</button></div>{/if}
 {#if imported!==null}<p class="notice good"><CheckCircle2 size={15}/>{imported} events imported and ready.</p>{/if}
 {#if error}<p class="notice bad">{error}</p>{/if}
</div>
<style>
 .import{overflow:hidden}
 .processors{display:flex;align-items:center;gap:16px;padding:10px 16px;border-bottom:1px solid var(--line);background:#fff}
 .processors img{height:16px;width:auto;object-fit:contain}
 .processors img.dodo{height:22px;border-radius:50%}
 .processors img.icon{height:18px}
 .import label{display:flex;align-items:center;gap:14px;padding:16px;min-height:78px;transition:.15s}
 .import label:hover,.import label.dragging{background:#f5f8f1}
 .upload-icon{width:42px;height:42px;display:grid;place-items:center;background:#edf3e9;border-radius:9px;color:var(--green)}
 .copy{display:grid;gap:4px;flex:1}
 .copy b{font-size:13px}
 .copy small{font-size:11px;color:var(--muted);line-height:1.45}
 .copy code{font:10px 'IBM Plex Mono';background:#efefe8;padding:1px 5px;border-radius:4px}
 .choose{border:1px solid var(--line);border-radius:8px;padding:9px 13px;font-size:11px;font-weight:650;background:white}
 .import input{position:absolute;opacity:0;width:1px;height:1px}
 .import-actions{padding:10px 14px;border-top:1px solid var(--line);background:#fafbf8;display:flex;justify-content:flex-end}
 .import-actions .btn{min-height:37px;font-size:11px}
 .notice{margin:0;padding:9px 16px;border-top:1px solid var(--line);display:flex;gap:7px;align-items:center;font-size:11px}
 .spin{display:inline-flex;animation:spin 1s linear infinite}
 @keyframes spin{to{transform:rotate(360deg)}}
 @media(max-width:560px){.choose{display:none}.processors{gap:12px}}
</style>
