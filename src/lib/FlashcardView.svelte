<script lang="ts">
  import { decks, downloadedDecks } from "$lib/localStorage"
  let {nameOfOpenDeck = $bindable("")} = $props()
  $effect(() => {
    const url = $decks[nameOfOpenDeck]
    if (url != null && $downloadedDecks[url] == null) {
      // TODO: Download the deck and add it to `downloadedDecks`
    }
  })
</script>
<button onclick={() => nameOfOpenDeck = ""}>Home</button>
{#if $decks[nameOfOpenDeck] != null}
  <span>Deck called {nameOfOpenDeck}</span>
{:else}
  <span>There isn't a deck called "{nameOfOpenDeck}"</span>
{/if}
