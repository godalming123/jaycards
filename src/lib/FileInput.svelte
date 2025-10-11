<script lang="ts">
  let {label, files = $bindable(), value = $bindable(), error = ""}
  : {label: string, files?: FileList, value?: string, error?: string}
  = $props()
  let id = $props.id()
  let hovered = $state(false)
</script>

<label for={id}>{label}</label>
<input type="file" id={id} bind:files={files} bind:value={value}
  style={`border: 2px ${hovered ? "dashed green" : "solid transparent"};`}
  ondragover={() => hovered = true}
  ondragleave={() => hovered = false}
  ondrop={() => hovered = false}
>
{#if error != ""}
  <span style="color: red;">{error}</span>
{/if}
