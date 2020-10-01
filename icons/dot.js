import { SVG } from "@kleros/components";

export default function Dot({ size = 16, ...rest }) {
  return (
    <SVG
      width={size}
      height={size}
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle cx="3.5" cy="3.5" r="3.5" fill="#00c42b" />
    </SVG>
  );
}
