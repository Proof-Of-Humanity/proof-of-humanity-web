import React from "react";
import ReactWebcam from "react-webcam";
import { Steps, Row, Col } from 'antd';

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
    this.camera = React.createRef();
    console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: false,
      image: null,
    }
  }

  videoConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 } //     height: { min: 480, ideal: 720, max: 1080 }
  }; // 

  enableCamera = () => {
    this.setState({ cameraEnabled: true });
  }

  takePicture = () => {
    let picture = this.camera.current.getScreenshot();

    // this.props.stateHandler({ picture }, 'ImageTab'); // proof props method can be called (save form status)
    // send picture as props and dont use image state?

    this.setState({
      picture,
      cameraEnabled: false,
    });
  }

  retakePicture = () => {
    this.setState({
      picture: null,
      cameraEnabled: true,
    })
  };
  
  onUserMedia(mediaStream) {
    console.log('User media detected', mediaStream);
  }

  onUserMediaError(e) {
    console.error('User media error', error);
  }

  render() {
    return (
      <Row>
        <Col>
          {this.state.cameraEnabled ? (
            <div>
              <ReactWebcam
                style={{ width: "100%" }}
                ref={this.camera}
                mirrored={false}
                screenshotFormat={'image/jpeg'}
                screenshotQuality={1}
                forceScreenshotSourceSize
                videoConstraints={this.videoConstraints}
                onCanPlayThrough={() => false}
                onClick={(event) => event.preventDefault()}
                onUserMedia={this.onUserMedia} 
                onUserMediaError={this.onUserMediaError}
              />
              <button onClick={this.takePicture}>Take image!</button>
            </div>
          ) : (
            !this.state.picture ? (
              <div>
                <button onClick={this.enableCamera}>Enable camera</button>
              </div>
            ) : (null)
          )}
          { this.state.picture ? (
            <div>
              This is your picture:
              <img style={{ width: '100%' }} src={this.state.picture}></img>
              <button onClick={this.retakePicture}>Retake image</button>
            </div>
          ) : null }
          </Col>
      </Row>
    );
  }
}
