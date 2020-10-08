import { forwardRef } from "react";
import { Box } from "theme-ui";

const List = forwardRef((props, ref) => <Box ref={ref} as="ul" {...props} />);
List.displayName = "List";
export default List;

export const ListItem = forwardRef((props, ref) => (
  <Box ref={ref} as="li" {...props} />
));
ListItem.displayName = "ListItem";
