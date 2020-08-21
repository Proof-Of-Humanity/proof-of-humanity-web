import { Box } from "theme-ui";

export default function List(props) {
  return <Box as="ul" {...props} />;
}

export function ListItem(props) {
  return <Box as="li" {...props} />;
}
