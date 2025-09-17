import { defineStore } from 'pinia'

const LS_KEY_SINGLE = 'pocket-monsters-save'   
const LS_KEY_MULTI  = 'pocket-monsters-saves'  
const LS_KEY_LAST   = 'pocket-monsters-last' 

export const useGameStore = defineStore('game', {
  state: () => ({
    trainerName: '',
    selectedGen: 1,
    encounter: null,
    encounterFailStreak: 0,
    logs: [],            
    collection: {}, 
    runAwayPending: false,         
  }),

  getters: {
    hasSave() {
      try { return !!JSON.parse(localStorage.getItem(LS_KEY_SINGLE))?.trainerName }
      catch { return false }
    }
  },

  actions: {
    _loadAll() {
        try {
          const raw = localStorage.getItem(LS_KEY_MULTI)
          if (!raw) return {}
          const parsed = JSON.parse(raw)
          return parsed && typeof parsed === 'object' ? parsed : {}
        } catch {
          return {}
        }
      },

    _saveAll(all) { localStorage.setItem(LS_KEY_MULTI, JSON.stringify(all))},

    _setLast(name) {                      // 👈 NEW
      localStorage.setItem(LS_KEY_LAST, (name || '').trim())
    },

    _leanPokemon(p) {
        if (!p) return null
        const speed = Array.isArray(p.stats)
          ? (p.stats.find(s => s.stat?.name === 'speed')?.base_stat ?? null)
          : null
  
        return {
          id: p.id,
          name: p.name,
          height: p.height,
          sprite: p.sprites?.front_default ?? null,
          types: (p.types || []).map(t => t.type?.name).filter(Boolean),
          stats: [{ stat: { name: 'speed' }, base_stat: speed }],
        }
      },

    setTrainer(name) { this.trainerName = (name || '').trim() },

    setGen(gen) { this.selectedGen = Number(gen) || 1 },

    saveTitleInfo() {
      const raw = localStorage.getItem(LS_KEY_SINGLE)
      const prev = raw ? JSON.parse(raw) : {}
      localStorage.setItem(LS_KEY_SINGLE, JSON.stringify({
        ...prev,
        trainerName: this.trainerName,
        selectedGen: this.selectedGen,
      }))
    },

    hydrateTitle() {
      const raw = localStorage.getItem(LS_KEY_SINGLE)
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.trainerName) this.trainerName = d.trainerName
      if (d.selectedGen) this.selectedGen = d.selectedGen
    },

    log(message) {
      this.logs.push({ id: Date.now() + Math.random(), message, ts: Date.now() })
    },

    startEncounter(pokemon) {
      this.encounter = pokemon
      this.encounterFailStreak = 0
      this.log(`A wild ${pokemon.name} appeared!`)
    },

    ignoreEncounter() {
      if (!this.encounter) return
      const who = this.trainerName || 'Trainer'
      this.log(`${who} ignored ${this.encounter.name}.`)
      this.encounter = null
      this.encounterFailStreak = 0
    },

    throwBall() {
      if (!this.encounter) return
      const who = this.trainerName || 'Trainer'
      this.log(`${who} throws a ball at ${this.encounter.name}…`)

      const fail = Math.floor(Math.random() * 3) === 0
      if (!fail) { this.capture(); return }

      this.encounterFailStreak += 1
      if (this.encounterFailStreak >= 2) {
        this.log(`${this.encounter.name} ran away!`)
        this.runAwayPending = true 
        return 'run'
      } else {
        this.log('Oh no! The ball broke free.')
        return 'fail'
      }
    },

    finalizeRunAway() {
      if (this.runAwayPending) {
        this.encounter = null
        this.encounterFailStreak = 0
        this.runAwayPending = false
      }
    },

    capture() {
      if (!this.encounter) return
      const p = this._leanPokemon(this.encounter) || this.encounter

      if (!this.collection[p.id]) {
        this.collection[p.id] = { id: p.id, count: 1, pokemon: p }
      } else {
        this.collection[p.id].count++
      }

      this.log(`Gotcha! ${p.name} was caught.`)
      this.encounter = null
      this.encounterFailStreak = 0
      this.saveAll()
    },

    saveAll() {
      const name = (this.trainerName || '').trim()
      if (!name) return
      const all = this._loadAll()
      all[name] = {
        trainerName: this.trainerName,
        selectedGen: this.selectedGen,
        logs: this.logs,
        collection: this.collection,
      }
      this._saveAll(all)
      localStorage.setItem(LS_KEY_SINGLE, JSON.stringify(all[name]))
      this._setLast(name)
    },

    hydrateAll() {
      const raw = localStorage.getItem(LS_KEY_SINGLE)
      if (!raw) return
      const d = JSON.parse(raw)
      this.trainerName = d.trainerName || ''
      this.selectedGen = d.selectedGen || 1
      this.logs = Array.isArray(d.logs) ? d.logs : []
      this.collection = d.collection && typeof d.collection === 'object' ? d.collection : {}
      this.encounter = null
      this.encounterFailStreak = 0
    },

    hydrateProfile(name) {
      if (!name) return
      const key = name.trim().toLowerCase()
      const all = this._loadAll()
      const foundKey = Object.keys(all).find(k => k.toLowerCase() === key)
      const d = foundKey ? all[foundKey] : null

      if (!d) {
        const raw = localStorage.getItem(LS_KEY_SINGLE)
        if (!raw) return
        const legacy = JSON.parse(raw)
        if ((legacy.trainerName || '').toLowerCase() !== key) return
        this.trainerName = legacy.trainerName
        this.selectedGen = legacy.selectedGen || 1
        this.logs = legacy.logs || []
        this.collection = legacy.collection || {}
        this.encounter = null
        this.encounterFailStreak = 0
        return
      }

      this.trainerName = d.trainerName || name
      this.selectedGen = d.selectedGen || 1
      this.logs = Array.isArray(d.logs) ? d.logs : []
      this.collection = d.collection && typeof d.collection === 'object' ? d.collection : {}
      this.encounter = null
      this.encounterFailStreak = 0
    },

    resetForNewGame(name, gen) {
      this.trainerName = (name || '').trim()
      this.selectedGen = Number(gen) || 1
      this.encounter = null
      this.encounterFailStreak = 0
      this.logs = []
      this.collection = {}

      const all = this._loadAll()
      all[this.trainerName] = {
        trainerName: this.trainerName,
        selectedGen: this.selectedGen,
        logs: [],
        collection: {},
      }
      this._saveAll(all)
      localStorage.setItem(LS_KEY_SINGLE, JSON.stringify(all[this.trainerName]))
      this._setLast(this.trainerName)
    },
  },
})

