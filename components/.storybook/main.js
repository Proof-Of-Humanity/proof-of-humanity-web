const path = require("path");

module.exports = {
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-essentials",
    "storybook-addon-theme-playground/dist",
    "storybook-mobile",
  ],
  stories: ["../*.stories.@(js|mdx)"],
  webpackFinal(config) {
    config.module.rules.push({
      include: (name) => !name.includes("relay"),
      resolve: {
        alias: {
          "core-js/modules": "@storybook/core/node_modules/core-js/modules",
          "@kleros/components": path.resolve(__dirname, ".."),
          "@kleros/icons": path.resolve(__dirname, "../../icons"),
        },
      },
    });
    return config;
  },
};
