# ⚡ Hirenova - AI-Native Career Command Center & Job Scraper Platform

[![Live Platform](https://img.shields.io/badge/Live_Deployment-Hirenova_Vercel-16a34a?style=for-the-badge&logo=vercel&logoColor=white)](https://hirenova-jobscraper.vercel.app)
[![GitHub Extension Folder](https://img.shields.io/badge/Chrome_Extension-Repository_Folder-09090b?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nickhil-verma/hirenova_jobscraper/tree/main/extension)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2_Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_1.5_Flash-8e44ad?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**Hirenova** is an all-in-one, AI-native career intelligence ecosystem and Chrome extension designed for software engineers and technology professionals. It indexes real-time job postings across top ATS platforms, scores resume compatibility using Google Gemini AI, simulates initial recruiter scanning impressions, provides an interactive drag-and-drop Kanban application tracker, and delivers automated 1-click application form filling with resume attachment directly inside ATS portals (**Greenhouse, Lever, Workday, LinkedIn, Indeed**).

---

## 🔥 Key Platform Features

### 1. 🤖 AI Job Matcher & Resume Compatibility Engine
- **Instant Match Scoring**: Calculates detailed percentage match scores by comparing candidate experience, tech stack, and skills against live job descriptions.
- **Skill Gap & Highlight Analysis**: Identifies exact matching skills, missing critical keywords, and actionable recommendations to optimize application success.
- **Tailored Resume Insights**: Uses Google Gemini 1.5 Flash to generate context-aware suggestions tailored to individual job listings.

### 2. 🎯 6-Second Recruiter Impression Simulator
- **Human Recruiter Simulation**: Replicates the brief initial scan performed by talent acquisition teams.
- **Visual Hierarchy & Formatting Audit**: Analyzes readability, typography density, section flow, and visual impact.
- **Immediate Pros & Red Flags**: Pinpoints instant highlights and potential red flags before submitting job applications.

### 3. 📊 Interactive Kanban Application Pipeline
- **Visual Status Management**: Track application progress across key stages: `Saved`, `Applied`, `Interviewing`, `Offered`, and `Rejected`.
- **Drag-and-Drop Workflow**: Seamlessly move job cards across pipeline stages with instant backend persistence.
- **Application Analytics**: Keep track of application counts, response rates, interview conversion metrics, and notes per role.

### 4. 🌐 Real-Time Multi-Source Job Indexer & Scraper
- **Automated Aggregation**: Aggregates live software engineering roles from leading job boards and corporate ATS platforms.
- **Advanced Filtering**: Filter roles by location, remote/hybrid status, experience level, salary range, and specific tech keywords.
- **Direct Application Mapping**: Preserves clean application links and company metadata for quick tracking.

### 5. 🧩 Hirenova Agent Chrome Extension & Smart Overlay HUD
- **Contextual In-Page Overlay**: Injects a sleek, draggable floating HUD pill on external job listings and application pages.
- **1-Click Master Application Autofill**: Automatically fills candidate contact details, work history, education, portfolio links, and attaches custom resume PDFs into ATS forms (**Greenhouse, Lever, Workday, LinkedIn, Indeed**).
- **Keyboard Productivity Shortcuts**:
  - `Alt + Shift + A`: Execute 1-Click Master Autofill & Resume Attachment.
  - `Ctrl + Q`: Cycle floating overlay display modes (`⚡ Expanded`, `🔹 Minimized`, `🚫 Hidden`).
- **One-Click Save to Dashboard**: Save active web job postings straight into your personal Hirenova Kanban board without leaving the browser tab.

### 6. 🛡️ Admin Control Panel & Infrastructure Monitoring
- **System Health & Scraper Metrics**: Monitor active job scraping jobs, platform throughput, and database sync status.
- **Rate Limit & API Management**: Operational controls for AI query volumes, scraper intervals, and user session management.

---

## 🏗️ Project Architecture & Technical Walkthrough

```
                        ┌──────────────────────────────────────────┐
                        │     Hirenova Next.js 16 Web App          │
                        │  (Dashboard, Kanban, AI Engines, Admin)   │
                        └────────────────────┬─────────────────────┘
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       │                     │                     │
                       ▼                     ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │  MongoDB Atlas   │  │  Gemini 1.5 AI   │  │  Multi-ATS       │
              │  (Jobs, Users,   │  │  (Match Engine,  │  │  Job Scraper     │
              │  Kanban State)   │  │  Recruiter Sim)  │  │  (Cheerio/Fetch) │
              └──────────────────┘  └──────────────────┘  └──────────────────┘
                                             ▲
                                             │ REST API Sync
                                             ▼
                        ┌──────────────────────────────────────────┐
                        │   Hirenova Agent Chrome Extension (V3)   │
                        │  (Floating HUD, Master Autofill, Sync)   │
                        └──────────────────────────────────────────┘
```

### Codebase Organization

* **`/src/app`**: Next.js 16 App Router hierarchy containing user-facing pages, authentication flows, and REST endpoints:
  * [`page.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/page.js): Main landing platform, job board showcase, and live query interface.
  * [`dashboard/`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/dashboard): Interactive Kanban job tracker & profile manager.
  * [`admin/`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/admin/page.js): Administrative dashboard for platform analytics and scraper health.
  * [`api/jobs/`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/api/jobs): Real-time job listing search, filtering, and detail APIs.
  * [`api/ai/`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/api/ai): Endpoints powering Gemini AI match scoring and recruiter impression analysis.
  * [`api/kanban/`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/app/api/kanban): Pipeline stage mutation and persistence endpoints.

* **`/src/lib`**: Core backend utilities and external service integrators:
  * [`db.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/lib/db.js): Cached MongoDB connection handler for serverless runtime efficiency.
  * [`scraper.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/src/lib/scraper.js): Multi-source job scraping engine equipped with HTML parsing, metadata normalization, and ATS URL detection.

* **`/extension`**: Manifest V3 Chrome Extension source code:
  * [`manifest.json`](file:///c:/Users/verma/Downloads/job_scrapping_agent/extension/manifest.json): Extension permissions, host matching, content script injection targets, and keyboard commands.
  * [`content.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/extension/content.js): Intelligent DOM form-filling engine supporting custom selectors for Greenhouse, Lever, Workday, LinkedIn, and Indeed, plus the floating overlay HUD widget.
  * [`background.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/extension/background.js): Extension event listener, state synchronization, and background communication bridge.
  * [`popup.html`](file:///c:/Users/verma/Downloads/job_scrapping_agent/extension/popup.html) & [`popup.js`](file:///c:/Users/verma/Downloads/job_scrapping_agent/extension/popup.js): Quick extension popup UI for active tab inspection, profile credentials config, and 1-click sync.

---

## 🎯 Supported ATS Portals & Platforms

Hirenova's autofill and extraction engine natively recognizes and adapts to standard fields across:
* 🟢 **Greenhouse.io**: Full name, email, phone, LinkedIn URL, portfolio link, cover letter, and resume file attachment.
* 🔵 **Lever.co**: Candidate info, custom questions, social links, resume upload.
* 🟠 **Workday**: Multi-step application field identification and pre-filling.
* 💼 **LinkedIn Jobs**: Easy Apply and external application tracking.
* 🔍 **Indeed**: Form field matching and fast submission support.

---

## 👤 Author & License

* **Built by**: Nickhil Verma ([GitHub](https://github.com/nickhil-verma))
* **License**: MIT License