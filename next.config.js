module.exports = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})({
  target: "serverless",
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  webpack5: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped. Doesn't make much sense, but how it is
        fs: false, // the solution
        // path: false,
      };
    }

    return config;
  },
});
