module.exports = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})({
  target: "serverless",
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ]
      }
    ];
  }
});
