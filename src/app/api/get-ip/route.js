// // File: src/app/api/get-ip/route.js
// export async function GET(req) {
//     const ip =
//       req.headers.get("x-forwarded-for")?.split(",")[0] ||
//       req.ip ||
//       req.connection?.remoteAddress ||
//       "unknown";
  
//     return Response.json({ ip });
//   }
  