<script setup>
import { computed } from 'vue'

const props = defineProps({
  pokemon: { type: Object, required: true }
})

// Types can be: ['grass','poison'] OR [{ type: { name: 'grass' }}, ...]
const typeList = computed(() => {
  const types = props.pokemon?.types || []
  return types
    .map(t => (typeof t === 'string' ? t : t?.type?.name))
    .filter(Boolean)
    .join(', ')
})

const speed = computed(() =>
  props.pokemon?.stats?.find(s => s.stat?.name === 'speed')?.base_stat ?? '—'
)
</script>

<template>
  <div class="encounter-stats panel" style="margin:0; text-align:left;">
    <h3 style="margin:.2rem 0 1rem; text-transform:capitalize;">
      {{ pokemon?.name }}
    </h3>
    <dl style="display:grid; grid-template-columns:auto 1fr; gap:.4rem 1rem;">
      <dt>Type</dt><dd>{{ typeList }}</dd>
      <dt>Height</dt><dd>{{ pokemon?.height }}</dd>
      <dt>Speed</dt><dd>{{ speed }}</dd>
    </dl>
  </div>
</template>

<style scoped>
  .encounter-stats { 
    color: #E2B700; 
  }

  .encounter-stats h3 { 
    color: #E2B700; 
  }
  
  .encounter-stats dt { 
    color: #E2B700; 
  }
  
  .encounter-stats.panel {
    border-color: #C9A227;
    background: #12141b;
    padding: 1rem;
    border-radius: 1rem;
  }
</style>
