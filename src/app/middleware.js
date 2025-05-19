// import { NextResponse } from 'next/server';

// export async function middleware(req) {
//   const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';

//   const allowedIp = '61.28.197.253'; // Replace with your actual public IP

//   if (!ip.startsWith(allowedIp)) {
//     return new NextResponse(
//       JSON.stringify({ message: 'Access denied. Please connect to authorized Wi-Fi.' }),
//       { status: 403, headers: { 'Content-Type': 'application/json' } }
//     );
//   }

//   return NextResponse.next();
// }

// // Run on all routes (optional: restrict to certain routes)
// export const config = {
//   matcher: ['/'], // You can add more paths if needed
// };
