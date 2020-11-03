import { GoogleFont } from "react-typography";
import { withThemePlayground } from "storybook-addon-theme-playground";
import { Flex } from "theme-ui";

import ThemeProvider, { theme, typographyTheme } from "../theme-provider";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    disable: true,
  },
  layout: "centered",
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
    theme,
  }),
];
