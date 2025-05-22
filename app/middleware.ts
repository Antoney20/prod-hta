import { emailRateLimiter } from '@/lib/utils';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const SECURE_PATHS = ['/api/send-email']; 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  

  if (!SECURE_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get client IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown-ip';
  

  if (process.env.NODE_ENV === 'development' && ip.includes('127.0.0.1') && 
      process.env.BYPASS_RATE_LIMIT === 'true') {
    return NextResponse.next();
  }

  if (pathname === '/api/send-email' && request.method === 'POST') {
    if (ip === 'unknown-ip') {
      return new NextResponse(JSON.stringify({ 
        error: 'Cannot identify client' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const userAgent = request.headers.get('user-agent') || '';
    
    if (!userAgent) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid request' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    if (userAgent.includes('bot') || userAgent.includes('crawler') || 
        userAgent.length < 10) {
      return new NextResponse(JSON.stringify({ 
        error: 'Automated requests are not allowed' 
      }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const rateLimitKey = ip;
    
    const rateLimitResult = emailRateLimiter.checkAndIncrement(rateLimitKey);
    

    if (!rateLimitResult.success) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return new NextResponse(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimitResult.reset
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
        }
      });
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString());
    
    return response;
  }
  
  const response = NextResponse.next();
  
  
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

// config paths
export const config = {
  matcher: [
    '/api/send-email',
    
  ],
};