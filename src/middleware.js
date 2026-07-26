import { NextResponse } from 'next/server';

// Secret key required for Chrome Extension and external authorized clients
const ALLOWED_API_KEY = process.env.HIRENOVA_INTERNAL_API_KEY || 'hn_sec_99182374892173_extension_client_key_v1';

// Allowed origin domains for frontend web app
const ALLOWED_ORIGINS = [
  'https://hirenova-jobscraper.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Protect all /api/* routes
  if (path.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const apiKey = request.headers.get('x-hirenova-api-key') || request.headers.get('x-hirenova-extension-key');
    const secFetchSite = request.headers.get('sec-fetch-site');

    // Handle CORS OPTIONS Preflight
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

    // 1. Check if secret API key matches (Chrome Extension or Authorized Client)
    const hasValidKey = apiKey === ALLOWED_API_KEY;

    // 2. Check if request originates from our Official Frontend Web App
    let isAllowedOrigin = false;
    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
      isAllowedOrigin = true;
    } else if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('chrome-extension://'))) {
      isAllowedOrigin = true;
    } else if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
      isAllowedOrigin = true;
    }

    // Block unauthorized external developers/cURL/Postman requests
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

    // Request is authorized - append CORS headers for extension responses
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
