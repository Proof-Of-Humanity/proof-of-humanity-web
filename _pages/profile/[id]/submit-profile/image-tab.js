import React from "react";
import ReactWebcam from "react-webcam";
import fetch from "node-fetch";


import {
  Field,
  FileUpload,
  Form,
} from "@kleros/components";

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
      fileURI:''
    }
  }

  videoConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 } //     height: { min: 480, ideal: 720, max: 1080 }
  }; // 
  
  enableCamera = () => {
    this.setState({ cameraEnabled: true });
  }
  urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
  uploadToIPFS = async (file) => {
    
    
    let buffer = this.urlB64ToUint8Array(file.split(',')[1])
    console.log(buffer)
    let URI = await fetch(process.env.NEXT_PUBLIC_MEDIA_SERVER + '/photo', {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({buffer:Buffer.from(buffer)}),

    }).then(function(response){
      return response.json()
      
    })
    .then(function(URI){
      console.log(URI.URI)
      return URI.URI
      
    })
    this.setState({fileURI:URI})
  }
  
  takePicture = async () => {
    let picture = this.camera.current.getScreenshot();
    console.log(picture)
    this.uploadToIPFS(picture);
  
    
  

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
          { this.state.fileURI !== '' ? (
          <div>
            This is your picture:
            <img src={this.state.fileURI}></img>
            <button onClick={this.retakePicture}>Retake image</button>
          </div>
        ) : null }
          </Col>
      </Row>
    );
  }
}
