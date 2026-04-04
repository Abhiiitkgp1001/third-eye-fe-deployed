# Clerk Webhook Setup Guide

## Overview

This guide explains how to set up Clerk webhooks to automatically create organizations in your database when users sign up.

## Why Webhooks?

When a user signs up and creates an organization in Clerk, your application needs to:
1. Create a corresponding `organizations` record in your PostgreSQL database
2. Use this `orgId` to link all company lists and people lists to the organization

The webhook automatically keeps your database in sync with Clerk.

## Setup Steps

### 1. Get Your Webhook Secret from Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   - **Development**: `http://localhost:3000/api/webhooks/clerk`
   - **Production**: `https://yourdomain.com/api/webhooks/clerk`

6. Select the following events to subscribe to:
   - ✅ `organization.created`
   - ✅ `organization.updated`
   - ✅ `organization.deleted`

7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_...`)

### 2. Add Webhook Secret to Environment

Add the webhook secret to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Testing Locally with ngrok (Development)

For local development, Clerk needs to reach your localhost. Use ngrok:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update your Clerk webhook endpoint:
- URL: `https://abc123.ngrok.io/api/webhooks/clerk`

### 4. Testing the Webhook

#### Test with Clerk Dashboard

1. Go to Clerk Dashboard → Webhooks
2. Select your endpoint
3. Click **Testing** tab
4. Click **Send Example** for `organization.created`
5. Check your app logs - you should see:

```
Webhook received: organization.created
Creating organization in database: org_xxx - Test Organization
✅ Organization created: org_xxx
```

#### Test with Real Sign-up

1. Sign up a new user in your app
2. During sign-up, create an organization
3. Check your database:

```bash
npm run db:studio
```

4. You should see the organization in the `organizations` table

### 5. Verify Database

```bash
# Open Drizzle Studio
npm run db:studio

# Or connect with psql
psql "postgresql://postgres:PASSWORD@db.naojfvqtiurghlsicrvt.supabase.co:5432/postgres"

# Check organizations
SELECT * FROM organizations;
```

## How It Works

### Webhook Flow

```
User Signs Up → Clerk Creates Org → Webhook Triggered → Your API
                                                            ↓
                                                    Verify Signature
                                                            ↓
                                                    Create in Database
                                                            ↓
                                        INSERT INTO organizations (id, name, domain)
```

### Events Handled

#### 1. `organization.created`
- **Triggered**: When user creates an organization
- **Action**: Creates organization record in database
- **Data**: `id`, `name`, `slug`

#### 2. `organization.updated`
- **Triggered**: When organization name/slug changes
- **Action**: Updates organization record
- **Data**: `id`, `name`, `slug`

#### 3. `organization.deleted`
- **Triggered**: When organization is deleted in Clerk
- **Action**: Deletes organization (CASCADE to lists)
- **Data**: `id`

## Webhook API Route

**Location**: `app/api/webhooks/clerk/route.ts`

**Key Features**:
- ✅ Webhook signature verification with svix
- ✅ Idempotent (won't create duplicates)
- ✅ Handles create, update, and delete events
- ✅ Automatic error handling and logging
- ✅ Public route (no authentication required)

## Security

### Signature Verification

Every webhook request is verified using svix:

```typescript
const wh = new Webhook(WEBHOOK_SECRET);
const evt = wh.verify(body, headers); // Throws if invalid
```

This ensures:
- ✅ Request is from Clerk
- ✅ Request hasn't been tampered with
- ✅ Request isn't a replay attack

### Public Route Configuration

The webhook route is public in `middleware.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  '/api/webhooks/clerk',  // Webhooks don't use auth
]);
```

## Troubleshooting

### Webhook Not Receiving Events

**Check webhook URL is correct**:
- Development: Use ngrok URL
- Production: Use your domain

**Verify webhook secret**:
```bash
echo $CLERK_WEBHOOK_SECRET  # Should start with whsec_
```

**Check logs**:
```bash
npm run dev
# Look for: "Webhook received: organization.created"
```

### Organization Not Created in Database

**Check database connection**:
```bash
npm run db:studio
```

**Check logs for errors**:
```
❌ Error processing webhook: ...
```

**Manually create organization** (temporary fix):
```sql
INSERT INTO organizations (id, name, domain)
VALUES ('org_xxx', 'Your Org Name', 'your-org-slug');
```

### Webhook Signature Verification Failed

**Ensure webhook secret is correct**:
- Copy the **Signing Secret** from Clerk Dashboard
- Not the webhook ID or endpoint URL

**Check environment variable is loaded**:
```typescript
console.log(process.env.CLERK_WEBHOOK_SECRET); // Should not be undefined
```

### Duplicate Organizations

The webhook handler is idempotent:

```typescript
const existingOrg = await db
  .select()
  .from(organizations)
  .where(eq(organizations.id, id));

if (existingOrg.length === 0) {
  // Only create if doesn't exist
  await db.insert(organizations).values({...});
}
```

If duplicates occur, check your webhook isn't firing twice.

## Production Deployment

### Environment Variables

Add to your production environment:

```env
CLERK_WEBHOOK_SECRET=whsec_your_production_secret
```

### Webhook Endpoint

Update Clerk webhook URL to production:
- URL: `https://yourdomain.com/api/webhooks/clerk`

### Testing Production

1. Create test organization in production
2. Check database for new record
3. Monitor logs for webhook events

## Monitoring

### Webhook Logs

Check your application logs for:
```
Webhook received: organization.created
Creating organization in database: org_xxx - Test Org
✅ Organization created: org_xxx
```

### Clerk Dashboard

Monitor webhook deliveries in Clerk Dashboard:
- **Webhooks** → Select endpoint → **Logs**
- Shows: Success/Failure, Response codes, Timestamps

### Database Verification

Periodically check database:
```bash
npm run db:studio
```

Ensure all organizations from Clerk exist in your database.

## Summary

✅ Webhook automatically creates organizations in database
✅ Users can create lists immediately after sign-up
✅ No manual database setup required
✅ Secure with signature verification
✅ Idempotent (safe to retry)
✅ Handles updates and deletions

Your app is now fully automated! 🎉
