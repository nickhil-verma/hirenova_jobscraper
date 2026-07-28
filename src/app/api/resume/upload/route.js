import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

// Helper to segregate resume text into clean contextual blocks via regex headings
function segregateResumeText(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n');
  const sections = {
    contact: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    achievements: [],
    other: []
  };

  const lines = normalized.split('\n');
  let currentSection = 'other';

  const headingPatterns = {
    skills: /^(?:skills?|technologies|technical\s+skills|expertise|tools|core\s+competencies)$/i,
    experience: /^(?:experience|employment|work\s+experience|professional\s+experience|employment\s+history|history)$/i,
    projects: /^(?:projects?|applications|personal\s+projects|academic\s+projects)$/i,
    education: /^(?:education|degrees|academic\s+background|qualifications|certifications)$/i,
    achievements: /^(?:achievements?|awards?|honors?|accomplishments|publications)$/i,
    contact: /^(?:contact|personal\s+details|links|profiles|socials)$/i
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedHeader = false;
    if (trimmed.length < 35) {
      for (const [secName, regex] of Object.entries(headingPatterns)) {
        if (regex.test(trimmed) || trimmed.toLowerCase().includes(secName + ':')) {
          currentSection = secName;
          matchedHeader = true;
          break;
        }
      }
    }

    if (!matchedHeader) {
      sections[currentSection].push(trimmed);
    }
  }

  return {
    contact: sections.contact.join('\n'),
    skills: sections.skills.join('\n'),
    experience: sections.experience.join('\n'),
    projects: sections.projects.join('\n'),
    education: sections.education.join('\n'),
    achievements: sections.achievements.join('\n'),
    other: sections.other.join('\n')
  };
}

