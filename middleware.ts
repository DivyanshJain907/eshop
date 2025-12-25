import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Get the origin from the request
  const origin = request.headers.get('origin') || '';

  // Set CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow specific origin (or any origin for same-origin requests)
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Add cache control for auth endpoints
  if (request.nextUrl.pathname.includes('/api/auth/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
