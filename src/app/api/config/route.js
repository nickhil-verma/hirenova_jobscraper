import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

// Initialize global scraper state if not already set
function initGlobalState() {
  if (!global.scraperState) {
    global.scraperState = {
      autoEnabled: true,
      secondsRemaining: 60,
      isScraping: false,
      lastRun: null
    };
  }
  return global.scraperState;
}

export async function GET() {
  try {
    const state = initGlobalState();
    
    // Fetch last sync log to verify last run details
    const logsCollection = await getCollection('scraping_logs');
    const lastLog = await logsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (lastLog[0]) {
      state.lastRun = lastLog[0].timestamp;
    }

    // Retrieve active API key and rotation history from MongoDB Atlas
    const configColl = await getCollection('scraper_config');
    const savedConfig = await configColl.findOne({ id: 'config' });
    const activeApiKey = savedConfig?.activeApiKey || process.env.GEMINI_API_KEY || '';
    const prevApiKeys = savedConfig?.prevApiKeys || [];
    const scrapingUrl = savedConfig?.scrapingUrl || 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=1';

    // Apply security masking helper
    const maskKey = (k) => k ? `${k.substring(0, 8)}...${k.substring(Math.max(0, k.length - 4))}` : 'None';
    const maskedActive = maskKey(activeApiKey);
    const maskedHistory = prevApiKeys.map(item => ({
      ...item,
      key: maskKey(item.key)
    }));

    return NextResponse.json({
      success: true,
      autoEnabled: state.autoEnabled,
      secondsRemaining: state.secondsRemaining,
      isScraping: state.isScraping,
      lastRun: state.lastRun,
      activeApiKey: maskedActive,
      prevApiKeys: maskedHistory,
      scrapingUrl
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { autoEnabled, scrapingUrl } = body;

    const state = initGlobalState();
    const updateData = {};

    if (typeof autoEnabled === 'boolean') {
      state.autoEnabled = autoEnabled;
      state.secondsRemaining = 60; // Reset countdown on toggle
      updateData.autoEnabled = autoEnabled;
    }

    if (typeof scrapingUrl === 'string' && scrapingUrl.trim() !== '') {
      updateData.scrapingUrl = scrapingUrl.trim();
    }

    if (Object.keys(updateData).length > 0) {
      // Persist this config to MongoDB
      const configColl = await getCollection('scraper_config');
      await configColl.updateOne(
        { id: 'config' },
        { $set: { ...updateData, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    console.log(`[Config] Configuration modified by client:`, updateData);

    const activeConfig = await (await getCollection('scraper_config')).findOne({ id: 'config' });
    const resolvedUrl = activeConfig?.scrapingUrl || 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=1';

    return NextResponse.json({
      success: true,
      autoEnabled: state.autoEnabled,
      secondsRemaining: state.secondsRemaining,
      isScraping: state.isScraping,
      scrapingUrl: resolvedUrl
    });
  } catch (error) {
    console.error('[API Config] Error updating scraper state:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
