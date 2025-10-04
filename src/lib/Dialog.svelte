<!--
WARN: You cannot use !important on the display attribute of the inline styles

Properties of this component:

- Doesn't allow the user to focus outside the dialog
- Doesn't allow the user to use elements outside the dialog
- Automatically closes when either:
  - The user presses escape
  - The user clicks outside the dialog
  - The user presses the platform's back button
- Automatically focuses the first focusable element when the dialog is opened
- Scroll from the start when the page is too small rather than cutting off the top and bottom to keep the dialog in the center without a scroll wheel

-->

<script lang="ts">
  let { children, setOpen = false, setClosed = false, style="" } = $props()
  let dialog: HTMLDialogElement
  $effect(() => {
    if (setOpen || !setOpen) {
      return () => {
        if (document.body.contains(dialog)) dialog.showModal()
      }
    }
  })
  $effect(() => {
    if (setClosed || !setClosed) {
      return () => {
        if (document.body.contains(dialog)) dialog.close()
      }
    }
  })
</script>

<dialog closedby="any" bind:this={dialog} style={style}>
  {@render children()}
</dialog>

<style>
  dialog:not([open]) {
    display: none !important;
  }
</style>
