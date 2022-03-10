import React from "react";

const PHOTO_OPTIONS = {
  types: {
      value: ["image/jpeg", "image/png"],
      label: "*.jpg, *.jpeg, *.png",
  },
  size: {
      value: 2 * 1024 * 1024,
      label: "2 MB",
  },
};

export default class ImageTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('ImageTab props=', props);
  }

  render() {
    return (<div>ImageTab</div>);
  }
}
