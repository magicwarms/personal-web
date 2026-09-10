<script setup lang="ts">
import { computed, ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import { REVEAL_START, ScrollTrigger, SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { roles } from '@/data/portfolio'

const currentRoles = computed(() => roles.filter((role) => !role.earlier))
const earlierRoles = computed(() => roles.filter((role) => role.earlier))

const showEarlier = ref(false)

const toggleLabel = computed(() =>
  showEarlier.value
    ? 'Hide earlier roles'
    : `Show ${earlierRoles.value.length} earlier roles (2015—2019)`,
)

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ isDesktop, reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)

    if (reduceMotion) {
      gsap.set(q('.timeline__period, .timeline__role, .timeline__company, .timeline__bullets li'), {
        autoAlpha: 1,
        clearProps: 'transform',
      })
      return
    }

    // Only the roles present at mount. The earlier ones live behind the
    // toggle and get their entrance from the accordion instead.
    q<HTMLElement>('.timeline__entry').forEach((entry) => {
      const role = entry.querySelector<HTMLElement>('.timeline__role')

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: entry, start: REVEAL_START, once: true },
      })

      timeline
        .to(entry.querySelector('.timeline__period'), { autoAlpha: 1, x: 0, duration: 0.5 }, 0)
        .to(entry.querySelector('.timeline__company'), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.35)
        .to(entry.querySelectorAll('.timeline__bullets li'), {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.45)

      if (!role) return
      SplitText.create(role, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(role, { autoAlpha: 1 })
          return timeline.fromTo(
            self.lines,
            { yPercent: 100 },
            { yPercent: 0, duration: 0.7, stagger: 0.06 },
            0.12,
          )
        },
      })
    })

    if (!isDesktop) return

    // The same depth cue RoleCycler uses on its three stacked lines, applied
    // at page scale: whichever role you are actually reading is the
    // brightest thing on screen. RoleCycler can drop to 0.2 because those
    // are three words of display type; these entries are paragraphs, so the
    // floor stays at 0.8 to keep them above their contrast minimum.
    q<HTMLElement>('.timeline__entry').forEach((entry) => {
      gsap
        .timeline({
          scrollTrigger: { trigger: entry, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        })
        .fromTo(entry, { autoAlpha: 0.8 }, { autoAlpha: 1, ease: 'none', duration: 1 })
        .to(entry, { autoAlpha: 0.8, ease: 'none', duration: 1 })
    })
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.timeline__period'), { autoAlpha: 0, x: -10 })
    gsap.set(q('.timeline__role'), { autoAlpha: 0 })
    gsap.set(q('.timeline__company'), { autoAlpha: 0, y: 8 })
    gsap.set(q('.timeline__bullets li'), { autoAlpha: 0, y: 10 })
  },
)

/**
 * Expanding the accordion changes the height of the page. Every ScrollTrigger
 * below this section — Stack, Credentials, Contact — measured its start and
 * end against the old height and is silently wrong until refreshed. Resize is
 * handled automatically; a DOM height change is not.
 *
 * The refresh has to wait a frame after `done()`. Vue only removes the
 * collapsed node once the transition reports finished, so refreshing before
 * that measures a page which still includes the element — and on collapse
 * that left the flex gap around it in the measurement, putting every trigger
 * below out by one `--spacing-96`.
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
      duration: 0.45,
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
    duration: 0.45,
    onComplete: () => refreshAfterLayout(done),
  })
}
</script>

<template>
  <section ref="root" id="experience" class="section" aria-labelledby="experience-heading">
    <SectionHeading id="experience-heading" title="Experience" />

    <div class="timeline">
      <article
        v-for="role in currentRoles"
        :key="role.id"
        class="timeline__entry"
        :aria-labelledby="`${role.id}-title`"
      >
        <span class="timeline__period">{{ role.period }}</span>
        <div class="timeline__head">
          <h3 :id="`${role.id}-title`" class="timeline__role">{{ role.title }}</h3>
          <span class="timeline__company">{{ role.company }}</span>
        </div>
        <ul class="bullets bullets--soft timeline__bullets">
          <li v-for="highlight in role.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </article>

      <!-- Always in the DOM so `aria-controls` always resolves; `display:
           contents` keeps it from leaving a gap while collapsed. -->
      <div id="earlier-roles" class="timeline__slot">
        <Transition :css="false" @enter="onEnter" @leave="onLeave">
          <div v-if="showEarlier" class="timeline__earlier">
            <article
              v-for="role in earlierRoles"
              :key="role.id"
              class="timeline__entry timeline__entry--muted"
              :aria-labelledby="`${role.id}-title`"
            >
              <span class="timeline__period">{{ role.period }}</span>
              <div class="timeline__head">
                <h3 :id="`${role.id}-title`" class="timeline__role">{{ role.title }}</h3>
                <span class="timeline__company">{{ role.company }}</span>
              </div>
              <ul class="bullets bullets--soft timeline__bullets">
                <li v-for="highlight in role.highlights" :key="highlight">{{ highlight }}</li>
              </ul>
            </article>
          </div>
        </Transition>
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-96);
}

.timeline__slot {
  display: contents;
}

.timeline__earlier {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-96);
  overflow: hidden;
}

.timeline__head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  align-items: baseline;
  margin-top: 10px;
}

.timeline__role {
  font-family: var(--font-display);
  font-size: var(--text-heading-2xs);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink);
  line-height: 1.3;
}

.timeline__company {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  color: var(--color-accent-bright);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.timeline__period {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  color: var(--color-saffron-spark);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.timeline__bullets {
  margin-top: 18px;
  gap: 9px;
}

.timeline__toggle {
  margin-top: 36px;
  background: none;
  border: none;
  color: var(--color-bone-white);
  padding: 0;
  font-family: var(--font-display);
  font-size: var(--text-nav-label);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  max-width: 100%;
  overflow-x: auto;
  transition: color var(--dur-short) var(--ease-out);
}

.timeline__toggle:hover {
  color: var(--color-saffron-spark);
}
</style>
