import {
  AccordionItemState,
  Accordion as _Accordion,
  AccordionItem as _AccordionItem,
  AccordionItemButton as _AccordionItemButton,
  AccordionItemHeading as _AccordionItemHeading,
  AccordionItemPanel as _AccordionItemPanel,
} from "react-accessible-accordion";
import { animated, useSpring } from "react-spring";
import useMeasure from "react-use-measure";
import { Box } from "theme-ui";

export default function Accordion({
  allowMultipleExpanded = true,
  allowZeroExpanded = true,
  ...rest
}) {
  return (
    <Box
      as={(props) => (
        <_Accordion
          allowMultipleExpanded={allowMultipleExpanded}
          allowZeroExpanded={allowZeroExpanded}
          {...rest}
          {...props}
        />
      )}
      {...rest}
    />
  );
}

export function AccordionItem(props) {
  return <Box as={_AccordionItem} variant="accordion.item" {...props} />;
}

export function AccordionItemHeading({ children, rest }) {
  return (
    <Box as={_AccordionItemHeading} {...rest}>
      <Box as={_AccordionItemButton} variant="accordion.heading">
        {children}
      </Box>
    </Box>
  );
}

function AnimatedAccordionItemPanel({ expanded, ...rest }) {
  const [measureRef, { height }] = useMeasure();
  const animatedStyle = useSpring({
    height: expanded ? height : 0,
    overflow: "hidden",
  });
  return (
    <animated.div style={animatedStyle}>
      <Box ref={measureRef}>
        <Box as={_AccordionItemPanel} variant="accordion.panel" {...rest} />
      </Box>
    </animated.div>
  );
}
export function AccordionItemPanel(props) {
  return (
    <AccordionItemState>
      {({ expanded }) => (
        <AnimatedAccordionItemPanel expanded={expanded} {...props} />
      )}
    </AccordionItemState>
  );
}
