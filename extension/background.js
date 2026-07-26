chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FETCH_SESSION') {
    (async () => {
      try {
        // Read Hirenova cookie if available
        let cookieToken = null;
        try {
          const cookie = await chrome.cookies.get({ url: 'https://hirenova-jobscraper.vercel.app', name: 'session_token' });
          if (cookie && cookie.value) {
            cookieToken = cookie.value;
          }
        } catch (e) {}

        const headers = {
          'x-hirenova-api-key': 'hn_sec_99182374892173_extension_client_key_v1'
        };
        if (cookieToken) {
          headers['Authorization'] = `Bearer ${cookieToken}`;
          headers['X-Session-Token'] = cookieToken;
        }

        const res = await fetch('https://hirenova-jobscraper.vercel.app/api/auth/session', {
          headers,
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            await chrome.storage.local.set({ hirenova_user_profile: data.user });
            sendResponse({ success: true, user: data.user });
            return;
          }
        }

        // Fallback to stored profile if server returns 401 or offline
        const stored = await chrome.storage.local.get('hirenova_user_profile');
        if (stored && stored.hirenova_user_profile) {
          sendResponse({ success: true, user: stored.hirenova_user_profile });
          return;
        }

        sendResponse({ success: false, error: 'Unauthorized' });
      } catch (err) {
        console.error('[Hirenova Background] Session fetch error:', err);
        try {
          const stored = await chrome.storage.local.get('hirenova_user_profile');
          if (stored && stored.hirenova_user_profile) {
            sendResponse({ success: true, user: stored.hirenova_user_profile });
          } else {
            sendResponse({ success: false, error: err.message });
          }
        } catch (e) {
          sendResponse({ success: false, error: err.message });
        }
      }
    })();
    return true; // Keep message channel open for async response
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'autofill_one_go') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL_ONE_GO' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('[Hirenova Extension] Injecting content script on demand...');
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }).then(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL_ONE_GO' });
            }).catch(err => console.error(err));
          }
        });
      }
    } catch (err) {
      console.error('[Hirenova Background] Command execution error:', err);
    }
  } else if (command === 'toggle_overlay') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_OVERLAY' });
      }
    } catch (err) {
      console.error('[Hirenova Background] Command execution error:', err);
    }
  }
});

