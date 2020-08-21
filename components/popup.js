import ReactJSPopup from "reactjs-popup";

export default function Popup({ contentStyle, ...rest }) {
  return (
    <ReactJSPopup
      contentStyle={{ border: "none", borderRadius: 3, ...contentStyle }}
      {...rest}
      arrow={false}
    />
  );
}
