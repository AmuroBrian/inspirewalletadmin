import { NextResponse } from 'next/server';

// Set the IPs allowed from your specific WiFi network (get this from your WiFi)
const allowedIps = ['192.168.70.144']; // Replace with your IP seen from your network

export function middleware(request) {
  // Get the real client IP from the x-forwarded-for header
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  console.log('Request IP:', ip); // Optional: log IP in Vercel functions log

  // Only allow users on the same WiFi IP (you may need to add more if range changes)
  if (allowedIps.includes(ip)) {
    return NextResponse.next();
  }

  return new Response('Access denied: Only available within specific WiFi network.', {
    status: 403,
  });
}
