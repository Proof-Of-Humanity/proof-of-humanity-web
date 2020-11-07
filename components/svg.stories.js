import SVG from "./svg";

const metadata = {
  title: "Components/SVG",
  component: SVG,
  argTypes: {
    fill: {
      type: "string",
      description: "The SVG's fill color.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "none",
    },
    size: {
      type: "number",
      description: "Shortcut for the SVG's width and height.",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: 16,
    },
    xmlns: {
      type: "string",
      description: "The SVG's XMLNS link.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "http://www.w3.org/2000/svg",
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
      description: "The SVG's additional props.",
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
    <SVG {...args}>
      <path
        d="M6.11359 13.4482L0.263593 7.59825C-0.0878642 7.24679 -0.0878642 6.67694 0.263593 6.32545L1.53635 5.05266C1.88781 4.70116 2.45769 4.70116 2.80915 5.05266L6.74999 8.99346L15.1908 0.552655C15.5423 0.201198 16.1122 0.201198 16.4636 0.552655L17.7364 1.82545C18.0878 2.17691 18.0878 2.74676 17.7364 3.09825L7.38639 13.4483C7.0349 13.7997 6.46505 13.7997 6.11359 13.4482Z"
        fill="black"
      />
    </SVG>
  );
}

export const Default = Template.bind();
Default.args = {};
