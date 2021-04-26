const disableSSRMixin = {
  exportTrailingSlash: true,
  exportPathMap() {
    return {
      "/": { page: "/" },
    };
  },
};

console.warn(">>>>>>>>>>>>>", process.env.DISABLE_SSR);

module.exports = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  ...(process.env.DISABLE_SSR === "true" ? disableSSRMixin : {}),
})({ target: "serverless" });
