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

import SVG from "./svg";

const accColor = "#7dffb5";

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

function Rectangle(props) {
  return (
    <animated.path
      d="M22.7075 10.7517L22.7075 13.16L13.1599 13.16H10.7517L1.20411 13.16L1.20411 10.7517H10.7517H13.1599H22.7075Z"
      fill="white"
      {...props}
    />
  );
}
function AnimatedAccordionItemHeading({ expanded, children, ...rest }) {
  const animatedRectangleAStyle = useSpring({
    opacity: expanded ? 0 : 1,
    scaleX: expanded ? 0 : 1,
    transformOrigin: "center",
  });
  const animatedRectangleBStyle = useSpring({
    rotate: expanded ? 0 : -90,
    transformOrigin: "center",
  });

  return (
    <Box as={_AccordionItemHeading} {...rest}>
      <Box
        as={_AccordionItemButton}
        variant="accordion.heading"
        sx={{
          backgroundImage: `linear-gradient(90.13deg, var(--theme-ui-colors-accent, ${accColor}) 49.89%, var(--theme-ui-colors-accentComplement, #517aea) 93.37%)`,
          boxShadow: "inset 2px 2px 16px #0000009e",
          position: "relative",
          borderRadius: "30px",
          padding: "16px 128px 16px 32px",
          cursor: "pointer",
        }}
      >
        {children}
        <SVG
          sx={{
            position: "absolute",
            right: 3,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          height={24}
          viewBox="0 0 24 24"
          width={24}
        >
          <Rectangle
            style={{
              ...animatedRectangleAStyle,
              transform: animatedRectangleAStyle.scaleX.interpolate(
                (scaleX) => `scaleX(${scaleX})`
              ),
            }}
          />
          <Rectangle
            style={{
              ...animatedRectangleBStyle,
              transform: animatedRectangleBStyle.rotate.interpolate(
                (rotate) => `rotate(${rotate}deg)`
              ),
            }}
          />
        </SVG>
      </Box>
    </Box>
  );
}
export function AccordionItemHeading(props) {
  return (
    <AccordionItemState>
      {({ expanded }) => (
        <AnimatedAccordionItemHeading expanded={expanded} {...props} />
      )}
    </AccordionItemState>
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
