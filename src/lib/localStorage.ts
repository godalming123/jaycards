import * as z from "zod"
import { writable } from "svelte/store"
import { tryRemovePrefix, getLocalStorage } from "$lib/utils"

const List = z.object({
  get heading() {
    return FormattedText
  },
  get items() {
    return z.array(FormattedText)
  }
})

const FormattedText = z.union([List])

export const FlashcardDeck = z.record(z.string(), z.object({
  dependencies: z.array(z.string()),
  contents: FormattedText,
})).refine((deck) => {
  const keys = Array.from(Object.keys(deck))
  let index = 0
  for (const flashcard of Object.values(deck)) {
    for (const dependency in flashcard.dependencies) {
      const dependencyIndex = keys.indexOf(dependency)
      // The dependency must be a flashcard that is defined before this
      // flashcard (this is necersarry to prevent circular dependencies)
      if (dependencyIndex == -1 || dependencyIndex >= index) {
        return false
      }
    }
    index += 1
  }
  return true
})

const deckPrefix = "deck-"
const downloadedDeckPrefix = "downloaded-deck-"

export type DownloadedDeck = z.infer<typeof FlashcardDeck>

const defaultDecks = {} as Record<string, string>
const defaultDownloadedDecks = {} as Record<string, DownloadedDeck>
const decksWritable = writable(defaultDecks)
const downloadedDecksWritable = writable(defaultDownloadedDecks)

function handleStorageEvent(event: StorageEvent) {
  if (event.storageArea == localStorage) {
    if (event.key == null) {throw new Error()}
    let key: string | null = null
    if ((key = tryRemovePrefix(event.key, deckPrefix)) != null) {
      decksWritable.update(value => {
        if (key == null) {throw new Error()}
        if (event.newValue == null) {
          delete value[key]
        } else {
          value[key] = event.newValue
        }
        return value
      })
    } else if ((key = tryRemovePrefix(event.key, downloadedDeckPrefix)) != null) {
      downloadedDecksWritable.update(value => {
        if (key == null) {throw new Error()}
        if (event.newValue == null) {
          delete value[key]
        } else {
          value[key] = JSON.parse(event.newValue)
        }
        return value
      })
    }
  }
}

export function initLocalStorage() {
  const initialised = window.localStorage.getItem("storage-initialised") == "true"
  if (initialised) {
    let decksValue = {} as Record<string, string>
    let downloadedDecksValue = {} as Record<string, DownloadedDeck>
    for (const [rawKey, value] of getLocalStorage()) {
      let key: string | null = null
      if ((key = tryRemovePrefix(rawKey, deckPrefix)) != null) {
        decksValue[key] = value
      } else if ((key = tryRemovePrefix(rawKey, downloadedDeckPrefix)) != null) {
        downloadedDecksValue[key] = JSON.parse(value)
      }
    }
    decksWritable.set(decksValue)
    downloadedDecksWritable.set(downloadedDecksValue)
  } else {
    for (const [key, value] of Object.entries(defaultDecks)) {
      window.localStorage.setItem(deckPrefix + key, value)
    }
    for (const [key, value] of Object.entries(defaultDownloadedDecks)) {
      window.localStorage.setItem(downloadedDeckPrefix + key, JSON.stringify(value))
    }
    window.localStorage.setItem("storage-initialised", "true")
  }
  window.addEventListener("storage", handleStorageEvent)
}

export function deinitLocalStorage() {
  window.removeEventListener("storage", handleStorageEvent)
}

// In the following 2 objects, the `set` and `delete` functions update the
// writable because for some reason the storage event is only received by other
// tabs

export const decks = {
  subscribe: decksWritable.subscribe,
  set: (name: string, url: string) => {
    decksWritable.update(decks => {
      decks[name] = url
      return decks
    })
    window.localStorage.setItem(deckPrefix + name, url)
  },
  delete: (name: string) => {
    decksWritable.update(decks => {
      delete decks[name]
      return decks
    })
    window.localStorage.removeItem(deckPrefix + name)
  },
}

export const downloadedDecks = {
  subscribe: downloadedDecksWritable.subscribe,
  set: (url: string, value: DownloadedDeck) => {
    downloadedDecksWritable.update(downloadedDecks => {
      downloadedDecks[url] = value
      return downloadedDecks
    })
    window.localStorage.setItem(downloadedDeckPrefix + url, JSON.stringify(value))
  },
  delete: (url: string) => {
    downloadedDecksWritable.update(downloadedDecks => {
      delete downloadedDecks[url]
      return downloadedDecks
    })
    window.localStorage.removeItem(downloadedDeckPrefix + url)
  },
}
