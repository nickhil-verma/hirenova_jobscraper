import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const usersColl = await getCollection('users');
    const existingUser = await usersColl.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
      resumeText: '',
      skills: [],
      experience: '',
      jobTitle: '',
      autoApplyEnabled: false,
      applications: []
    };

    const result = await usersColl.insertOne(newUser);
    const userId = result.insertedId;

    // Log them in immediately by generating a session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionsColl = await getCollection('sessions');
    await sessionsColl.insertOne({
      token: sessionToken,
      userId: userId,
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
        id: userId.toString(),
        name: newUser.name,
        email: newUser.email,
        autoApplyEnabled: newUser.autoApplyEnabled
      }
    });

  } catch (error) {
    console.error('[Signup API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
