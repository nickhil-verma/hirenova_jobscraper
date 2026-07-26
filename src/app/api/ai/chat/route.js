import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    
    let user = null;
    if (token) {
      try {
        const sessionsColl = await getCollection('sessions');
        const session = await sessionsColl.findOne({ token });
        if (session && session.userId) {
          const usersColl = await getCollection('users');
          user = await usersColl.findOne({ _id: new ObjectId(session.userId) });
        }
      } catch (e) {
        console.warn('[AI Chat] Session lookup fallback:', e.message);
      }
    }

    const body = await req.json();
    const { message, chatHistory } = body;
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const skillsText = user?.skills?.join(', ') || 'React, Next.js, Node.js, TypeScript, PostgreSQL, REST APIs';
    const titleText = user?.jobTitle || 'Full Stack Software Engineer';
    const experienceText = user?.experience || '3+ years experience building web applications';

    const historyContext = chatHistory?.map(chat => 
      `${chat.sender === 'user' ? 'Candidate' : 'Coach'}: ${chat.text}`
    ).join('\n') || '';

    const prompt = `You are Hirenova's expert AI Career Coach. Help the candidate improve their resume, prepare for job interviews, suggest target skills to learn, or provide strategic application advice based on their profile.

Candidate Profile:
- Target Role: ${titleText}
- Synced Tech Skills: ${skillsText}
- Experience Summary: ${experienceText}

Conversation History:
${historyContext}

Candidate Message: "${message}"

Give a highly professional, actionable, and specific response. Mention technical concepts relevant to their skills. Keep your answers concise, clear, and formatted in clean markdown.`;

    if (apiKey) {
      // Try models in order of availability: gemini-1.5-flash -> gemini-2.0-flash -> gemini-flash-latest
      const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
      
      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          if (response.ok) {
            const geminiData = await response.json();
            const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
              return NextResponse.json({ success: true, reply: replyText });
            }
          }
        } catch (mErr) {
          console.warn(`[AI Chat] Model ${model} failed, trying next fallback...`, mErr.message);
        }
      }
    }

    // Smart Fallback Career Coach response if API key is rate limited or unavailable
    let fallbackReply = `As your Hirenova AI Career Coach, here is my recommendation for **${titleText}**:\n\n` +
      `1. **ATS Optimization**: Ensure key tools like **${skillsText.split(', ')[0] || 'React'}** and **System Design** are highlighted near the top of your resume.\n` +
      `2. **Impact Metrics**: Quantify your experience with throughput numbers (e.g. *Reduced latency by 35% via Redis caching*).\n` +
      `3. **Interview Prep**: Practice core data structures, system design patterns, and behavioral STAR stories for target roles.`;

    return NextResponse.json({
      success: true,
      reply: fallbackReply
    });

  } catch (error) {
    console.error('[AI Chat Coach API] Error:', error);
    return NextResponse.json({ 
      success: true, 
      reply: `Here are strategic tips for your application:\n- **Target Skills**: Focus on modern tech stacks (${user?.skills?.slice(0, 3)?.join(', ') || 'React, Node.js'}).\n- **Metrics**: Add quantified metric bullets to boost ATS scores.` 
    });
  }
}
