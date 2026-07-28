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

    const candidateName = user?.name || 'Candidate';
    const candidateFirstName = candidateName.split(' ')[0];
    const apiKey = process.env.GEMINI_API_KEY;
    const skillsText = user?.skills?.join(', ') || 'React, Next.js, Node.js, TypeScript, PostgreSQL, REST APIs';
    const titleText = user?.jobTitle || 'Full Stack Software Engineer';
    const experienceText = user?.experience || 'Experienced Software Engineer';

    const historyContext = chatHistory?.map(chat => 
      `${chat.sender === 'user' ? candidateFirstName : 'Coach'}: ${chat.text}`
    ).join('\n') || '';

    const prompt = `You are Hirenova's expert AI Career Coach assisting ${candidateName}.

Candidate Profile:
- Candidate Name: ${candidateName}
- Target Role: ${titleText}
- Candidate Level: ${user?.candidateLevel || 'Mid-Level'}
- Domain of Interest: ${user?.domainOfInterest || 'Full Stack'}
- Synced Tech Skills: ${skillsText}
- Experience Summary: ${experienceText}

Conversation History:
${historyContext}

Candidate Question: "${message}"

CRITICAL FORMATTING & LENGTH CONSTRAINTS:
1. Provide an ULTRA-CONCISE, extremely brief reply (maximum 2-3 short bullet points or 2 sentences total).
2. Address ${candidateFirstName} directly by name.
3. Do NOT use markdown code blocks (\`\`\`), markdown bold asterisks (**text** or *text*), or markdown headers (###). Use plain clean text with simple bullet points (• ) only.`;

    const persistChatToDb = async (userText, coachText) => {
      if (user && user._id) {
        try {
          const usersColl = await getCollection('users');
          const newHistory = [
            { sender: 'user', text: userText, timestamp: new Date() },
            { sender: 'coach', text: coachText, timestamp: new Date() }
          ];
          await usersColl.updateOne(
            { _id: new ObjectId(user._id) },
            { $push: { chatHistory: { $each: newHistory } } }
          );
        } catch (dbErr) {
          console.warn('[AI Chat DB Persistence Error]:', dbErr.message);
        }
      }
    };

    if (apiKey) {
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
              const cleanReply = replyText
                .replace(/```[\s\S]*?```/g, m => m.replace(/```[a-z]*/gi, '').trim())
                .replace(/`([^`]+)`/g, '$1')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/###?\s*/g, '')
                .trim();

              await persistChatToDb(message, cleanReply);
              return NextResponse.json({ success: true, reply: cleanReply });
            }
          }
        } catch (mErr) {
          console.warn(`[AI Chat] Model ${model} failed, trying next fallback...`, mErr.message);
        }
      }
    }

    // Smart Fallback Career Coach response addressing candidate by their actual name
    let fallbackReply = `Hi ${candidateFirstName}! Here is my top advice for your ${titleText} job search:\n\n` +
      `• Feature key skills like ${skillsText.split(', ')[0] || 'React'} and System Architecture near the top of your resume.\n` +
      `• Quantify engineering achievements with measurable metrics (e.g. reduced latency, increased throughput).\n` +
      `• Save 3 active ${user?.domainOfInterest || 'Full Stack'} engineering positions to your Kanban board today.`;

    await persistChatToDb(message, fallbackReply);

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
