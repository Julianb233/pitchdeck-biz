import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { getUserOrders } from '@/lib/supabase/orders';

export async function GET() {
  const user = await getSessionFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await getUserOrders(user.id);
  return NextResponse.json({ orders });
}
