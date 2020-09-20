import {
  ScrollArea as _ScrollArea,
  ScrollTo as _ScrollTo,
} from "react-scroll-to";
import { Box } from "theme-ui";

export default function ScrollTo(props) {
  return <Box as={_ScrollTo} {...props} />;
}

export function ScrollArea(props) {
  return <Box as={_ScrollArea} {...props} />;
}
