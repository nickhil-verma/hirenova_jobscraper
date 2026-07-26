import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(req) {
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API Key missing' }, { status: 500 });
    }

    const prompt = `You are a Senior Tech Recruiter at a top tech company. Perform a strict 6-second initial scan of this candidate profile.

Candidate Profile:
- Target Role: ${user.jobTitle || 'Software Engineer'}
- Experience Summary: ${user.experience || 'N/A'}
- Technical Skills: ${(user.skills || []).join(', ')}
- Achievements: ${(user.achievements || []).join(' | ')}
- Projects: ${JSON.stringify(user.projects || [])}

Analyze the candidate as a recruiter who reviews 300 resumes per day.
Return your evaluation strictly in JSON format adhering to this schema:
{
  "scanTimeSeconds": 6,
  "recruiterImpression": "1-sentence immediate gut impression upon glancing at the resume.",
  "strengthsSeen": [
    "✓ Strong Callout 1",
    "✓ Strong Callout 2"
  ],
  "weaknessesSeen": [
    "✗ Weak area or missing item 1",
    "✗ Weak area or missing item 2"
  ],
  "strategicActionItem": "Single most impactful recommendation (e.g. Move React project higher up, Quantify API latency in summary).",
  "predictedInterviewChance": 87,
  "interviewProbabilityLabel": "High",
  "expectedQuestions": [
    "Likely technical interview question 1",
    "Likely system design or architecture question 2",
    "Likely behavioral or project deep dive question 3"
  ]
}

Do not add any markdown formatting, backticks (\`\`\`json), or text outside of the JSON object.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Empty response from Recruiter Simulation model');
    }

    const evaluation = JSON.parse(responseText.trim());

    return NextResponse.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error('[Recruiter Sim API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
