<script setup lang="ts">
import { computed } from 'vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import RevealItem from '@/components/ui/RevealItem.vue'
import { contact, profile } from '@/data/portfolio'
import { getPages } from '@/seo/pages'
import type { CaseProject } from '@/seo/pages'

const props = defineProps<{ project: CaseProject }>()

interface Block {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  line?: string
}

// Sections with no data are skipped, and the rest are numbered in order.
const blocks = computed<Block[]>(() => {
  const { caseStudy, did, results, stack } = props.project
  const all: Block[] = [
    { id: 'case-context', title: 'Context', paragraphs: caseStudy.context },
    { id: 'case-approach', title: 'Approach', paragraphs: caseStudy.approach },
    { id: 'case-did', title: 'What I did', items: did },
    { id: 'case-results', title: 'Results', items: results },
    { id: 'case-stack', title: 'Stack', line: stack?.join(' · ') },
  ]
  return all.filter((block) => block.paragraphs?.length || block.items?.length || block.line)
})

const otherCases = computed(() =>
  getPages().flatMap((page) =>
    page.kind === 'case' && page.project.id !== props.project.id ? [page] : [],
  ),
)

const index = (position: number) => String(position).padStart(2, '0')
const liveHost = computed(() => {
  const url = props.project.caseStudy.url
  return url ? new URL(url).host : null
})
</script>

<template>
  <section class="intro" aria-labelledby="case-title">
    <nav class="crumbs mono rise" :style="{ '--i': 0 }" aria-label="Breadcrumb">
      <ol class="crumbs__list">
        <li><a class="link" href="/">Home</a></li>
        <li aria-current="page">{{ project.org }}</li>
      </ol>
    </nav>

    <div class="intro__copy paper-fill">
      <p class="intro__meta mono rise" :style="{ '--i': 1 }">
        <span>{{ project.org }}</span>
        <span>{{ project.period }}</span>
        <span>{{ project.role }}</span>
      </p>

      <h1 id="case-title" class="intro__title rise" :style="{ '--i': 2 }">{{ project.title }}</h1>
      <p class="intro__lead rise" :style="{ '--i': 3 }">{{ project.summary }}</p>

      <p v-if="project.caseStudy.url" class="intro__live mono rise" :style="{ '--i': 4 }">
        <a class="link" :href="project.caseStudy.url" target="_blank" rel="noopener noreferrer">
          Visit {{ liveHost }}
        </a>
      </p>
    </div>
  </section>

  <section
    v-for="(block, position) in blocks"
    :id="block.id"
    :key="block.id"
    class="section"
    :aria-labelledby="`${block.id}-heading`"
  >
    <SectionHeading :id="`${block.id}-heading`" :index="index(position + 1)" :title="block.title" />

    <div class="body paper-fill">
      <RevealItem>
        <div v-if="block.paragraphs" class="body__prose">
          <p v-for="paragraph in block.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
        <ul v-else-if="block.items" class="list body__list">
          <li v-for="item in block.items" :key="item">{{ item }}</li>
        </ul>
        <p v-else class="body__stack mono">{{ block.line }}</p>
      </RevealItem>
    </div>
  </section>

  <section id="more-work" class="section" aria-labelledby="more-work-heading">
    <SectionHeading id="more-work-heading" :index="index(blocks.length + 1)" title="More work" />

    <div class="body paper-fill">
      <RevealItem>
        <ul class="list body__list">
          <li v-for="page in otherCases" :key="page.path">
            <a class="link" :href="page.path">Read the case study for {{ page.project.org }}</a>
            <span class="more__title">{{ page.project.title }}</span>
          </li>
          <li><a class="link" href="/#work">All work</a></li>
        </ul>
      </RevealItem>
    </div>
  </section>

  <section id="case-contact" class="section" aria-labelledby="case-contact-heading">
    <SectionHeading id="case-contact-heading" :index="index(blocks.length + 2)" :title="contact.heading" />

    <div class="body paper-fill">
      <RevealItem>
        <p class="body__prose">{{ contact.intro }}</p>
        <div class="cta">
          <a class="btn btn--solid" :href="`mailto:${profile.email}`">Email me</a>
          <a class="btn btn--outline" href="/#contact">Contact</a>
        </div>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.intro {
  padding-top: clamp(24px, 5vh, 48px);
  padding-bottom: clamp(48px, 8vh, 80px);
}

.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  padding: 0;
  list-style: none;
  color: var(--color-ink-3);
}

.crumbs__list li + li::before {
  content: '/';
  margin-right: 10px;
  color: var(--color-rule-strong);
}

.crumbs__list a {
  display: inline-block;
  padding-block: 6px;
}

.intro__copy {
  margin-top: clamp(24px, 5vh, 48px);
}

.intro__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--color-ink-3);
}

.intro__meta span:first-child {
  color: var(--color-ink);
}

.intro__title {
  margin-top: 16px;
  max-width: 22ch;
  font-size: clamp(2rem, 4.5vw, 3rem);
  letter-spacing: var(--tracking-display);
  line-height: 1.08;
  text-wrap: balance;
}

.intro__lead {
  margin-top: 20px;
  max-width: 60ch;
  font-size: var(--text-lead);
  line-height: 1.6;
}

.intro__live {
  margin-top: 20px;
}

.body__prose {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 62ch;
}

.body__list {
  max-width: 62ch;
}

.body__stack {
  color: var(--color-ink-3);
}

.more__title {
  display: block;
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--color-ink-3);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
