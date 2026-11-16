import { createZcomMiddleware } from "@zcom/storefront-kit/edge";

// Zcom: same-origin /v1/graphql proxy, store identity check, suspended-store page,
// noindex on private pages. No loginGuard: sign-in is a drawer (no /login page), and the account
// area opens it for signed-out visitors (AuthProvider). Checkout is open to guests.
export default createZcomMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)",
    "/.well-known/zcom-store",
    "/v1/graphql",
  ],
};
