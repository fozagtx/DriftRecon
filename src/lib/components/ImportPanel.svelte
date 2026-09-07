<script lang="ts">
 import { invalidateAll, goto } from '$app/navigation';
 import { Upload, RefreshCw, CheckCircle2 } from 'lucide-svelte';
 let { canReconcile=false, redirect=false }:{canReconcile?:boolean;redirect?:boolean}=$props();
 let state=$state<'idle'|'uploading'|'running'|'error'>('idle'); let error=$state(''); let imported=$state<number|null>(null); let dragging=$state(false);
 async function submit(body:FormData){state='uploading';error='';try{const r=await fetch('/api/import',{method:'POST',body});const data=await r.json();if(!r.ok)throw new Error(data.error||'Import failed');imported=data.events?.length??data.eventCount??null;state='idle';await invalidateAll();if(redirect)goto('/dashboard')}catch(e){error=e instanceof Error?e.message:'Import failed';state='error'}}
 function upload(files:FileList|null){if(!files?.length)return;const form=new FormData();for(const f of files)form.append('files',f);void submit(form)}
 async function run(){state='running';error='';try{const r=await fetch('/api/reconcile',{method:'POST'});if(!r.ok)throw new Error('Reconciliation failed');state='idle';imported=null;await invalidateAll()}catch(e){error=e instanceof Error?e.message:'Reconciliation failed';state='error'}}
</script>
<div class="wrap">
 <div class="bar" class:dragging>
  <img src="/logos/stripe.svg" alt="Stripe"/>
  <img class="dodo" src="/logos/dodo.webp" alt="Dodo Payments"/>
  <img class="icon" src="/logos/gumroad.svg" alt="Gumroad"/>
  <img src="/logos/chase.svg" alt="Chase"/>
  <label ondragenter={(e)=>{e.preventDefault();dragging=true}} ondragover={(e)=>e.preventDefault()} ondragleave={()=>dragging=false} ondrop={(e)=>{e.preventDefault();dragging=false;upload(e.dataTransfer?.files??null)}}>
   <Upload size={15}/>
   <span>{state==='uploading'?'Importing…':'Upload'}</span>
   <input aria-label="Upload source files" type="file" accept=".csv,.json" multiple onchange={(e)=>{upload(e.currentTarget.files);e.currentTarget.value=''}}/>
  </label>
  {#if !redirect}<button class="btn" onclick={run} disabled={!canReconcile||state==='running'}><span class:spin={state==='running'}><RefreshCw size={14}/></span>{state==='running'?'Reconciling…':'Run'}</button>{/if}
 </div>
 {#if imported!==null}<p class="notice good"><CheckCircle2 size={14}/>{imported} imported</p>{/if}
 {#if error}<p class="notice bad">{error}</p>{/if}
</div>
<style>
 .wrap{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
 .bar{display:flex;align-items:center;gap:10px;width:max-content;max-width:100%}
 .bar.dragging label{border-color:var(--brand);background:#f5f8f1}
 .bar>img{height:16px;width:auto;object-fit:contain}
 .bar>img.dodo{height:20px;width:20px;border-radius:50%;object-fit:cover}
 .bar>img.icon{height:18px}
 .bar label{position:relative;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:12px;font-weight:650;cursor:pointer;white-space:nowrap}
 .bar input{position:absolute;width:1px;height:1px;padding:0;border:0;overflow:hidden;clip:rect(0,0,0,0)}
 .bar .btn{min-height:36px;padding:0 14px;font-size:12px}
 .notice{margin:0;font-size:12px;display:flex;align-items:center;gap:6px}
 .spin{display:inline-flex;animation:spin 1s linear infinite}
 @keyframes spin{to{transform:rotate(360deg)}}
 @media(max-width:700px){.wrap,.bar{align-items:stretch;width:100%}.bar{flex-wrap:wrap}.bar label,.bar .btn{flex:1 1 auto;justify-content:center}}
</style>
