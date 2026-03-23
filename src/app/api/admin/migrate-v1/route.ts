import { NextRequest, NextResponse } from 'next/server';
import { migrateV1Subscribers, getMigrationStats } from '@/lib/migration';

/**
 * POST /api/admin/migrate-v1
 * Runs the V1 subscriber migration. Requires ADMIN_API_KEY header.
 *
 * GET /api/admin/migrate-v1
 * Returns migration statistics.
 */

function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('[migrate-v1] ADMIN_API_KEY not configured');
    return false;
  }

  return apiKey === expectedKey;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await migrateV1Subscribers();

    return NextResponse.json({
      success: result.success,
      migrated: result.migrated,
      skipped: result.skipped,
      errors: result.errors,
      details: result.details,
    }, { status: result.success ? 200 : 207 });
  } catch (err) {
    console.error('[migrate-v1] Migration failed:', err);
    return NextResponse.json(
      { error: 'Migration failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getMigrationStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[migrate-v1] Stats fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to fetch migration stats', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
