import { NextResponse } from 'next/server';

export async function middleware(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';

  // Add logging to debug IP detection
  console.log('Detected IP:', ip);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  const allowedIp = '61.28.197.253'; // Replace with your actual public IP

  // Allow access from localhost (127.0.0.1), ::1 (IPv6 localhost), or the specified IP
  if (ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith(allowedIp)) {
    console.log('Access denied for IP:', ip);
    return new NextResponse(
      JSON.stringify({ message: 'Access denied. Please connect to authorized Wi-Fi.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// Run on all routes (optional: restrict to certain routes)
export const config = {
  matcher: ['/'], // You can add more paths if needed
};
