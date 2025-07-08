# Cloudflare Turnstile Setup Guide

## Quick Development Setup

For immediate testing in development or CI, add these test keys to your `.env.local`:

```bash
# Cloudflare Test Keys (Always Pass - Development Only)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

You can also find keys that always fail for e.g. negative e2e tests.

These test keys will:

- Work on any domain (including localhost)
- Always pass verification
- Allow you to test the complete flow
- Should NOT be used in production

## Production Setup

### 1. Create Turnstile Sites

Go to [Cloudflare Dashboard > Turnstile](https://dash.cloudflare.com/) and create separate sites for:

**Development Site:**

- Domain: `localhost`
- Use for local development with real verification

**Vercel Production Site:**

- Domain: `*.vercel.app`
- Use for Vercel deployments

**Custom Domain Production Site:**

- Domain: `*.prod-domain.com`
- Use for your custom domain

### 2. Environment Variables

**Local Development (.env.local):**

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_dev_site_key
TURNSTILE_SECRET_KEY=your_dev_secret_key
```

**Vercel Environment Variables:**
Set these in your Vercel dashboard:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_vercel_site_key
TURNSTILE_SECRET_KEY=your_vercel_secret_key
```

**Custom Domain Environment Variables:**

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_custom_domain_site_key
TURNSTILE_SECRET_KEY=your_custom_domain_secret_key
```

### 3. Testing

1. **Development**: Use test keys or create localhost site
2. **Staging**: Test on Vercel preview deployments
3. **Production**: Verify on your custom domain

## Troubleshooting

**Error 110200**: Usually means the site key doesn't match the domain

- Check that your site key matches the current domain
- Verify the domain is correctly configured in Cloudflare

**Widget doesn't appear**:

- Check browser console for errors
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set
- Ensure the key starts with the correct prefix

**Verification fails**:

- Check server logs for detailed error messages
- Verify `TURNSTILE_SECRET_KEY` is correctly set
- Ensure the secret key matches the site key
