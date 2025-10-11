<script lang="ts">
  let {label, value = $bindable(""), error = ""}
    : {label: string, value?: string, error?: string}
    = $props()
  let id = $props.id()
</script>

<label for={id}>{label}</label>
<input id={id} bind:value={value}>
{#if error != ""}
  <span style="color: red;">{error}</span>
{/if}
