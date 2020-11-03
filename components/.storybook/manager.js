import { addons } from "@storybook/addons";
import { create } from "@storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandImage: "/kleros-logo-horizontal.png",
    brandTitle: "Kleros Components",
    brandUrl: "https://kleros.io",
  }),
});
