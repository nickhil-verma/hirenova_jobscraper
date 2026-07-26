# ⚡ Hirenova AI Agent - Chrome Extension

> **The 1-Click AI Job Autofill, Resume Auto-Attacher & Recruiter Intelligence Agent for Software Engineers.**

[![Chrome Extension Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-09090b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension)
[![Live Platform](https://img.shields.io/badge/Live_Platform-Hirenova_Vercel-16a34a?style=for-the-badge&logo=vercel&logoColor=white)](https://hirenova-jobscraper.vercel.app)

The Hirenova Chrome Extension integrates directly into your browser to automatically detect job application forms across ATS portals (**Greenhouse, Lever, Workday, LinkedIn, Indeed, Ashby**) and autofill your profile & attach your local resume with a single click or keyboard shortcut.

---

## 🚀 Key Features

* **⚡ 1-GO Master Autofill (`Alt + Shift + A`)**: Instantly detects and populates input fields (Full Name, Email, Phone, LinkedIn, GitHub, Portfolio, Years of Experience, Work Authorization, Salary Expectations) across 15+ job application schemas.
* **📎 Automatic Local Resume Attacher**: Seamlessly attaches your chosen `.pdf` or `.docx` resume file directly into ATS file input fields.
* **🔘 Smart 3-Mode Overlay Pill (`Ctrl + Q`)**:
  * **⚡ Expanded**: Full floating autofill action bar on application forms.
  * **🔹 Minimized**: Sleek 44px circular `⚡` floating action icon.
  * **🚫 Hidden**: Hides the floating overlay completely with persistent memory across tabs and page refreshes.
* **🔔 Live Job Notifications & 2.5-Hour Cache**: View live indexed engineering job alerts inside the extension popup dropdown with zero network bloat.
* **🔒 100% Local & Encrypted**: Your local PC resume file and profile data stay on your computer.

---

## 🛠️ Step-by-Step Installation Guide (PC / Mac / Linux)

Follow these simple steps to install the extension on **Google Chrome**, **Brave**, **Microsoft Edge**, or any Chromium-based browser:

### Step 1: Download or Clone the Extension Folder
1. Go to the GitHub repository:  
   👉 **[https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension](https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension)**
2. Click the green **`<Code>`** button and select **Download ZIP** (or clone via git):
   ```bash
   git clone https://github.com/nickhil-verma/hirenova_jobscraper.git
   ```
3. Extract the downloaded ZIP file on your PC. You will see a folder named `extension` containing `manifest.json`, `content.js`, `background.js`, and `popup.html`.

### Step 2: Open Extensions Page in Your Browser
Open your browser and navigate to the extensions management URL:
* **Google Chrome**: `chrome://extensions`
* **Brave Browser**: `brave://extensions`
* **Microsoft Edge**: `edge://extensions`

### Step 3: Enable Developer Mode
In the top right corner of the Extensions page, toggle the **Developer mode** switch to **ON** (enabled).

### Step 4: Load the Unpacked Extension
1. Click the **Load unpacked** button in the top left header bar.
2. Select the `extension` folder from your PC (the folder containing `manifest.json`).
3. You will see **Hirenova Agent** appear in your extension list with an active green status badge!

### Step 5: Pin the Extension Icon
Click the puzzle piece icon (🧩) on your browser toolbar and click the **Pin** (📌) icon next to **Hirenova Agent** for 1-click access.

---

## 💻 How to Work with Hirenova Extension

### 1. Authenticate / Sync Your Profile
* Open the **Hirenova Agent** popup from your browser toolbar.
* If you are logged in on **[https://hirenova-jobscraper.vercel.app](https://hirenova-jobscraper.vercel.app)**, the extension will automatically display **"Synced"** with your profile name and email.

### 2. Choose Your Local PC Resume
* In the extension popup dropdown, click **📁 Choose Local Resume**.
* Select your `.pdf` or `.docx` resume file from your computer.
* Your resume is stored safely in local browser storage for automatic attachment.

### 3. Autofill Applications on ATS Sites
* Visit any job application page (e.g. Greenhouse, Lever, Workday, LinkedIn, Indeed).
* Click the floating **⚡ 1-GO AUTOFILL & ATTACH** pill on the webpage OR press **`Alt + Shift + A`**.
* Watch as all form fields are automatically filled and your local resume is attached!

### 4. Control Floating Overlay Pill Visibility
* Press **`Ctrl + Q`** anytime to cycle through Overlay Pill states (`⚡ Expanded`, `🔹 Minimized`, `🚫 Hidden`).
* Or select your preferred mode in the extension popup dropdown under **On-Screen Overlay Pill**. Your selection persists across all tabs and website refreshes.

### 5. Check Live Job Notifications
* Open the extension popup dropdown to view **🔔 Live Job Feed & Notifications**.
* Click **⚡ Fetch Jobs** to refresh live job listings cached for 2.5 hours. Click **Apply ↗** to open any role directly.

---

## ⌨️ Keyboard Shortcuts Summary

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Alt + Shift + A`** | **1-GO Master Autofill** | Autofill all fields and attach resume on active form |
| **`Ctrl + Q`** | **Cycle Overlay Pill** | Toggle between Expanded, Minimized, and Hidden modes |

---

## ❓ Troubleshooting & FAQs

* **Q: The overlay pill is not appearing on a website.**  
  * Check the extension popup and verify the pill mode is set to **⚡ Expanded** or **🔹 Minimized** (not Hidden). You can also press **`Ctrl + Q`**.
* **Q: How do I update the extension?**  
  * Go to `chrome://extensions` and click the refresh icon (🔄) on the Hirenova Agent card.

---

## 🔗 Official Links

* **Platform Website**: [https://hirenova-jobscraper.vercel.app](https://hirenova-jobscraper.vercel.app)
* **GitHub Repository**: [https://github.com/nickhil-verma/hirenova_jobscraper](https://github.com/nickhil-verma/hirenova_jobscraper)
* **Extension Folder**: [https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension](https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension)
