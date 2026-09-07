<script lang="ts">
 import { page } from '$app/state'; import Logo from './Logo.svelte';
 import { LayoutDashboard, GitBranch, ClipboardCheck, ChartNoAxesCombined, ShieldCheck, ArrowUpRight } from 'lucide-svelte';
 let { children } = $props();
 const links=[['/dashboard','Overview',LayoutDashboard],['/graph','Money map',GitBranch],['/review','Review queue',ClipboardCheck],['/evaluation','Evaluation',ChartNoAxesCombined]] as const;
</script>
<div class="shell"><aside class="sidebar"><div class="side-head"><Logo inverse/><span class="live"><i></i>Live</span></div><div class="workspace-label">Workspace</div><nav aria-label="Workspace navigation">{#each links as [href,label,Icon]}<a {href} class:active={page.url.pathname===href}><Icon size={18}/><span>{label}</span>{#if page.url.pathname===href}<b></b>{/if}</a>{/each}</nav><div class="side-foot"><p><ShieldCheck size={16}/> Audit trail enabled</p><a href="/">View website <ArrowUpRight size={15}/></a></div></aside><main class="workspace">{@render children()}</main></div>
