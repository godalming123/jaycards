<script lang="ts">
  import { browser } from '$app/environment'
  import { onDestroy } from 'svelte';

  import DecksView from '$lib/DecksView.svelte'
  import FlashcardView from '$lib/FlashcardView.svelte'
  import { deinitLocalStorage, initLocalStorage } from '$lib/localStorage';

  let nameOfOpenDeck = $state("")

  if (browser) {
    initLocalStorage()
    onDestroy(deinitLocalStorage)
  }
</script>

{#if nameOfOpenDeck == ""}
  <DecksView bind:nameOfOpenDeck={nameOfOpenDeck} />
{:else}
  <FlashcardView bind:nameOfOpenDeck={nameOfOpenDeck}/>
{/if}
