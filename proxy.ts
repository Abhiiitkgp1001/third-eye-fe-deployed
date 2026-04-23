import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/webhooks/clerk',
]);

// Routes that require an organization to be selected
const requiresOrganization = createRouteMatcher([
  '/app(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all non-public routes
  await auth.protect();

  // Check organization requirements for protected routes
  if (requiresOrganization(request)) {
    const { userId, orgId } = await auth();

    // Skip if already on select-org page
    if (request.nextUrl.pathname.startsWith('/select-org')) {
      return NextResponse.next();
    }

    // If no active organization, check user's memberships
    if (!orgId && userId) {
      try {
        const client = await clerkClient();
        const orgMemberships = await client.users.getOrganizationMembershipList({
          userId,
        });

        const userOrgs = orgMemberships.data;

        if (userOrgs.length === 0) {
          // No organizations - could redirect to create org page
          // For now, continue and let the app handle it
          return NextResponse.next();
        } else if (userOrgs.length === 1) {
          // Single org - redirect to set it as active via Clerk's organization switcher
          // The redirect will trigger Clerk to set this org as active
          const orgId = userOrgs[0].organization.id;
          const selectOrgUrl = new URL('/select-org', request.url);
          selectOrgUrl.searchParams.set('__clerk_redirect_url', request.nextUrl.pathname);
          selectOrgUrl.searchParams.set('__clerk_org_id', orgId);
          return NextResponse.redirect(selectOrgUrl);
        } else {
          // Multiple orgs - redirect to organization selector page
          const selectOrgUrl = new URL('/select-org', request.url);
          selectOrgUrl.searchParams.set('__clerk_redirect_url', request.nextUrl.pathname);
          return NextResponse.redirect(selectOrgUrl);
        }
      } catch (error) {
        console.error('Error fetching user organizations:', error);
        // On error, let the request proceed and handle it in the app
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
