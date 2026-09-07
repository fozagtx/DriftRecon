<script lang="ts">let { title = '', children }: { title?: string; children: import('svelte').Snippet } = $props();</script>
<section class="card">{#if title}<header class="card-head"><strong>{title}</strong></header>{/if}<div class="card-body">{@render children()}</div></section>
