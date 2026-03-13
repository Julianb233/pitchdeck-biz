import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase/types';
import { verifySessionToken, getUserById, toSafeUser } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update Supabase session (refreshes auth token)
  let response = await updateSession(request);

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    let isAuthenticated = false;

    // Check 1: NextAuth / custom session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      try {
        const userId = await verifySessionToken(sessionCookie);
        if (userId) {
          const user = getUserById(userId);
          if (user) isAuthenticated = true;
        }
      } catch {
        // Session invalid, continue to Supabase check
      }
    }

    // Check 2: NextAuth session cookie (authjs.session-token)
    const nextAuthCookie = request.cookies.get('authjs.session-token')?.value
      || request.cookies.get('__Secure-authjs.session-token')?.value;
    if (nextAuthCookie) {
      isAuthenticated = true;
    }

    // Check 3: Supabase auth
    if (!isAuthenticated) {
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) isAuthenticated = true;
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
