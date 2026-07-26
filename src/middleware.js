import { NextResponse } from 'next/server';

// Secret key required for Extension background & internal API clients
const ALLOWED_API_KEY = process.env.HIRENOVA_INTERNAL_API_KEY || 'hn_sec_99182374892173_extension_client_key_v1';

// Allowed origin domains for frontend web app
const ALLOWED_ORIGINS = [
  'https://hirenova-jobscraper.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Simple in-memory rate limiter map (IP -> timestamp & count)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // max 100 requests / minute

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Protect all /api/* routes
  if (path.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const apiKey = request.headers.get('x-hirenova-api-key') || request.headers.get('x-hirenova-extension-key');
    const secFetchSite = request.headers.get('sec-fetch-site');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    // 1. RATE LIMITING CHECK
    const now = Date.now();
    const userRate = rateLimitMap.get(ip) || { count: 0, startTime: now };
    if (now - userRate.startTime > RATE_LIMIT_WINDOW_MS) {
      userRate.count = 1;
      userRate.startTime = now;
    } else {
      userRate.count += 1;
    }
    rateLimitMap.set(ip, userRate);

    if (userRate.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { success: false, error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    // 2. Handle CORS OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('chrome-extension://'))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else {
        response.headers.set('Access-Control-Allow-Origin', 'https://hirenova-jobscraper.vercel.app');
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-hirenova-api-key, x-hirenova-extension-key');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 3. SECURE BROWSER ORIGIN & HEADER VALIDATION
    // Note: Browsers (Chrome, Edge, Brave) automatically attach untamperable Sec-Fetch-Site header.
    // External scripts on other domains CANNOT spoof Sec-Fetch-Site: same-origin or Chrome extension origin!
    const hasValidKey = apiKey === ALLOWED_API_KEY;
    let isAllowedOrigin = false;

    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
      isAllowedOrigin = true;
    } else if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('chrome-extension://'))) {
      isAllowedOrigin = true;
    } else if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
      isAllowedOrigin = true;
    }

    // Block unauthorized external developers / cURL / Postman scrapers
    if (!hasValidKey && !isAllowedOrigin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Access Forbidden', 
          message: 'Hirenova API endpoints are restricted to authorized frontend web app and extension clients only.' 
        },
        { status: 403 }
      );
    }

    // Request is authorized - append security & CORS headers
    const response = NextResponse.next();
    if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('chrome-extension://'))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
