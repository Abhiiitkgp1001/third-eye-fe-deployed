# Profile Images Fix

## Problem
Profile images were not displaying in the people list - only showing initials in avatars.

## Root Causes
1. LinkedIn profile image URLs may require authentication or have CORS restrictions
2. Images failing to load weren't being handled gracefully
3. Next.js wasn't configured to allow external images from LinkedIn domains

## Fixes Applied

### 1. Enhanced Error Handling (`ProfileRow.tsx`)
- Added `useState` to track image loading errors
- Added `onError` handler to gracefully fallback to initials
- Added multiple fallback fields: `profile_photo_url`, `profile_pic_url`, `image_url`
- Added debug logging to identify missing image URLs

### 2. Next.js Configuration (`next.config.ts`)
- Added `remotePatterns` to allow images from:
  - `**.licdn.com`
  - `**.linkedin.com`
  - `media.licdn.com`
  - `static.licdn.com`

## How to Test

### 1. Restart the Frontend
```bash
cd third-eye-fe
# Stop the dev server (Ctrl+C)
npm run dev
```

### 2. Check Browser Console
Open the people list page and check for:
- `[ProfileRow] No image URL found for...` - means enrichment didn't include photo URL
- CORS errors - means LinkedIn is blocking the request
- 404 errors - means the URL is invalid or expired

### 3. Verify Enrichment Data
If images still don't show, check if the enrichment API is returning `profile_photo_url`:
1. Open browser DevTools → Network tab
2. Find the API call to get people list
3. Look for `latestMetadata.profile.profile_photo_url` in the response

## Possible Issues

### Issue: Images Still Not Showing

**Cause 1: EnrichGraph Not Returning Photo URLs**
- The enrichment API might not be including profile photos
- Check with EnrichGraph API documentation
- Verify API response includes `profile_photo_url`

**Cause 2: LinkedIn CORS Restrictions**
- LinkedIn blocks direct image loading from external domains
- **Solution**: Use a backend proxy:
  1. Create an API route: `/api/proxy-image/[...path]`
  2. Fetch image on backend and return as response
  3. Update `profileImageUrl` to use proxy: `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`

**Cause 3: URLs Require Authentication**
- LinkedIn profile photo URLs might require session cookies
- **Solution**: Same as Cause 2 - use backend proxy with authentication

### Issue: Images Load Then Disappear

**Cause**: LinkedIn URLs might be time-limited or session-based
- URLs expire after a certain time
- **Solution**: Cache images on your backend or use a CDN

## Backend Proxy Implementation (If Needed)

If LinkedIn blocks direct access, create this API route:

```typescript
// app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThirdEye/1.0)',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
```

Then update ProfileRow to use proxy:
```typescript
const profileImageUrl = metadata?.profile_photo_url
  ? `/api/proxy-image?url=${encodeURIComponent(metadata.profile_photo_url)}`
  : null;
```

## Debugging Commands

### Check if images are in metadata
```bash
# In browser console
const profiles = await trpc.peopleLists.getById.query({ id: 'list-id', limit: 10, offset: 0 });
profiles.profiles.forEach(p => {
  console.log(p.latestMetadata?.profile?.profile_photo_url);
});
```

### Test image URL directly
```bash
# Open in browser or use curl
curl -I "https://media.licdn.com/path/to/image"
# Check for CORS headers and status code
```

## Backend Code Verification ✅

I've verified the entire backend data flow:

1. **Schema is correct**: `enrichgraph-profile-schemas.ts:133` includes `profile_photo_url: z.string().nullish()`
2. **API call is correct**: `enrich.ts` properly requests profile data from EnrichGraph
3. **Aggregator is correct**: `aggregator.ts:438-443` returns complete profile object with all fields
4. **Data structure**: When saved to DB, structure is:
   ```json
   {
     "profile": { "profile_photo_url": "...", ... },
     "posts": [...],
     "commentedOn": [...],
     "reactedOn": [...]
   }
   ```

## Status

- ✅ Error handling improved
- ✅ Next.js configured for external images
- ✅ Debug logging added
- ✅ Backend code verified - schema and data flow are correct
- ✅ Frontend and backend servers restarted
- ⏳ **ACTION REQUIRED**: Navigate to a people list and check browser console
- ⏳ May need backend proxy if LinkedIn blocks direct access

## Debugging Steps - Do This Now

1. **Open the people list page** in your browser: http://localhost:3000/app/people/[list-id]
2. **Open browser DevTools** (F12 or Right-click → Inspect)
3. **Go to Console tab** and look for:
   - `[ProfileRow] No image URL found for [name]` - means EnrichGraph didn't return photo URL
   - Any CORS errors with `licdn.com` - means LinkedIn is blocking the request
   - Any 404/403 errors with image URLs - means URLs are invalid or expired
4. **Go to Network tab** and filter by "Img" to see if any image requests are being made
5. **Check API response**: Find the people list API call and look for `latestMetadata.profile.profile_photo_url` in the JSON response
