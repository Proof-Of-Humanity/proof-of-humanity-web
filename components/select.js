import { alpha } from "@theme-ui/color";
import { useSelect } from "downshift";
import { useRef } from "react";
import { usePopper } from "react-popper";
import { animated, useSpring } from "react-spring";
import useMeasure from "react-use-measure";
import { Box } from "theme-ui";

import Button from "./button";
import Label from "./label";
import List, { ListItem } from "./list";

const popperOptions = {
  modifiers: [
    {
      name: "sameWidth",
      enabled: true,
      phase: "beforeWrite",
      fn({ state }) {
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      requires: ["computeStyles"],
      effect: ({ state }) => {
        state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
      },
    },
    {
      name: "offset",
      options: {
        offset: [0, 8],
      },
    },
    {
      name: "preventOverflow",
    },
  ],
};
function Icon({ item }) {
  return item.Icon ? (
    <item.Icon
      sx={{
        marginRight: 1,
        stroke: item.color,
        path: { fill: item.color },
      }}
    />
  ) : null;
}
export default function Select({ items, onChange, value, label, ...rest }) {
  const {
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    selectedItem,
  } = useSelect({
    items,
    onSelectedItemChange({ selectedItem: _selectedItem }) {
      onChange(_selectedItem);
    },
    initialSelectedItem: value,
  });

  const toggleButtonRef = useRef();
  const menuRef = useRef();
  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(toggleButtonRef.current, menuRef.current, popperOptions);

  const border = isOpen ? "borderBottom" : "borderTop";

  const [measureMenuRef, { height }] = useMeasure();
  const animatedMenuStyle = useSpring({
    height: isOpen ? height : 0,
    opacity: isOpen ? 1 : 0,
    overflow: "hidden",
  });
  return (
    <Box {...rest}>
      <Label
        {...getLabelProps({
          variant: "forms.label.visuallyHidden",
        })}
      >
        {label}
      </Label>
      <Button
        {...getToggleButtonProps({
          ref: toggleButtonRef,
          variant: "select",
          sx: {
            width: "100%",
            "::after": {
              [border]: "8px solid",
              [`${border}Color`]: "skeleton",
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              content: '""',
              position: "absolute",
              right: 2,
              top: "50%",
              transform: "translateY(-50%)",
            },
          },
        })}
      >
        <Icon item={selectedItem} />
        {String(selectedItem)}
      </Button>
      <List
        {...getMenuProps({
          ref: menuRef,
          style: popperStyle,
          variant: "select.list",
          sx: {
            boxShadow(theme) {
              return `0 6px 24px ${alpha("primary", 0.25)(theme)}`;
            },
          },
          ...popperAttributes,
        })}
      >
        <animated.div style={animatedMenuStyle}>
          <Box ref={measureMenuRef}>
            {items.map((item, index) => (
              <ListItem
                key={`${item}-${index}`}
                {...getItemProps({
                  variant: "select.list.item",
                  sx: {
                    backgroundColor:
                      highlightedIndex === index && alpha("highlight", 0.06),
                    ...(selectedItem === item && {
                      borderLeftColor: "highlight",
                      borderLeftStyle: "solid",
                      borderLeftWidth: 3,
                    }),
                  },
                  item,
                  index,
                })}
              >
                <Icon item={item} />
                {String(item)}
              </ListItem>
            ))}
          </Box>
        </animated.div>
      </List>
    </Box>
  );
}
