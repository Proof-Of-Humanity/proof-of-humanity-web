import { SVG } from "@kleros/components";

export default function Ether({ size = 16, ...rest }) {
  return (
    <SVG
      width={size}
      height={size}
      viewBox="0 0 11 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M10.684 9.16875L5.34375 12.4313L0 9.16875L5.34375 0L10.684 9.16875ZM5.34375 13.4789L0 10.2164L5.34375 18L10.6875 10.2164L5.34375 13.4789Z"
        fill="black"
      />
    </SVG>
  );
}
