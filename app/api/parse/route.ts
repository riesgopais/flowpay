import { NextResponse } from 'next/server';
import { parsePaymentIntent } from '@/lib/parser';

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();
    if (!intent || typeof intent !== 'string') {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }
    const parsed = await parsePaymentIntent(intent);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parse failed' },
      { status: 500 }
    );
  }
}
