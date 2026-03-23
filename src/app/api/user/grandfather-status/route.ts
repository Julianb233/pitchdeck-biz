import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { getGrandfatherStatus } from '@/lib/migration';

/**
 * GET /api/user/grandfather-status
 * Returns the grandfathering status for the authenticated user.
 */
export async function GET() {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const status = await getGrandfatherStatus(user.id);

  return NextResponse.json(status);
}
