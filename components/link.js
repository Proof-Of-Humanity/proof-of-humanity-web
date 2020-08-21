import { forwardRef } from "react";
import { Link as _Link } from "theme-ui";

const Link = forwardRef((props, ref) => <_Link {...props} ref={ref} />);
Link.displayName = "Link";
export default Link;
