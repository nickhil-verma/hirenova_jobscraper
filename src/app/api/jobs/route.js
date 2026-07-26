import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const jobsCollection = await getCollection('jobs');
    const logsCollection = await getCollection('scraping_logs');

    // Natural Language Search Parser
    const query = {};
    if (rawSearch.trim()) {
      const stopWords = new Set(['high', 'paying', 'jobs', 'job', 'hiring', 'freshers', 'roles', 'role', 'with', 'for', 'and', 'similar', 'to', 'in']);
      const tokens = rawSearch
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !stopWords.has(w));

      const isRemoteIntent = rawSearch.toLowerCase().includes('remote');
      const isInternshipIntent = rawSearch.toLowerCase().includes('intern') || rawSearch.toLowerCase().includes('ppo');

      const conditions = [];

      // Check tokens against title, company, skills, or workplace
      tokens.forEach(token => {
        conditions.push(
          { 'job_information.title': { $regex: token, $options: 'i' } },
          { 'v5_processed_job_data.company_name': { $regex: token, $options: 'i' } },
          { 'v5_processed_job_data.core_job_title': { $regex: token, $options: 'i' } },
          { 'v5_processed_job_data.technical_tools': { $regex: token, $options: 'i' } },
          { 'v5_processed_job_data.formatted_workplace_location': { $regex: token, $options: 'i' } }
        );
      });

      if (isRemoteIntent) {
        conditions.push({ 'v5_processed_job_data.formatted_workplace_location': { $regex: 'remote', $options: 'i' } });
      }

      if (isInternshipIntent) {
        conditions.push({ 'job_information.title': { $regex: 'intern', $options: 'i' } });
      }

      if (conditions.length > 0) {
        query.$or = conditions;
      }
    }

    const jobs = await jobsCollection
      .find(query)
      .sort({ 'updatedAt': -1, '_id': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalJobs = await jobsCollection.countDocuments(query);
    const dbTotalJobsCount = await jobsCollection.countDocuments({});

    const lastLog = await logsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json({
      success: true,
      jobs,
      totalJobs,
      dbTotalJobsCount,
      lastScrapeLog: lastLog[0] || null,
      page,
      limit,
      totalPages: Math.ceil(totalJobs / limit)
    });
  } catch (error) {
    console.error('[API Jobs] Failed to fetch jobs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
