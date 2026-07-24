import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const usersColl = await getCollection('users');
    const user = await usersColl.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 400 });
    }

    // Hash and compare
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 400 });
    }

    // Generate session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionsColl = await getCollection('sessions');
    await sessionsColl.insertOne({
      token: sessionToken,
      userId: user._id,
      createdAt: new Date()
    });

    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        autoApplyEnabled: user.autoApplyEnabled || false
      }
    });

  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
