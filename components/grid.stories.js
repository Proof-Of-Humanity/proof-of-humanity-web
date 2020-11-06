import Card from "./card";
import Grid from "./grid";

const metadata = {
  title: "Components/Grid",
  component: Grid,
  argTypes: {
    children: {
      type: "string",
      description: "The elements to be rendered as cells.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    gap: {
      type: { name: "number", required: true },
      description: "The column gap.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    columns: {
      type: { name: "number|array", required: true },
      description:
        "The number of columns or a list of the number of columns at different breakpoints.",
      table: {
        type: {
          summary: "number|array",
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
    "...rest": {
      type: "object",
      description: "The grid's additional props.",
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
  return <Grid {...args} />;
}

export const Basic = Template.bind();
Basic.args = {
  children: [
    <Card key="A">A</Card>,
    <Card key="B">B</Card>,
    <Card key="C">C</Card>,
    <Card key="D">D</Card>,
  ],
  gap: 2,
  columns: 2,
};

export const Responsive = Template.bind();
Responsive.args = {
  children: [
    <Card key="A">A</Card>,
    <Card key="B">B</Card>,
    <Card key="C">C</Card>,
    <Card key="D">D</Card>,
  ],
  gap: 2,
  columns: [1, 2, 3, 4],
};

export const Loading = Template.bind();
Loading.args = {
  gap: 2,
  columns: 2,
  sx: { width: 300 },
};
