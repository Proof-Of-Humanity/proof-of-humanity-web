import { SVG } from "@kleros/components";

function Camera(props) {
  return (
    <SVG
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc"
      focusable="false"
      aria-hidden="true"
      height={props.height}
      width={props.width}
      fill={props.fill}
      data-testid="PhotoCameraIcon"
    >
      <circle cx={12} cy={12} r={3.2} />
      <path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </SVG>
  );
}
export default Camera;
