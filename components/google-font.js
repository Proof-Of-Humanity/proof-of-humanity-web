import React from "react";

export default function GoogleFont(props) {
  let fontsString = "";
  if (props.typography.options.googleFonts) {
    const fonts = props.typography.options.googleFonts.map((font) => {
      let string = "";
      string += font.name.split(" ").join("+");
      string += ":";
      string += font.styles.join(",");

      return string;
    });

    fontsString = fonts.join("|");

    if (fontsString)
      return React.createElement("link", {
        href: `//fonts.googleapis.com/css?family=${fontsString}`,
        rel: "stylesheet",
        type: "text/css",
        crossOrigin: "anonymous",
      });

    return null;
  }
}
