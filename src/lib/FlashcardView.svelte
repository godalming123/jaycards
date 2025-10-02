<script lang="ts">
  import type { LocalStorageState } from '../lib/utils'
  let {localStorage = $bindable({} as LocalStorageState), nameOfOpenDeck = $bindable("")} = $props()
</script>
<button onclick={() => nameOfOpenDeck = ""}>Home</button>
<span>Deck called {nameOfOpenDeck}</span>
