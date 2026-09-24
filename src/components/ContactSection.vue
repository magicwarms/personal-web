<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { contact, contactLinks, profile } from '@/data/portfolio'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

/** `company` is the honeypot — hidden from people, filled in by bots. */
const form = reactive({ name: '', email: '', message: '', company: '' })
const state = ref<SubmitState>('idle')
const errorDetail = ref('')

const status = computed(() => {
  switch (state.value) {
    case 'submitting':
      return 'Sending your message…'
    case 'success':
      return 'Thanks, your message is on its way. I usually reply within a couple of days.'
    case 'error':
      // Always leave a way through, whatever failed.
      return `${errorDetail.value || 'Something went wrong sending your message.'} You can write to ${profile.email} directly instead.`
    default:
      return `Goes straight to my inbox. Or email ${profile.email} directly.`
  }
})

interface ContactResponse {
  ok?: boolean
  error?: string
  errors?: Partial<Record<'name' | 'email' | 'message', string>>
}

/**
 * Posts to the site's own API, which holds the SMTP credentials server-side.
 * The path stays relative so it resolves through the Vite proxy in development
 * and same-origin in production, with no host baked into the bundle.
 */
async function onSubmit() {
  if (state.value === 'submitting') return

  state.value = 'submitting'
  errorDetail.value = ''

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const payload = (await response.json().catch(() => ({}))) as ContactResponse

    if (!response.ok || !payload.ok) {
      // Prefer the server's own wording — a field error or the rate-limit
      // notice is far more useful than a generic failure.
      const firstFieldError = payload.errors ? Object.values(payload.errors)[0] : undefined
      errorDetail.value = firstFieldError ?? payload.error ?? ''
      state.value = 'error'
      return
    }

    form.name = ''
    form.email = ''
    form.message = ''
    state.value = 'success'
  } catch {
    // Offline, DNS failure, server down — nothing actionable to report beyond
    // the fallback address the status message already carries.
    state.value = 'error'
  }
}
</script>

<template>
  <section id="contact" class="section" aria-labelledby="contact-heading">
    <SectionHeading id="contact-heading" index="06" title="Contact" />

    <div class="contact">
      <RevealItem class="contact__info">
        <p class="contact__heading">{{ contact.heading }}</p>
        <p class="contact__intro">{{ contact.intro }}</p>

        <dl class="spec contact__links">
          <div v-for="link in contactLinks" :key="link.id" class="spec__row">
            <dt class="spec__key">{{ link.label }}</dt>
            <dd class="spec__value">
              <a
                class="link"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
              >
                {{ link.value }}
              </a>
            </dd>
          </div>
        </dl>

        <a class="btn btn--outline contact__cv" :href="profile.cv" download>Download CV (PDF)</a>
      </RevealItem>

      <RevealItem :delay="0.06">
        <form class="contact__form" @submit.prevent="onSubmit">
          <label class="contact__field">
            <span class="contact__field-label">Name</span>
            <input v-model.trim="form.name" name="name" type="text" required autocomplete="name" />
          </label>

          <label class="contact__field">
            <span class="contact__field-label">Work email</span>
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
            <span class="contact__field-label">Message</span>
            <textarea
              v-model.trim="form.message"
              name="message"
              rows="5"
              required
              placeholder="Role, team, and what you're building."
            ></textarea>
          </label>

          <div class="contact__honeypot" aria-hidden="true">
            <label>
              Company
              <input
                v-model.trim="form.company"
                name="company"
                type="text"
                tabindex="-1"
                autocomplete="off"
              />
            </label>
          </div>

          <button type="submit" class="btn btn--solid contact__submit" :disabled="state === 'submitting'">
            {{ state === 'submitting' ? 'Sending…' : 'Send message' }}
          </button>

          <p
            class="contact__status"
            :class="{
              'contact__status--success': state === 'success',
              'contact__status--error': state === 'error',
            }"
            role="status"
            aria-live="polite"
          >
            {{ status }}
          </p>
        </form>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

@media (min-width: 48rem) {
  .contact {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.contact__heading {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  line-height: 1.3;
  color: var(--color-ink);
}

.contact__intro {
  margin-top: 10px;
  max-width: 44ch;
}

.contact__links {
  margin-top: 24px;
}

.contact__links .spec__row {
  grid-template-columns: minmax(0, 5.5rem) minmax(0, 1fr);
}

.contact__links .link {
  overflow-wrap: anywhere;
}

.contact__cv {
  margin-top: 24px;
}

.contact__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.contact__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact__field-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.contact__field input,
.contact__field textarea {
  min-height: 44px;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-rule-strong);
  border-radius: var(--radius);
  color: var(--color-ink);
  font-size: var(--text-sm);
  transition: border-color var(--dur-short) var(--ease-out);
}

.contact__field textarea {
  resize: vertical;
}

.contact__field input:hover,
.contact__field textarea:hover {
  border-color: var(--color-ink-2);
}

/* The global focus ring stays; the border darkens too so the active field
   is obvious even at a glance. */
.contact__field input:focus-visible,
.contact__field textarea:focus-visible {
  border-color: var(--color-ink);
  outline-offset: 2px;
}

.contact__field input::placeholder,
.contact__field textarea::placeholder {
  color: var(--color-ink-3);
}

.contact__submit {
  align-self: flex-start;
}

.contact__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/*
 * Positioned off-screen rather than `display: none` — bots routinely skip
 * fields that are genuinely hidden, which would defeat the trap.
 */
.contact__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.contact__status {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-ink-3);
}

.contact__status--success {
  color: var(--color-accent);
}

.contact__status--error {
  color: var(--color-danger);
}
</style>
