<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useActiveSection } from '@/composables/useActiveSection'
import { useSectionMotion } from '@/composables/useSectionMotion'

defineProps<{
  /** Wired to the section's `aria-labelledby`. */
  id: string
  /** Two-digit section number, shown in mono above the title. */
  index: string
  title: string
}>()

const root = ref<HTMLElement | null>(null)
/** Read after mount, so server and client render the same inactive label. */
const sectionId = ref<string | null>(null)
const { activeId } = useActiveSection()
const isActive = computed(() => sectionId.value !== null && activeId.value === sectionId.value)

onMounted(() => {
  sectionId.value = root.value?.closest('section')?.id ?? null
})

// On wide screens the label is sticky; a short hairline under the index
// fills as the reader moves through its section.
useSectionMotion(root, ({ isDesktop, reduceMotion }) => {
  const section = root.value?.closest('section')
  if (!section || !isDesktop || reduceMotion) return
  gsap.fromTo(
    '.heading__progress',
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 40%', end: 'bottom 40%', scrub: true },
    },
  )
})
</script>

<template>
  <!-- The page's connective motif: a numbered margin label, like the
       sections of a design doc. It stays in view while its section scrolls
       past on wide screens, and marks itself while it is being read. -->
  <div ref="root" class="heading paper-fill" :class="{ 'heading--active': isActive }">
    <span class="heading__index mono" aria-hidden="true">{{ index }}</span>
    <span class="heading__progress" aria-hidden="true"></span>
    <h2 :id="id" class="heading__title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.heading {
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: start;
}

@media (min-width: 60rem) {
  .heading {
    position: sticky;
    top: calc(var(--header-h) + 24px);
  }
}

.heading__index {
  color: var(--color-ink-3);
  transition: color var(--dur-short) var(--ease-out);
}

.heading__progress {
  display: none;
}

@media (min-width: 60rem) {
  .heading--active .heading__index {
    color: var(--color-accent);
  }
}

@media (min-width: 60rem) and (prefers-reduced-motion: no-preference) {
  .heading__progress {
    display: block;
    width: 48px;
    height: 1px;
    background: var(--color-accent);
    transform: scaleX(0);
    transform-origin: left;
  }
}

.heading__title {
  font-size: var(--text-h2);
  letter-spacing: var(--tracking-heading);
  line-height: 1.15;
  overflow-wrap: anywhere;
}
</style>
