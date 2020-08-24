import { SVG } from "@kleros/components";

export default function Blog({ size = 16 }) {
  return (
    <SVG
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.152344"
        y="0.152344"
        width="9.81887"
        height="3.4366"
        rx="1.5"
        fill="white"
      />
      <rect
        x="13.4077"
        y="0.152344"
        width="3.4366"
        height="3.4366"
        rx="1.5"
        fill="white"
      />
      <rect
        x="9.97119"
        y="13.4082"
        width="6.87321"
        height="3.4366"
        rx="1.5"
        fill="white"
      />
      <rect
        x="0.152344"
        y="13.4082"
        width="6.87321"
        height="3.4366"
        rx="1.5"
        fill="white"
      />
      <rect
        x="0.152344"
        y="6.53516"
        width="16.6921"
        height="3.4366"
        rx="1.5"
        fill="white"
      />
    </SVG>
  );
}
