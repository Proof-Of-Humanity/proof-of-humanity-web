import { base } from "@theme-ui/presets";
import { toTheme } from "@theme-ui/typography";
import { useMemo } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { ThemeProvider as _ThemeProvider, merge } from "theme-ui";
import typographyThemeSutro from "typography-theme-sutro";

export const typographyTheme = {
  ...typographyThemeSutro,
  bodyFontFamily: typographyThemeSutro.headerFontFamily,
  boldWeight: 600,
  googleFonts: [{ name: "Open Sans", styles: [300, "300i", 600, "600i"] }],
  headerWeight: 600,
};
export const theme = merge(merge(base, toTheme(typographyTheme)), {
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
    accentComplement: "#fdc9d3",
    highlight: "#009aff",
    muted: "#fffcf0",
    skeleton: "#ccc", // #eee
    skeletonHighlight: "#f5f5f5",
    success: "#00c851",
    warning: "#ffbb33",
    danger: "#ff4444",
    info: "#33b5e5",
    neutral: "#999",
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
      boxShadow: "0 1px 0 rgba(216, 213, 213, 0.5)",
      color: "background",
      fontFamily: "heading",
      lineHeight: "heading",
    },
    main: {
      backgroundColor: "background",
    },
    footer: {
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
      borderRadius: 3,
      color: "background",
      fontWeight: "bold",
      paddingLeft: 2,
      paddingRight: 5,
      paddingY: 1,
      ":hover": {
        opacity: 0.8,
      },
    },
    panel: {
      backgroundColor: "background",
      bordeRadius: 3,
      boxShadow: "0 6px 90px rgba(153, 153, 153, 0.25)",
      fontSize: 1,
      paddingX: 4,
      paddingY: 3,
    },
  },
  alert: {
    info: {
      borderColor: "info",
      borderRadius: 3,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 2,
      icon: {
        stroke: "info",
        path: { fill: "info" },
      },
      title: {
        color: "info",
        fontWeight: "bold",
      },
    },
    warning: {
      borderColor: "warning",
      borderRadius: 3,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 2,
      icon: {
        stroke: "warning",
        path: { fill: "warning" },
      },
      title: {
        color: "warning",
        fontWeight: "bold",
      },
    },

    muted: {
      borderColor: "skeleton",
      borderRadius: 3,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 2,
      icon: {
        stroke: "neutral",
        path: { fill: "neutral" },
      },
      title: {
        color: "neutral",
        fontWeight: "bold",
      },
    },
  },
  buttons: {
    primary: {
      borderRadius: 300,
      fontSize: 1,
      paddingX: 2,
      paddingY: 1,
      ":disabled:not([data-loading=true])": {
        backgroundColor: "skeleton",
        backgroundImage: "none !important",
      },
      ":hover": {
        opacity: 0.8,
      },
      ":focus": {
        outline: "none",
      },
      spinner: {
        "div > div": {
          backgroundColor: "background",
          borderColor: "background",
        },
      },
      svg: { fill: "background" },
    },
    outlined: {
      borderRadius: 300,
      border: "1px solid currentColor",
      color: "primary",
      backgroundColor: "transparent",
      backgroundImage: "none !important",
      fontSize: 1,
      paddingX: 2,
      paddingY: 1,
      ":disabled:not([data-loading=true])": {
        backgroundColor: "transparent",
        backgroundImage: "none !important",
      },
      ":hover": {
        opacity: 0.8,
      },
      ":focus": {
        outline: "none",
      },
      spinner: {
        "div > div": {
          backgroundColor: "transparent",
          borderColor: "primary",
        },
      },
      svg: { fill: "primary" },
    },
    secondary: {
      backgroundColor: "transparent",
      backgroundImage: "none !important",
      borderColor: "skeleton",
      borderStyle: "solid",
      borderWidth: 1,
      color: "text",
      fontSize: 1,
      paddingX: 2,
      paddingY: 1,
      ":disabled:not([data-loading=true])": {
        color: "skeleton",
      },
      ":hover": {
        opacity: 0.8,
      },
      ":focus,&.active": {
        borderColor: "primary",
        color: "primary",
        outline: "none",
      },
      spinner: {
        marginLeft: 1,
        "div > div": {
          backgroundColor: "text",
          borderColor: "text",
        },
      },
    },
    select: {
      backgroundColor: "background",
      backgroundImage: "none !important",
      borderColor: "skeleton",
      borderStyle: "solid",
      borderWidth: 1,
      color: "text",
      paddingLeft: 2,
      paddingRight: 3,
      paddingY: 1,
      ":hover": {
        opacity: 0.8,
      },
      ":focus": {
        opacity: 0.8,
        outline: "none",
      },
    },
  },
  cards: {
    primary: {
      backgroundColor: "background",
      borderRadius: 3,
      boxShadow: "0 6px 10px rgba(153, 153, 153, 0.25)",
      fontFamily: "heading",
      fontSize: 0,
    },
    muted: {
      backgroundColor: "muted",
      borderColor: "transparent",
      borderRadius: 12,
      borderStyle: "solid",
      borderWidth: 2,
      fontSize: 1,
      padding: 2,
      ":disabled": {
        backgroundColor: "skeleton",
      },
      ":focus": {
        outline: "none",
      },
      ":focus,:hover[role=button]:not([disabled]),&.active": {
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
    checkbox: { marginTop: 1 },
    field: {
      error: {
        color: "danger",
        fontSize: "0.75em",
        marginLeft: 1,
        marginTop: "0.5em",
        icon: {
          stroke: "danger",
          ":hover": { opacity: 0.8 },
          path: { fill: "danger" },
        },
      },
      info: {
        color: "info",
        fontSize: "0.75em",
        marginTop: "0.5em",
      },
    },
    fileUpload: {
      backgroundColor: "muted",
      borderColor: "primary",
      borderRadius: 3,
      borderStyle: "dashed",
      borderWidth: 1,
      padding: 2,
      paddingRight: 6,
    },
    input: {
      borderColor: "skeleton",
      paddingY: 1,
      ":focus": {
        borderColor: "highlight",
        outline: "none",
      },
      "&.error": {
        borderColor: "danger",
      },
    },
    label: {
      display: "flex",
      flexDirection: "column",
      fontSize: 1,
      marginBottom: 2,
      visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        width: "1px",
      },
    },
    mutedInput: { border: "none", paddingY: 1 },
    textarea: { borderColor: "skeleton", fontFamily: "inherit" },
  },
  form: {
    flex: 1,
    width: "100%",
  },
  images: {
    avatar: {
      borderRadius: 62,
      height: 124,
      objectFit: "contain",
      width: 124,
    },
    smallAvatar: {
      borderColor: "success",
      borderRadius: 64,
      borderStyle: "solid",
      borderWidth: 1,
      height: 32,
      objectFit: "contain",
      width: 32,
    },
    challengedSmallAvatar: {
      borderColor: "danger",
      borderRadius: 64,
      borderStyle: "solid",
      borderWidth: 1,
      height: 32,
      objectFit: "contain",
      width: 32,
    },
    thumbnail: {
      borderRadius: 3,
      width: 200,
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
  select: {
    list: {
      backgroundColor: "background",
      borderRadius: 3,
      listStyle: "none",
      padding: 0,
      zIndex: 1000,
      ":focus": { outline: "none" },
      item: {
        paddingX: 2,
        paddingY: 1,
      },
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
        color: "primary",
      },
    },
  },
  text: {
    buttons: {
      primary: {
        justifyContent: "space-evenly",
      },
      secondary: {
        justifyContent: "space-evenly",
      },
      select: {
        justifyContent: "flex-start",
        paddingRight: 1,
      },
    },
    clipped: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    multiClipped: {
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: " 2 ",
      display: "-webkit-box",
      overflow: "hidden",
    },
  },
  video: {
    responsive: { paddingTop: "56.25%" },
    thumbnail: {
      height: "200px !important",
      width: "200px !important",
    },
  },
});
export const klerosTheme = merge(theme, {
  // Colors
  colors: {
    primary: "#009aff",
    secondary: "#009aff",
    accent: "#4d00b4",
    accentComplement: "#4d00b4",
    muted: "#fbf9fe",
  },

  // Components
  buttons: {
    primary: {
      borderRadius: 3,
    },
  },
});
export default function ThemeProvider({ theme: _theme, children }) {
  const mergedTheme = useMemo(
    () => (_theme ? merge(theme, _theme) : theme),
    [_theme]
  );
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
