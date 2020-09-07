import { forwardRef } from "react";
import { Link as _Link } from "theme-ui";

const Link = forwardRef(({ newTab: tab, ...rest }, ref) => (
  <_Link
    {...(tab && { target: "_blank", rel: "noopener noreferrer" })}
    {...rest}
    ref={ref}
  />
));
Link.displayName = "Link";
export default Link;
