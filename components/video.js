import ReactLoadingSkeleton from "react-loading-skeleton";
import ReactPlayerLazy from "react-player/lazy";
import { Box } from "theme-ui";

export default function Video({
  variant = "responsive",
  sx,
  controls = true,
  ...rest
}) {
  return (
    <Box variant={`video.${variant}`} sx={{ position: "relative", ...sx }}>
      <Box
        as={(props) =>
          rest.url ? (
            <ReactPlayerLazy controls={controls} {...rest} {...props} />
          ) : (
            <ReactLoadingSkeleton {...rest} {...props} />
          )
        }
        sx={{
          height: "100% !important",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100% !important",
        }}
      />
    </Box>
  );
}
