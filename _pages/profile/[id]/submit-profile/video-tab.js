import React from 'react';
import ReactWebcam from 'react-webcam';
import { Steps, Row, Col, Button, Upload, Space, List } from 'antd';
import { FileAddFilled } from '@ant-design/icons';

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    this.camera = React.createRef();
    this.mediaRecorderRef = React.createRef();

    console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: false,
      recording: false,
      recordedVideo: [],
      recordedVideoUrl: '',
      videoURI: ''
    }
  }

  videoOptions = {
    types: {
      value: [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska'
      ],
      label: '.mp4, .webm, .avi, .mov, .mkv'
    },
    size: {
      value: 15 * 1024 * 1024, // ?? 15 seems low limit, maybe up to 32?
      label: '15 MB'
    },
    dimensions: {
      minWidth: 352,
      minHeight: 352
    }
  };

  videoConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 }, //     height: { min: 480, ideal: 720, max: 1080 }
    framerate: { min: 24, ideal: 60 }
  }

  videoRulesList = [
    { title: 'Face the camera', description: 'The submitter facial features must be visible at all times with good enough lightning conditions.' },
    { title: 'Show your wallet address', description: 'The submitter need to be showing the sign while facing the camera.' },
    { title: 'Say the required phrase', description: 'The submitter must say (in English) "I certify that I am a real human and that I am not already registered in this registry". Submitter should speak in their normal voice.' },
    // { title: '',  description: '' },
    // { title: '',  description: '' },
    // { title: '',  description: '' },
  ]

  draggerProps = {
    name: 'file',
    multiple: false,
    accept: this.videoOptions.types.label,
    onChange: ({ file }) => {
      console.log('onChange file=', file);

      let blob = new Blob([file.originFileObj], { type: file.type });
      let videoURL = window.URL.createObjectURL(blob);

      console.log('onChange videoURL=', videoURL);
      this.setState({
        file: file.originFileObj,
        recordedVideoUrl: videoURL
      });
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  }

  uploadVideo = () => {
    let file = this.state.file;
    console.log(file);

    file.arrayBuffer().then((_buffer) => {
      let buffer = Buffer.from(_buffer);
      console.log('uploadVideoBuffer=', buffer);

      let body = { buffer: buffer, type: 'webm' };

      fetch(process.env.NEXT_PUBLIC_MEDIA_SERVER + '/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then(({ URI }) => {
          this.setState({
            fileURI: URI
          });
        })
    });
  }

  enableCamera = () => {
    this.setState({ cameraEnabled: true });
  }

  retakeVideo = () => {
    this.setState({
      recording: false,
      cameraEnabled: true,
      recordedVideo: []
    })
  }

  onUserMedia = (mediaStream) => {
    console.log('User media detected', mediaStream);
  }

  onUserMediaError = (error) => {
    console.error('User media error', error);
  }

  handleStartCaptureClick = () => {
    this.setState({ recording: true });

    this.mediaRecorderRef.current = new MediaRecorder(this.camera.current.stream, {
      mimeType: 'video/webm;codecs=h264,avc1'
    });

    this.mediaRecorderRef.current.ondataavailable = this.handleDataAvailable;
    this.mediaRecorderRef.current.onstop = this.handleStop;

    this.mediaRecorderRef.current.start();
  }

  handleDataAvailable = ({ data }) => {
    console.log('data available=', data);
    this.setState({
      recordedVideo: this.state.recordedVideo.concat(data)
    });
  }

  handleStopCaptureClick = () => {
    if (this.state.recording) {
      this.mediaRecorderRef.current.stop();
    }
  }

  handleStop = () => {
    console.log(this.state.recordedVideo);

    let blob = new Blob(this.state.recordedVideo, { type: 'video/webm;codecs=h264,avc1' });
    let videoURL = window.URL.createObjectURL(blob);

    //let buffer = await this.blobToArray(blob);
    //this.uploadVideo(buffer);
    this.setState({ recordedVideoUrl: videoURL, file: blob, recording: false, cameraEnabled: false });
  }

  render = () => {
    return (
      <>
        <Row>
          <Space direction='vertical' size={1}>
            <h2>Upload your video</h2>
            <p>In this step you will need to select a file or record a video with your camera</p>
          </Space>
        </Row>
        <Row>
          <List style={{ width: '100%' }} itemLayout='horizontal' dataSource={this.videoRulesList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )} />
        </Row>
        <Row>
          <>
            {!this.state.cameraEnabled && !this.state.file && (
              <Col xs={24} xl={12}>
                <Button type='primary' onClick={this.enableCamera}>Record now using my camera</Button>
              </Col>
            )}


            {this.state.cameraEnabled ? (
              <Col xs={24}>
                <ReactWebcam
                  style={{ width: '100%' }}
                  ref={this.camera}
                  audio={true}
                  mirrored={false}
                  videoConstraints={this.videoConstraints}
                  onCanPlayThrough={() => false}
                  onClick={(event) => event.preventDefault()}
                  onUserMedia={this.onUserMedia}
                  onUserMediaError={this.onUserMediaError}
                />
                {this.state.recording ? (
                  <div>
                    <div>RECORDING IN PROGRESS</div>
                    <button onClick={this.handleStopCaptureClick}>Stop recording!</button>
                  </div>
                ) : <button onClick={this.handleStartCaptureClick}>Start capturing video!</button>}

              </Col>
            ) : (
              !this.state.recording && this.state.recordedVideoUrl !== '' ? (
                <Col xs={24}>
                  <video controls style={{ width: '100%' }} src={this.state.recordedVideoUrl}></video>
                  <button onClick={this.retakeVideo}>Retake video</button>
                </Col>
              ) : (
                null
              )
            )}
          </>
          {!this.state.cameraEnabled && !this.state.file && (
            <Col xs={24} xl={12}>
              <Upload.Dragger {...this.draggerProps}>

                <FileAddFilled />

                <p className='ant-upload-text'>Click or drag file to this area to upload</p>
                <p className='ant-upload-hint'>
                  Video's format can be: {this.videoOptions.types.label}
                </p>
              </Upload.Dragger>
            </Col>
          )}
        </Row>
        <Row>
          {this.state.file ? <Button onClick={this.uploadVideo}>Upload!</Button> : null}
        </Row>
      </>
    );
  }
}
