export async function register() {
  // Only execute on the Node.js server side runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getCollection } = await import('./lib/db');
    const { scrapeJobs } = await import('./lib/scraper');

    console.log('[Scheduler] Server initialized. Setting up background ticker...');

    // Initialize global state if not already existing
    global.scraperState = global.scraperState || {
      autoEnabled: true,
      secondsRemaining: 60,
      isScraping: false,
      lastRun: null
    };

    // Load persisted configuration from MongoDB
    try {
      const configColl = await getCollection('scraper_config');
      const savedConfig = await configColl.findOne({ id: 'config' });
      if (savedConfig) {
        global.scraperState.autoEnabled = savedConfig.autoEnabled ?? true;
        console.log(`[Scheduler] Restored config from MongoDB Atlas: autoEnabled = ${global.scraperState.autoEnabled}`);
      } else {
        console.log('[Scheduler] No saved config found. Using default autoEnabled = true');
      }
    } catch (err) {
      console.error('[Scheduler] Failed to restore config from MongoDB Atlas:', err);
    }

    // Set up a 1-second precise interval timer
    if (!global.jobScraperInterval) {
      console.log('[Scheduler] Initializing 1-second automation timer loop...');

      // Let's run a dry run 5 seconds after startup if enabled
      setTimeout(async () => {
        if (global.scraperState.autoEnabled && !global.scraperState.isScraping) {
          console.log('[Scheduler] Running initial boot scrape...');
          global.scraperState.isScraping = true;
          try {
            await scrapeJobs();
          } catch (e) {
            console.error('[Scheduler] Boot scrape failed:', e);
          } finally {
            global.scraperState.isScraping = false;
            global.scraperState.secondsRemaining = 60;
          }
        }
      }, 5000);

      global.jobScraperInterval = setInterval(async () => {
        const state = global.scraperState;

        // If auto-scraping is disabled, keep resetting the timer to 60 seconds
        if (!state.autoEnabled) {
          state.secondsRemaining = 60;
          return;
        }

        if (state.isScraping) {
          return;
        }

        state.secondsRemaining--;

        if (state.secondsRemaining <= 0) {
          state.isScraping = true;
          state.secondsRemaining = 60; // reset immediately

          console.log('[Scheduler] Countdown hit 0. Triggering automated scrape...');
          try {
            await scrapeJobs();
          } catch (err) {
            console.error('[Scheduler] Automated scrape error:', err);
          } finally {
            state.isScraping = false;
            state.lastRun = new Date();
          }
        }
      }, 1000);
    } else {
      console.log('[Scheduler] Scraper interval already running.');
    }
  }
}
