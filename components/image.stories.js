import Image from "./image";

const metadata = {
  title: "Components/Image",
  component: Image,
  argTypes: {
    variant: {
      type: "string",
      description: "The image's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "radio",
        options: [undefined, "avatar", "thumbnail"],
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
      description: "The image's additional props.",
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
  return <Image {...args} />;
}

export const Default = Template.bind();
Default.args = {
  src:
    "https://ipfs.kleros.io/ipfs/QmWjb8GBPwdFZ5wctyGfExRt1ydaLUy8ywb18jYq9LuLkV/pepe.png",
  width: 300,
};

export const Avatar = Template.bind();
Avatar.args = {
  variant: "avatar",
  src:
    "https://ipfs.kleros.io/ipfs/QmWjb8GBPwdFZ5wctyGfExRt1ydaLUy8ywb18jYq9LuLkV/pepe.png",
  width: 300,
};

export const Thumbnail = Template.bind();
Thumbnail.args = {
  variant: "thumbnail",
  src:
    "https://ipfs.kleros.io/ipfs/QmWjb8GBPwdFZ5wctyGfExRt1ydaLUy8ywb18jYq9LuLkV/pepe.png",
  width: 300,
};
