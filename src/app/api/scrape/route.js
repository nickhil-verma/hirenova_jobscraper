import { NextResponse } from 'next/server';
import { scrapeJobs } from '../../../lib/scraper';

export async function POST() {
  try {
    const result = await scrapeJobs();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Scrape] Failed to run scrape:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
