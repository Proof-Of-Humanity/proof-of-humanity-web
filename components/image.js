import { forwardRef } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import { Image as _Image, useThemeUI } from "theme-ui";

const Image = forwardRef((props, ref) => {
  const { theme } = useThemeUI();
  const { width, height } = theme.images?.[props.variant] ?? {};

  return props.src ? (
    <_Image ref={ref} {...props} />
  ) : (
    <ReactLoadingSkeleton
      circle={props.variant === "avatar"}
      {...props}
      width={props.width || width}
      height={props.height || height}
    />
  );
});

Image.displayName = "Image";

export default Image;
