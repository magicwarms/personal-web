<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { stackGroups } from '@/data/portfolio'
</script>

<template>
  <section id="skills" class="section" aria-labelledby="skills-heading">
    <SectionHeading id="skills-heading" index="04" title="Skills" />

    <!-- Plain text in a spec table, so a recruiter can scan for keywords
         and a search can find them. -->
    <div class="paper-fill">
      <RevealItem>
        <dl class="spec">
          <div v-for="group in stackGroups" :key="group.id" class="spec__row">
            <dt class="spec__key">{{ group.label }}</dt>
            <dd class="spec__value">{{ group.items.join(', ') }}</dd>
          </div>
        </dl>
      </RevealItem>
    </div>
  </section>
</template>
