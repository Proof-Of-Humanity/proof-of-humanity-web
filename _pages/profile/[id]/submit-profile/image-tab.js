import React from 'react';
import ReactWebcam from 'react-webcam';
import fetch from 'node-fetch';

import { Steps, Row, Col, List, Avatar, Space } from 'antd';

export default class ImageTab extends React.Component {
  constructor(props) {
    super(props);
    this.camera = React.createRef();
    console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: false,
      image: null,
      fileURI: ''
    }
  }

  photoOptions = {
    types: {
      value: ['image/jpeg', 'image/png'],
      label: '*.jpg, *.jpeg, *.png',
    },
    size: {
      value: 2 * 1024 * 1024,
      label: '2 MB',
    },
  }

  cameraConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 } //     height: { min: 480, ideal: 720, max: 1080 }
  }

  imageRulesList = [
    { title: 'Face the camera', description: 'The submitter facial features must be visible with good enough lightning conditions.' },
    { title: 'Show your real self', description: 'The submitters should not be covered under heavy make-up, large piercings or masks.' },
    { title: '', description: '' },
  ]

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

  uploadPicture = (picture) => {
    let buffer = this.urlB64ToUint8Array(picture.split(',')[1])
    console.log(buffer)

    fetch(process.env.NEXT_PUBLIC_MEDIA_SERVER + '/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buffer: Buffer.from(buffer)
      })
    })
      .then(response => response.json())
      .then(({ URI }) => {
        console.log('Image URI=', URI);
        this.setState({
          fileURI: URI,
        });
      });
  }

  takePicture = () => {
    let picture = this.camera.current.getScreenshot();
    console.log('Picture b64=', picture);
    this.uploadPicture(picture); // we shouldn't upload every time a picture is taken, but at the end/when user selects it as final image

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
  }

  onUserMedia(mediaStream) {
    console.log('User media detected', mediaStream);
  }

  onUserMediaError(error) {
    console.error('User media error', error);
  }

  render() {
    return (
      <>
        <Row>
          <Space direction='vertical' size={1}>
            <h2>Upload your image</h2>
            <p>In this step you will need to select a file or take an image with your camera of your face</p>
          </Space>
        </Row>
        <Row>
          <List style={{ width: '100%' }} itemLayout='horizontal' dataSource={this.imageRulesList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )} />
        </Row>
        {this.state.cameraEnabled ? (
          <div>
            <ReactWebcam
              style={{ width: '100%' }}
              ref={this.camera}
              mirrored={false}
              screenshotFormat={'image/jpeg'}
              screenshotQuality={1}
              forceScreenshotSourceSize
              videoConstraints={this.cameraConstraints}
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
        {this.state.fileURI !== '' ? (
          <div>
            This is your picture:
            <img style={{ width: '100%' }} src={this.state.fileURI}></img>
            <button onClick={this.retakePicture}>Retake image</button>
          </div>
        ) : null}
      </>
    );
  }
}
