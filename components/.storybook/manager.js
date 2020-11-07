import { addons } from "@storybook/addons";
import { create } from "@storybook/theming";

addons.setConfig({
  theme: create({
    base: "dark",
    brandImage: "/kleros-logo-full-white.png",
    brandTitle: "Kleros Components",
    brandUrl: "https://kleros.io",
  }),
});
