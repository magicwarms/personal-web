<script setup lang="ts">
import { computed, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import SectionHeading from './ui/SectionHeading.vue'
import { easeOut, revealProps } from '@/motion/presets'
import { roles } from '@/data/portfolio'

const currentRoles = computed(() => roles.filter((role) => !role.earlier))
const earlierRoles = computed(() => roles.filter((role) => role.earlier))

const showEarlier = ref(false)

const toggleLabel = computed(() =>
  showEarlier.value
    ? 'Hide earlier roles'
    : `Show ${earlierRoles.value.length} earlier roles (2015—2019)`,
)
</script>

<template>
  <section id="experience" class="section" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" title="Experience" />

    <div class="timeline">
      <motion.article
        v-for="(role, position) in currentRoles"
        :key="role.id"
        v-bind="revealProps"
        class="timeline__entry"
        :aria-labelledby="`${role.id}-title`"
      >
        <span
          class="timeline__marker"
          :class="{ 'timeline__marker--lead': position === 0 }"
          aria-hidden="true"
        ></span>
        <div class="timeline__head">
          <h3 :id="`${role.id}-title`" class="timeline__role">{{ role.title }}</h3>
          <span class="timeline__company">{{ role.company }}</span>
          <span class="timeline__period">{{ role.period }}</span>
        </div>
        <ul class="bullets bullets--soft timeline__bullets">
          <li v-for="highlight in role.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </motion.article>

      <!-- Always in the DOM so `aria-controls` always resolves; `display:
           contents` keeps it from leaving a gap while collapsed. -->
      <div id="earlier-roles" class="timeline__slot">
        <AnimatePresence :initial="false">
        <motion.div
          v-if="showEarlier"
          key="earlier-roles-list"
          class="timeline__earlier"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="{ duration: 0.45, ease: easeOut }"
        >
          <article
            v-for="role in earlierRoles"
            :key="role.id"
            class="timeline__entry timeline__entry--muted"
            :aria-labelledby="`${role.id}-title`"
          >
            <span class="timeline__marker timeline__marker--faint" aria-hidden="true"></span>
            <div class="timeline__head">
              <h3 :id="`${role.id}-title`" class="timeline__role">{{ role.title }}</h3>
              <span class="timeline__company">{{ role.company }}</span>
              <span class="timeline__period">{{ role.period }}</span>
            </div>
            <ul class="bullets bullets--soft timeline__bullets">
              <li v-for="highlight in role.highlights" :key="highlight">{{ highlight }}</li>
            </ul>
          </article>
        </motion.div>
        </AnimatePresence>
      </div>
    </div>

    <button
      type="button"
      class="timeline__toggle"
      :aria-expanded="showEarlier"
      aria-controls="earlier-roles"
      @click="showEarlier = !showEarlier"
    >
      {{ toggleLabel }}
    </button>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.timeline {
  margin-top: 48px;
  border-left: 1px solid var(--color-rule);
  padding-left: clamp(20px, 3vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 44px;
}

.timeline__entry {
  position: relative;
}

.timeline__slot {
  display: contents;
}

.timeline__earlier {
  display: flex;
  flex-direction: column;
  gap: 44px;
  overflow: hidden;
}

.timeline__marker {
  position: absolute;
  left: calc(clamp(20px, 3vw, 36px) * -1 - 4px);
  top: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-ink-4);
}

.timeline__marker--lead {
  background: var(--color-accent);
}

.timeline__marker--faint {
  background: var(--color-rule);
}

.timeline__head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  align-items: baseline;
}

.timeline__role {
  font-family: var(--font-display);
  font-size: 1.1875rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  line-height: 1.4;
}

.timeline__company {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-accent);
  letter-spacing: 0.01em;
}

.timeline__period {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-warn);
  letter-spacing: 0.04em;
  margin-left: auto;
}

.timeline__bullets {
  margin-top: 14px;
  gap: 9px;
}

.timeline__toggle {
  margin-top: 36px;
  background: transparent;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  padding: 12px 20px;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
  max-width: 100%;
  overflow-x: auto;
  transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out);
}

@media (max-width: 26rem) {
  .timeline__toggle {
    padding: 10px 14px;
    font-size: 0.6875rem;
  }
}

.timeline__toggle:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-a08);
  color: var(--color-accent);
}
</style>
