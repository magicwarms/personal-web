<script setup lang="ts">
/**
 * A small hand-built signature mark — a core service with a handful of
 * satellites, the shape a distributed backend actually has. Pure inline
 * SVG (Tier B), no external asset, decorative only.
 */
</script>

<template>
  <div class="system-mark" aria-hidden="true">
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="system-mark__edges" stroke="var(--color-accent)" stroke-linecap="round" stroke-width="7">
        <line x1="160" y1="100" x2="55" y2="45" opacity="0.4" />
        <line x1="160" y1="100" x2="255" y2="30" opacity="0.28" />
        <line x1="160" y1="100" x2="275" y2="145" opacity="0.34" />
        <line x1="160" y1="100" x2="60" y2="160" opacity="0.22" />
      </g>
      <g class="system-mark__nodes" fill="var(--color-accent)">
        <circle cx="55" cy="45" r="10" opacity="0.7" />
        <circle cx="255" cy="30" r="7" opacity="0.5" />
        <circle cx="275" cy="145" r="13" opacity="0.6" />
        <circle cx="60" cy="160" r="8" opacity="0.4" />
        <circle cx="160" cy="100" r="27" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.system-mark {
  display: flex;
  justify-content: center;
  padding-block: var(--space-lg);
}

.system-mark svg {
  width: min(320px, 70vw);
  height: auto;
}
</style>
