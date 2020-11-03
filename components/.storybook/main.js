module.exports = {
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-essentials",
    "storybook-addon-theme-playground/dist",
    "storybook-mobile",
  ],
  stories: ["../*.stories.@(js|mdx)"],
  webpackFinal(config) {
    config.resolve.alias["core-js/modules"] =
      "@storybook/core/node_modules/core-js/modules";
    return config;
  },
};
