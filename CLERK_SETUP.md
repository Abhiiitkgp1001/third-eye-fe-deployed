# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your Third Eye app.

## 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

## 4. Configure Social Providers (Optional)

If you want to enable Google or GitHub authentication:

1. In your Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Enable the providers you want (Google, GitHub, etc.)
3. Follow the setup instructions for each provider

## 5. Run Your App

```bash
npm run dev
```

Visit http://localhost:3000 and try signing up!

## Routes

- `/` - Home page (public)
- `/sign-in` - Sign in page (public)
- `/sign-up` - Sign up page (public)
- `/dashboard` - Protected dashboard (requires authentication)

## How Authentication Works

- **Middleware**: The `middleware.ts` file protects all routes except `/`, `/sign-in`, and `/sign-up`
- **ClerkProvider**: Wraps your app in `app/layout.tsx` to provide auth context
- **Sign In/Up Pages**: Custom styled pages at `/sign-in` and `/sign-up` using Clerk components
- **Protected Routes**: Any route not in the public list requires authentication

## Customization

### Theme Customization

The Clerk components are styled to match your dark theme. To customize:

1. Edit the `appearance` prop in:
   - `app/sign-in/page.tsx`
   - `app/sign-up/page.tsx`

### Route Protection

To add more public routes, edit `middleware.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/your-public-route', // Add your route here
]);
```

## Useful Clerk Hooks & Functions

### Client Components

```tsx
import { useUser, useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return <div>Hello {user?.firstName}!</div>;
}
```

### Server Components

```tsx
import { auth, currentUser } from '@clerk/nextjs/server';

async function MyServerComponent() {
  const { userId } = await auth();
  const user = await currentUser();

  return <div>Hello {user?.firstName}!</div>;
}
```

## Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js + Clerk Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)
