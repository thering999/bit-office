import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const isDev = process.env.NODE_ENV === "development";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  reactStrictMode: true,
  transpilePackages: ["@office/shared"],

  // Static HTML export for GitHub Pages
  ...(isGithubActions && {
    output: "export",
    basePath: "/bit-office",
    images: {
      unoptimized: true,
    },
  }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side: exclude all Node.js native modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        "node:fs": false,
        "node:path": false,
        events: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        "better-sqlite3": false,
        "node-gyp-build": false,
        bindings: false,
      };
    }

    if (isGithubActions) {
      // In static export mode, tell webpack to ignore native addons entirely
      config.plugins = config.plugins ?? [];
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^better-sqlite3$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^node-gyp-build$/,
        })
      );
    }

    return config;
  },

  ...(isDev && {
    headers: async () => [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ],
  }),
};

export default withPWA(nextConfig);
