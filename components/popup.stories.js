import { Button } from "theme-ui";

import Popup from "./popup";

const metadata = {
  title: "Components/Popup",
  component: Popup,
  argTypes: {
    arrow: {
      type: "boolean",
      description: "Whether to show an arrow or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: false,
    },
    sx: {
      type: "object",
      description: "Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
    "...rest": {
      type: "object",
      description: "[Reactjs-popup](https://react-popup.elazizi.com) props.",
      table: {
        type: {
          summary: "object",
        },
      },
      control: null,
    },
  },
};
export default metadata;

function Template(args) {
  return (
    <Popup trigger={<Button>Trigger</Button>} {...args}>
      Content
    </Popup>
  );
}

export const Tooltip = Template.bind();
Tooltip.args = {};

export const Modal = Template.bind();
Modal.args = {
  modal: true,
};
