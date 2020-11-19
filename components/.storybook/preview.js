import { GoogleFont } from "react-typography";
import { withThemePlayground } from "storybook-addon-theme-playground";
import { Flex } from "theme-ui";

import ThemeProvider, {
  klerosTheme,
  theme,
  typographyTheme,
} from "../theme-provider";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    disable: true,
  },
  options: {
    storySort: {
      order: [
        "Guides",
        ["Getting Started", "Working With Next.js", "Data & Routing"],
        "Components",
        "Inputs",
        "Providers",
        "Web3",
        "Arbitration",
        "Widgets",
        "SDKs",
      ],
    },
  },
};

const typography = { options: typographyTheme };
export const decorators = [
  (Story) => (
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <GoogleFont typography={typography} />
      <Story />
    </Flex>
  ),
  withThemePlayground({
    provider: ThemeProvider,
    theme: [
      { name: "Kleros", theme: klerosTheme },
      { name: "Proof Of Humanity", theme },
    ],
  }),
];
