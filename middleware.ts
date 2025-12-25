import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Allow credentials in requests
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Add cache control for auth endpoints
  if (request.nextUrl.pathname.includes('/api/auth/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/:path*',
  ],
};
