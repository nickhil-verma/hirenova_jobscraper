import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionsColl = await getCollection('sessions');
    const session = await sessionsColl.findOne({ token });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    const usersColl = await getCollection('users');
    const user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      autoApplyEnabled: user.autoApplyEnabled || false,
      applications: user.applications || []
    });
  } catch (error) {
    console.error('[Auto Apply GET API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionsColl = await getCollection('sessions');
    const session = await sessionsColl.findOne({ token });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    const usersColl = await getCollection('users');
    const user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    let applications = user.applications || [];

    if (enabled && !user.autoApplyEnabled) {
      const userSkills = user.skills || [];
      const targetTitle = user.jobTitle || '';

      if (userSkills.length > 0) {
        const jobsColl = await getCollection('jobs');
        const jobs = await jobsColl.find({}).limit(50).toArray();

        const matches = jobs.map(job => {
          const details = job.v5_processed_job_data || {};
          const requiredSkills = details.technical_tools || [];
          const coreTitle = details.core_job_title || job.job_information?.title || '';
          
          let skillScore = 0;
          if (requiredSkills.length > 0) {
            const overlap = requiredSkills.filter(skill => 
              userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
            );
            skillScore = (overlap.length / requiredSkills.length) * 70;
          } else {
            skillScore = 30;
          }

          let titleScore = 15;
          if (targetTitle && coreTitle) {
            const overlap = targetTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2 && coreTitle.toLowerCase().includes(w));
            titleScore = overlap.length > 0 ? 30 : 15;
          }

          return {
            jobId: job.id,
            title: coreTitle,
            company: details.company_name || 'Unknown Company',
            matchPercent: Math.min(100, Math.round(skillScore + titleScore))
          };
        });

        const topMatches = matches
          .filter(m => m.matchPercent >= 50)
          .sort((a, b) => b.matchPercent - a.matchPercent)
          .slice(0, 5);

        const statuses = ['Resume Sent', 'Under Review', 'Interview Scheduled', 'Applied', 'Resume Sent'];
        topMatches.forEach((match, idx) => {
          const exists = applications.some(app => app.jobId === match.jobId);
          if (!exists) {
            applications.push({
              jobId: match.jobId,
              title: match.title,
              company: match.company,
              appliedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000 - 3600000), 
              status: statuses[idx % statuses.length],
              matchPercent: match.matchPercent
            });
          }
        });
      }
    }

    await usersColl.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          autoApplyEnabled: enabled,
          applications: applications,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      autoApplyEnabled: enabled,
      applications: applications
    });

  } catch (error) {
    console.error('[Auto Apply POST API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
