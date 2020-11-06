import { useState } from "react";

import FileUpload from "./file-upload";

const metadata = {
  title: "Inputs/FileUpload",
  component: FileUpload,
  argTypes: {
    value: {
      type: "object|array",
      description:
        "A single [File object](https://developer.mozilla.org/en-US/docs/Web/API/File) or a list of them for `multiple` mode.",
      table: {
        type: {
          summary: "object|array",
        },
      },
    },
    onChange: {
      type: "function",
      description: "The uploader's onChange handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    name: {
      type: "string",
      description: "The input's name.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    accept: {
      type: "string",
      description:
        "Comma separated list of accepted [mime types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    maxSize: {
      type: "number",
      description: "Max size of each file in MB.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    multiple: {
      type: "boolean",
      description: "Allows uploading multiple files.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: false,
    },
    onBlur: {
      type: "function",
      description: "The uploader's onBlur handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    placeholder: {
      type: "string",
      description: "The uploader's placeholder.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: null,
    },
    photo: {
      type: "boolean",
      description: "Allows using the webcam to capture photos.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: false,
    },
    video: {
      type: "boolean",
      description: "Allows using the webcam to record videos.",
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
      description: "The uploader's additional props.",
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

function Template({ value: _value, onChange: _onChange, ...args }) {
  const [value, setValue] = useState(_value);
  return (
    <FileUpload
      value={value}
      onChange={(event) => {
        _onChange(event);
        setValue(event.target.value);
      }}
      {...args}
    />
  );
}

export const Photo = Template.bind();
Photo.args = { accept: "image/png, image/jpeg", maxSize: 1 };

export const Photos = Template.bind();
Photos.args = { accept: "image/png, image/jpeg", maxSize: 1, multiple: true };

export const PhotosWithWebcam = Template.bind();
PhotosWithWebcam.args = {
  accept: "image/png, image/jpeg",
  maxSize: 1,
  multiple: true,
  photo: true,
};

export const Video = Template.bind();
Video.args = { accept: "video/webm, video/mp4", maxSize: 1 };

export const Videos = Template.bind();
Videos.args = { accept: "video/webm, video/mp4", maxSize: 1, multiple: true };

export const VideosWithWebcam = Template.bind();
VideosWithWebcam.args = {
  accept: "video/webm, video/mp4",
  maxSize: 1,
  multiple: true,
  video: true,
};

export const PhotosAndVideosWithWebcam = Template.bind();
PhotosAndVideosWithWebcam.args = {
  accept: "image/png, image/jpeg, video/webm, video/mp4",
  maxSize: 1,
  multiple: true,
  photo: true,
  video: true,
};
