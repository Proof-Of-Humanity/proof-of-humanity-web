import React from 'react';

export default function GoogleFont(props) {
  var fontsStr = "";
  if (props.typography.options.googleFonts) {
    var fonts = props.typography.options.googleFonts.map(function (font) {
      var str = "";
      str += font.name.split(" ").join("+");
      str += ":";
      str += font.styles.join(",");

      return str;
    });

    fontsStr = fonts.join("|");

    if (fontsStr) {
      return React.createElement("link", {
        href: "//fonts.googleapis.com/css?family=" + fontsStr,
        rel: "stylesheet",
        type: "text/css",
        crossOrigin: 'anonymous'
      });
    }
    return null;
  }
};