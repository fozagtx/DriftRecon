<script lang="ts">
 import { page } from '$app/state';
 import Logo from './Logo.svelte';
 import { LayoutDashboard, GitBranch, ClipboardCheck, ChartNoAxesCombined, ArrowUpRight } from 'lucide-svelte';
 let { children } = $props();
 const links=[['/dashboard','Overview',LayoutDashboard],['/graph','Graph',GitBranch],['/review','Review',ClipboardCheck],['/evaluation','Evaluation',ChartNoAxesCombined]] as const;
</script>
<div class="shell"><aside class="sidebar"><div class="side-head"><Logo/></div><nav aria-label="Workspace navigation">{#each links as [href,label,Icon]}<a {href} class:active={page.url.pathname===href}><Icon size={18}/><span>{label}</span>{#if page.url.pathname===href}<b></b>{/if}</a>{/each}</nav><div class="side-foot"><a href="/">Website <ArrowUpRight size={15}/></a></div></aside><main class="workspace">{@render children()}</main></div>
