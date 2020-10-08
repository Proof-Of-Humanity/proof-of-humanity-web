import { forwardRef } from "react";
import { Label as _Label } from "theme-ui";

const Label = forwardRef((props, ref) => <_Label ref={ref} {...props} />);
Label.displayName = "Label";
export default Label;
