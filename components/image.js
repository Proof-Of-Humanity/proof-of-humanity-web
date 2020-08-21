import ReactLoadingSkeleton from "react-loading-skeleton";
import { Image as _Image, useThemeUI } from "theme-ui";

export default function Image(props) {
  const {
    theme: {
      images: { [props.variant]: { width, height } = {} },
    },
  } = useThemeUI();
  return props.src ? (
    <_Image {...props} />
  ) : (
    <ReactLoadingSkeleton
      circle={props.variant === "avatar"}
      {...props}
      width={props.width || width}
      height={props.height || height}
    />
  );
}
