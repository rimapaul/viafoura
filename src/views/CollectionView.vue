<script>
import { useGameStore } from '@/stores/game'
export default {
  name: 'CollectedView',
  props: {
    open: { type: Boolean, default: false },
    collection: { type: Object, default: () => ({}) },
    mode: { type: String, default: 'modal' },
  },
  emits: ['close'],
  data() {
    return {
      sortBy: 'id',           
      selectedTypes: [],      
      game: null,
    }
  },
  created() {
    if (this.mode === 'page') {
      this.game = useGameStore()
      if (!this.game.trainerName) {
        const last = localStorage.getItem('pocket-monsters-last')
        if (last) this.game.hydrateProfile(last)
      }
    }
  },
  computed: {
    entries() {
      return Object.values(this.effectiveCollection || {})
    },
    isOpen() {
      return this.mode === 'modal' ? this.open : true
    },
    effectiveCollection() {
      return this.mode === 'page'
        ? (this.game?.collection || {})
        : (this.collection || {})
    },
    allTypes() {
      const s = new Set()
      for (const e of this.entries) {
        const types = e?.pokemon?.types || []
        for (const t of types) {
          const name = typeof t === 'string' ? t : t?.type?.name
          if (name) s.add(name)
        }
      }
      return Array.from(s).sort()
    },
    filteredSorted() {
      let list = this.entries
      if (this.selectedTypes.length) {
        const set = new Set(this.selectedTypes)
        list = list.filter(e => {
          const types = e?.pokemon?.types || []
          return types.some(t => set.has(typeof t === 'string' ? t : t?.type?.name))
        })
      }
      return list.slice().sort((a,b) => {
        if (this.sortBy === 'name')   return a.pokemon.name.localeCompare(b.pokemon.name)
        if (this.sortBy === 'height') return (a.pokemon.height || 0) - (b.pokemon.height || 0)
        if (this.sortBy === 'speed')  {
          const sa = a.pokemon.stats?.find(s=>s.stat?.name==='speed')?.base_stat ?? 0
          const sb = b.pokemon.stats?.find(s=>s.stat?.name==='speed')?.base_stat ?? 0
          return sa - sb
        }
        return a.id - b.id
      })
    },
    summary() {
      return {
        unique: this.filteredSorted.length,
        total: this.filteredSorted.reduce((n,e)=> n + (e.count || 0), 0),
      }
    },
  },
  watch: {
    open(v) { if (v) this.$nextTick(() => this.$refs.closeBtn?.focus()) }
  },
  methods: {
    onBackdrop() { this.$emit('close') },
    onEsc(e) { if (e.key === 'Escape') this.$emit('close') },
    trapTab(e) {
      if (e.key !== 'Tab') return
      const root = this.$refs.card
      const focusables = Array.from(
        root.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled)
      if (!focusables.length) return
      const first = focusables[0], last = focusables.at(-1), active = document.activeElement
      if (e.shiftKey && (active === first || !focusables.includes(active))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (active === last || !focusables.includes(active))) { e.preventDefault(); first.focus() }
    },
    typeList(p) {
      const types = p?.types || []
      return types.map(t => typeof t === 'string' ? t : t?.type?.name).filter(Boolean).join(', ')
    }
  }
}
</script>

<template>
  <div
  v-if="isOpen"
   class="dex-modal"
   :class="{ 'as-page': mode === 'page' }"
   :role="mode === 'modal' ? 'dialog' : null"
   :aria-modal="mode === 'modal' ? 'true' : null"
   aria-label="Pokédex"
   @keydown="mode === 'modal' && trapTab($event)"
   @keydown.esc.prevent="mode === 'modal' && onEsc($event)"
 >
   <div v-if="mode === 'modal'" class="dex-backdrop" @click="onBackdrop"></div>
   <div class="dex-card" ref="card" :tabindex="mode === 'modal' ? -1 : null">
    
      <header class="dex-header">
        <h3>Pokédex</h3>
        <button
         v-if="mode === 'modal'"
         ref="closeBtn"
         @click="$emit('close')"
       >Close</button>
      </header>

      <div class="panel controls">
        <div>
          <strong>Sort by</strong>
          <select v-model="sortBy" aria-label="Sort by">
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="height">Height</option>
            <option value="speed">Speed</option>
          </select>
        </div>
        <div>
          <strong>Filter by type</strong>
          <div class="type-row">
            <label v-for="t in allTypes" :key="t" class="type-chip">
              <input type="checkbox" :value="t" v-model="selectedTypes" />
              <span class="capitalize">{{ t }}</span>
            </label>
          </div>
        </div>
      </div>

      <p class="subtitle summary">
        Showing {{ summary.unique }} unique · Total caught: {{ summary.total }}
      </p>

      <ul class="dex-grid">
        <li v-for="e in filteredSorted" :key="e.id" class="dex-item">
          <div class="dex-item-head">
            <img :src="e.pokemon.sprite || e.pokemon.sprites?.front_default || ''"
                 :alt="e.pokemon.name" width="72" height="72" />
            <div>
              <div><strong>#{{ e.id }}</strong> — <span class="capitalize">{{ e.pokemon.name }}</span></div>
              <div class="subtitle">x{{ e.count }}</div>
            </div>
          </div>
          <div class="dex-stats">
            <div>Height</div><div>{{ e.pokemon.height }}</div>
            <div>Speed</div><div>{{ e.pokemon.stats?.find(s => s.stat?.name === 'speed')?.base_stat ?? '—' }}</div>
            <div>Type</div><div>{{ typeList(e.pokemon) }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
    .dex-modal { 
        position: fixed; 
        inset: 0; 
        display: grid; 
        place-items: center; 
        z-index: 50;
    }
    .dex-backdrop { 
        position: absolute; 
        inset:0; 
        background: rgba(0,0,0,.6); 
    }
    .dex-card {
        position: relative; 
        width: min(980px, 96vw); 
        max-height: 86vh; 
        overflow: auto;
        background: #12141b; 
        border:1px solid #2a2e3a; 
        border-radius: 1rem; 
        padding:1rem; color: #f2f5fb;
    }
    .dex-modal.as-page {
      position: static;
      inset: auto;
      display: block;
      place-items: normal;
  }
    .dex-modal.as-page .dex-card {
      max-height: none;
    }
    .dex-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        gap: .5rem; 
    }
    .controls { 
        margin-top: .75rem; 
        display: grid; gap: .75rem; 
    }
    .type-row { 
        display: flex; 
        gap: .5rem; 
        flex-wrap: wrap; 
        margin-top: .5rem; 
    }
    .type-chip { 
        display: inline-flex; 
        align-items: center; 
        gap: .35rem; 
        border: 1px solid #2a2e3a; 
        border-radius: .6rem; 
        padding:.3rem .5rem; 
        cursor: pointer; 
    }
    .subtitle { 
        color :#a2adc2; 
    }
    .summary { 
        margin: .6rem 0 0 0; 
    }
    .dex-grid {
        display: grid; 
        gap: 1rem; 
        margin: 1rem 0 0 0; 
        padding: 0; 
        list-style: none;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .dex-item { 
        background: #0f1117; 
        border:1px solid #2a2e3a; 
        border-radius: .8rem; 
        padding: .8rem; 
        display: grid; 
        gap: .5rem; 
    }
    .dex-item-head { 
        display: flex; 
        gap: .6rem; 
        align-items: center; 
    }
    .dex-stats { 
        display: grid;
        grid-template-columns: auto 1fr; 
        gap:.2rem 1rem; 
    }
    .capitalize { 
        text-transform: capitalize; 
    }
</style>
