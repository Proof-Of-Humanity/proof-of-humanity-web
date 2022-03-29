import { SVG } from "@kleros/components";

function Fullscreen(props) {
  return (
    <SVG
      {...props}
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="FullscreenIcon"
    >
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </SVG>
  );
}
export default Fullscreen;
