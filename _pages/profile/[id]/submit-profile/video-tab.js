import React from "react";

const VIDEO_OPTIONS = {
  types: {
      value: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"],
      label: "*.mp4, *.webm, *.avi, *.mov, *.mkv",
  },
  size: {
      value: 15 * 1024 * 1024,
      label: "15 MB",
  },
  dimensions: {
      minWidth: 352,
      minHeight: 352,
  },
};

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('VideoTab props=', props);
  }

  render() {
    return (<div>VideoTab</div>);
  }
}
