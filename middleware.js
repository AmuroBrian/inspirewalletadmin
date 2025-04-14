// middleware.js
import { NextResponse } from 'next/server';

const allowedIps = ['61.28.197.253']; // Your real public IP

export function middleware(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();

  console.log('Visitor IP:', ip); // Optional: View this in Vercel logs

  if (allowedIps.includes(ip)) {
    return NextResponse.next(); // Allow
  }

  return new Response('Access denied: not on allowed network.', {
    status: 403,
  });
}
