<script>
import { useGameStore } from '@/stores/game'
import { idRangeForGeneration, randomId, fetchPokemonById } from '@/api/pokeapi'
import EventLog from '@/components/EventLog.vue'
import EncounterStats from '@/components/EncounterStats.vue'
import CollectedView from '@/views/CollectionView.vue'
import ViewFinder from '@/components/ViewFinder.vue'
import GameControls from '@/components/GameControls.vue'

export default {
  components: { EventLog, EncounterStats, CollectedView, ViewFinder, GameControls },

  data() {
    return {
      game: useGameStore(),
      loading: false,
      ignoreLocked: false,   
      showDex: false,
      showQuit: false,
      anim: { ignoring: false, running: false },
    }
  },

  created() {
    this.game = useGameStore()
    
    if (!this.game.trainerName) {
        const last = localStorage.getItem('pocket-monsters-last')
        if (last) this.game.hydrateProfile(last)
    }
    
    if (!this.game.trainerName) {
        this.$router.push('/')
    }
  },

  computed: {
    canFind()  { 
        return !this.loading && !this.game.encounter 
    },
    canIgnore() { 
        return !!this.game.encounter && !this.ignoreLocked 
    },
    canThrow() { 
        return !!this.game.encounter 
    },
    pokedexCount() {
        return Object.keys(this.game?.collection || {}).length  
    },
    dexEntries() {
        return Object.values(this.game?.collection || {})
    },
    dexAllTypes() {
      const s = new Set()
      for (const e of this.dexEntries) {
        const types = e?.pokemon?.types || []
        for (const t of types) {
          const name = typeof t === 'string' ? t : t?.type?.name
          if (name) s.add(name)
        }
      }
      return Array.from(s).sort()
    },
    dexFilteredSorted() {
      let list = this.dexEntries
      if (this.dexSelectedTypes.length) {
        const set = new Set(this.dexSelectedTypes)
        list = list.filter(e => {
          const types = e?.pokemon?.types || []
          return types.some(t => set.has(typeof t === 'string' ? t : t?.type?.name))
        })
      }

      return list.slice().sort((a, b) => {
        if (this.dexSort === 'name')   return a.pokemon.name.localeCompare(b.pokemon.name)
        if (this.dexSort === 'height') return (a.pokemon.height || 0) - (b.pokemon.height || 0)
        if (this.dexSort === 'speed')  {
          const sa = a.pokemon.stats?.find(s => s.stat?.name === 'speed')?.base_stat ?? 0
          const sb = b.pokemon.stats?.find(s => s.stat?.name === 'speed')?.base_stat ?? 0
          return sa - sb
        }
        return a.id - b.id
      })
    },
    dexSummary() {
      return {
        unique: this.dexFilteredSorted.length,
        total: this.dexFilteredSorted.reduce((a,c)=>a + c.count, 0),
      }
    },
  },

  methods: {
    async onFind() {
      this.loading = true
      try {
        const range = idRangeForGeneration(this.game.selectedGen)
        const pid = randomId(range)
        const p = await fetchPokemonById(pid)
        this.game.startEncounter(p)          
        this.ignoreLocked = false               
      } catch (e) {
        this.game.log('Failed to find a Pokémon. Try again.')
      } finally {
        this.loading = false
      }
    },
    onIgnore() {
        if (!this.game.encounter) return
        this.anim.ignoring = true
        setTimeout(() => {
          this.game.ignoreEncounter()
          this.anim.ignoring = false
        }, 450)        
    },
    onThrow() {
      this.ignoreLocked = true
      const outcome = this.game.throwBall()

      if (outcome === 'run') {
        this.anim.running = true
        setTimeout(() => {
          this.game.finalizeRunAway()
          this.anim.running = false
          this.ignoreLocked = false
        }, 600)
      } else if (outcome === 'success') {
        this.ignoreLocked = false
      } else if (outcome === 'fail') {
      }
    },
    onQuitConfirm() {
      this.game.saveAll()       
      this.showQuit = false
      this.$router.push('/')     
    },
    onQuitCancel() {
      this.showQuit = false
    },
    onControlsKeydown(e) {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if (k === 'f' && this.canFind)   { e.preventDefault(); this.onFind() }
      if (k === 'i' && this.canIgnore) { e.preventDefault(); this.onIgnore() }
      if (k === 't' && this.canThrow)  { e.preventDefault(); this.onThrow() }
    },
  }
}
</script>

<template>
  <div class="container" style="max-width:1100px; margin:0 auto; padding:1rem; color:#f2f5fb;">

    <header class="panel" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; background:#12141b; border:1px solid #2a2e3a; border-radius:1rem; padding:1rem;">
      <h2 style="margin:0;">Capture Pocket Monsters</h2>
      <div>
        Trainer: <strong>{{ game.trainerName }}</strong> · Gen {{ game.selectedGen }}
      </div>
    </header>


    <div class="grid catch-layout" style="display:grid; gap:1rem; margin-top:1rem;">

      <ViewFinder
        :encounter="game.encounter"
        :loading="loading"
        :anim-ignoring="anim.ignoring"
        :anim-running="anim.running || game.runAwayPending"
      />

      <GameControls
        :can-find="canFind"
        :can-ignore="canIgnore"
        :can-throw="canThrow"
        :loading="loading"
        :pokedex-count="pokedexCount"
        @find="onFind"
        @ignore="onIgnore"
        @throw="onThrow"
        @openDex="showDex = true"
        @openQuit="showQuit = true"
      />
    </div>

    <section class="panel" aria-label="Event log"
             style="background:#12141b; border:1px solid #2a2e3a; border-radius:1rem; padding:1rem; margin-top:1rem;">
      <EventLog :items="game?.logs || []" :trainer="game?.trainerName || ''" />
    </section>
  </div>

  <CollectedView :open="showDex" :collection="game?.collection || {}" @close="showDex = false" />


  <div v-if="showQuit" class="dex-modal" role="dialog" aria-modal="true" aria-label="Quit game" @keydown.esc="onQuitCancel">
    <div class="dex-backdrop" @click="onQuitCancel"></div>
    <div class="dex-card">
      <h3 style="margin-top:0;">Quit game?</h3>
      <p class="subtitle">Your progress (trainer, collection, logs) will be saved to this browser.</p>
      <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1rem;">
        <button @click="onQuitCancel">No, keep playing</button>
        <button @click="onQuitConfirm">Yes, save & quit</button>
      </div>
    </div>
  </div>

</template>


<style scoped>
  @media (min-width: 900px) {
    .vf-grid { grid-template-columns: 180px 1fr; }
  }

  .dex-modal { position: fixed; inset: 0; display:grid; place-items:center; z-index: 50; }
  .dex-backdrop { position:absolute; inset:0; background: rgba(0,0,0,.6); }
  .dex-card {
    position: relative; width: min(980px, 96vw); max-height: 86vh; overflow:auto;
    background:#12141b; border:1px solid #2a2e3a; border-radius:1rem; padding:1rem; color:#f2f5fb;
  }
  .subtitle { color:#a2adc2; }

  .vf-grid { transition: transform 450ms ease, opacity 450ms ease; }
  .vf-sprite { transition: transform 600ms ease, opacity 600ms ease; }

  .is-running .vf-sprite {
    transform: translateX(160px);
    opacity: 0;
  }
  .is-running {
    transform: translateX(-8px);
    opacity: .85;
  }
</style>