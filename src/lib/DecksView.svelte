<script lang="ts">
  import Dialog from '$lib/Dialog.svelte'
  import TextInput from '$lib/TextInput.svelte'
  import {decks, downloadedDecks} from '$lib/localStorage'

  let {nameOfOpenDeck = $bindable("")} = $props()

  let setDialogOpen = $state(false)
  let setDialogClosed = $state(false)
  let focusDeckNameInput = $state(false)
  let focusDeckUrlInput = $state(false)
  const addDeckDialogInitialState = {
    nameError: "",
    urlError: "",
    newDeckName: "",
    newDeckUrl: "",
  }
  let addDeckDialogState = $state(addDeckDialogInitialState)

  function startAddingDeck() {
    addDeckDialogState = addDeckDialogInitialState
    setDialogOpen = !setDialogOpen
  }

  function addDeck() {
    addDeckDialogState.nameError = ""
    addDeckDialogState.urlError = ""

    if (addDeckDialogState.newDeckName == "") {
      addDeckDialogState.nameError = `Decks must have a name`
    } else if (Object.hasOwn($decks, addDeckDialogState.newDeckName)) {
      addDeckDialogState.nameError = `There is already a deck called "${addDeckDialogState.newDeckName}"`
    }

    if (addDeckDialogState.newDeckUrl == "") {
      addDeckDialogState.urlError = `Must specify URL`
    }

    if (addDeckDialogState.nameError != "") {
      focusDeckNameInput = !focusDeckNameInput
    } else if (addDeckDialogState.urlError != "") {
      focusDeckUrlInput = !focusDeckUrlInput
    } else {
      // TODO: Download the deck from the URL, and save it in `downloadedDecks`
      decks.set(addDeckDialogState.newDeckName, addDeckDialogState.newDeckUrl)
      setDialogClosed = !setDialogClosed
    }
  }
</script>

<svelte:window on:keydown={(e) => {
  if (document.activeElement?.nodeName != "INPUT" && e.key == "a") {
    e.preventDefault()
    startAddingDeck()
  }
}}/>

<button onclick={startAddingDeck}>Add deck Ⓐ</button>

<ul style="padding: 0; margin: 0.5rem 0; display: flex; flex-direction: column; gap: 0.25rem;">
  {#each Object.entries($decks) as [deckName, _]}
    <li style="display: flex;">
      <button onclick={() => {nameOfOpenDeck = deckName}}>{deckName}</button>
      <button style="margin-left: auto;" onclick={() => decks.delete(deckName)}>Delete</button>
    </li>
  {/each}
</ul>

<Dialog setOpen={setDialogOpen} setClosed={setDialogClosed} style="display: flex; flex-direction: column; gap: 0.1rem;">
  <TextInput label="Name" error={addDeckDialogState.nameError} bind:value={addDeckDialogState.newDeckName} setFocused={focusDeckNameInput} onenter={() => focusDeckUrlInput = !focusDeckUrlInput} />
  <TextInput label="URL"  error={addDeckDialogState.urlError}  bind:value={addDeckDialogState.newDeckUrl}  setFocused={focusDeckUrlInput}  onenter={addDeck}/>
  <button onclick={addDeck}>Add ⏎</button>
  <button onclick={() => setDialogClosed = !setDialogClosed}>Cancel ␛</button>
</Dialog>
