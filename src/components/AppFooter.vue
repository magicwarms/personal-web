<script setup lang="ts">
import { profile } from '@/data/portfolio'
</script>

<template>
  <footer class="footer">
    <div class="shell footer__inner paper-fill">
      <p class="footer__who">
        <span class="status-dot" aria-hidden="true"></span>
        {{ profile.name }} · {{ profile.location }} · {{ profile.availability }}
      </p>
      <ul class="footer__links">
        <li><a class="link" :href="profile.cv" download>Download CV (PDF)</a></li>
        <li><a class="link" href="#top">Back to top</a></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-rule);
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  justify-content: space-between;
  align-items: center;
  padding-block: 28px 36px;
  font-size: var(--text-sm);
  color: var(--color-ink-3);
}

.footer__who {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  padding: 0;
  list-style: none;
}

.footer__links .link {
  display: inline-block;
  padding-block: 6px;
  color: var(--color-ink-2);
}
</style>
