import React from 'react';
import ReactWebcam from 'react-webcam';
import { Steps, Row, Col, Button, Upload, Space, List } from 'antd';
import { FileAddFilled, VideoCameraFilled } from '@ant-design/icons';

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    this.mediaRecorderRef = React.createRef();

    console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: false,
      recording: false,
      recordedVideo: [],
      recordedVideoUrl: '',
      videoURI: '', 
      file:'',
      mirrored:false
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
    facingMode:'user'
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
    this.props.next();
    file.arrayBuffer().then((_buffer) => {
      
      let buffer = Buffer.from(_buffer);
      let type = this.state.file.type.split('/')[1];
      let body = { buffer: buffer, type };
      let requestOptions = {
        method: 'POST',
        mode:'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };

      console.log('uploadVideo requestOptions=', requestOptions);

      fetch(process.env.NEXT_PUBLIC_MEDIA_SERVER + '/video', requestOptions)
      .then((response) =>{
        return response.json();
      })
      .then(({URI}) =>{

        console.log("videoURI: "+URI)
        this.setState({
          fileURI: URI
        });
        this.props.stateHandler({videoURI:URI})
      })
        .catch(error => {
          // Handle errors
          console.log('Video upload error=', error);
          this.setState({
            recordedVideo: [],
            recordedVideoUrl: '',
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
      recordedVideoUrl:'', 
      file:''
    })
  }

  onUserMedia = (mediaStream) => {
    console.log(mediaStream.length)
    console.log('User media detected', mediaStream);
    this.setState({userMedia:mediaStream});
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
  mirrorVideo = () =>{
    if(this.state.mirrored == true){
      this.setState({mirrored:false})
    } else{
      this.setState({mirrored:true})
    }
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
                <Button onClick={this.enableCamera} style={{width: '95%', height: '100%',fontSize:'14px', border:'1px solid black'}}><VideoCameraFilled /> <br />Record now using my camera</Button>
              </Col>
            )}


            {this.state.cameraEnabled ? (
              <Col xs={24}>
                <ReactWebcam
                  style={{ width: '100%' }}
                  ref={camera => { this.camera = camera }}
                  audio={true}
                  mirrored={this.state.mirrored}
                  videoConstraints={this.videoConstraints}
                  onCanPlayThrough={() => false}
                  onClick={(event) => event.preventDefault()}
                  onUserMedia={this.onUserMedia}
                  onUserMediaError={this.onUserMediaError}
                />
                {this.state.recording ? (
                  <div>
                    <div>RECORDING IN PROGRESS</div>
                    <Button onClick={this.handleStopCaptureClick} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none'}}>Stop recording</Button>
                  </div>
                ) :
                
                  
                  
                <Row>
                      <Col xl={8} xs={24}>
                        <Button onClick={this.handleStartCaptureClick} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none',width:'100%',height:'100%'}}>Start recording</Button>
                        </Col>
                        <Col xl={8} xs={24}>
                        <Button onClick={this.retakeVideo} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none',width:'100%',height:'100%'}}>Choose a different video source</Button>
                        </Col>
                        <Col xl={8} xs={24}>
                        <Button onClick={this.mirrorVideo} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none',width:'100%',height:'100%'}}>Mirror video</Button></Col><Col xl={12} xs={24}>
                      </Col>
                      {this.state.userMedia.length>1 && (
                        <>
                        <Col xl={8} xs={24}>
                        <Button onClick={this.mirrorVideo} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none',width:'100%',height:'100%'}}>Switch camera</Button></Col><Col xl={12} xs={24}>
                      </Col>
                      </>
                      )}
                      
                    </Row>
                    
                    }

              </Col>
            ) : (
              !this.state.recording && this.state.recordedVideoUrl !== '' ? (
                <Col xs={24} xl={12} style={{display:'block', margin:'0 auto'}}>
                  <video controls style={{ width: '100%' }} src={this.state.recordedVideoUrl}></video>
                  <Button onClick={this.retakeVideo} shape='round' style={{display:'block', margin:'0 auto', background:"#000", color:'white', border:'none'}}>Choose a different video</Button>
                </Col>
              ) : (
                null
              )
            )}
          </>
          {!this.state.cameraEnabled && !this.state.file && (
            <Col xs={24} xl={12}>
              <Upload.Dragger {...this.draggerProps} style={{width: '95%', height: '100%',background: 'white', border:'1px solid black'}}>

                <FileAddFilled />

                <p className='ant-upload-text' style={{fontSize:'14px'}}>Click or drag file to this area to upload</p>
                <p className='ant-upload-hint'>
                  Video's format can be: {this.videoOptions.types.label}
                </p>
              </Upload.Dragger>
            </Col>
          )}
        </Row>
        <Row style={{marginTop: '2%'}}>
        <Button type='primary' shape='round' style={{fontWeight:'bold',display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.props.prev}>Previous</Button>
        <Button type='primary' disabled={this.state.file == ''} shape='round' style={{fontWeight:'bold',display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.uploadVideo}>Next</Button>
         
        </Row>
      </>
    );
  }
}
