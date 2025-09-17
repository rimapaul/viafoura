<script>
import EncounterStats from '@/components/EncounterStats.vue'

export default {
  name: 'ViewFinder',
  components: { EncounterStats },
  props: {
    encounter: { type: Object, default: null },
    loading:   { type: Boolean, default: false },
    animIgnoring: { type: Boolean, default: false },
    animRunning:  { type: Boolean, default: false },
  },
}
</script>

<template>
  <section
    class="viewfinder"
    aria-label="Viewfinder"
    :aria-busy="loading ? 'true' : 'false'"
  >
  
    <template v-if="loading">
        <p class="subtitle">Finding a Pokémon…</p>
    </template>
  
    <template v-else-if="!encounter">
        <p class="subtitle">No encounter yet. Click <strong>Find</strong> to begin.</p>
    </template>
  
    <template v-else>
        <div class="vf-grid"
            :class="{ 'is-ignoring': animIgnoring, 'is-running': animRunning }"
        >
            <img
                class="vf-sprite"
                :src="encounter?.sprite || encounter?.sprites?.front_default || ''"
                :alt="encounter?.name || 'Pokémon'"
                width="160" height="160"
            />
            <EncounterStats :pokemon="encounter" />
        </div>
    </template>
  </section>
</template>

<style scoped>
    .viewfinder {
        border: 2px solid #3aa1ff;
        border-radius: 1rem;
        min-height: 320px;
        display: grid;
        place-items: center;
        padding: 1rem;
    }

    .subtitle { 
        color: #a2adc2; 
        margin: 0; 
    }

    .vf-grid { 
        display: grid; 
        gap: 1rem; 
        align-items: center; 
    }

    @media (min-width: 900px) {
        .vf-grid { 
            grid-template-columns: 180px 1fr; 
        }
    }

    .vf-grid, .vf-sprite { 
        transition: transform 600ms ease, opacity 600ms ease; 
    }

    .is-ignoring { 
        opacity: 0; transform: scale(.95); 
    }

    .is-running .vf-sprite { 
        transform: translateX(160px); 
        opacity:0; 
    }

    .is-running { 
        transform: translateX(-8px); 
        opacity:.85; 
    }

    @media (prefers-reduced-motion: reduce) {
        .vf-grid, .vf-sprite { 
            transition: none; 
        }
    }
</style>
