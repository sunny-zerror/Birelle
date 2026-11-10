import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Product and lookbook images uploaded in Zcom are served from the Zcom media CDN
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.zerrorstudios.com" }],
  },
  // The wishlist moved into the account dashboard (which asks for sign-in)
  async redirects() {
    return [{ source: "/wishlist", destination: "/account/wishlist", permanent: true }];
  },
};

export default nextConfig;
