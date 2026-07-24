import "./globals.css";

export const metadata = {
  title: "Hirenova | Find Your Dream Job with AI Autopilot",
  description: "Hirenova matches your resume PDF to active crawled job postings, provides ATS scoring gap analysis, and runs an automated auto-apply beta pipeline.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

