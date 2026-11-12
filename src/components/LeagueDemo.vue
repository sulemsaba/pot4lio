<template>
  <div class="demo">
    <div class="demo-head">
      <h3 class="tag demo-title swap">{{ t.demoTitle }}</h3>
      <span class="badge swap">{{ t.demoBadge }}</span>
    </div>

    <div class="match" aria-live="polite">
      <p class="score">
        <span>{{ match.home }}</span>
        <strong>{{ match.hg }} : {{ match.ag }}</strong>
        <span>{{ match.away }}</span>
      </p>
      <p v-if="!confirmed" class="line swap">
        {{ match.home }} {{ t.demoRead }} {{ match.hg }} : {{ match.ag }}. {{ match.away }}, {{ t.demoAsk }}
      </p>
      <p v-else class="line done">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.25" /><path d="M4.75 8.25 6.9 10.4 11.25 5.75" /></svg>
        <span class="swap">{{ t.demoDone }}</span>
      </p>
      <button v-if="!confirmed" type="button" class="button button--ink" @click="confirm">
        <span class="swap">{{ t.demoConfirm }}</span>
      </button>
      <button v-else type="button" class="button" @click="next">
        <span class="swap">{{ round === matches.length - 1 ? t.demoAgain : t.demoNext }}</span>
      </button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col" class="swap">{{ t.demoPlayer }}</th>
          <th scope="col" class="num swap">{{ t.demoPlayed }}</th>
          <th scope="col" class="num swap">{{ t.demoPoints }}</th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" name="row">
        <tr v-for="(row, i) in sorted" :key="row.name" :class="{ moved: changed.includes(row.name) }">
          <td>{{ i + 1 }}</td>
          <td>{{ row.name }}</td>
          <td class="num">{{ row.played }}</td>
          <td class="num pts">{{ row.points }}</td>
        </tr>
      </TransitionGroup>
    </table>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineProps({ t: { type: Object, required: true } })

// A made-up mini league, only to show how LigiPlay keeps the table.
const START = [
  { name: 'Baraka', played: 2, points: 4 },
  { name: 'Juma', played: 2, points: 3 },
  { name: 'Asha', played: 1, points: 1 },
  { name: 'Neema', played: 1, points: 0 },
]
const matches = [
  { home: 'Asha', away: 'Juma', hg: 2, ag: 1 },
  { home: 'Neema', away: 'Baraka', hg: 1, ag: 1 },
  { home: 'Juma', away: 'Neema', hg: 3, ag: 0 },
]

const rows = reactive(START.map((row) => ({ ...row })))
const round = ref(0)
const confirmed = ref(false)
const changed = ref([])
const match = computed(() => matches[round.value])

const sorted = computed(() => [...rows].sort((a, b) => b.points - a.points || a.played - b.played || a.name.localeCompare(b.name)))

// Both players have confirmed: the table updates itself.
function confirm() {
  const { home, away, hg, ag } = match.value
  const h = rows.find((r) => r.name === home)
  const a = rows.find((r) => r.name === away)
  h.played += 1
  a.played += 1
  if (hg > ag) h.points += 3
  else if (ag > hg) a.points += 3
  else {
    h.points += 1
    a.points += 1
  }
  changed.value = [home, away]
  confirmed.value = true
}

function next() {
  confirmed.value = false
  changed.value = []
  if (round.value === matches.length - 1) {
    START.forEach((row, i) => Object.assign(rows[i], row))
    round.value = 0
  } else round.value += 1
}
</script>

<style scoped>
.demo {
  margin-top: 1.5rem;
  padding: clamp(1.125rem, 2.5vw, 1.5rem);
  border-radius: calc(var(--radius) * 0.75);
  background: #123d31;
  color: #eaf5ef;
}

.demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.demo-title {
  color: rgb(234 245 239 / 0.8);
}

.badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: #d7f36b;
  color: #123d31;
  font-size: 0.75rem;
  font-weight: 700;
}

.match {
  display: grid;
  justify-items: start;
  gap: 0.625rem;
  margin-top: 1rem;
}

.score {
  display: flex;
  align-items: baseline;
  gap: 0.875rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.score strong {
  padding: 0.125rem 0.625rem;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.1);
  font-variant-numeric: tabular-nums;
}

.line {
  margin: 0;
  color: rgb(234 245 239 / 0.85);
  font-size: 0.9375rem;
}

.done {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d7f36b;
}

.done circle {
  fill: #d7f36b;
}

.done path {
  fill: none;
  stroke: #123d31;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.match .button {
  min-height: 2.5rem;
  border-color: rgb(234 245 239 / 0.35);
  background: transparent;
  color: inherit;
}

.match .button--ink {
  border-color: #d7f36b;
  background: #d7f36b;
  color: #123d31;
}

.table {
  width: 100%;
  margin-top: 1.125rem;
  border-collapse: collapse;
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
}

th {
  padding: 0 0 0.375rem;
  color: rgb(234 245 239 / 0.7);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 0.5rem 0;
  border-top: 1px solid rgb(234 245 239 / 0.12);
}

.num {
  width: 4.5rem;
  text-align: right;
}

th:first-child,
td:first-child {
  width: 2.25rem;
}

.pts {
  font-weight: 700;
}

.moved td {
  color: #d7f36b;
}

/* Rows slide to their new places. */
.row-move {
  transition: transform 0.7s var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .row-move {
    transition: none;
  }
}
</style>
