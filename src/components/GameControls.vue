<script>
export default {
  name: 'GameControls',
  props: {
    canFind:   { type: Boolean, default: true },
    canIgnore: { type: Boolean, default: false },
    canThrow:  { type: Boolean, default: false },
    loading:   { type: Boolean, default: false },
    pokedexCount: { type: Number, default: 0 },
  },
  emits: ['find','ignore','throw','openDex','openQuit'],
  methods: {
    onKeydown(e) {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if (k === 'f' && this.canFind)   { e.preventDefault(); this.$emit('find') }
      if (k === 'i' && this.canIgnore) { e.preventDefault(); this.$emit('ignore') }
      if (k === 't' && this.canThrow)  { e.preventDefault(); this.$emit('throw') }
    }
  }
}
</script>

<template>
  <aside
    class="panel game-controls"
    aria-label="Controls"
    tabindex="0"
    @keydown="onKeydown"
  >
    <div class="row">
      <button :disabled="!canFind" @click="$emit('find')">
        <span v-if="loading">Finding…</span><span v-else>Find</span>
      </button>
      <button :disabled="!canIgnore" @click="$emit('ignore')">Ignore</button>
      <button :disabled="!canThrow"  @click="$emit('throw')">Throw</button>
    </div>

    <div class="row">
      <button @click="$emit('openDex')">Pokédex ({{ pokedexCount }})</button> <!-- ✅ use pokedexCount -->
      <button @click="$emit('openQuit')">Quit</button>
    </div>

    <p class="subtitle kbd">Keyboard: F = Find, I = Ignore, T = Throw</p>
  </aside>
</template>

<style scoped>
    .game-controls {
        background: #12141b; 
        border: 1px solid #2a2e3a; 
        border-radius: 1rem; 
        padding: 1rem;
    }

    .row { 
        display: flex; 
        gap: .5rem; 
        flex-wrap: wrap; 
        margin-bottom: .5rem; 
    }

    .subtitle.kbd { 
        margin: .25rem 0 0; 
        color: #a2adc2; 
    }
    
    .panel:focus { 
        outline: 3px solid #3aa1ff; 
        outline-offset: 2px; 
    }
</style>
