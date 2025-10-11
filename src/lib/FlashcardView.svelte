<script lang="ts">
  import { decks, getNextFlashcard, getTotalFrequency, getFlashcardRenderFunctions, type FlashcardDeck } from "$lib/localStorage"
  import { maxFrequencyChange, maxFrequencyForCard, minFrequencyForCard, maxFrequencyForDeck } from "$lib/spacedRepetition"
  let { nameOfOpenDeck = $bindable("") } = $props()
  let last3cards = $state([] as string[]) // More recent cards are later on in the list
  let random = $state(Math.random())
  let s = $state("Loading deck..." as string | {deck: FlashcardDeck, totalFrequency: number, flashcard: string, possibleFrequencyChange: {increase: number, decrease: number}, flashcardHTML: Element})
  $effect(() => {
    const deck = $decks[nameOfOpenDeck] || null
    if (deck == null) s = `There isn't a deck called "${nameOfOpenDeck}"`
    let totalFrequency = getTotalFrequency(deck, [])
    let flashcard = getNextFlashcard(deck, random, last3cards)
    let possibleFrequencyChange = {
      increase: Math.min(maxFrequencyChange, (maxFrequencyForCard - deck.cards[flashcard].spacedRepetitionData.frequency)/4),
      decrease: Math.max(-maxFrequencyChange, (minFrequencyForCard - deck.cards[flashcard].spacedRepetitionData.frequency)/4),
    }
    import("data:text/javascript;base64," + btoa(deck.code)).then(() => {
      try {
        const flashcardHTML = getFlashcardRenderFunctions()[flashcard]()
        s = {deck, totalFrequency, flashcard, possibleFrequencyChange, flashcardHTML}
      } catch (e: any) {
        s = `Failed to get HTML for a flashcard called ${flashcard}: ${e.toString()}`
      }
    }).catch(e => {s = `Failed to get HTML for a deck called ${nameOfOpenDeck}: ${e.toString()}`})
  })
  let flashcardContents = $state(null as HTMLDivElement | null)
  $effect(() => {
    if (typeof s === "object" && flashcardContents != null) {
      flashcardContents.innerHTML = ""
      flashcardContents.appendChild(s.flashcardHTML)
    }
  });
  (window as any).handleFlashcardFinished = (amountCorrect: number /* a number between 0 and 1 where 0 is completely wrong and 1 is completely correct */) => {
    if (typeof s === "string") {
      throw new Error("Unreachable")
    }
    decks.setSpacedRepetitionFrequency(
      nameOfOpenDeck,
      s.flashcard,
      s.deck.cards[s.flashcard].spacedRepetitionData.frequency
      + (s.possibleFrequencyChange.increase * (1-amountCorrect))
      + (s.possibleFrequencyChange.decrease * amountCorrect),
    )
    if (s.totalFrequency < maxFrequencyForDeck) {
      // TODO: Also increase the difficulty of existing cards as well as adding new cards to the set of cards with frequency > 0
      for (const [cardName, card] of Object.entries(s.deck.cards)) {
        if (card.spacedRepetitionData.frequency == 0) {
          decks.setSpacedRepetitionFrequency(nameOfOpenDeck, cardName, maxFrequencyForCard)
          if (s.totalFrequency >= 10) {
            break
          }
        }
      }
    }
    random = Math.random()
    last3cards.push(s.flashcard)
    last3cards = last3cards.slice(-3)
  }
</script>
<button onclick={() => nameOfOpenDeck = ""}>Home</button><br>
{#if typeof s === "string"}
  <span>{s}</span>
{:else}
  <div bind:this={flashcardContents}></div><br>
  <span>A flashcard called {s.flashcard} in a deck called {nameOfOpenDeck}</span><br>
  <span>Total frequency: {s.totalFrequency}</span><br>
  <span>Frequency of this card: {s.deck.cards[s.flashcard].spacedRepetitionData.frequency}</span><br>
  <span>Maximum possible frequency decrease of this card if you get everything right: {s.possibleFrequencyChange.decrease}</span><br>
  <span>Maximum possible frequency increase of this card if you get everything wrong: {s.possibleFrequencyChange.increase}</span>
{/if}
