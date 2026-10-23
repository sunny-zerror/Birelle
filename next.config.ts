import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The wishlist moved into the account dashboard (which asks for sign-in)
  async redirects() {
    return [{ source: "/wishlist", destination: "/account/wishlist", permanent: true }];
  },
};

export default nextConfig;
