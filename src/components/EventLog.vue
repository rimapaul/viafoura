<script setup>
  defineProps({
    items: { type: Array, default: () => [] },   
    trainer: { type: String, default: '' }
  })
</script>

<template>
  <div class="event-log" aria-live="polite" aria-label="Event log">
    <div v-if="!items.length">
      Happy hunting, {{ trainer || 'Trainer' }}!
    </div>

    <ol v-else>
      <li v-for="i in items" :key="i.id">
        {{ new Date(i.ts).toLocaleTimeString() }} — {{ i.message }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
  .event-log { 
    max-height: 260px; 
    overflow: auto; 
  }
  
  ol { 
    margin: 0; 
    padding-left: 1.2rem; 
  }
</style>