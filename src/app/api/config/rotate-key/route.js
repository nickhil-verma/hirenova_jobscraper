import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { newApiKey } = body;

    if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid key: newApiKey cannot be empty' },
        { status: 400 }
      );
    }

    const configColl = await getCollection('scraper_config');
    const savedConfig = await configColl.findOne({ id: 'config' });

    // Current active API key
    let currentActive = savedConfig?.activeApiKey || process.env.GEMINI_API_KEY || '';
    
    // Prepare history array
    const prevApiKeys = savedConfig?.prevApiKeys || [];

    // Only archive if there is an existing active key and it's different
    if (currentActive && currentActive !== newApiKey) {
      prevApiKeys.push({
        key: currentActive,
        rotatedAt: new Date(),
        reason: 'Rotated by user request'
      });
    }

    // Update DB
    await configColl.updateOne(
      { id: 'config' },
      { 
        $set: { 
          activeApiKey: newApiKey, 
          prevApiKeys,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    // Dynamic rotation in runtime environment memory
    process.env.GEMINI_API_KEY = newApiKey;
    if (global.scraperState) {
      global.scraperState.activeApiKey = newApiKey;
    }

    console.log(`[Config] API Key successfully rotated. Prev stored in DB.`);

    // Return updated config with masked values for security
    const maskKey = (k) => k ? `${k.substring(0, 8)}...${k.substring(Math.max(0, k.length - 4))}` : 'None';
    
    const maskedHistory = prevApiKeys.map(item => ({
      ...item,
      key: maskKey(item.key)
    }));

    return NextResponse.json({
      success: true,
      activeApiKey: maskKey(newApiKey),
      prevApiKeys: maskedHistory
    });
  } catch (error) {
    console.error('[API Rotate Key] Error executing rotation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
