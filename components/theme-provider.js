import { base } from "@theme-ui/presets";
import { toTheme } from "@theme-ui/typography";
import { useMemo } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { ThemeProvider as _ThemeProvider, merge } from "theme-ui";
import typographyThemeSutro from "typography-theme-sutro";

export const typographyTheme = {
  ...typographyThemeSutro,
  boldWeight: 600,
  googleFonts: [
    { name: "Open Sans", styles: [300, "300i", 600, "600i"] },
    { name: "Merriweather", styles: [300, "300i", 600, "600i"] },
  ],
  headerWeight: 600,
};
const theme = merge(merge(base, toTheme(typographyTheme)), {
  // Settings
  initialColorModeName: "light",
  useColorSchemeMediaQuery: true,

  // Colors
  colors: {
    text: "#000",
    background: "#fffffa",
    primary: "#ff9900",
    secondary: "#ffc700",
    accent: "#ffb978",
    highlight: "#009aff",
    muted: "#fffcf0",
    skeleton: "#eee",
    skeletonHighlight: "#f5f5f5",
  },

  // Styles
  styles: {
    hr: {
      color: "skeleton",
    },
  },

  // Layout
  layout: {
    header: {
      backgroundColor: "accent",
      color: "background",
      fontFamily: "heading",
      lineHeight: "heading",
    },
    main: {
      backgroundColor: "background",
      padding: 3,
    },
    footer: {
      backgroundColor: "accent",
      color: "background",
      fontFamily: "heading",
      lineHeight: "heading",
    },
  },

  // Components
  accordion: {
    item: {
      marginY: 2,
    },
    heading: {
      backgroundColor: "accent",
      borderRadius: 3,
      color: "background",
      fontWeight: "bold",
      paddingX: 2,
      paddingY: 1,
    },
    panel: {
      backgroundColor: "background",
      bordeRadius: 3,
      boxShadow: "0 6px 90px rgba(255, 153, 0, 0.25)",
      fontSize: 1,
      paddingX: 4,
      paddingY: 3,
    },
  },
  buttons: {
    primary: {
      borderRadius: 300,
      fontSize: 1,
      padding: 2,
      "&:disabled": {
        backgroundColor: "skeleton",
      },
    },
  },
  cards: {
    primary: {
      borderRadius: 3,
      boxShadow: "0 6px 90px rgba(255, 153, 0, 0.25)",
      fontFamily: "heading",
      fontSize: 0,
      "&:hover": {
        boxShadow: "0 6px 20px rgba(255, 153, 0, 0.25)",
      },
    },
    muted: {
      backgroundColor: "muted",
      borderColor: "transparent",
      borderRadius: 12,
      borderStyle: "solid",
      borderWidth: 2,
      fontSize: 1,
      padding: 2,
      "&:hover": {
        borderColor: "primary",
      },
    },
  },
  card: {
    header: {
      backgroundColor: "muted",
      borderRadius: "3px 3px 0 0",
      justifyContent: "space-between",
      paddingX: 2,
      paddingY: 1,
    },
    main: {
      padding: 3,
    },
    footer: {
      backgroundColor: "muted",
      borderRadius: "0 0 3px 3px",
      justifyContent: "flex-end",
      padding: 1,
    },
  },
  forms: {
    input: { border: "none" },
    select: {
      borderColor: "skeleton",
      paddingRight: 3,
      paddingY: 1,
    },
  },
  images: {
    avatar: {
      borderRadius: 62,
      height: 124,
      width: 124,
    },
  },
  links: {
    navigation: {
      color: "background",
      fontWeight: "bold",
      textDecoration: "none",
    },
    unstyled: {
      color: "inherit",
      textDecoration: "none",
    },
  },
  tabs: {
    tabList: {
      fontSize: 1,
      marginBottom: 3,
      marginTop: 2,
      padding: 0,
    },
    tab: {
      borderBottomColor: "skeleton",
      borderBottomStyle: "solid",
      borderBottomWidth: 1,
      padding: 1,
      textAlign: "center",
      "&[aria-selected=true]": {
        borderBottomColor: "primary",
        borderBottomWidth: 2,
        color: "primary",
      },
    },
  },
  text: {
    clipped: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
});
export default function ThemeProvider({ theme: _theme, children }) {
  const mergedTheme = useMemo(() => (_theme ? merge(theme, _theme) : theme), [
    _theme,
  ]);
  return (
    <_ThemeProvider theme={mergedTheme}>
      <SkeletonTheme
        color={mergedTheme.colors.skeleton}
        highlightColor={mergedTheme.colors.skeletonHighlight}
      >
        {children}
      </SkeletonTheme>
    </_ThemeProvider>
  );
}
