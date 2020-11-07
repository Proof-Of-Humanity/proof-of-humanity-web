import Pagination from "./pagination";

const metadata = {
  title: "Components/Pagination",
  component: Pagination,
  argTypes: {
    sx: {
      type: "object",
      description: "Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
    initialPage: {
      type: "number",
      description: "The initial page.",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: 1,
    },
    numberOfPages: {
      type: "number",
      description: "The total number of pages.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    maxButtons: {
      type: "number",
      description: "The maximum number of buttons to render at once.",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: 5,
    },
    onChange: {
      type: "function",
      description: "The onChange handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    "...rest": {
      type: "object",
      description: "The pagination element's additional props.",
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
  return <Pagination {...args} />;
}

export const Basic = Template.bind();
Basic.args = {
  numberOfPages: 5,
};

export const MorePagesThanButtons = Template.bind();
MorePagesThanButtons.args = {
  numberOfPages: 10,
};
