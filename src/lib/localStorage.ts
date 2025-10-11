import { writable } from "svelte/store"
import { getLocalStorage } from "$lib/utils"

export function getFlashcardRenderFunctions() {
  return (window as any).flashcards as Record<string, () => Element>
}

type LocalStorageChange = {
  type: "createDeck",
  deckName: string,
  deck: FlashcardDeck,
} | {
  type: "deleteDeck",
  deckName: string,
} | {
  type: "setSpacedRepetitionFrequency",
  deckName: string,
  flashcardName: string,
  newFrequency: number,
}

const code = "code"
const spacedRepetitionFrequency = "spaced-repetition-frequency"

type SpacedRepetitionData = {frequency: number}

type LocalStorageKey = {
  type: typeof code,
  deckName: string,
} | {
  type: typeof spacedRepetitionFrequency,
  deckName: string,
  flashcardName: string,
}

function deserializeLocalStorageKey(key: string): undefined | LocalStorageKey {
  let index = 0

  function parseString() {
    while (index < key.length && key[index] == " ") {
      index += 1
    }
    let lengthStr = ""
    while (index < key.length && key[index] != ":") {
      lengthStr += key[index]
      index += 1
    }
    index += 1
    const length = parseInt(lengthStr)
    index += length
    return key.substring(index-length, index)
  }

  if (key.startsWith(code)) {
    index += code.length
    return {type: code, deckName: parseString()}
  } else if (key.startsWith(spacedRepetitionFrequency)) {
    index += spacedRepetitionFrequency.length
    return {type: spacedRepetitionFrequency, deckName: parseString(), flashcardName: parseString()}
  }
}

function setLocalStorageCodeItem(deckName: string, codeToSet: string) {
  window.localStorage.setItem(`${code} ${deckName.length}:${deckName}`, codeToSet)
}
function removeLocalStorageCodeItem(deckName: string) {
  window.localStorage.removeItem(`${code} ${deckName.length}:${deckName}`)
}

function setLocalStorageSpacedRepetitionFrequency(deckName: string, flashcardName: string, frequency: number) {
  window.localStorage.setItem(`${spacedRepetitionFrequency} ${deckName.length}:${deckName} ${flashcardName.length}:${flashcardName}`, frequency.toString())
}
function removeLocalStorageSpacedRepetitionFrequency(deckName: string, flashcardName: string) {
  window.localStorage.removeItem(`${spacedRepetitionFrequency} ${deckName.length}:${deckName} ${flashcardName.length}:${flashcardName}`)
}

export type Flashcard = {
  spacedRepetitionData: SpacedRepetitionData
}
export type FlashcardDeck = {
  code: string,
  cards: Record<string, Flashcard>,
}

const decksWritable = writable({} as Record<string, FlashcardDeck>)

export function initLocalStorage() {
  let decksValue = {} as Record<string, FlashcardDeck>
  // TODO: Do not parse all the permanently stored state when the page is loaded
  for (const [rawKey, value] of getLocalStorage()) {
    const key = deserializeLocalStorageKey(rawKey)
    if (key == undefined) {
      continue
    }
    if (!Object.hasOwn(decksValue, key.deckName)) {
      decksValue[key.deckName] = {code: "", cards: {}}
    }
    if (key.type == code) {
      decksValue[key.deckName].code = value
    } else if (key.type == spacedRepetitionFrequency) {
      decksValue[key.deckName].cards[key.flashcardName] = {spacedRepetitionData: {frequency: parseFloat(value)}}
    }
  }
  decksWritable.set(decksValue)
}

const localStorageSignals = new BroadcastChannel("local-storage")

function updateDecks(change: LocalStorageChange, sendMessageAndUpdateLocalStorage: boolean) {
  switch (change.type) {
    case "createDeck":
      decksWritable.update(decks => {
        if (sendMessageAndUpdateLocalStorage) {
          setLocalStorageCodeItem(change.deckName, change.deck.code)
          for (const [flashcardName, flashcard] of Object.entries(change.deck.cards)) {
            setLocalStorageSpacedRepetitionFrequency(change.deckName, flashcardName, flashcard.spacedRepetitionData.frequency)
          }
        }
        decks[change.deckName] = change.deck
        return decks
      })
      break
    case "deleteDeck":
      decksWritable.update(decks => {
        if (sendMessageAndUpdateLocalStorage) {
          removeLocalStorageCodeItem(change.deckName)
          for (const [flashcardName, _flashcard] of Object.entries(decks[change.deckName].cards)) {
            removeLocalStorageSpacedRepetitionFrequency(change.deckName, flashcardName)
          }
        }
        delete decks[change.deckName]
        return decks
      })
      break
    case "setSpacedRepetitionFrequency":
      decksWritable.update(decks => {
        if (sendMessageAndUpdateLocalStorage) {
          setLocalStorageSpacedRepetitionFrequency(change.deckName, change.flashcardName, change.newFrequency)
        }
        decks[change.deckName].cards[change.flashcardName].spacedRepetitionData.frequency = change.newFrequency
        return decks
      })
  }
  if (sendMessageAndUpdateLocalStorage) {
    localStorageSignals.postMessage(change)
  }
}

localStorageSignals.onmessage = ({data}: {data: LocalStorageChange}) => {
  updateDecks(data, false)
}

export const decks = {
  subscribe: decksWritable.subscribe,
  setSpacedRepetitionFrequency: (deckName: string, flashcardName: string, newFrequency: number) => {
    updateDecks({type: "setSpacedRepetitionFrequency", flashcardName, deckName, newFrequency}, true)
  },
  createDeck: (deckName: string, deck: FlashcardDeck) => {
    updateDecks({type: "createDeck", deckName, deck}, true)
  },
  deleteDeck: (deckName: string) => {
    updateDecks({type: "deleteDeck", deckName}, true)
  },
}

export function getTotalFrequency(deck: FlashcardDeck, excludedCards: string[]) {
  let totalFrequency = 0
  for (const [cardName, card] of Object.entries(deck.cards)) {
    if (!excludedCards.includes(cardName)) {
      totalFrequency += card.spacedRepetitionData.frequency
    }
  }
  return totalFrequency
}

export function getNextFlashcard(
  deck: FlashcardDeck,
  random: number, // A number between 0 and 1
  excludedCards: string[],
) {
  const number = random * getTotalFrequency(deck, excludedCards)
  let currentFrequency = 0
  for (const [cardName, card] of Object.entries(deck.cards)) {
    if (!excludedCards.includes(cardName)) {
      currentFrequency += card.spacedRepetitionData.frequency
      if (currentFrequency >= number) {
        return cardName
      }
    }
  }
  throw new Error("Unreachable")
}
