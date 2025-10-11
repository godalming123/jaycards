<script lang="ts">
  import { browser } from '$app/environment'

  import DecksView from '$lib/DecksView.svelte'
  import FlashcardView from '$lib/FlashcardView.svelte'
  import { initLocalStorage, decks } from '$lib/localStorage';

  let nameOfOpenDeck = $state("")

  if (browser) {
    initLocalStorage()
  }
</script>

{#if nameOfOpenDeck == ""}
  <DecksView bind:nameOfOpenDeck={nameOfOpenDeck} />
{:else}
  <FlashcardView bind:nameOfOpenDeck={nameOfOpenDeck}/>
{/if}
