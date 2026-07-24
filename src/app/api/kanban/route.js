import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';
import { cookies } from 'next/headers';

const defaultKanbanItems = [
  { id: '1', company: 'Stripe', title: 'Backend Engineer', location: 'Remote', match: 94, stage: 'applied', notes: 'Applied via direct candidate link.' },
  { id: '2', company: 'Sprinto', title: 'Full Stack Developer', location: 'Hybrid', match: 89, stage: 'interview', notes: 'First phone screen completed.' },
  { id: '3', company: 'Razorpay', title: 'Senior Software Engineer', location: 'Onsite', match: 84, stage: 'oa', notes: 'Online assessment link received.' },
  { id: '4', company: 'Google', title: 'Software Engineer II', location: 'Remote', match: 91, stage: 'saved', notes: 'Saved for resume tailoring.' },
  { id: '5', company: 'Amazon', title: 'Frontend Specialist', location: 'Remote', match: 78, stage: 'offer', notes: 'Offer letter under review.' },
  { id: '6', company: 'Meta', title: 'AI Applications Engineer', location: 'Hybrid', match: 82, stage: 'rejected', notes: 'Closed position.' }
];

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const sessionsColl = await getCollection('sessions');
  const session = await sessionsColl.findOne({ token });
  if (!session) return null;

  return session.userId ? String(session.userId) : null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const kanbanColl = await getCollection('kanban_boards');
    const userBoard = await kanbanColl.findOne({ userId });

    if (userBoard && Array.isArray(userBoard.items)) {
      return NextResponse.json({ success: true, items: userBoard.items });
    }

    // Seed default cards for first-time user
    await kanbanColl.updateOne(
      { userId },
      { $set: { userId, items: defaultKanbanItems, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, items: defaultKanbanItems });
  } catch (error) {
    console.error('[API Kanban GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Invalid items array' }, { status: 400 });
    }

    const kanbanColl = await getCollection('kanban_boards');
    await kanbanColl.updateOne(
      { userId },
      { $set: { userId, items, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[API Kanban POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
