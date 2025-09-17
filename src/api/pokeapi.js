const BASE = 'https://pokeapi.co/api/v2'

export function idRangeForGeneration(gen) {
  const map = { 1:[1,151], 2:[152,251], 3:[252,386] }
  return map[gen] || map[1]
}

export function randomId([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function fetchPokemonById(id) {
  const res = await fetch(`${BASE}/pokemon/${id}`)
  if (!res.ok) throw new Error('Failed to fetch Pokémon')
  return res.json()
}
