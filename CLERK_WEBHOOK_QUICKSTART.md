# Clerk Webhook Quick Start

## ⚡ Quick Setup (5 minutes)

### 1. Get Webhook Secret

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click **Webhooks** → **Add Endpoint**
3. Subscribe to these events:
   - ✅ `organization.created`
   - ✅ `organization.updated`
   - ✅ `organization.deleted`
4. Copy the **Signing Secret** (starts with `whsec_...`)

### 2. Add to .env.local

```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### 3. Set Webhook URL

**Local Development (with ngrok):**

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

Use ngrok URL in Clerk: `https://abc123.ngrok.io/api/webhooks/clerk`

**Production:**

Use your domain: `https://yourdomain.com/api/webhooks/clerk`

### 4. Test It

Sign up a new user → Create organization → Check database:

```bash
npm run db:studio
```

You should see the organization in the `organizations` table! ✅

## What Happens Automatically

When a user signs up:

1. ✅ User creates organization in Clerk
2. ✅ Webhook fires to your app
3. ✅ Organization created in your database
4. ✅ User can immediately create lists (linked to their orgId)

## Troubleshooting

**Webhook not working?**
- Check `CLERK_WEBHOOK_SECRET` is in `.env.local`
- Verify webhook URL is correct in Clerk dashboard
- Use ngrok for local development

**Organization not in database?**
- Check app logs for webhook events
- Test webhook in Clerk dashboard → Testing tab
- Manually test: `curl http://localhost:3000/api/webhooks/clerk`

## More Info

See [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) for detailed documentation.
