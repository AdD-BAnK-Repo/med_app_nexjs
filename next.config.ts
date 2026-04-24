import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["100.79.32.11", "host.netfree.in.th", "med.netfree.in.th"],
};

export default nextConfig;