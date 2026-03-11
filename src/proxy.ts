export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    // Protect these routes — users must be authenticated
    "/checkout/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
