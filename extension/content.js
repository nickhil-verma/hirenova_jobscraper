// Listen for background service worker command (Alt+Shift+A hotkey, Ctrl+Q overlay toggle)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'AUTOFILL_ONE_GO') {
    initiateOneGoAutofill();
    sendResponse({ success: true });
  } else if (message.action === 'TOGGLE_OVERLAY' || message.action === 'HIDE_OVERLAY') {
    hideExtensionOverlay();
    sendResponse({ success: true });
  } else if (message.action === 'UPDATE_OVERLAY_MODE') {
    if (typeof applyOverlayMode === 'function') {
      applyOverlayMode(message.mode);
    }
    sendResponse({ success: true });
  }
});

// Function to hide/toggle the floating extension overlay and active toasts
function hideExtensionOverlay() {
  const container = document.getElementById('hirenova-floating-btn-container');
  if (container) {
    if (container.style.display === 'none' || container.style.getPropertyValue('display') === 'none') {
      container.style.setProperty('display', 'flex', 'important');
      chrome.storage.local.set({ hirenova_overlay_mode: 'expanded' });
    } else {
      container.style.setProperty('display', 'none', 'important');
      chrome.storage.local.set({ hirenova_overlay_mode: 'hidden' });
    }
  }

  const toast = document.getElementById('hirenova-toast-notification');
  if (toast) {
    toast.style.display = 'none';
  }
}

// Global keydown listener for Ctrl + Q (or Cmd + Q on Mac) to hide/toggle overlay
window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && (event.key === 'q' || event.key === 'Q' || event.code === 'KeyQ')) {
    event.preventDefault();
    hideExtensionOverlay();
  }
}, true);


function checkIsApplicationForm() {
  const form = document.querySelector('form');
  if (form) return true;

  const text = (document.body?.innerText || '').toLowerCase();
  const hasFileInput = !!document.querySelector('input[type="file"]');
  const isAts = window.location.href.includes('lever.co') || 
                window.location.href.includes('greenhouse.io') || 
                window.location.href.includes('workday') ||
                window.location.href.includes('bamboohr.com') ||
                window.location.href.includes('ashbyhq.com') ||
                window.location.href.includes('smartrecruiters.com') ||
                text.includes('submit application') || 
                text.includes('apply for this job') ||
                text.includes('upload resume') ||
                text.includes('attach resume');

  return hasFileInput || isAts;
}

async function initiateOneGoAutofill() {
  try {
    chrome.runtime.sendMessage({ action: 'FETCH_SESSION' }, async (data) => {
      if (chrome.runtime.lastError || !data || !data.success || !data.user) {
        const stored = await chrome.storage.local.get(['hirenova_user_profile', 'hirenova_local_resume']);
        if (stored && stored.hirenova_user_profile) {
          executeFullAutofillAndAttach(stored.hirenova_user_profile, stored.hirenova_local_resume);
          return;
        }
        showToastNotification('⚠️ Please log in to Hirenova at https://hirenova-jobscraper.vercel.app to authenticate');
        return;
      }

      const profile = data.user;
      chrome.storage.local.set({ hirenova_user_profile: profile });

      let storedResume = null;
      try {
        const stored = await chrome.storage.local.get('hirenova_local_resume');
        if (stored && stored.hirenova_local_resume) {
          storedResume = stored.hirenova_local_resume;
        }
      } catch (e) {}

      executeFullAutofillAndAttach(profile, storedResume);
    });
  } catch (err) {
    console.error('[Hirenova Content] Session error:', err);
    try {
      const stored = await chrome.storage.local.get(['hirenova_user_profile', 'hirenova_local_resume']);
      if (stored && stored.hirenova_user_profile) {
        executeFullAutofillAndAttach(stored.hirenova_user_profile, stored.hirenova_local_resume);
      } else {
        showToastNotification('⚠️ Please log in at https://hirenova-jobscraper.vercel.app');
      }
    } catch (e) {
      showToastNotification('⚠️ Please log in at https://hirenova-jobscraper.vercel.app');
    }
  }
}

