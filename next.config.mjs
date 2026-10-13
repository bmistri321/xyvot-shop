/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    // DEMO DATA — remove before production (demo product images).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
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
