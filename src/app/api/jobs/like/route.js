import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const sessionsColl = await getCollection('sessions');
  const session = await sessionsColl.findOne({ token });
  if (!session) return null;

  const usersColl = await getCollection('users');
  const user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
  return user;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      likedJobs: user.likedJobs || []
    });
  } catch (error) {
    console.error('[API Jobs Like GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, jobData } = await request.json();
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId is required' }, { status: 400 });
    }

    const currentLiked = user.likedJobs || [];
    const exists = currentLiked.some(id => String(id) === String(jobId));

    const usersColl = await getCollection('users');
    let updatedLiked;

    if (exists) {
      // Remove like
      updatedLiked = currentLiked.filter(id => String(id) !== String(jobId));
      await usersColl.updateOne(
        { _id: user._id },
        { $set: { likedJobs: updatedLiked } }
      );
    } else {
      // Add like
      updatedLiked = [...currentLiked, String(jobId)];
      await usersColl.updateOne(
        { _id: user._id },
        { $set: { likedJobs: updatedLiked } }
      );
    }

    return NextResponse.json({
      success: true,
      isLiked: !exists,
      likedJobs: updatedLiked
    });
  } catch (error) {
    console.error('[API Jobs Like POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
