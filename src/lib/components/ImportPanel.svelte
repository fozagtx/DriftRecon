<script lang="ts">
 import { invalidateAll, goto } from '$app/navigation';
 import { Upload, RefreshCw, CheckCircle2 } from 'lucide-svelte';
 let { canReconcile=false, redirect=false }:{canReconcile?:boolean;redirect?:boolean}=$props();
 let state=$state<'idle'|'uploading'|'running'|'error'>('idle'); let error=$state(''); let imported=$state<number|null>(null); let dragging=$state(false);
 async function submit(body:FormData){state='uploading';error='';try{const r=await fetch('/api/import',{method:'POST',body});const data=await r.json();if(!r.ok)throw new Error(data.error||'Import failed');imported=data.events?.length??data.eventCount??null;state='idle';await invalidateAll();if(redirect)goto('/dashboard')}catch(e){error=e instanceof Error?e.message:'Import failed';state='error'}}
 function upload(files:FileList|null){if(!files?.length)return;const form=new FormData();for(const f of files)form.append('files',f);void submit(form)}
 async function run(){state='running';error='';try{const r=await fetch('/api/reconcile',{method:'POST'});if(!r.ok)throw new Error('Reconciliation failed');state='idle';imported=null;await invalidateAll()}catch(e){error=e instanceof Error?e.message:'Reconciliation failed';state='error'}}
</script>
<div class="import">
 <label class="drop" class:dragging ondragenter={(e)=>{e.preventDefault();dragging=true}} ondragover={(e)=>e.preventDefault()} ondragleave={()=>dragging=false} ondrop={(e)=>{e.preventDefault();dragging=false;upload(e.dataTransfer?.files??null)}}>
  <Upload size={22}/>
  <b>{state==='uploading'?'Importing…':'Drop files here'}</b>
  <span>or click to choose</span>
  <input aria-label="Upload source files" type="file" accept=".csv,.json" multiple onchange={(e)=>{upload(e.currentTarget.files);e.currentTarget.value=''}}/>
 </label>
 {#if !redirect}<button class="btn" onclick={run} disabled={!canReconcile||state==='running'}><span class:spin={state==='running'}><RefreshCw size={14}/></span>{state==='running'?'Reconciling…':'Run'}</button>{/if}
 {#if imported!==null}<p class="notice good"><CheckCircle2 size={14}/>{imported} imported</p>{/if}
 {#if error}<p class="notice bad">{error}</p>{/if}
</div>
<style>
 .import{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
 .drop{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:28px 16px;border:1px dashed var(--line);border-radius:10px;background:#fff;cursor:pointer;text-align:center}
 .drop.dragging{border-color:var(--brand);background:#f5f8f1}
 .drop b{font-size:14px;font-weight:650}
 .drop span{font-size:12px;color:var(--muted)}
 .drop input{position:absolute;width:1px;height:1px;padding:0;border:0;overflow:hidden;clip:rect(0,0,0,0)}
 .import .btn{min-height:42px;padding:0 16px;font-size:13px}
 .notice{grid-column:1/-1;margin:0;font-size:12px;display:flex;align-items:center;gap:6px}
 .spin{display:inline-flex;animation:spin 1s linear infinite}
 @keyframes spin{to{transform:rotate(360deg)}}
 @media(max-width:700px){.import{grid-template-columns:1fr}.import .btn{width:100%;justify-content:center}}
</style>
