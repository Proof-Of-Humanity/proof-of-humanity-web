import { Box, Select as _Select } from "theme-ui";

export default function Select(props) {
  return <_Select {...props} />;
}

export function Option(props) {
  return <Box as="option" {...props} />;
}
