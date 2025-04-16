// /app/api/get-ip/route.js (for app directory + edge runtime)
export const runtime = 'edge';

export async function GET(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || 'Unknown IP';

  return new Response(JSON.stringify({ ip }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
