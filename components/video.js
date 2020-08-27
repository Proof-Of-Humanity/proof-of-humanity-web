import ReactLoadingSkeleton from "react-loading-skeleton";
import ReactPlayerLazy from "react-player/lazy";
import { Box } from "theme-ui";

export default function Video({ controls = true, sx, ...rest }) {
  return (
    <Box sx={{ paddingTop: "56.25%", position: "relative" }}>
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
          ...sx,
        }}
      />
    </Box>
  );
}
