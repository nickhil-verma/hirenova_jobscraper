import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

function getCorsHeaders(req) {
  const origin = req?.headers?.get('origin') || req?.headers?.get('referer') || '';
  let cleanOrigin = origin;
  if (cleanOrigin && cleanOrigin.startsWith('http')) {
    try {
      cleanOrigin = new URL(cleanOrigin).origin;
    } catch (e) {}
  }

  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With'
  };

  if (cleanOrigin && cleanOrigin !== 'null') {
    headers['Access-Control-Allow-Origin'] = cleanOrigin;
  }

  return headers;
}

export async function OPTIONS(req) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function GET(req) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('session_token')?.value;

    if (!token) {
      const authHeader = req?.headers?.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = req?.headers?.get('x-session-token');
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const sessionsColl = await getCollection('sessions');
    const session = await sessionsColl.findOne({ token });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401, headers: corsHeaders });
    }

    const usersColl = await getCollection('users');
    const user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401, headers: corsHeaders });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        candidateLevel: user.candidateLevel || 'Mid-Level',
        domainOfInterest: user.domainOfInterest || 'Full Stack',
        resumeText: user.resumeText || '',
        skills: user.skills || [],
        experience: user.experience || '',
        jobTitle: user.jobTitle || '',
        contact: user.contact || null,
        achievements: user.achievements || [],
        projects: user.projects || [],
        autoApplyEnabled: user.autoApplyEnabled || false,
        applications: user.applications || [],
        likedJobs: user.likedJobs || [],
        title: user.title || '',
        phoneExtension: user.phoneExtension || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        linkedin: user.linkedin || '',
        xTwitter: user.xTwitter || '',
        github: user.github || '',
        portfolio: user.portfolio || '',
        photoPath: user.photoPath || '',
        photoDataUrl: user.photoDataUrl || '',
        gpa: user.gpa || user.cgpa || '',
        gender: user.gender || '',
        race: user.race || '',
        dob: user.dob || '',
        age: user.age || '',
        educations: Array.isArray(user.educations) ? user.educations : []
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
