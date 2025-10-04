export function tryRemovePrefix(str: string, prefix: string): string | null {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length)
  }
  return null
}

export function* getLocalStorage() {
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key == null) {throw new Error()}
    const value = window.localStorage.getItem(key)
    if (value == null) {throw new Error()}
    yield [key, value]
  }
}
