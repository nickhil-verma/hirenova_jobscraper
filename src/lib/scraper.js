import { getCollection } from './db';

const DEFAULT_ENDPOINT = 'https://hiring.cafe/_next/data/KCgrrnmmOlXzN7Ul4_QFC/index.json?page=1';

export async function scrapeJobs() {
  const startTime = new Date();
  
  // Resolve target endpoint URL dynamically from database config
  let endpointUrl = DEFAULT_ENDPOINT;
  try {
    const configColl = await getCollection('scraper_config');
    const savedConfig = await configColl.findOne({ id: 'config' });
    if (savedConfig?.scrapingUrl) {
      endpointUrl = savedConfig.scrapingUrl;
    }
  } catch (err) {
    console.error('[Scraper] Error fetching dynamic URL config, falling back to default:', err);
  }

  console.log(`[Scraper] Starting scrape at ${startTime.toISOString()} using URL: ${endpointUrl}`);

  try {
    let res = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 0 } // Bypass Next.js fetch cache
    });

    let hits = null;
    let data = null;

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const text = await res.text();
          data = JSON.parse(text);
          hits = data?.pageProps?.ssrHits || data?.props?.pageProps?.ssrHits;
        } catch (jsonErr) {
          console.warn('[Scraper] Failed to parse JSON response, falling back to HTML parsing:', jsonErr);
        }
      }
    }

    // Fallback: if fetch failed, or returned HTML (e.g. 404 page), or JSON parsing failed
    if (!hits && endpointUrl.includes('hiring.cafe')) {
      console.log('[Scraper] Target JSON endpoint unavailable or returned non-JSON. Attempting HTML extraction fallback...');
      
      // Extract page number from target URL
      let pageNum = 1;
      try {
        const urlObj = new URL(endpointUrl);
        const pageParam = urlObj.searchParams.get('page');
        if (pageParam) {
          pageNum = parseInt(pageParam, 10) || 1;
        }
      } catch (urlErr) {
        console.warn('[Scraper] Failed to parse page number from URL, defaulting to page 1:', urlErr);
      }

      const htmlUrl = `https://hiring.cafe/${pageNum > 1 ? `?page=${pageNum}` : ''}`;
      console.log(`[Scraper] Fetching HTML fallback page: ${htmlUrl}`);

      const htmlRes = await fetch(htmlUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      });

      if (!htmlRes.ok) {
        throw new Error(`Failed to fetch HTML fallback page: HTTP ${htmlRes.status} ${htmlRes.statusText}`);
      }

      const htmlText = await htmlRes.text();
      const match = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (match) {
        const nextData = JSON.parse(match[1]);
        hits = nextData?.props?.pageProps?.ssrHits;
      } else {
        throw new Error('Failed to find __NEXT_DATA__ script tag in fallback HTML response');
      }
    }

    if (!hits || !Array.isArray(hits)) {
      throw new Error('Invalid response structure: pageProps.ssrHits is missing or not an array');
    }

    // Filter out expired jobs so only active listings are stored
    const activeHits = hits.filter(job => !job.is_expired);

    console.log(`[Scraper] Successfully fetched ${hits.length} jobs. Active: ${activeHits.length}, Expired filtered: ${hits.length - activeHits.length}`);

    if (activeHits.length === 0) {
      // Log success but empty
      await logScrape({
        timestamp: startTime,
        status: 'success',
        jobsCount: 0,
        message: 'No active (non-expired) jobs found in endpoint response.'
      });
      return { success: true, count: 0, message: 'No active jobs found.' };
    }

    // Connect to MongoDB collections
    const jobsCollection = await getCollection('jobs');
    
    // Prepare bulk operations for upsert
    const operations = activeHits.map(job => {
      const uniqueId = job.id || job.objectID;
      if (!uniqueId) {
        console.warn('[Scraper] Job missing unique id, skipping:', job);
        return null;
      }
      return {
        updateOne: {
          filter: { id: uniqueId },
          update: { 
            $set: {
              ...job,
              id: uniqueId, // Make sure it exists under 'id'
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          upsert: true
        }
      };
    }).filter(Boolean);

    let upsertedCount = 0;
    let modifiedCount = 0;
    let matchedCount = 0;

    if (operations.length > 0) {
      const bulkResult = await jobsCollection.bulkWrite(operations);
      upsertedCount = bulkResult.upsertedCount;
      modifiedCount = bulkResult.modifiedCount;
      matchedCount = bulkResult.matchedCount;
      console.log(`[Scraper] DB Sync complete. Upserted: ${upsertedCount}, Modified: ${modifiedCount}, Matched: ${matchedCount}`);
    }

    const durationMs = new Date() - startTime;

    // Log success in scraping_logs
    await logScrape({
      timestamp: startTime,
      status: 'success',
      jobsCount: hits.length,
      upsertedCount,
      modifiedCount,
      matchedCount,
      durationMs,
      message: `Successfully sync'd ${hits.length} jobs. New: ${upsertedCount}, Updated: ${modifiedCount}.`
    });

    return { 
      success: true, 
      count: hits.length,
      upsertedCount,
      modifiedCount,
      matchedCount,
      durationMs 
    };

  } catch (error) {
    const durationMs = new Date() - startTime;
    console.error('[Scraper] Error during scraping:', error);

    // Log failure in scraping_logs
    try {
      await logScrape({
        timestamp: startTime,
        status: 'error',
        message: error.message || 'Unknown scraping error',
        durationMs
      });
    } catch (dbErr) {
      console.error('[Scraper] Could not write error log to MongoDB:', dbErr);
    }

    return { 
      success: false, 
      error: error.message || 'Scraping failed',
      durationMs 
    };
  }
}

async function logScrape(logEntry) {
  try {
    const logsCollection = await getCollection('scraping_logs');
    await logsCollection.insertOne({
      ...logEntry,
      createdAt: new Date()
    });
  } catch (err) {
    console.error('[Scraper] Error writing log entry:', err);
  }
}
