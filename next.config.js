module.exports = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
})({ target: "serverless" });

