import type { NextConfig } from "next";
import optimizeLocales from "@react-aria/optimize-locales-plugin";

const localeOptimization = optimizeLocales.turbopack({
  locales: ["en-US", "pt-BR"],
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      ...localeOptimization.rules,
    },
  },
};

export default nextConfig;
