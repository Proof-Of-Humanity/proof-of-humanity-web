import { forwardRef } from "react";
import { Link as _Link } from "theme-ui";

const Link = forwardRef(({ newTab: tab, ...rest }, ref) => (
  <_Link
    ref={ref}
    onClick={(event) => event.stopPropagation()}
    {...(tab && { target: "_blank", rel: "noopener noreferrer" })}
    {...rest}
  />
));
Link.displayName = "Link";
export default Link;
