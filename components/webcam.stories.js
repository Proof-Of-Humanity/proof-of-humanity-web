import Button from "./button";
import Webcam from "./webcam";

const metadata = {
  title: "Inputs/Webcam",
  component: Webcam,
  argTypes: {
    trigger: {
      type: { name: "object", required: true },
      description: "The element to click to open the webcam.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
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
    videoConstraints: {
      type: "object",
      description:
        "[MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints) video constraints.",
      table: {
        type: {
          summary: "object",
        },
      },
      defaultValue: { height: 360, width: 360 },
    },
    mirrored: {
      type: "boolean",
      description: "Mirrors the camera.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    photo: {
      type: "boolean",
      description: "Allows using the webcam to capture photos.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    onChange: {
      type: "function",
      description: "The webcam's onChange handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    video: {
      type: "boolean",
      description: "Allows using the webcam to record videos.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    "...rest": {
      type: "object",
      description:
        "[React Webcam](https://github.com/mozmorris/react-webcam) props.",
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
  return <Webcam {...args} />;
}

export const Default = Template.bind();
Default.args = {
  trigger: <Button variant="secondary">Use Webcam</Button>,
};
