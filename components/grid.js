import ReactLoadingSkeleton from "react-loading-skeleton";
import { Grid as _Grid } from "theme-ui";

export default function Grid({ children, ...rest }) {
  return (
    <_Grid {...rest}>
      {children ||
        [...new Array(rest.columns)].map((_, i) => (
          <ReactLoadingSkeleton key={i} />
        ))}
    </_Grid>
  );
}
