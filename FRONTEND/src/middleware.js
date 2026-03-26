// Middleware disabled - using Firebase Auth with client-side route protection
// Protected routes are now handled by ProtectedRoute component in layouts

// export { default } from "next-auth/middleware";

// export const config = {
//   matcher: [
//     "/portal/:path*",
//     "/profile",
//     "/dashboard/:path*",
//   ],
// };

export function middleware(request) {
  // Middleware is currently disabled
  // Route protection is handled by ProtectedRoute component
  return;
}
