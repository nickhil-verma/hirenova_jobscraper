import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminsecret123';
const TOKEN_VALUE = 'admin_authenticated_session_token_sec_v2';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (token === TOKEN_VALUE) {
      return NextResponse.json({ success: true, authenticated: true });
    }
    return NextResponse.json({ success: false, authenticated: false });
  } catch (error) {
    console.error('[API Admin Auth GET] Error:', error);
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', TOKEN_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid Admin Credentials' }, { status: 401 });
  } catch (error) {
    console.error('[API Admin Auth POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Auth DELETE] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
