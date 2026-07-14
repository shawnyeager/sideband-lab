# Previewing a draft over Tailscale Funnel

Share a local dev server on the public internet so someone off the tailnet can
see a draft project.

## The command

```bash
npm run share          # dev server on IPv4 loopback + funnel, one command
npm run share:off      # tear the funnel down when you're finished
```

Public URL is this machine's tailnet name, e.g.
`https://framework.bonobo-acoustic.ts.net/<slug>/`. Get it with `tailscale status`
if you don't remember it.

**The funnel is public.** Anyone with the URL reaches it, no tailnet membership and
no auth. It's a draft-preview link, not a private one. Turn it off when you're done.

## The two things that break it

Both fail with errors that point nowhere near the cause, which is why this file
exists.

### 1. Astro binds to IPv6, Funnel connects over IPv4 → 502

`astro dev` listens on `[::1]:4321` only. `tailscale funnel 4321` proxies to
`http://127.0.0.1:4321`, which is IPv4. Nothing is listening there, so every
request returns **502 Bad Gateway** while `curl localhost:4321` works fine from
the same box (curl falls back to IPv6).

Fix: bind explicitly.

```bash
astro dev --host 127.0.0.1
```

Confirm with `ss -tlnp | grep 4321`. You want `127.0.0.1:4321`, not `[::1]:4321`.

### 2. Vite host allowlist → "Blocked request"

Vite rejects any request whose `Host` header it doesn't recognize, and the funnel
arrives as `framework.bonobo-acoustic.ts.net`. `astro.config.mjs` reads
`DEV_ALLOWED_HOSTS` (comma-separated) into `vite.server.allowedHosts`.

The trap: `.env` and `.env.local` both define it, and **`.env.local` wins**. If
`.env.local` names a different machine's host, the funnel is blocked even though
`.env` looks correct. Set `.env.local` to every machine you funnel from:

```
DEV_ALLOWED_HOSTS=framework.bonobo-acoustic.ts.net,nanoclaw.bonobo-acoustic.ts.net
```

A 502 is gotcha #1. An HTML page reading "Blocked request. This host is not
allowed." is gotcha #2.

## Prerequisites

Once per tailnet, not once per preview: HTTPS certs enabled, and `funnel` in the
ACL policy for this node. `tailscale funnel --bg 4321` prints an enable link if
either is missing.

## Checking it actually works

Test the public hostname, not localhost. Localhost passes in both failure modes.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://framework.bonobo-acoustic.ts.net/circles/
```

200 means it's live. 502 is gotcha #1, 403 is gotcha #2.
