<script lang="ts">
  import { decks, getFlashcardRenderFunctions, type Flashcard } from '$lib/localStorage'
  import {startingFrequencyForCard} from "$lib/spacedRepetition"
  import Dialog from '$lib/Dialog.svelte'
  import TextInput from '$lib/TextInput.svelte'
  import FileInput from '$lib/FileInput.svelte';

  let {nameOfOpenDeck = $bindable("")} = $props()

  let setDialogOpen = $state(false)
  let setDialogClosed = $state(false)
  const addDeckDialogInitialState = {
    nameError: "",
    fileError: "",
    newDeckName: "",
    newDeckCode: undefined as FileList | undefined,
    fileInputValue: "",
  }
  let addDeckDialogState = $state(addDeckDialogInitialState)

  function startAddingDeck() {
    addDeckDialogState = addDeckDialogInitialState
    setDialogOpen = !setDialogOpen
  }

  function onAddDeckButtonClick() {
    if (addDeckDialogState.newDeckName == "") {
      addDeckDialogState.nameError = `Decks must have a name`
    } else if (Object.hasOwn($decks, addDeckDialogState.newDeckName)) {
      addDeckDialogState.nameError = `There is already a deck called "${addDeckDialogState.newDeckName}"`
    } else {
      addDeckDialogState.nameError = ""
    }
    let file = addDeckDialogState.newDeckCode?.item(0)
    if (addDeckDialogState.newDeckCode == null || file == null) {
      addDeckDialogState.fileError = `Must specify a file`
    } else if (addDeckDialogState.newDeckCode.length > 1) {
      addDeckDialogState.fileError = `Cannot specify more than 1 file`
    } else {
      file.text().then(text => {
        import("data:text/javascript;base64," + btoa(text)).then(() => {
          let cards = {} as Record<string, Flashcard>
          for (const cardName of Object.keys(getFlashcardRenderFunctions())) {
            cards[cardName] = {spacedRepetitionData: {frequency: startingFrequencyForCard}}
          }
          addDeckDialogState.fileError = ``
          if (addDeckDialogState.nameError == "") {
            decks.createDeck(addDeckDialogState.newDeckName, {code: text, cards})
            setDialogClosed = !setDialogClosed
          }
        }).catch((e: any) => {
          addDeckDialogState.fileError = `Failed to get run code: ${e.toString()}`
        })
      }).catch((e: any) => {
        addDeckDialogState.fileError = `Failed to get code to run: ${e.toString()}`
      })
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
      <button style="margin-left: auto;" onclick={() => decks.deleteDeck(deckName)}>Delete</button>
    </li>
  {/each}
</ul>

<Dialog setOpen={setDialogOpen} setClosed={setDialogClosed} style="display: grid; gap: 0.1rem;">
  <TextInput label="Name" error={addDeckDialogState.nameError} bind:value={addDeckDialogState.newDeckName} />
  <FileInput label="File" error={addDeckDialogState.fileError} bind:files={addDeckDialogState.newDeckCode} bind:value={addDeckDialogState.fileInputValue} />
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.1rem;">
    <button onclick={onAddDeckButtonClick}>Add</button>
    <button onclick={() => setDialogClosed = !setDialogClosed}>Cancel ␛</button>
  </div>
</Dialog>
