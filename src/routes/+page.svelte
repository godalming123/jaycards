<script lang="ts">
  import DecksView from '../lib/DecksView.svelte'
  import FlashcardView from '../lib/FlashcardView.svelte'
  import type { LocalStorageState } from '../lib/utils'
  import { browser } from '$app/environment'
  let localStorage = $state(
    {
      decks: browser ? JSON.parse(window.localStorage.getItem("decks") ?? "{}") : {}
    } as LocalStorageState
  )
  let nameOfOpenDeck = $state("")
  $effect(() => {
    window.localStorage.setItem("decks", JSON.stringify(localStorage.decks))
  })
</script>

{#if nameOfOpenDeck == ""}
  <DecksView localStorage={localStorage} bind:nameOfOpenDeck={nameOfOpenDeck} />
{:else}
  <FlashcardView bind:nameOfOpenDeck={nameOfOpenDeck}/>
{/if}
