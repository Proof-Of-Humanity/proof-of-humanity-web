import { SVG } from "@kleros/components";

export default function Dot(props) {
  return (
    <SVG viewBox="0 0 7 7" {...props}>
      <circle cx="3.5" cy="3.5" r="3.5" />
    </SVG>
  );
}
