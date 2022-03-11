import React from "react";
import ReactWebcam from "react-webcam";

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
    this.camera = React.createRef();
    this.mediaRecorderRef = React.createRef();

    console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: false,
      recording: false,
      recordedVideo: [],
      recordedVideoUrl: '',
    }
  }

  videoConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 } //     height: { min: 480, ideal: 720, max: 1080 }
  }; // 

  enableCamera = () => {
    this.setState({ cameraEnabled: true });
  }

  retakeVideo = () => {
    this.setState({
      video: null,
      cameraEnabled: true,
      recordedVideo: []
    })
  };
  
  onUserMedia(mediaStream) {
    console.log('User media detected', mediaStream);
  }

  onUserMediaError(e) {
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
    this.mediaRecorderRef.current.stop();
  };

  handleStop = () => {
    console.log(this.state.recordedVideo);

    let blob = new Blob(this.state.recordedVideo, { type: 'video/webm;codecs=h264,avc1' });
    let videoURL = window.URL.createObjectURL(blob);

    this.setState({
      recordedVideoUrl: videoURL,
      recording: false,
      cameraEnabled: false,
    });
  }

  render() {
    return (
      <div>
        {this.state.cameraEnabled ? (
          <div>
            <ReactWebcam
              style={{ width: "100%" }}
              ref={this.camera}
              audio={true}
              mirrored={false}
              forceScreenshotSourceSize
              videoConstraints={this.videoConstraints}
              onCanPlayThrough={() => false}
              onClick={(event) => event.preventDefault()}
              onUserMedia={this.onUserMedia} 
              onUserMediaError={this.onUserMediaError}
            />
            { this.state.recording ? (
              <div>
                <div>RECORDING IN PROGRESS</div>
                <button onClick={this.handleStopCaptureClick}>Stop recording!</button>
              </div>
            ) : <button onClick={this.handleStartCaptureClick}>Start capturing video!</button> }
            
          </div>
        ) : (
          !this.state.recording && this.state.recordedVideo.length > 0 ? (
            <video controls src={this.state.recordedVideoUrl}></video>
          ) : (
            <div>
              <button onClick={this.enableCamera}>Enable camera</button>
            </div>
          )
        )}
        {/* { this.state.picture ? (
          <div>
            This is your picture:
            <img src={this.state.picture}></img>
            <button onClick={this.retakeVideo}>Retake image</button>
          </div>
        ) : null } */}
      </div>
    );
  }
}
