import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Allow accessing the dev server from other devices on the local network
  // (e.g. your phone/laptop at 192.168.1.x). Adjust IPs as needed.
  allowedDevOrigins: ["127.0.0.1", "192.168.1.8", "192.168.1.1", "localhost"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
