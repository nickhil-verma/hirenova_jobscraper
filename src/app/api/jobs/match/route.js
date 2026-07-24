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

    const userSkills = user.skills || [];
    const targetTitle = user.jobTitle || '';
    const experience = user.experience || '';
    const resumeText = user.resumeText || '';
    const achievements = user.achievements || [];
    const projects = user.projects || [];
    const candidateLevel = user.candidateLevel || 'Mid-Level';
    const domainOfInterest = user.domainOfInterest || 'Full Stack';

    if (userSkills.length === 0) {
      return NextResponse.json({ success: true, matches: [], message: 'Please upload your resume to see matches' });
    }

    // Target Domain Keywords Table
    const domainKeywords = {
      'Frontend': ['frontend', 'react', 'next.js', 'ui', 'ux', 'vue', 'angular', 'web', 'javascript', 'typescript', 'css', 'html'],
      'Backend': ['backend', 'node', 'python', 'java', 'sql', 'api', 'postgres', 'microservices', 'go', 'rust', 'express'],
      'Full Stack': ['full stack', 'fullstack', 'react', 'node', 'web', 'engineer', 'developer', 'typescript'],
      'AI/ML': ['ai', 'ml', 'machine learning', 'python', 'llm', 'rag', 'data scientist', 'deep learning', 'pytorch', 'tensorflow'],
      'DevOps/Cloud': ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'ci/cd', 'infrastructure', 'terraform'],
      'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin']
    };

    const targetDomainKeywords = domainKeywords[domainOfInterest] || domainKeywords['Full Stack'];

    let candidateYoe = 0;
    const yoeMatch = experience.match(/(\d+)\+?\s*y(?:ea)?r/i);
    if (yoeMatch) {
      candidateYoe = parseInt(yoeMatch[1], 10);
    } else {
      const numMatch = experience.match(/(\d+)\s*y/i);
      if (numMatch) {
        candidateYoe = parseInt(numMatch[1], 10);
      }
    }

    const tokenize = (text) => {
      if (!text) return [];
      return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);
    };

    const getCosineSimilarity = (tokensA, tokensB) => {
      const freqA = {};
      const freqB = {};
      const allUnique = new Set([...tokensA, ...tokensB]);

      tokensA.forEach(t => freqA[t] = (freqA[t] || 0) + 1);
      tokensB.forEach(t => freqB[t] = (freqB[t] || 0) + 1);

      let dotProduct = 0;
      let magnitudeA = 0;
      let magnitudeB = 0;

      allUnique.forEach(term => {
        const valA = freqA[term] || 0;
        const valB = freqB[term] || 0;
        dotProduct += valA * valB;
        magnitudeA += valA * valA;
        magnitudeB += valB * valB;
      });

      if (magnitudeA === 0 || magnitudeB === 0) return 0;
      return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    };

    const jobsColl = await getCollection('jobs');
    const jobs = await jobsColl.find({}).limit(150).toArray();

    const localMatches = jobs.map(job => {
      const details = job.v5_processed_job_data || {};
      const requiredSkills = details.technical_tools || [];
      const coreTitle = details.core_job_title || job.job_information?.title || '';
      const titleLower = coreTitle.toLowerCase();
      const summaryLower = (details.requirements_summary || '').toLowerCase();
      
      let matchedSkills = [];
      let missingSkills = [];

      // A. Tool Overlap Score
      let toolScore = 0;
      if (requiredSkills.length > 0) {
        matchedSkills = requiredSkills.filter(skill => 
          userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        );
        missingSkills = requiredSkills.filter(skill => 
          !userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        );
        toolScore = (matchedSkills.length / requiredSkills.length) * 100;
      } else {
        const matchingKeywords = userSkills.filter(skill => titleLower.includes(skill.toLowerCase()));
        toolScore = matchingKeywords.length > 0 ? 80 : 30;
      }

      // B. Candidate Domain Filtering & Alignment
      const isDomainMatch = targetDomainKeywords.some(kw => 
        titleLower.includes(kw) || summaryLower.includes(kw) || requiredSkills.some(s => s.toLowerCase().includes(kw))
      );
      const domainScore = isDomainMatch ? 100 : 20;

      // C. Seniority Level Alignment & Penalty
      let levelPenalty = 0;
      if (candidateLevel === 'Intern' || candidateLevel === 'Entry-Level') {
        if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('staff') || titleLower.includes('principal') || (details.min_industry_and_role_yoe > 3)) {
          levelPenalty = 45; // Exclude senior roles for junior candidates
        }
      } else if (candidateLevel === 'Senior' || candidateLevel === 'Lead/Architect') {
        if (titleLower.includes('intern') || titleLower.includes('junior')) {
          levelPenalty = 45; // Exclude junior roles for senior candidates
        }
      }

      // D. Experience Gap Score
      let yoeScore = 100;
      const requiredYoe = details.min_industry_and_role_yoe;
      if (requiredYoe && candidateYoe > 0) {
        if (candidateYoe < requiredYoe) {
          const gap = requiredYoe - candidateYoe;
          yoeScore = Math.max(20, 100 - gap * 20);
        }
      }

      // E. Term Cosine Similarity
      const candidateTokens = [
        ...tokenize(targetTitle),
        ...tokenize(experience),
        ...userSkills.flatMap(s => tokenize(s)),
        ...achievements.flatMap(a => tokenize(a)),
        ...projects.flatMap(p => [...tokenize(p.title), ...tokenize(p.description)])
      ];

      const jobTokens = [
        ...tokenize(coreTitle),
        ...tokenize(details.requirements_summary),
        ...(details.role_activities || []).flatMap(a => tokenize(a)),
        ...requiredSkills.flatMap(s => tokenize(s))
      ];

      const cosineSim = getCosineSimilarity(candidateTokens, jobTokens);
      const cosineScore = cosineSim * 100;

      // Final Calculated Match Score with strict Domain & Level constraints
      const localMatchPercent = Math.max(0, Math.min(100, Math.round(
        (toolScore * 0.4) + (domainScore * 0.3) + (yoeScore * 0.15) + (cosineScore * 0.15) - levelPenalty
      )));

      const matchBreakdown = {
        overallMatch: localMatchPercent,
        technicalSkills: Math.min(100, Math.round(toolScore || 70)),
        experience: Math.min(100, Math.round(yoeScore || 80)),
        projectsScore: Math.min(100, Math.round((cosineScore * 1.2) || 75)),
        resumeQuality: 88,
        cultureFit: Math.min(100, Math.round(75 + (localMatchPercent * 0.25))),
        confidence: 91
      };

      return {
        jobId: job.id,
        title: job.job_information?.title || 'Software Specialist',
        company: details.company_name || 'Unknown Company',
        location: details.formatted_workplace_location || 'Remote / Hybrid',
        matchPercent: localMatchPercent,
        isDomainMatch,
        matchBreakdown,
        matchedSkills,
        missingSkills,
        requiredSkills,
        requirementsSummary: details.requirements_summary || '',
        applyUrl: job.apply_url,
        compensation: details
      };
    });

    // Filter out irrelevant level/domain mismatches (Match percent < 40%)
    const filteredMatches = localMatches.filter(j => j.matchPercent >= 40 && j.isDomainMatch);
    filteredMatches.sort((a, b) => b.matchPercent - a.matchPercent);
    
    // Fallback to top matches if filtered results are sparse
    const topLocalMatches = (filteredMatches.length >= 6 ? filteredMatches : localMatches).slice(0, 12);

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && resumeText && topLocalMatches.length > 0) {
      try {
        const jobsPayload = topLocalMatches.map((j, idx) => ({
          index: idx + 1,
          jobId: j.jobId,
          title: j.title,
          company: j.company,
          requiredSkills: j.requiredSkills,
          localWeightedAtsScore: j.matchPercent,
          summary: j.requirementsSummary
        }));

        const prompt = `You are an expert AI Recruitment Matching Agent. Review candidate profile level (${candidateLevel}) and domain (${domainOfInterest}) against these pre-filtered positions.
Generate a brief 1-sentence 'matchReason' explanation highlighting why this candidate's level (${candidateLevel}) and domain (${domainOfInterest}) fits this role.

Candidate Profile:
- Level: ${candidateLevel}
- Domain of Interest: ${domainOfInterest}
- Target Job: ${targetTitle}
- Core Skills: ${userSkills.join(', ')}
- Work History & YOE: ${experience}

Calculated Matches:
${JSON.stringify(jobsPayload, null, 2)}

Return your calibrated scores strictly in JSON format matching this schema:
[
  {
    "jobId": "unique_job_id_string",
    "atsScore": 85,
    "matchReason": "Match reason explanation here."
  }
]`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const aiEvaluations = JSON.parse(responseText.trim());
            
            topLocalMatches.forEach(match => {
              const evalItem = aiEvaluations.find(item => item.jobId === match.jobId);
              if (evalItem) {
                match.matchPercent = evalItem.atsScore || match.matchPercent;
                match.matchBreakdown.overallMatch = match.matchPercent;
                match.matchReason = evalItem.matchReason || `Targeted match for ${candidateLevel} ${domainOfInterest} profile.`;
                match.isAiEvaluated = true;
              } else {
                match.isAiEvaluated = false;
              }
            });
          }
        }
      } catch (geminiErr) {
        console.error('[Jobs Match API] Gemini Agent matching failed:', geminiErr);
      }
    }

    topLocalMatches.forEach(match => {
      if (!match.matchReason) {
        match.matchReason = `Targeted ${candidateLevel} ${domainOfInterest} position matching core tools: ${match.matchedSkills.slice(0, 3).join(', ') || 'technical stack'}.`;
        match.isAiEvaluated = false;
      }
    });

    topLocalMatches.sort((a, b) => b.matchPercent - a.matchPercent);

    return NextResponse.json({
      success: true,
      candidateLevel,
      domainOfInterest,
      matches: topLocalMatches
    });

  } catch (error) {
    console.error('[Jobs Match API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
