import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["postgres"],
  outputFileTracingIncludes: {
    "/skills/[slug]": ["./skills/**/*"],
    "/skills/[slug]/raw": ["./skills/**/*"],
    "/skills/[slug]/download": ["./skills/**/*"],
    "/llms-full.txt": ["./skills/**/*"],
  },
};

export default nextConfig;
