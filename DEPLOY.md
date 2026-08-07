# Deploying to the VPS (Dokploy)

The site runs as a **single Node process**. Express serves the built Vue SPA from `dist/`
and hosts `POST /api/contact`, which relays the contact form over SMTP. Dokploy's built-in
Traefik terminates TLS in front of it.

Production domain: **https://magicwarms.my.id**

---

## Secrets

Nothing secret lives in this repository or in the Docker image.

- `.env` is gitignored and has never been committed.
- `.dockerignore` excludes every `.env*` from the build context, so credentials cannot be
  copied into an image layer. This matters because image layers are immutable and readable
  via `docker history` and layer extraction — deleting a file in a later step does not
  remove it from the layer that added it.
- The Dockerfile declares **no `ARG` or `ENV`** for any credential. Build args are recorded
  in image metadata and would be exposed the same way.
- No value is `VITE_`-prefixed, so nothing reaches the browser bundle. `server/env.ts` is
  server-only and must never be imported from `src/`.

Credentials are injected at **run time** by Dokploy. Set these in the application's
**Environment** tab — not Build Args:

| Variable | Notes |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | `465` for implicit TLS, `587` for STARTTLS |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Verified sender on a domain your provider controls — an arbitrary `@gmail.com` fails SPF/DMARC |
| `CONTACT_TO` | Inbox that receives enquiries |
| `PORT` | `3000`. Must match the container port set on the domain |

`server/env.ts` validates all six required keys at boot and throws listing whichever are
missing, so a half-configured deploy fails loudly on start instead of silently dropping
enquiries.

---

## Dokploy setup

1. **Create Application** → Provider **GitHub** → this repo, branch `main`.
2. **Build Type: Dockerfile**, path `./Dockerfile`. Dokploy clones and builds on the VPS,
   so no container registry and no registry credentials are involved.
3. **Environment tab** → add the seven variables above.
4. **Domains** → `magicwarms.my.id`, Container Port **3000**, HTTPS on, certificate
   provider **Let's Encrypt**.
   - DNS must resolve *before* deploying: an `A` record for `magicwarms.my.id` pointing at
     the VPS public IP. Check with `dig +short magicwarms.my.id`. If it does not resolve,
     the Let's Encrypt HTTP-01 challenge fails and Traefik serves its self-signed default.
   - Optionally add `www.magicwarms.my.id` redirecting to the apex.
5. **Deploy.**

Because `.env` is gitignored, the clone on the VPS will not contain it. That is intended —
configuration lives only in Dokploy.

---

## Verifying a deploy

```bash
curl -sI https://magicwarms.my.id/            # 200, valid cert, CSP + HSTS present
curl -s  https://magicwarms.my.id/api/health  # {"ok":true,"uptime":...}
```

In the Dokploy logs, a healthy boot prints:

```
[server] listening on http://localhost:3000
[server] static SPA: /app/dist
[server] SMTP connection verified
```

Then submit the contact form once and confirm the mail arrives at `CONTACT_TO` with
`Reply-To` set to the sender's address.

---

## Troubleshooting

**`SMTP verify failed` in the logs.** Usually the VPS provider blocking outbound SMTP.
Ports 465 and 587 are normally open; port 25 is very often blocked. The site keeps serving
— this is a warning, not a crash — but the contact form will return a 502.

**Every visitor shares one rate limit.** `server/index.ts` sets `trust proxy` to `2`:
Cloudflare's proxy fronts the domain and Dokploy's Traefik sits behind it, so a request
crosses two hops before reaching Express. The value must track that count. If the DNS
record is ever grey-clouded (Cloudflare proxy off, DNS only), Traefik becomes the sole hop
and this must go back to `1` — otherwise Express trusts one entry too many and a client can
spoof `X-Forwarded-For` to pick its own rate-limit key.

**Blank page or missing fonts after deploy.** Check the browser console for CSP
violations. The policy in `server/index.ts` allowlists `fonts.googleapis.com` and
`fonts.gstatic.com`; any new third-party asset needs adding there.

**Certificate is self-signed.** DNS was not resolving when the app was first deployed.
Fix the `A` record, then redeploy so Traefik retries the ACME challenge.

---

## Local production-parity test

`docker-compose.yml` runs the exact production image against the real `.env`, injected at
run time rather than baked in:

```bash
docker compose up --build
curl -s localhost:3000/api/health
```