// Recursive DOM crawler to discover all form elements across Shadow DOM & IFrames
function getAllFormElements(root = document) {
  const elements = [];

  function traverse(node) {
    if (!node) return;
    
    // Query standard form inputs and contenteditables
    if (node.querySelectorAll) {
      const found = node.querySelectorAll('input, textarea, select, [contenteditable="true"], div.dropzone, div[class*="drop"], div[class*="upload"]');
      found.forEach(el => elements.push(el));
    }

    // Check all children for shadowRoot or iFrames
    const allNodes = node.querySelectorAll ? node.querySelectorAll('*') : [];
    allNodes.forEach(child => {
      if (child.shadowRoot) {
        traverse(child.shadowRoot);
      }
      if (child.tagName === 'IFRAME') {
        try {
          const iframeDoc = child.contentDocument || child.contentWindow?.document;
          if (iframeDoc) {
            traverse(iframeDoc);
          }
        } catch (e) {
          // Cross-origin iframe (handled automatically by extension with all_frames: true)
        }
      }
    });
  }

  traverse(root);
  return elements;
}

// React / Vue / Angular native value setter & event dispatcher
function setNativeInputValue(element, value) {
  if (!element || value === undefined || value === null) return false;
  const strVal = String(value);

  // ContentEditable handling (Draft.js, ProseMirror, Slate)
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

  // Select dropdown handling
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

  // Bypass React/Vue prototype setter overrides
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

  // Dispatch full synthetic event stack
  const events = ['focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
  events.forEach(evtName => {
    element.dispatchEvent(new Event(evtName, { bubbles: true, cancelable: true }));
  });
  return true;
}

// File Attachment Engine with DataTransfer & Simulated Drag/Drop
function attachFileToInput(input, file) {
  if (!input || !file) return false;

  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    if (input.tagName === 'INPUT' && input.type === 'file') {
      input.files = dataTransfer.files;
    }

    // Dispatch input and change events
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    // Dispatch simulated Drag and Drop events for custom ATS dropzones
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

    // Checkbox Handling
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

    // Radio Button Handling
    if (el.type === 'radio') {
      const groupName = el.getAttribute('name') || el.getAttribute('id') || 'default_group';
      if (!radioGroups[groupName]) radioGroups[groupName] = [];
      radioGroups[groupName].push(el);
    }
  });

  // Evaluate Radio Groups
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

