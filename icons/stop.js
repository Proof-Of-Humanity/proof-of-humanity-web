import { SVG } from "@kleros/components";

function Stop(props) {
  return (
    <SVG
      class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc"
      {...props}
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="StopCircleIcon"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 14H8V8h8v8z" />
    </SVG>
  );
}
export default Stop;
