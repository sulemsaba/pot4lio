<template>
  <svg class="arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.arrow {
  flex: none;
  transition: transform 0.25s var(--ease-out);
}

a:hover > .arrow {
  transform: translate(1px, -1px);
}
</style>
