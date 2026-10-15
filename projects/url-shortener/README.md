# URL Shortener (Cloudflare Workers)

A standalone, portfolio-ready URL shortener built with **Cloudflare Workers** and **Cloudflare KV** on the free tier.

## Project overview

This project adds a lightweight short-link service you can deploy on `go.yourdomain.com` while keeping your main site at `yourdomain.com`.

- Visitor requests like `go.yourdomain.com/my-link` are redirected via KV-backed slug lookups.
- Admin users can create links with a protected API endpoint.

## Live demo (placeholder)

- Public short link: `https://go.yourdomain.com/example`
- Admin endpoint: `https://go.yourdomain.com/admin/create`

## Features

- Cloudflare Worker edge routing for fast redirects
- KV-backed slug storage (`URL_STORE` binding)
- Admin-protected link creation with `X-Admin-Secret`
- Simple JSON API for link creation
- Friendly fallback behavior:
  - `/` redirects to `https://yourdomain.com`
  - unknown slugs return `404 Short link not found`

## Architecture

```text
User Browser
   |
   v
go.yourdomain.com/<slug>
   |
   v
Cloudflare Worker (my-url-shortener)
   |-- if path = admin/create (POST + secret) --> write slug->url to KV
   |
   +-- else --> read slug from KV (URL_STORE)
                 |-- found --> HTTP 302 redirect to target URL
                 +-- not found --> 404 response
```

## Tech stack

- JavaScript (ES modules)
- Cloudflare Workers
- Cloudflare KV
- Wrangler CLI

## Setup

1. Install Wrangler CLI
   ```bash
   npm install
   ```
2. Login to Cloudflare
   ```bash
   npx wrangler login
   ```
3. Create a KV namespace
   ```bash
   npx wrangler kv:namespace create URL_STORE
   ```
4. Update `wrangler.toml`
   - Replace `YOUR_KV_NAMESPACE_ID` with the namespace id from the previous command.
   - Keep placeholders (`go.yourdomain.com`, `yourdomain.com`) until you are ready to swap them.
5. Set admin secret (required)
   ```bash
   npx wrangler secret put ADMIN_SECRET
   ```
6. Deploy
   ```bash
   npm run deploy
   ```

## Usage example

Create a short link:

```bash
curl -X POST "https://go.yourdomain.com/admin/create" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret" \
  -d '{"slug":"github","url":"https://github.com/"}'
```

Expected response:

```json
{
  "success": true,
  "slug": "github",
  "url": "https://github.com/"
}
```

Then visit:

- `https://go.yourdomain.com/github`

## Free tier limits (high level)

This project intentionally uses free-tier-friendly services:

- Cloudflare Workers (free plan request/runtime limits apply)
- Cloudflare KV (free plan storage and operations limits apply)

Check Cloudflare's current pricing/limits page before production use.

## What I learned / portfolio notes

- How to build edge redirects with Cloudflare Workers
- How to model short-link storage with KV key-value pairs
- How to secure admin operations with Worker secrets (`env.ADMIN_SECRET`)
- How to package a small, standalone cloud project for portfolio presentation
