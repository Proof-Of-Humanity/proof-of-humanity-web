import Video from "./video";

const metadata = {
  title: "Components/Video",
  component: Video,
  argTypes: {
    variant: {
      type: "string",
      description: "The video's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "radio",
        options: ["responsive", "thumbnail"],
      },
      defaultValue: "responsive",
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
    controls: {
      type: "boolean",
      description: "Whether to render controls or not.",
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
        "[React Player](https://github.com/CookPete/react-player) props.",
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
  return <Video {...args} />;
}

export const Responsive = Template.bind();
Responsive.args = {
  sx: { width: "80%" },
  url:
    "https://ipfs.kleros.io/ipfs/QmNW9RDNSLLTdk5GVpAkJSMigqsk7rJFTeT1ptCRrtoTRy/video.mp4",
};

export const ResponsiveLoading = Template.bind();
ResponsiveLoading.args = {
  sx: { width: "80%" },
};

export const Thumbnail = Template.bind();
Thumbnail.args = {
  url:
    "https://ipfs.kleros.io/ipfs/QmNW9RDNSLLTdk5GVpAkJSMigqsk7rJFTeT1ptCRrtoTRy/video.mp4",
  variant: "thumbnail",
};

export const ThumbnailLoading = Template.bind();
ThumbnailLoading.args = {
  variant: "thumbnail",
};
