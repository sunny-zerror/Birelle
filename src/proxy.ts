import { createZcomMiddleware } from "@zcom/storefront-kit/edge";

// Zcom: same-origin /v1/graphql proxy, store identity check, suspended-store page,
// noindex on private pages
export default createZcomMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)",
    "/.well-known/zcom-store",
    "/v1/graphql",
  ],
};
