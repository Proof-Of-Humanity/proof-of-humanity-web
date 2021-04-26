const disableSSRMixin = {
  exportTrailingSlash: true,
  exportPathMap() {
    return {
      "/": { page: "/" },
    };
  },
};

module.exports = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  ...(process.env.DISABLE_SSR ? disableSSRMixin : {}),
})({ target: "serverless" });
