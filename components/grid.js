import ReactLoadingSkeleton from "react-loading-skeleton";
import { Grid as _Grid } from "theme-ui";

export default function Grid({ children, rows, ...rest }) {
  return (
    <_Grid {...rest}>
      {children ||
        [
          ...new Array(
            (rest.columns[rest.columns.length - 1] || rest.columns) *
              (rows || 1)
          ),
        ].map((_, i) => <ReactLoadingSkeleton key={i} height="100%" />)}
    </_Grid>
  );
}
