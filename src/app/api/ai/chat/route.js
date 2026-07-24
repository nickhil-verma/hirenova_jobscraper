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

    const body = await req.json();
    const { message, chatHistory } = body;
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API Key is not configured' }, { status: 500 });
    }

    // Build context
    const skillsText = user.skills?.join(', ') || 'No skills parsed yet';
    const titleText = user.jobTitle || 'Job Seeker';
    const experienceText = user.experience || 'Not specified';
    
    // Prepare prompt history
    const historyContext = chatHistory?.map(chat => 
      `${chat.sender === 'user' ? 'Candidate' : 'Coach'}: ${chat.text}`
    ).join('\n') || '';

    const prompt = `You are Hirenova's expert AI Career Coach. Help the candidate improve their resume, prepare for job interviews, suggest target skills to learn, or provide strategic application advice based on their parsed profile.

Candidate Profile:
- Target Role: ${titleText}
- Synced Tech Skills: ${skillsText}
- Experience Summary: ${experienceText}

Conversation History:
${historyContext}

Candidate Message: "${message}"

Give a highly professional, actionable, and specific response. Mention technical concepts relevant to their skills. Keep your answers concise, clear, and formatted in clean markdown. Do not use generic filler words.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Chat Coach API] Gemini error:', errText);
      throw new Error(`Gemini API error: HTTP ${response.status}`);
    }

    const geminiData = await response.json();
    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process your request. Let's try again.";

    return NextResponse.json({
      success: true,
      reply: replyText
    });

  } catch (error) {
    console.error('[AI Chat Coach API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
