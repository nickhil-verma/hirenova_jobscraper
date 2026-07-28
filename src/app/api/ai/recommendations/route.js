import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    let user = null;
    if (token) {
      const sessionsColl = await getCollection('sessions');
      const session = await sessionsColl.findOne({ token });
      if (session && session.userId) {
        const usersColl = await getCollection('users');
        user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
      }
    }

    const userName = user?.name ? user.name.split(' ')[0] : 'Candidate';
    const skills = Array.isArray(user?.skills) ? user.skills : [];
    const jobTitle = user?.jobTitle || 'Software Engineer';
    const domain = user?.domainOfInterest || 'Full Stack';

    // Fetch user's kanban items from DB
    let kanbanItems = [];
    if (user?._id) {
      const kanbanColl = await getCollection('kanban');
      const kanbanDoc = await kanbanColl.findOne({ userId: user._id.toString() });
      if (kanbanDoc && Array.isArray(kanbanDoc.items)) {
        kanbanItems = kanbanDoc.items;
      }
    }

    // Fetch top active job postings for recommendations context
    const jobsColl = await getCollection('jobs');
    const recentJobs = await jobsColl.find({}).limit(5).toArray();

    // 1. Calculate dynamic Hiring Score
    let score = 65;
    if (user?.name) score += 5;
    if (user?.email) score += 5;
    if (user?.portfolio || user?.github || user?.linkedin) score += 8;
    if (skills.length >= 3) score += Math.min(skills.length * 2, 12);
    if (user?.resumeText) score += 8;
    if (kanbanItems.length > 0) score += Math.min(kanbanItems.length * 2, 10);
    const dynamicHiringScore = Math.min(score, 98);

    // Calculate percentile badge text
    const percentile = dynamicHiringScore >= 90 ? 'Top 3%' : dynamicHiringScore >= 80 ? 'Top 8%' : 'Top 15%';

    // 2. Generate 100% Dynamic Recommendations
    const dynamicTasks = [];

    // Recommendation 1: Application Target
    const savedOrTopJob = kanbanItems.find(i => i.stage === 'saved') || recentJobs[0];
    if (savedOrTopJob) {
      const company = savedOrTopJob.company || savedOrTopJob.company_name || 'Tech Leader';
      const title = savedOrTopJob.title || savedOrTopJob.job_information?.title || jobTitle;
      dynamicTasks.push({
        id: 1,
        text: `Apply to ${title} position at ${company} (High ATS fit score)`,
        done: false,
        category: 'application'
      });
    } else {
      dynamicTasks.push({
        id: 1,
        text: `Explore live ${jobTitle} opportunities matching your ${skills.slice(0, 2).join(', ') || 'tech'} stack`,
        done: false,
        category: 'application'
      });
    }

    // Recommendation 2: Resume / Skill Gap Recommendation
    const commonDemandedSkills = ['Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'AWS', 'System Design', 'CI/CD'];
    const missingSkill = commonDemandedSkills.find(s => !skills.some(userSkill => userSkill.toLowerCase() === s.toLowerCase())) || 'System Design';
    dynamicTasks.push({
      id: 2,
      text: `Highlight ${missingSkill} in your profile & resume to match incoming ${jobTitle} postings`,
      done: skills.some(s => s.toLowerCase() === missingSkill.toLowerCase()),
      category: 'skill'
    });

    // Recommendation 3: Kanban Pipeline Action
    const inProgressApp = kanbanItems.find(i => i.stage === 'applied' || i.stage === 'interview' || i.stage === 'oa');
    if (inProgressApp) {
      dynamicTasks.push({
        id: 3,
        text: `Follow up with recruiter for ${inProgressApp.title} role at ${inProgressApp.company} (${inProgressApp.stage.toUpperCase()} stage)`,
        done: false,
        category: 'kanban'
      });
    } else {
      dynamicTasks.push({
        id: 3,
        text: `Save at least 3 target ${domain} engineering roles to your Kanban tracker board`,
        done: kanbanItems.length >= 3,
        category: 'kanban'
      });
    }

    // Recommendation 4: Profile & Recruiter Impression Polish
    if (!user?.portfolio && !user?.github) {
      dynamicTasks.push({
        id: 4,
        text: `Add your GitHub profile or portfolio link in 'Your Information' settings to boost recruiter impressions`,
        done: false,
        category: 'profile'
      });
    } else {
      dynamicTasks.push({
        id: 4,
        text: `Run the 6-Second Recruiter Impression Simulator to audit layout readability for ${jobTitle}`,
        done: false,
        category: 'profile'
      });
    }

    return NextResponse.json({
      success: true,
      hiringScore: dynamicHiringScore,
      percentileText: `${percentile} of Candidates`,
      recommendations: dynamicTasks,
      userContext: {
        name: userName,
        jobTitle,
        skillsCount: skills.length
      }
    });

  } catch (error) {
    console.error('[AI Recommendations API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations'
    }, { status: 500 });
  }
}
