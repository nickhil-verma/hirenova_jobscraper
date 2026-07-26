let userProfile = null;
let storedResume = null;

document.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('status-badge');
  const nameEl = document.getElementById('profile-name');
  const detailsEl = document.getElementById('profile-details');
  const masterBtn = document.getElementById('autofill-one-go-btn');
  const selectResumeBtn = document.getElementById('select-resume-btn');
  const attachResumeBtn = document.getElementById('attach-resume-only-btn');
  const fileInput = document.getElementById('resume-file-input');
  const refreshBtn = document.getElementById('refresh-sync-btn');
  const pageContextText = document.getElementById('page-context-text');

  // Load Stored Resume from chrome.storage.local
  await loadStoredResume();

  // Check Session with Hirenova Server
  await syncUserSession();

  // Inspect current tab context
  await inspectActiveTab();

  // Pill Overlay Mode Selection Elements
  const modeExpandedBtn = document.getElementById('pill-mode-expanded');
  const modeMinimizedBtn = document.getElementById('pill-mode-minimized');
  const modeHiddenBtn = document.getElementById('pill-mode-hidden');

  await loadOverlaySetting();

  // Listen for storage changes in real-time
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.hirenova_overlay_mode) {
      updatePillModeButtonsUI(changes.hirenova_overlay_mode.newValue);
    }
  });

  async function loadOverlaySetting() {
    try {
      const data = await chrome.storage.local.get('hirenova_overlay_mode');
      const mode = data.hirenova_overlay_mode || 'expanded';
      updatePillModeButtonsUI(mode);
    } catch (e) {}
  }

  function updatePillModeButtonsUI(mode) {
    if (!modeExpandedBtn) return;
    [modeExpandedBtn, modeMinimizedBtn, modeHiddenBtn].forEach(b => b.classList.remove('active'));
    if (mode === 'minimized') modeMinimizedBtn.classList.add('active');
    else if (mode === 'hidden') modeHiddenBtn.classList.add('active');
    else modeExpandedBtn.classList.add('active');
  }

  async function setPillMode(mode) {
    await chrome.storage.local.set({ hirenova_overlay_mode: mode });
    updatePillModeButtonsUI(mode);

    // Notify active tab content script to update mode immediately
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'UPDATE_OVERLAY_MODE', mode: mode }).catch(() => {});
    }
  }

  if (modeExpandedBtn) modeExpandedBtn.addEventListener('click', () => setPillMode('expanded'));
  if (modeMinimizedBtn) modeMinimizedBtn.addEventListener('click', () => setPillMode('minimized'));
  if (modeHiddenBtn) modeHiddenBtn.addEventListener('click', () => setPillMode('hidden'));

  // Live Job Feed & Notifications Elements with 2.5-Hour Local Cache TTL
  const fetchJobsBtn = document.getElementById('fetch-jobs-btn');
  const jobListEl = document.getElementById('job-notifications-list');
  const JOB_CACHE_TTL_MS = 2.5 * 60 * 60 * 1000; // 2.5 Hours TTL

  async function fetchJobNotifications(forceRefresh = false) {
    if (!jobListEl) return;

    if (!forceRefresh) {
      // Check local chrome.storage.local cache first
      try {
        const cached = await chrome.storage.local.get(['hirenova_cached_jobs', 'hirenova_jobs_cache_timestamp']);
        const now = Date.now();
        const timestamp = cached.hirenova_jobs_cache_timestamp || 0;
        const timeDiff = now - timestamp;

        if (cached.hirenova_cached_jobs && cached.hirenova_cached_jobs.length > 0 && timeDiff < JOB_CACHE_TTL_MS) {
          const minutesAgo = Math.floor(timeDiff / (60 * 1000));
          const cacheLabel = minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`;
          renderJobNotifications(cached.hirenova_cached_jobs, `Cached (${cacheLabel})`);
          return;
        }
      } catch (e) {}
    }

    jobListEl.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:0.5rem;">⚡ Fetching live job notifications...</div>';

    try {
      const res = await fetch('https://hirenova-jobscraper.vercel.app/api/jobs?limit=5', {
        headers: { 'x-hirenova-api-key': 'hn_sec_99182374892173_extension_client_key_v1' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          await chrome.storage.local.set({
            hirenova_cached_jobs: data.jobs,
            hirenova_jobs_cache_timestamp: Date.now()
          });
          renderJobNotifications(data.jobs, 'Live Feed');
          return;
        }
      }
      jobListEl.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:0.5rem;">No active job alerts found right now.</div>';
    } catch (err) {
      console.error('[Hirenova Extension] Failed to fetch job notifications:', err);
      // Fallback to cached jobs if network fails
      const cached = await chrome.storage.local.get('hirenova_cached_jobs');
      if (cached && cached.hirenova_cached_jobs && cached.hirenova_cached_jobs.length > 0) {
        renderJobNotifications(cached.hirenova_cached_jobs, 'Offline Cache');
      } else {
        jobListEl.innerHTML = '<div style="font-size:0.75rem; color:#ef4444; text-align:center; padding:0.5rem;">⚠️ Offline or Server Disconnected</div>';
      }
    }
  }

  function renderJobNotifications(jobsList, statusTag = 'Live Feed') {
    if (!jobListEl) return;
    jobListEl.innerHTML = '';
    jobsList.forEach(job => {
      const title = job.job_information?.title || job.title || 'Software Engineer';
      const company = job.v5_processed_job_data?.company_name || job.company || 'Tech Company';
      const location = job.v5_processed_job_data?.formatted_workplace_location || job.location || 'Remote';
      const applyUrl = job.apply_url || job.job_information?.apply_url || 'https://hirenova-jobscraper.vercel.app/dashboard';

      const item = document.createElement('div');
      item.className = 'job-notice-item';
      item.innerHTML = `
        <div class="job-notice-title">
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:210px;">${company} • ${title}</span>
          <a href="${applyUrl}" target="_blank" style="font-size:0.68rem; font-weight:700; color:#09090b; text-decoration:none; background:#e4e4e7; padding:0.15rem 0.4rem; border-radius:4px;">Apply ↗</a>
        </div>
        <div class="job-notice-meta">
          <span class="job-notice-badge">${location}</span>
          <span style="color:#71717a; font-size:0.68rem;">${statusTag}</span>
        </div>
      `;
      jobListEl.appendChild(item);
    });
  }

  if (fetchJobsBtn) {
    fetchJobsBtn.addEventListener('click', () => fetchJobNotifications(true)); // Force refresh on click
  }

  // Load from local cache (or fetch if > 2.5 hours old)
  fetchJobNotifications(false);

  // File Picker Click
  selectResumeBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle Resume File Selection
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const resumeData = {
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileType: file.type || 'application/pdf',
        fileDataUrl: reader.result,
        lastUpdated: new Date().toLocaleDateString()
      };

      await chrome.storage.local.set({ hirenova_local_resume: resumeData });
      storedResume = resumeData;
      updateResumeUI();
    };
    reader.readAsDataURL(file);
  });

  // Refresh Sync Button
  refreshBtn.addEventListener('click', async () => {
    badge.textContent = 'Syncing...';
    await syncUserSession();
  });

  // 1-GO Master Autofill & Attach Button
  masterBtn.addEventListener('click', async () => {
    if (!userProfile) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runFullAutofillAndAttach,
      args: [userProfile, storedResume]
    });
  });

  // Attach Resume Only Button
  attachResumeBtn.addEventListener('click', async () => {
    if (!storedResume) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runAttachResumeOnly,
      args: [storedResume]
    });
  });

  // Load Stored Resume Helper
  async function loadStoredResume() {
    try {
      const data = await chrome.storage.local.get('hirenova_local_resume');
      if (data.hirenova_local_resume) {
        storedResume = data.hirenova_local_resume;
        updateResumeUI();
      }
    } catch (err) {
      console.error('[Hirenova Extension] Failed to load stored resume:', err);
    }
  }

  // Update Resume UI Box
  function updateResumeUI() {
    const nameEl = document.getElementById('resume-file-name');
    const metaEl = document.getElementById('resume-file-meta');
    const boxEl = document.getElementById('resume-box');
    const tagEl = document.getElementById('resume-status-tag');
    const attachBtn = document.getElementById('attach-resume-only-btn');

    if (storedResume && storedResume.fileName) {
      nameEl.textContent = `📄 ${storedResume.fileName}`;
      metaEl.textContent = `${storedResume.fileSize} • Saved local file`;
      boxEl.classList.add('has-file');
      tagEl.textContent = '✓ Ready';
      attachBtn.disabled = false;
    } else {
      nameEl.textContent = 'No local resume selected';
      metaEl.textContent = 'Select a PDF/DOCX from your PC to auto-attach on job forms';
      boxEl.classList.remove('has-file');
      tagEl.textContent = '';
      attachBtn.disabled = true;
    }
  }

  // Sync User Session Helper
  async function syncUserSession() {
    try {
      const res = await fetch('https://hirenova-jobscraper.vercel.app/api/auth/session', { 
        credentials: 'include',
        headers: { 'x-hirenova-api-key': 'hn_sec_99182374892173_extension_client_key_v1' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          userProfile = data.user;
          await chrome.storage.local.set({ hirenova_user_profile: userProfile });
          badge.textContent = 'Synced';
          badge.className = 'status-badge status-badge-active';
          nameEl.textContent = userProfile.name;
          nameEl.style.color = '#09090b';
          detailsEl.textContent = `${userProfile.jobTitle || 'Full Stack Engineer'} • ${userProfile.email}`;
          masterBtn.disabled = false;
          return;
        }
      }
      // Check stored profile cache
      const stored = await chrome.storage.local.get('hirenova_user_profile');
      if (stored && stored.hirenova_user_profile) {
        userProfile = stored.hirenova_user_profile;
        badge.textContent = 'Cached';
        badge.className = 'status-badge status-badge-active';
        nameEl.textContent = userProfile.name;
        nameEl.style.color = '#09090b';
        detailsEl.textContent = `${userProfile.jobTitle || 'Candidate Profile'} • ${userProfile.email}`;
        masterBtn.disabled = false;
        return;
      }
      badge.textContent = 'Offline';
      badge.className = 'status-badge';
      nameEl.textContent = 'Not Logged In';
      detailsEl.textContent = 'Log in at https://hirenova-jobscraper.vercel.app to authenticate';
      masterBtn.disabled = true;
    } catch (e) {
      console.error('[Hirenova Extension] Session error:', e);
      const stored = await chrome.storage.local.get('hirenova_user_profile');
      if (stored && stored.hirenova_user_profile) {
        userProfile = stored.hirenova_user_profile;
        badge.textContent = 'Cached';
        badge.className = 'status-badge status-badge-active';
        nameEl.textContent = userProfile.name;
        nameEl.style.color = '#09090b';
        detailsEl.textContent = `${userProfile.jobTitle || 'Candidate Profile'} • ${userProfile.email}`;
        masterBtn.disabled = false;
        return;
      }
      badge.textContent = 'Offline';
      badge.className = 'status-badge';
      nameEl.textContent = 'Server Disconnected';
      detailsEl.textContent = 'Log in at https://hirenova-jobscraper.vercel.app';
      masterBtn.disabled = true;
    }
  }

  // Inspect Active Tab context helper
  async function inspectActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const inputs = document.querySelectorAll('input, textarea, select');
            const fileInputs = document.querySelectorAll('input[type="file"]');
            return {
              totalInputs: inputs.length,
              fileInputsCount: fileInputs.length,
              url: window.location.hostname
            };
          }
        });
        const res = results?.[0]?.result;
        if (res) {
          pageContextText.textContent = `${res.url} • ${res.totalInputs} inputs (${res.fileInputsCount} file uploaders)`;
        }
      }
    } catch (e) {
      pageContextText.textContent = 'Ready for ATS forms';
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
});

// Programmatic Script Functions injected into web pages
// Programmatic Script Functions injected into web pages
function getAllFormElements(root = document) {
  const elements = [];

  function traverse(node) {
    if (!node) return;
    if (node.querySelectorAll) {
      const found = node.querySelectorAll('input, textarea, select, [contenteditable="true"], div.dropzone, div[class*="drop"], div[class*="upload"]');
      found.forEach(el => elements.push(el));
    }
    const allNodes = node.querySelectorAll ? node.querySelectorAll('*') : [];
    allNodes.forEach(child => {
      if (child.shadowRoot) traverse(child.shadowRoot);
      if (child.tagName === 'IFRAME') {
        try {
          const iframeDoc = child.contentDocument || child.contentWindow?.document;
          if (iframeDoc) traverse(iframeDoc);
        } catch (e) {}
      }
    });
  }

  traverse(root);
  return elements;
}

function setNativeInputValue(element, value) {
  if (!element || value === undefined || value === null) return false;
  const strVal = String(value);

  if (element.getAttribute('contenteditable') === 'true') {
    element.focus();
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, strVal);
    } catch (e) {
      element.innerText = strVal;
    }
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    return true;
  }

  if (element.tagName === 'SELECT') {
    let matched = false;
    const lowerVal = strVal.toLowerCase();
    for (let opt of element.options) {
      if (opt.value.toLowerCase() === lowerVal || opt.text.toLowerCase().includes(lowerVal)) {
        element.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched && element.options.length > 0) {
      element.selectedIndex = 0;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, strVal);
  } else if (valueSetter) {
    valueSetter.call(element, strVal);
  } else {
    element.value = strVal;
  }

  const events = ['focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
  events.forEach(evtName => {
    element.dispatchEvent(new Event(evtName, { bubbles: true, cancelable: true }));
  });
  return true;
}

function attachFileToInput(input, file) {
  if (!input || !file) return false;
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    if (input.tagName === 'INPUT' && input.type === 'file') {
      input.files = dataTransfer.files;
    }

    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    const dragEvents = ['dragenter', 'dragover', 'drop'];
    dragEvents.forEach(type => {
      const evt = new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      input.dispatchEvent(evt);
      if (input.parentElement) {
        input.parentElement.dispatchEvent(evt);
      }
    });
    return true;
  } catch (err) {
    console.error('[Hirenova Extension] File attach error:', err);
    return false;
  }
}

function handleRadioAndCheckboxes(allElements, profile) {
  let radioMarkedCount = 0;
  let checkboxMarkedCount = 0;

  const radioGroups = {};

  allElements.forEach(el => {
    if (el.tagName !== 'INPUT') return;

    if (el.type === 'checkbox') {
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      let labelText = '';
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) labelText = label.textContent.toLowerCase();
      }
      if (el.parentElement) labelText += ' ' + el.parentElement.textContent.toLowerCase();

      const text = `${name} ${id} ${labelText}`;
      const agreePatterns = [/agree/i, /terms/i, /certify/i, /accurate/i, /acknowledge/i, /consent/i, /privacy/i, /declaration/i];

      if (agreePatterns.some(p => p.test(text))) {
        if (!el.checked) {
          el.checked = true;
          el.dispatchEvent(new Event('click', { bubbles: true }));
          el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          checkboxMarkedCount++;
        }
      }
    }

    if (el.type === 'radio') {
      const groupName = el.getAttribute('name') || el.getAttribute('id') || 'default_group';
      if (!radioGroups[groupName]) radioGroups[groupName] = [];
      radioGroups[groupName].push(el);
    }
  });

  Object.keys(radioGroups).forEach(groupName => {
    const radios = radioGroups[groupName];
    if (!radios.length) return;

    let groupContextText = groupName.toLowerCase();
    const firstRadio = radios[0];
    let parent = firstRadio.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 4) {
      if (parent.tagName === 'FIELDSET' || parent.querySelector('legend') || parent.querySelector('label')) {
        groupContextText += ' ' + parent.textContent.toLowerCase();
        break;
      }
      parent = parent.parentElement;
      depth++;
    }

    let targetVal = '';
    if (/gender|sex/i.test(groupContextText)) {
      targetVal = profile.gender;
    } else if (/race|ethnic|origin|demographic/i.test(groupContextText)) {
      targetVal = profile.race;
    } else if (/veteran|military/i.test(groupContextText)) {
      targetVal = 'no';
    } else if (/disability|handicap/i.test(groupContextText)) {
      targetVal = 'no';
    } else if (/sponsorship|require\s*visa/i.test(groupContextText)) {
      targetVal = 'no';
    } else if (/authoriz|legally|work\s*in/i.test(groupContextText)) {
      targetVal = 'yes';
    }

    if (targetVal) {
      const lowerTarget = targetVal.toLowerCase();
      let matchedRadio = null;

      for (let r of radios) {
        const val = (r.value || '').toLowerCase();
        const id = (r.id || '').toLowerCase();
        let labelText = '';
        if (id) {
          const l = document.querySelector(`label[for="${id}"]`);
          if (l) labelText = l.textContent.toLowerCase();
        }
        if (r.parentElement) labelText += ' ' + r.parentElement.textContent.toLowerCase();

        const radioText = `${val} ${id} ${labelText}`;

        if (radioText.includes(lowerTarget) || (lowerTarget === 'yes' && /yes|authorized|true/i.test(radioText)) || (lowerTarget === 'no' && /no|do not|false/i.test(radioText))) {
          matchedRadio = r;
          break;
        }
      }

      if (matchedRadio && !matchedRadio.checked) {
        matchedRadio.checked = true;
        matchedRadio.dispatchEvent(new Event('click', { bubbles: true }));
        matchedRadio.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        matchedRadio.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        radioMarkedCount++;
      }
    }
  });

  return { radioMarkedCount, checkboxMarkedCount };
}

function runFullAutofillAndAttach(profile, resumeData) {
  console.log('[Hirenova Extension] 1-GO Autofill & Resume Attach running...');

  const nameParts = (profile.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const primaryEdu = Array.isArray(profile.educations) && profile.educations.length > 0 ? profile.educations[0] : {};

  const allElements = getAllFormElements(document);

  const rules = [
    { key: 'title', patterns: [/title/i, /prefix/i, /salutation/i, /honorific/i], val: profile.title },
    { key: 'email', patterns: [/email/i, /mail/i], val: profile.email || profile.contact?.email },
    { key: 'phone_ext', patterns: [/country\s*code/i, /phone\s*ext/i, /extension/i, /dial\s*code/i, /prefix/i], val: profile.phoneExtension },
    { key: 'phone', patterns: [/phone/i, /mobile/i, /tel/i, /contact/i, /cell/i], val: profile.phone || profile.contact?.phone },
    { key: 'first_name', patterns: [/first\s*name/i, /given\s*name/i, /fname/i], val: firstName },
    { key: 'last_name', patterns: [/last\s*name/i, /surname/i, /lname/i], val: lastName },
    { key: 'full_name', patterns: [/full\s*name/i, /^name$/i, /candidate\s*name/i], val: profile.name },
    { key: 'address_1', patterns: [/address\s*line\s*1/i, /street\s*address/i, /address\s*1/i, /^address$/i, /street/i], val: profile.addressLine1 },
    { key: 'address_2', patterns: [/address\s*line\s*2/i, /apartment/i, /suite/i, /unit/i, /address\s*2/i, /building/i], val: profile.addressLine2 },
    { key: 'city', patterns: [/city/i, /town/i, /municipality/i, /district/i, /location/i], val: profile.city },
    { key: 'linkedin', patterns: [/linkedin/i], val: profile.linkedin || profile.contact?.links?.find(l => l.includes('linkedin')) },
    { key: 'x_twitter', patterns: [/twitter/i, /^x$/i, /x\.com/i, /x\s*handle/i], val: profile.xTwitter || profile.contact?.links?.find(l => l.includes('twitter') || l.includes('x.com')) },
    { key: 'github', patterns: [/github/i, /git/i], val: profile.github || profile.contact?.links?.find(l => l.includes('github')) },
    { key: 'portfolio', patterns: [/website/i, /portfolio/i, /personal\s*site/i, /homepage/i, /url/i], val: profile.portfolio || profile.contact?.links?.find(l => !l.includes('linkedin') && !l.includes('github') && !l.includes('twitter')) },
    { key: 'university', patterns: [/university/i, /college/i, /school/i, /institution/i], val: primaryEdu.institution },
    { key: 'degree', patterns: [/degree/i, /qualification/i, /major/i, /field\s*of\s*study/i], val: primaryEdu.degree || primaryEdu.fieldOfStudy },
    { key: 'grad_year', patterns: [/graduat/i, /passing\s*year/i, /grad\s*year/i], val: primaryEdu.gradYear },
    { key: 'gpa', patterns: [/gpa/i, /cgpa/i, /grade/i, /marks/i, /percentage/i, /score/i], val: primaryEdu.gpa || profile.gpa || profile.cgpa },
    { key: 'gender', patterns: [/gender/i, /sex/i], val: profile.gender },
    { key: 'race', patterns: [/race/i, /ethnic/i, /demographic/i, /origin/i], val: profile.race },
    { key: 'dob', patterns: [/birth/i, /dob/i, /date\s*of\s*birth/i], val: profile.dob },
    { key: 'age', patterns: [/age/i], val: profile.age },
    { key: 'summary', patterns: [/summary/i, /cover\s*letter/i, /introduce\s*yourself/i, /describe/i], val: profile.experience }
  ];

  let fillCount = 0;
  allElements.forEach(input => {
    if (input.type === 'hidden' || input.type === 'file') return;

    const name = (input.getAttribute('name') || '').toLowerCase();
    const id = (input.getAttribute('id') || '').toLowerCase();
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

    let labelText = '';
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) labelText = label.textContent.toLowerCase();
    }
    let parent = input.parentElement;
    while (parent && parent !== document.body) {
      if (parent.tagName === 'LABEL') {
        labelText += ' ' + parent.textContent.toLowerCase();
        break;
      }
      parent = parent.parentElement;
    }

    const checkText = `${name} ${id} ${placeholder} ${ariaLabel} ${labelText}`;

    for (const rule of rules) {
      if (!rule.val) continue;
      const isMatch = rule.patterns.some(pat => pat.test(checkText));
      if (isMatch) {
        const success = setNativeInputValue(input, rule.val);
        if (success) fillCount++;
        break;
      }
    }
  });

  const { radioMarkedCount, checkboxMarkedCount } = handleRadioAndCheckboxes(allElements, profile);
  fillCount += (radioMarkedCount + checkboxMarkedCount);

  // Attach local stored resume PDF
  let fileAttachCount = 0;
  if (resumeData && resumeData.fileDataUrl) {
    try {
      const fileInputs = allElements.filter(el => el.tagName === 'INPUT' && el.type === 'file');
      const arr = resumeData.fileDataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: resumeData.fileType || mime || 'application/pdf' });
      const file = new File([blob], resumeData.fileName || 'Resume.pdf', { type: resumeData.fileType || mime || 'application/pdf' });

      fileInputs.forEach(input => {
        const accept = (input.getAttribute('accept') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        if (accept.includes('image') || /photo|picture|headshot|passport|avatar/i.test(name + id)) return;

        const attached = attachFileToInput(input, file);
        if (attached) fileAttachCount++;
      });
    } catch (err) {
      console.error('[Hirenova Extension] File attach error:', err);
    }
  }

  // Attach Passport Photo if available
  let photoAttachCount = 0;
  if (profile && profile.photoDataUrl) {
    try {
      const fileInputs = allElements.filter(el => el.tagName === 'INPUT' && el.type === 'file');
      const arr = profile.photoDataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const photoBlob = new Blob([u8arr], { type: mime || 'image/png' });
      const photoFile = new File([photoBlob], 'passport_photo.png', { type: mime || 'image/png' });

      fileInputs.forEach(input => {
        const accept = (input.getAttribute('accept') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();

        if (accept.includes('image') || /photo|picture|headshot|passport|avatar/i.test(name + id)) {
          const attached = attachFileToInput(input, photoFile);
          if (attached) photoAttachCount++;
        }
      });
    } catch (err) {
      console.error('[Hirenova Extension] Photo attach error:', err);
    }
  }

  showToastNotification(`⚡ Hirenova: Filled ${fillCount} fields & attached ${fileAttachCount ? (resumeData?.fileName || 'Resume.pdf') : '0 files'}!`);
}

function runAttachResumeOnly(resumeData) {
  if (!resumeData || !resumeData.fileDataUrl) return;

  try {
    const allElements = getAllFormElements(document);
    const fileInputs = allElements.filter(el => el.tagName === 'INPUT' && el.type === 'file');

    if (!fileInputs.length) {
      showToastNotification('⚠️ No <input type="file"> found on this page.');
      return;
    }

    const arr = resumeData.fileDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: resumeData.fileType || mime || 'application/pdf' });
    const file = new File([blob], resumeData.fileName || 'Resume.pdf', { type: resumeData.fileType || mime || 'application/pdf' });

    let attachedCount = 0;
    fileInputs.forEach(input => {
      const attached = attachFileToInput(input, file);
      if (attached) attachedCount++;
    });

    showToastNotification(`📄 Successfully attached ${resumeData.fileName} to ${attachedCount} file input(s)!`);
  } catch (err) {
    console.error('[Hirenova Extension] File attach error:', err);
    showToastNotification('⚠️ Failed to attach resume file.');
  }
}

function showToastNotification(messageText) {
  const existing = document.getElementById('hirenova-toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'hirenova-toast-notification';
  toast.innerText = messageText;
  toast.style.cssText = `
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999999;
    background: #09090b;
    color: #ffffff;
    padding: 0.75rem 1.25rem;
    border-radius: 50px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
