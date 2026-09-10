<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { contactIntro, contactLinks, profile } from '@/data/portfolio'

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
      return 'Thanks — your message is on its way. I usually reply within a couple of days.'
    case 'error':
      // Always leave a way through, whatever failed.
      return `${errorDetail.value || 'Something went wrong sending your message.'} You can write to ${profile.email} directly instead.`
    default:
      return `Goes straight to my inbox. Direct: ${profile.email}`
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

        <!-- Ghost, not solid: "Send message" below is this view's one
             filled violet pill (DESIGN.md Don'ts). -->
        <a class="btn btn--ghost contact__cv" :href="profile.cv" download>Download CV (PDF)</a>
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
  color: var(--color-ink-2);
  font-weight: var(--font-weight-extralight);
  font-size: var(--text-body);
  line-height: 1.6;
  max-width: 42ch;
}

.contact__links {
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-18);
}

.contact__link {
  padding: 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  color: var(--color-ink);
  transition: color var(--dur-short) var(--ease-out);
}

.contact__link:hover {
  color: var(--color-accent-bright);
}

.contact__value {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.contact__cv {
  margin-top: 30px;
}

.contact__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-24);
}

.contact__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* The one surviving rule in the whole page: a bottom-only hairline on
   form inputs, so field boundaries stay legible. Everything else on the
   site floats on black with whitespace alone. */
.contact__field input,
.contact__field textarea {
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-field-rule);
  border-radius: 0;
  padding: 10px 2px;
  color: var(--color-ink);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color var(--dur-short) var(--ease-out);
}

.contact__field textarea {
  resize: vertical;
}

.contact__field input:focus,
.contact__field textarea:focus {
  border-color: var(--color-electric-iris);
}

.contact__field input::placeholder,
.contact__field textarea::placeholder {
  color: var(--color-ink-3);
}

.contact__submit {
  margin-top: 6px;
  align-self: flex-start;
}

.contact__submit:disabled {
  opacity: 0.55;
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
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--color-ink-3);
  transition: color var(--dur-short) var(--ease-out);
}

.contact__status--success {
  color: var(--color-accent-bright);
}

.contact__status--error {
  color: var(--color-danger);
}
</style>
