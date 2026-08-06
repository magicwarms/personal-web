<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { contactIntro, contactLinks, profile } from '@/data/portfolio'

const form = reactive({ name: '', email: '', message: '' })
const hasSent = ref(false)

const status = computed(() =>
  hasSent.value
    ? `Opening your mail client — if nothing happens, write to ${profile.email} directly.`
    : `Sends via your mail client. Direct: ${profile.email}`,
)

/**
 * No backend to post to, so the form composes a message and hands off to the
 * visitor's mail client — the same contract the design describes.
 */
function onSubmit() {
  const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`)
  const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)

  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  hasSent.value = true
}
</script>

<template>
  <section id="contact" class="section" aria-labelledby="contact-heading">
    <SectionHeading id="contact-heading" title="Contact" />

    <div class="contact">
      <RevealItem>
        <p class="contact__intro">{{ contactIntro }}</p>

        <ul class="contact__links">
          <li v-for="link in contactLinks" :key="link.id">
            <a
              class="contact__link"
              :href="link.href"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
            >
              <span class="eyebrow">{{ link.label }}</span>
              <span class="contact__value">{{ link.value }}</span>
            </a>
          </li>
        </ul>

        <a class="btn btn--solid contact__cv" :href="profile.cv" download>Download CV (PDF)</a>
      </RevealItem>

      <RevealItem :delay="0.08">
        <form class="contact__form" @submit.prevent="onSubmit">
          <label class="contact__field">
            <span class="eyebrow">Name</span>
            <input v-model.trim="form.name" name="name" type="text" required placeholder="Your name" />
          </label>

          <label class="contact__field">
            <span class="eyebrow">Email</span>
            <input
              v-model.trim="form.email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@company.com"
            />
          </label>

          <label class="contact__field">
            <span class="eyebrow">Message</span>
            <textarea
              v-model.trim="form.message"
              name="message"
              rows="5"
              required
              placeholder="Role, team, and what you're building."
            ></textarea>
          </label>

          <button type="submit" class="contact__submit">Send message</button>

          <p class="contact__status" role="status" aria-live="polite">{{ status }}</p>
        </form>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
  padding-bottom: clamp(64px, 10vh, 120px);
}

.contact {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
}

.contact__intro {
  color: var(--text-muted);
  max-width: 42ch;
}

.contact__links {
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--accent-14);
  border: 1px solid var(--accent-14);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.contact__link {
  background: var(--surface);
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  color: var(--text);
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.contact__link:hover {
  background: var(--surface-raised);
  color: var(--accent);
}

.contact__value {
  font-size: 13px;
}

.contact__cv {
  margin-top: 24px;
}

.contact__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1px solid var(--accent-14);
  border-radius: var(--radius-lg);
  padding: clamp(20px, 3vw, 32px);
  background: rgba(8, 22, 21, 0.6);
}

.contact__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact__field input,
.contact__field textarea {
  background: var(--surface-raised);
  border: 1px solid rgba(61, 219, 196, 0.18);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.25s ease;
}

.contact__field textarea {
  resize: vertical;
}

.contact__field input:focus,
.contact__field textarea:focus {
  border-color: var(--accent);
}

.contact__field input::placeholder,
.contact__field textarea::placeholder {
  color: var(--text-dimmer);
}

.contact__submit {
  background: transparent;
  border: 1px solid var(--accent-40);
  border-radius: var(--radius-sm);
  color: var(--accent);
  padding: 13px 22px;
  font-size: 11px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  transition: background-color 0.25s ease;
}

.contact__submit:hover {
  background: var(--accent-12);
}

.contact__status {
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-dimmer);
}
</style>
