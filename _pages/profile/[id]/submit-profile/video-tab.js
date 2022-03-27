import React from 'react';
import ReactWebcam from 'react-webcam';
import { Steps, Row, Col, Button, Upload, Space, List, Typography, Image } from 'antd';
import { FileAddFilled, VideoCameraFilled } from '@ant-design/icons';
const { Title, Paragraph, Text, Link } = Typography;

import { videoSanitizer } from 'lib/media-controller';

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    this.mediaRecorderRef = React.createRef();

    // console.log('VideoTab props=', props);

    this.state = {
      cameraEnabled: false,
      recording: false,
      recordedVideo: [],
      recordedVideoUrl: '',
      videoURI: '',
      file: '',
      mirrored: false,
      videoDevices: 0,
      facingMode: 'user',
      recordingMode:''
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
    framerate: { min: 24, ideal: 60 },
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
    let { file } = this.state;
    console.log(file);
    
    this.props.next();

    file.arrayBuffer().then((_buffer) => {
      let buffer = Buffer.from(_buffer);
      // let type = file.type.split('/')[1];
      let { size } = file;
      let { duration } = this.video;

      videoSanitizer(buffer, size, duration)
        .then((URI) => {
          console.log("videoURI: " + URI);
          this.setState({ fileURI: URI });
          this.props.stateHandler({ videoURI:URI });
        })
        .catch(error => {
          // Handle errors
          console.log('Video upload error=', error);
          this.setState({
            cameraEnabled: false,
            recording: false,
            recordedVideo: [],
            recordedVideoUrl: '',
            videoURI: '',
            file: '',
            mirrored: false
            // cameraEnabled: true?
          });
        });
    });
  }

  enableCamera = () => {
    this.setState({ cameraEnabled: true });
  }

  retakeVideo = () => {
    this.setState({
      recording: false,
      cameraEnabled: false,
      recordedVideo: [],
      recordedVideoUrl: '',
      file: '',
      recordingMode:''
    })
  }

  onUserMedia = (mediaStream) => {
    console.log('User media detected', mediaStream);
    this.setState({ userMedia: mediaStream });

    // maybe move this to another place?
    if (this.state.videoDevices === 0) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        let videoDevices = devices.filter((d) => d.kind === "videoinput").length;
        this.setState({ videoDevices });
      });
    }
  }

  onUserMediaError = (error) => {
    console.error('User media error', error);
  }

  handleStartCaptureClick = () => {
    this.setState({ recording: true });

    this.mediaRecorderRef.current = new MediaRecorder(this.camera.stream, {
      mimeType: 'video/webm'
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

  mirrorVideo = () => {
    if (this.state.mirrored == true) {
      this.setState({ mirrored: false })
    } else {
      this.setState({ mirrored: true })
    }
  }

  switchCamera = () => {
    if (this.state.facingMode == 'user') {
      this.setState({ facingMode: 'environment' });
    } else {
      this.setState({ facingMode: 'user' });
    }
  }

  render = () => {
    console.log('videoTab render state', this.state);

    return (
      <>
      {this.state.recordingMode == '' && (
        <Row>
        
          <Title level={2}>Are you ready to speak?</Title>
          <Paragraph>You must be in a quiet room, with a working microphone and be able to read from your screen. If you are unable to comply, then an alternative process is available.</Paragraph>
          <Space direction='vertical' size={1} className='center'>
            <Space direction='horizontal'>
              <Button onClick={()=>this.setState({recordingMode:'speaking',cameraEnabled:true})} className="video-mode-buttons"><Image preview={false} src='/images/speaker.png' width='200px' height='auto' /><Title level={4} style={{marginTop: '10px', color:'#95a5a6'}}>I am able to identify my account using my voice and sight</Title></Button>
            </Space>
            <Space direction='horizontal'>
              <Button onClick={()=>this.setState({recordingMode:'visual',cameraEnabled:true})} className="video-mode-buttons"><Image preview={false} src='/images/sign.png' width='200px' height='auto' /><Title level={4} style={{marginTop: '10px', color:'#95a5a6'}}>I would prefer to use a visual method</Title></Button>
            </Space>
          </Space>
      </Row>
      )}
      
        
        {/*<Row>
          <List style={{ width: '100%' }} itemLayout='horizontal' dataSource={this.videoRulesList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )} />
            </Row>*/}
        
        <Row>
          <>
            

            {this.state.cameraEnabled && this.state.recordingMode !== '' ? (
              <Col xs={24}>
                <Title level={2}>Get ready to say your bit!</Title>
                <Title level={5}>Speak the words as they appear on the screen</Title>
                <div className="video-inner-container"
          ref={
            (screen) => {
              this.screen = screen;
            }
        }>
          <div className="video-overlay">Text inside video!</div>
                <ReactWebcam
                  style={{ width: '100%' }}
                  ref={camera => { this.camera = camera }}
                  audio={true}
                  mirrored={this.state.mirrored}
                  videoConstraints={{ ...this.videoConstraints, facingMode: this.state.facingMode }}
                  onCanPlayThrough={() => false}
                  onClick={(event) => event.preventDefault()}
                  onUserMedia={this.onUserMedia}
                  onUserMediaError={this.onUserMediaError}
                />
                <div className="buttons-camera">
                  {!this.state.recording ?
                  <>
                  <Space size={1} direction='horizontal'>
                  <Button onClick={this.mirrorVideo} shape='round' style={{display:'block', margin:'20px',verticalAlign:'middle', background:"#ffb978", color:'black', fontWeight:'bold', border:'none',width:'max-content',height:'100%'}}><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" style={{width:'25px'}} focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ThreeSixtyIcon"><path d="M12 7C6.48 7 2 9.24 2 12c0 2.24 2.94 4.13 7 4.77V20l4-4-4-4v2.73c-3.15-.56-5-1.9-5-2.73 0-1.06 3.04-3 8-3s8 1.94 8 3c0 .73-1.46 1.89-4 2.53v2.05c3.53-.77 6-2.53 6-4.58 0-2.76-4.48-5-10-5z"></path></svg></Button>
                  <Button onClick={this.handleStartCaptureClick} shape='round' style={{display:'block', margin:'20px', background:"#ffb978", color:'black', fontWeight:'bold', border:'none',width:'max-content',height:'100%'}}><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" style={{width:'25px'}} focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="VideoCameraBackIcon"><path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zM5 16l2.38-3.17L9 15l2.62-3.5L15 16H5z"></path></svg></Button>
                  {this.state.videoDevices > 1 && (
                      <>
                        
                          <Button onClick={this.switchCamera} shape='round' style={{display:'block', margin:'20px', background:"#ffb978", color:'black', fontWeight:'bold', border:'none',width:'max-content',height:'100%'}}><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" style={{width:'25px'}} focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CameraswitchIcon"><path d="M16 7h-1l-1-1h-4L9 7H8c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-4 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path><path d="m8.57.51 4.48 4.48V2.04c4.72.47 8.48 4.23 8.95 8.95h2C23.34 3.02 15.49-1.59 8.57.51zm2.38 21.45c-4.72-.47-8.48-4.23-8.95-8.95H0c.66 7.97 8.51 12.58 15.43 10.48l-4.48-4.48v2.95z"></path></svg></Button>
                        
                      </>
                    )}
                    </Space>
                  </> : 
                  <div>
                    <div>RECORDING IN PROGRESS</div>
                    <Button onClick={this.handleStopCaptureClick} shape='round' style={{ display: 'block', margin: '0 auto', background: "#000", color: 'white', border: 'none' }}>Stop recording</Button>
                  </div>
                }
        
          </div> 
        </div>
      
                
                <>
               
                  <Space direction={'vertical'} size={1} style={{margin:'0 auto',display: 'block'}}>
        <Upload.Dragger {...this.draggerProps} style={{width: '25%', height: '100%', backgroundColor:'#ffb978', fontWeight:'bold', display:'block',margin:'0 auto', border:'none', borderRadius: '10px',marginTop:'15px'}}>
          <FileAddFilled/>

          <p className="ant-upload-text">
            Upload video
          </p>
          
        </Upload.Dragger>
        </Space>
        </>
                

              </Col>
            ) : (
              !this.state.recording && this.state.recordedVideoUrl !== '' ? (
                <Col xs={24} xl={12} style={{display:'block', margin:'0 auto'}}>
                  <video ref={video => { this.video = video }} crossOrigin="anonymous" controls style={{ width: '100%' }} src={this.state.recordedVideoUrl}></video>
                  <Button onClick={this.retakeVideo} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none'}}>Choose a different video</Button>
                </Col>
              ) : (
                null
              )
            )}
          </>
          
        </Row>
        <Row style={{ marginTop: '2%' }}>
          <Button type='primary' shape='round' style={{ fontWeight: 'bold', display: 'block', margin: '0 auto', backgroundColor: "#ffb978", border: 'none' }} onClick={this.props.prev}>Previous</Button>
          <Button type='primary' disabled={this.state.file == ''} shape='round' style={{ fontWeight: 'bold', display: 'block', margin: '0 auto', backgroundColor: "#ffb978", border: 'none' }} onClick={this.uploadVideo}>Next</Button>
        </Row>
      </>
    );
  }
}
