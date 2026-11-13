<template>
  <div class="play">
    <h1 class="headline swap reveal" :style="{ '--i': 1 }" tabindex="-1" data-page-title>
      <RichText :text="t.playTitle" />
    </h1>
    <div class="games">
      <GameCard
        v-for="(game, n) in games"
        :key="game.id"
        class="reveal"
        :style="{ '--i': n + 2 }"
        :id="game.id"
        :title="t[game.id].title"
        :how="t[game.id].how"
        :tone="game.tone"
        :flip="n % 2 === 1"
        :create="game.create"
        :scene="game.scene"
        :t="t"
      />
    </div>
  </div>
</template>

<script setup>
import { createDaladala } from '../games/daladala.js'
import { createEmbe } from '../games/embe.js'
import { createMpira } from '../games/mpira.js'
import RichText from '../components/RichText.vue'
import GameCard from '../components/play/GameCard.vue'

defineProps({
  lang: { type: String, required: true },
  t: { type: Object, required: true },
  focus: { type: String, default: '' },
})

// Three one-button games. Each keeps its best score on the visitor's device.
// The 3D scenes (and three.js) load only here, when the page opens.
const games = [
  { id: 'daladala', tone: 'sand', create: createDaladala, scene: () => import('../games/scenes/daladala3d.js') },
  { id: 'embe', tone: 'palm', create: createEmbe, scene: () => import('../games/scenes/embe3d.js') },
  { id: 'mpira', tone: 'sky', create: createMpira, scene: () => import('../games/scenes/mpira3d.js') },
]
</script>

<style scoped>
.play {
  max-width: 68rem;
  margin: 0 auto;
}

.headline {
  max-width: 40rem;
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.games {
  display: grid;
  gap: var(--gap);
}
</style>
