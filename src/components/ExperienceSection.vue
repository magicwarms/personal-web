<script setup lang="ts">
import { computed, ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { ScrollTrigger, gsap } from '@/motion/gsap'
import { roles } from '@/data/portfolio'

const currentRoles = computed(() => roles.filter((role) => !role.earlier))
const earlierRoles = computed(() => roles.filter((role) => role.earlier))

const showEarlier = ref(false)

const toggleLabel = computed(() =>
  showEarlier.value
    ? 'Hide earlier roles'
    : `Show ${earlierRoles.value.length} earlier roles, 2015 to 2019`,
)

/**
 * Expanding the accordion changes the height of the page. Every ScrollTrigger
 * below this section measured its start against the old height and is
 * silently wrong until refreshed. Resize is handled automatically; a DOM
 * height change is not.
 *
 * The refresh has to wait a frame after `done()`. Vue only removes the
 * collapsed node once the transition reports finished, so refreshing before
 * that measures a page which still includes the element.
 */
function refreshAfterLayout(done: () => void) {
  done()
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

function onEnter(element: Element, done: () => void) {
  gsap.fromTo(
    element,
    { height: 0, autoAlpha: 0 },
    {
      height: 'auto',
      autoAlpha: 1,
      onComplete: () => {
        // Hand the height back to the layout, so later reflows are free.
        gsap.set(element, { clearProps: 'height' })
        refreshAfterLayout(done)
      },
    },
  )
}

function onLeave(element: Element, done: () => void) {
  gsap.to(element, {
    height: 0,
    autoAlpha: 0,
    onComplete: () => refreshAfterLayout(done),
  })
}
</script>

<template>
  <section id="experience" class="section" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" index="02" title="Experience" />

    <div class="paper-fill">
      <!-- Scope lines, not achievements: the numbers live in Selected work,
           so this list answers "what was the job" without repeating them. -->
      <ol class="roles">
        <RevealItem v-for="role in currentRoles" :key="role.id" as="li" class="role">
          <span class="role__period mono">{{ role.period }}</span>
          <div>
            <h3 class="role__title">
              {{ role.title }}<span class="role__company">, {{ role.company }}</span>
            </h3>
            <p class="role__location mono">{{ role.location }}</p>
            <p class="role__scope">{{ role.scope }}</p>
          </div>
        </RevealItem>
      </ol>

      <!-- Always in the DOM so `aria-controls` always resolves. -->
      <div id="earlier-roles">
        <Transition :css="false" @enter="onEnter" @leave="onLeave">
          <ol v-if="showEarlier" class="roles roles--earlier">
            <li v-for="role in earlierRoles" :key="role.id" class="role">
              <span class="role__period mono">{{ role.period }}</span>
              <div>
                <h3 class="role__title">
                  {{ role.title }}<span class="role__company">, {{ role.company }}</span>
                </h3>
                <p class="role__location mono">{{ role.location }}</p>
                <p class="role__scope">{{ role.scope }}</p>
              </div>
            </li>
          </ol>
        </Transition>
      </div>

      <button
        type="button"
        class="btn btn--outline roles__toggle"
        :aria-expanded="showEarlier"
        aria-controls="earlier-roles"
        @click="showEarlier = !showEarlier"
      >
        {{ toggleLabel }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.roles {
  padding: 0;
  list-style: none;
}

.roles--earlier {
  overflow: hidden;
}

.role {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 4px 24px;
  padding-block: 20px;
  border-bottom: 1px solid var(--color-rule);
}

.roles:not(.roles--earlier) .role:first-child {
  padding-top: 0;
}

@media (min-width: 40rem) {
  .role {
    grid-template-columns: minmax(0, 7rem) minmax(0, 1fr);
  }
}

.role__period {
  color: var(--color-ink-3);
  padding-top: 3px;
}

.role__title {
  font-size: 1.0625rem;
  font-weight: var(--weight-semibold);
  line-height: 1.4;
}

.role__company {
  font-weight: var(--weight-regular);
  color: var(--color-ink-2);
}

.role__location {
  margin-top: 2px;
  color: var(--color-ink-3);
}

.role__scope {
  margin-top: 8px;
  max-width: 62ch;
  font-size: var(--text-sm);
  line-height: 1.6;
}

.roles__toggle {
  margin-top: 24px;
  white-space: normal;
  text-align: left;
}
</style>