// Local Fallback Resume Parser (Guarantees zero crashes if Gemini hits persistent rate limits)
function parseResumeLocally(text, segregated) {
  const commonTech = [
    'React', 'Next.js', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'Python', 'Java',
    'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'HTML', 'CSS', 'Tailwind', 'PostgreSQL',
    'MongoDB', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS',
    'GCP', 'Azure', 'Git', 'CI/CD', 'FastAPI', 'PyTorch', 'TensorFlow', 'LLM', 'RAG'
  ];

  const foundSkills = commonTech.filter(tech => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`;
    return new RegExp(pattern, 'i').test(text);
  });

  let candidateLevel = 'Mid-Level';
  let yoe = 0;
  const yoeMatch = text.match(/(\d+)\+?\s*y(?:ea)?rs?/i);
  if (yoeMatch) {
    yoe = parseInt(yoeMatch[1], 10);
    if (yoe <= 2) candidateLevel = 'Entry-Level';
    else if (yoe >= 5) candidateLevel = 'Senior';
  } else if (/intern|student|fresh/i.test(text)) {
    candidateLevel = 'Intern';
  }

  let domainOfInterest = 'Full Stack';
  if (/python|machine learning|deep learning|llm|rag|data scientist/i.test(text)) {
    domainOfInterest = 'AI/ML';
  } else if (/docker|kubernetes|aws|cloud|devops|ci\/cd/i.test(text)) {
    domainOfInterest = 'DevOps/Cloud';
  } else if (/react|next\.js|vue|angular|frontend|ui/i.test(text) && !/node|backend|postgres/i.test(text)) {
    domainOfInterest = 'Frontend';
  } else if (/backend|express|node|python|java|postgres|sql/i.test(text) && !/react|frontend/i.test(text)) {
    domainOfInterest = 'Backend';
  }

  const expLines = (segregated.experience || text).split('\n').filter(l => l.trim().length > 10);
  const projLines = (segregated.projects || text).split('\n').filter(l => l.trim().length > 10);
  const achiveLines = (segregated.achievements || text).split('\n').filter(l => l.trim().length > 10);

  return {
    candidateLevel,
    domainOfInterest,
    skills: foundSkills.length > 0 ? foundSkills : ['Software Engineering', 'JavaScript', 'Git'],
    experience: expLines.slice(0, 4).join(' ') || 'Software development history parsed from resume.',
    jobTitle: domainOfInterest + ' Developer',
    achievements: achiveLines.slice(0, 3),
    projects: projLines.slice(0, 3).map((line, i) => ({
      title: `Project ${i + 1}`,
      description: line
    }))
  };
}

// Gemini API Call with Exponential Backoff Retry for HTTP 429 Rate Limits
async function callGeminiWithRetry(prompt, apiKey, maxRetries = 3) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.status === 429) {
        console.warn(`[Gemini API] Rate limit hit (429). Attempt ${attempt} of ${maxRetries}. Retrying in ${attempt * 1200}ms...`);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, attempt * 1200));
          continue;
        }
        throw new Error('Gemini API 429 Rate Limit Exceeded after retries.');
      }

      if (!response.ok) {
        throw new Error(`Gemini API error: HTTP ${response.status}`);
      }

      const geminiData = await response.json();
      const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini parser');
      }

      return JSON.parse(responseText.trim());
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(res => setTimeout(res, attempt * 1000));
    }
  }
}

// Resilient Multi-Layer PDF Text Extractor
async function extractTextFromPdf(buffer) {
  let text = '';

  // Layer 1: Standard pdf-parse module
  try {
    const pdfParse = eval("require('pdf-parse')");
    if (typeof pdfParse === 'function') {
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length > 20) {
        text = data.text;
      }
    } else if (pdfParse && pdfParse.PDFParse) {
      const parser = new pdfParse.PDFParse({ data: buffer });
      const res = await parser.getText();
      if (res && res.text && res.text.trim().length > 20) {
        text = res.text;
      }
    }
  } catch (err1) {
    console.warn('[PDF Parser] Layer 1 pdf-parse attempt failed:', err1.message);
  }

  // Layer 2: Raw PDF parenthesis text stream regex extraction (handles custom/scanned PDF streams)
  if (!text || text.trim().length < 20) {
    try {
      const str = buffer.toString('latin1');
      const matches = str.match(/\(([^()]{2,})\)/g) || [];
      const extracted = matches
        .map(m => m.slice(1, -1))
        .filter(t => /[a-zA-Z0-9]{2,}/.test(t))
        .join(' ')
        .replace(/\\([()\\])/g, '$1');

      if (extracted && extracted.trim().length > 10) {
        text = extracted;
      }
    } catch (err2) {
      console.warn('[PDF Parser] Layer 2 stream extraction failed:', err2.message);
    }
  }

  // Layer 3: Text operator regex fallback (handles Tj/TJ operators)
  if (!text || text.trim().length < 20) {
    try {
      const rawStr = buffer.toString('utf-8');
      const tjMatches = rawStr.match(/\[(.*?)\]\s*TJ|\((.*?)\)\s*Tj/gi) || [];
      const cleaned = tjMatches
        .map(m => m.replace(/[\(\)\[\]\/]/g, ' '))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned && cleaned.length > 10) {
        text = cleaned;
      }
    } catch (err3) {
      console.warn('[PDF Parser] Layer 3 TJ operator extraction failed:', err3.message);
    }
  }

  return text;
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

    const formData = await request.formData();
    const file = formData.get('resume');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No resume file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        text = await extractTextFromPdf(buffer);
      } catch (pdfErr) {
        console.error('[Resume Upload] Failed to extract text from PDF:', pdfErr);
      }

      if (!text || text.trim() === '') {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to extract text from PDF resume. Please make sure the PDF contains selectable text.' 
        }, { status: 422 });
      }
    } else {
      text = buffer.toString('utf-8');
    }

    if (!text || text.trim() === '') {
      return NextResponse.json({ success: false, error: 'Resume text content is empty' }, { status: 400 });
    }

    // Step 1: Segregate resume text
    const segregated = segregateResumeText(text);

    let segregatedPrompt = '';
    if (segregated.contact) segregatedPrompt += `--- CONTACT INFORMATION ---\n${segregated.contact}\n\n`;
    if (segregated.skills) segregatedPrompt += `--- TECHNICAL SKILLS ---\n${segregated.skills}\n\n`;
    if (segregated.experience) segregatedPrompt += `--- WORK EXPERIENCE ---\n${segregated.experience}\n\n`;
    if (segregated.projects) segregatedPrompt += `--- PROJECTS ---\n${segregated.projects}\n\n`;
    if (segregated.education) segregatedPrompt += `--- EDUCATION ---\n${segregated.education}\n\n`;
    if (segregated.achievements) segregatedPrompt += `--- ACHIEVEMENTS & AWARDS ---\n${segregated.achievements}\n\n`;
    if (segregated.other) segregatedPrompt += `--- GENERAL DESCRIPTION ---\n${segregated.other}\n\n`;

    const emails = text.match(/[\w.-]+@[\w.-]+\.[\w.-]+/g) || [];
    const phones = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    const rawLinks = text.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com)\/[a-zA-Z0-9_.-]+/gi) || [];

    const contactInfo = {
      email: emails[0] || '',
      phone: phones[0] || '',
      links: Array.from(new Set(rawLinks))
    };

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedProfile = null;

    if (apiKey) {
      const prompt = `You are an expert recruitment assistant. Parse the following pre-segregated resume details and extract:
1. Target job title.
2. Candidate Seniority Level (Choose exactly ONE: "Intern", "Entry-Level", "Mid-Level", "Senior", "Lead/Architect").
3. Candidate Domain of Interest (Choose exactly ONE: "Frontend", "Backend", "Full Stack", "AI/ML", "DevOps/Cloud", "Mobile").
4. Technical tools, core skills, and languages.
5. Concise summary of work history with YOE.
6. Candidate's key accomplishments, achievements, or awards.
7. Projects built by the candidate.

Return the parsed result strictly in JSON format matching this schema:
{
  "candidateLevel": "Entry-Level",
  "domainOfInterest": "Full Stack",
  "skills": ["List of key technical tools"],
  "experience": "Brief work history summary with total YOE.",
  "jobTitle": "Target job title.",
  "achievements": ["List of key achievements/awards"],
  "projects": [
    {
      "title": "Project Name",
      "description": "Short summary of what was built and technologies used"
    }
  ]
}
Do not add any markup or text outside of the JSON string.

Pre-segregated Resume Content:
${segregatedPrompt}`;

      try {
        parsedProfile = await callGeminiWithRetry(prompt, apiKey, 3);
      } catch (geminiErr) {
        console.warn('[Resume Upload] Gemini call failed or rate-limited. Activating local fallback parser:', geminiErr.message);
        parsedProfile = parseResumeLocally(text, segregated);
      }
    } else {
      parsedProfile = parseResumeLocally(text, segregated);
    }

    const candidateLevel = parsedProfile.candidateLevel || 'Mid-Level';
    const domainOfInterest = parsedProfile.domainOfInterest || 'Full Stack';
    const uploadTimestamp = new Date();

    const usersColl = await getCollection('users');
    await usersColl.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          resumeText: text,
          resumeFileName: file.name,
          resumeUploadDate: uploadTimestamp,
          candidateLevel,
          domainOfInterest,
          skills: parsedProfile.skills || [],
          experience: parsedProfile.experience || '',
          jobTitle: parsedProfile.jobTitle || '',
          achievements: parsedProfile.achievements || [],
          projects: parsedProfile.projects || [],
          contact: contactInfo,
          updatedAt: uploadTimestamp
        }
      }
    );

    return NextResponse.json({
      success: true,
      profile: {
        fileName: file.name,
        uploadDate: uploadTimestamp,
        candidateLevel,
        domainOfInterest,
        skills: parsedProfile.skills || [],
        experience: parsedProfile.experience || '',
        jobTitle: parsedProfile.jobTitle || '',
        achievements: parsedProfile.achievements || [],
        projects: parsedProfile.projects || [],
        contact: contactInfo
      }
    });

  } catch (error) {
    console.error('[Resume Upload API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
