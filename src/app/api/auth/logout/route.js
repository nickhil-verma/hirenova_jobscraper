import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const sessionsColl = await getCollection('sessions');
      await sessionsColl.deleteOne({ token });
    }

    // Clear cookie
    cookieStore.set('session_token', '', {
      path: '/',
      maxAge: 0
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
