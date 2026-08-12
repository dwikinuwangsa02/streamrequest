import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  serverExternalPackages: ["cheerio", "yt-search", "spotify-url-info"],
};

export default nextConfig;
