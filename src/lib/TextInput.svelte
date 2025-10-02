<script lang="ts">
  let {
    label,
    value = $bindable(""),
    error = "",
    setFocused = false,
    onenter = (_: Event) => {}
  } = $props()
  let id = $props.id()
  let input: HTMLInputElement
  $effect(() => {
    // Make this code runs whenever `setFocused` is toggled
    if (setFocused || !setFocused) {
      return () => {
        // - The input must be focused in an effect because AFAIK effects are
        //   the only way to run code without a rerender happening afterwoods,
        //   and (MAYBE WRONG) rerenders seem to reset textboxes being focused in
        //   svelte
        // - The input must be focused in an effect callback so that the input
        //   isn't focused when the component is initialised
        if (document.body.contains(input)) input.focus()
      }
    }
  })
</script>

<label for={id}>{label}</label>
<input
  id={id}
  bind:value={value}
  bind:this={input}
  onkeypress={(e) => {if (e.key == "Enter") onenter(e)}}>
{#if error != ""}
  <span style="color: red;">{error}</span>
{/if}
