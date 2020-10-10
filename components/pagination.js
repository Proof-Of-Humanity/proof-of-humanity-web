import { usePagination } from "react-pagination-hook";
import { Flex } from "theme-ui";

import Button from "./button";

export default function Pagination({
  sx,
  initialPage = 1,
  numberOfPages,
  maxButtons = 5,
  onChange,
  ...rest
}) {
  const { visiblePieces, activePage, goToPage } = usePagination({
    initialPage,
    numberOfPages,
    maxButtons,
  });
  return (
    <Flex sx={{ justifyContent: "center", ...sx }} {...rest}>
      {visiblePieces.map(({ type, pageNumber, isDisabled }, index) => {
        const button = {};
        switch (type) {
          case "previous":
            button.children = "‹";
            break;
          case "page-number":
            if (activePage === pageNumber) button.activeClassName = "active";
            button.children = pageNumber;
            break;
          case "ellipsis":
            isDisabled = true;
            button.children = "…";
            break;
          case "next":
            button.children = "›";
        }
        return (
          <Button
            key={index}
            className={button.activeClassName}
            variant="secondary"
            sx={{ marginRight: 1 }}
            disabled={isDisabled}
            onClick={() => {
              goToPage(pageNumber);
              onChange(pageNumber);
            }}
          >
            {button.children}
          </Button>
        );
      })}
    </Flex>
  );
}