function executeFullAutofillAndAttach(profile, resumeData) {
  console.log('[Hirenova Extension] Executing unshakeable autofill engine...');

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

  // Handle Radio Buttons and Checkboxes
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
      const resumeFile = new File([blob], resumeData.fileName || 'Resume.pdf', { type: resumeData.fileType || mime || 'application/pdf' });

      fileInputs.forEach(input => {
        const accept = (input.getAttribute('accept') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        if (accept.includes('image') || /photo|picture|headshot|passport|avatar/i.test(name + id)) return;

        const attached = attachFileToInput(input, resumeFile);
        if (attached) fileAttachCount++;
      });
    } catch (err) {
      console.error('[Hirenova Extension] Resume attach error:', err);
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
    transition: all 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Global function to apply overlay mode from popup or on-screen actions
let applyOverlayMode = function() {};

// Inject Floating Badge Button with Minimize & Close Controls on detected ATS Application Forms
if (checkIsApplicationForm()) {
  console.log('[Hirenova Extension] Job application page identified. Injecting floating fill action with minimize options...');
  
  const container = document.createElement('div');
  container.id = 'hirenova-floating-btn-container';
  container.style.setProperty('display', 'none', 'important'); // Default hidden until storage setting resolves

  function renderWidget(minimized) {
    container.innerHTML = '';

    if (minimized) {
      // Minimized State: Sleek circular floating badge
      container.style.cssText = `
        position: fixed !important;
        bottom: 1.5rem !important;
        right: 1.5rem !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        background: #09090b !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.25) !important;
        border-radius: 9999px !important;
        width: 44px !important;
        height: 44px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35) !important;
        cursor: pointer !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      `;
      container.title = "Hirenova 1-GO Autofill (Click to expand overlay)";
      
      const fabIcon = document.createElement('div');
      fabIcon.innerHTML = `⚡`;
      fabIcon.style.cssText = `
        font-size: 1.25rem;
        user-select: none;
      `;
      
      container.onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.set({ hirenova_overlay_mode: 'expanded' });
        renderWidget(false);
      };
      
      container.onmouseover = () => {
        container.style.transform = 'scale(1.1)';
        container.style.background = '#18181b';
      };
      container.onmouseout = () => {
        container.style.transform = 'scale(1)';
        container.style.background = '#09090b';
      };

      container.appendChild(fabIcon);
    } else {
      // Expanded State: Full Pill + Action + Minimize + Close Controls
      container.style.cssText = `
        position: fixed !important;
        bottom: 2rem !important;
        right: 2rem !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        display: flex !important;
        align-items: center !important;
        background: #09090b !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 9999px !important;
        padding: 0.35rem 0.5rem 0.35rem 0.65rem !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35) !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      `;
      container.title = "";
      container.onclick = null;
      container.onmouseover = null;
      container.onmouseout = null;

      // Main Autofill Button
      const mainBtn = document.createElement('button');
      mainBtn.title = "Click to Autofill & Attach Resume (Press Ctrl+Q to toggle)";
      mainBtn.innerHTML = `
        <span style="font-weight: 800; font-size: 0.88rem; background: rgba(255,255,255,0.2); padding: 0.15rem 0.45rem; border-radius: 4px; margin-right: 0.45rem;">⚡ 1-GO</span>
        <span style="font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Autofill & Attach Resume</span>
      `;
      mainBtn.style.cssText = `
        display: flex;
        align-items: center;
        background: transparent;
        color: #ffffff;
        border: none;
        cursor: pointer;
        padding: 0.3rem 0.5rem;
        border-radius: 9999px;
        transition: background 0.2s ease;
      `;
      mainBtn.onmouseover = () => { mainBtn.style.background = 'rgba(255,255,255,0.1)'; };
      mainBtn.onmouseout = () => { mainBtn.style.background = 'transparent'; };
      mainBtn.onclick = () => initiateOneGoAutofill();

      // Vertical Divider line
      const divider = document.createElement('div');
      divider.style.cssText = `
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 0.3rem;
      `;

      // Minimize Button (–)
      const minBtn = document.createElement('button');
      minBtn.title = "Minimize to small floating icon";
      minBtn.innerHTML = "–";
      minBtn.style.cssText = `
        background: transparent;
        color: #a1a1aa;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: bold;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      minBtn.onmouseover = () => { minBtn.style.color = '#ffffff'; minBtn.style.background = 'rgba(255,255,255,0.15)'; };
      minBtn.onmouseout = () => { minBtn.style.color = '#a1a1aa'; minBtn.style.background = 'transparent'; };
      minBtn.onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.set({ hirenova_overlay_mode: 'minimized' });
        renderWidget(true);
      };

      // Close Button (✕)
      const closeBtn = document.createElement('button');
      closeBtn.title = "Close overlay (Press Ctrl+Q to show again)";
      closeBtn.innerHTML = "✕";
      closeBtn.style.cssText = `
        background: transparent;
        color: #a1a1aa;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: bold;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      closeBtn.onmouseover = () => { closeBtn.style.color = '#ef4444'; closeBtn.style.background = 'rgba(239, 68, 68, 0.15)'; };
      closeBtn.onmouseout = () => { closeBtn.style.color = '#a1a1aa'; closeBtn.style.background = 'transparent'; };
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.set({ hirenova_overlay_mode: 'hidden' });
        container.style.setProperty('display', 'none', 'important');
        showToastNotification('ℹ️ Hirenova overlay hidden. Press Ctrl+Q to bring back.');
      };

      container.appendChild(mainBtn);
      container.appendChild(divider);
      container.appendChild(minBtn);
      container.appendChild(closeBtn);
    }
  }

  applyOverlayMode = function(mode) {
    const targetContainer = document.getElementById('hirenova-floating-btn-container') || container;
    if (!targetContainer) return;

    if (mode === 'hidden') {
      targetContainer.style.setProperty('display', 'none', 'important');
    } else if (mode === 'minimized') {
      renderWidget(true);
      targetContainer.style.setProperty('display', 'flex', 'important');
    } else {
      renderWidget(false);
      targetContainer.style.setProperty('display', 'flex', 'important');
    }
  };

  // Real-time listener for chrome.storage.local changes across tabs
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.hirenova_overlay_mode) {
      applyOverlayMode(changes.hirenova_overlay_mode.newValue);
    }
  });

  // Initial load from chrome.storage.local
  chrome.storage.local.get('hirenova_overlay_mode', (stored) => {
    const mode = stored?.hirenova_overlay_mode || 'expanded';
    applyOverlayMode(mode);
  });

  document.body.appendChild(container);
}
