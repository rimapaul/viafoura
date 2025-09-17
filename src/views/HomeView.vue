<script>
import { useGameStore } from '@/stores/game'

export default {
  data() {
    return {
      name: '',
      gen: 1,
      game: null,
      isStarting: false,
    }
  },

  created() {
    this.game = useGameStore()
    this.game.hydrateTitle()
    if (this.game.trainerName) {
      this.name = this.game.trainerName
      this.gen = this.game.selectedGen
    }
  },

  computed: {
    hasSave() {
      return this.game?.hasSave ?? false
    }
  },

  methods: {
    async startGame() {
      const enteredName = this.name?.trim()
      if (!enteredName) return
      
      const all = JSON.parse(localStorage.getItem('pocket-monsters-saves') || '{}')
      const hasProfile = Object.keys(all).some(k => k.toLowerCase() === enteredName.toLowerCase())
      
      if (hasProfile) {
        this.game.hydrateProfile(enteredName)
        this.game._setLast(enteredName) 
      } else {
        this.game.resetForNewGame(enteredName, this.gen || 1)
      }
      
      this.isStarting = true
      await new Promise(r => setTimeout(r, 500))
      this.$router.push('/capture')
    }
  }
}
</script>

<template>
  <main :class="['start-screen', { 'start-screen--starting': isStarting }]">
  <h1 class="start-title">Capture Pocket Monsters!</h1>
    
    <div class="start-panel">
      
      <form id="form-registration" @submit.prevent="startGame" style="display:grid; gap:.75rem; text-align:left; max-width:460px; margin:0 auto;">
        <label for="trainer-name">Trainer Name</label>
        <input type="text" id="trainer-name" v-model="name" required placeholder="Ash, Misty, Rima…" />

        <label for="gen">Generation</label>
        <select id="gen" v-model.number="gen">
          <option :value="1">Gen 1 (1-151)</option>
          <option :value="2">Gen 2 (152-251)</option>
          <option :value="3">Gen 3 (252-386)</option>
        </select>

        <div style="display:flex; gap:.5rem; justify-content:center; margin-top:.25rem;">
          <button type="submit">Start</button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>

.start-screen {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  position: relative;
  padding: 1rem;
}

.start-panel{
  width:100%;
  max-width:720px;
  margin-inline:auto;
  text-align:center;
  border:1px solid #2a2e3a;
  background:#12141b;
  border-radius:1rem;
  padding:1.25rem;
}

.start-title {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%,-60%);
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  margin: 0;
  text-align: center;
  transition: transform 500ms ease, font-size 500ms ease, top 500ms ease;
  color: #C9A227;
}

.start-form {
  display: grid;
  gap: .75rem;
  width: min(420px, 92vw);
  z-index: 1;
  text-align: left;
}

.start-screen--starting .start-title {
  top: 24px;
  left: 50%;
  transform: translate(-50%, 0);
  font-size: clamp(1.4rem, 3.2vw, 2rem);
}

@media (prefers-reduced-motion: reduce) {
  .start-title { transition: none; }
}
</style>