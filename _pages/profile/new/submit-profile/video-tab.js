import { FileAddFilled } from "@ant-design/icons";
import {
  CameraSwitch,
  ExitFullscreen,
  Fullscreen,
  MirrorCamera,
  RecordCamera,
  Stop,
} from "@kleros/icons";
import { Button, Col, Image, Row, Typography, Upload, message } from "antd";
import React from "react";
import Video from "react-player";
import ReactWebcam from "react-webcam";
import getBlobDuration from 'get-blob-duration'


const { Title, Paragraph } = Typography;

import { loadFFMPEG, videoSanitizer } from "lib/media-controller";

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    this.mediaRecorderRef = React.createRef();

    // //console.log('VideoTab props=', props);

    this.state = {
      cameraEnabled: false,
      recording: false,
      recordedVideo: [],
      recordedVideoUrl: "",
      videoURI: "",
      file: "",
      mirrored: false,
      videoDevices: 0,
      facingMode: "user",
      recordingMode: "",
      fullscreen: false,
    };
  }

  videoOptions = {
    types: {
      value: ["video/mp4", "video/webm", "video/quicktime"],
      label: ".mp4, .webm, .mov",
    },
    size: {
      value: 15 * 1024 * 1024, // ?? 15 seems low limit, maybe up to 32?
      label: "15 MB",
    },
    dimensions: {
      minWidth: 352,
      minHeight: 352,
    },
  };

  videoConstraints = {
    width: { min: 640, ideal: 1920 }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 1080 }, //     height: { min: 480, ideal: 720, max: 1080 }
    framerate: { min: 24, ideal: 60 },
  };

  videoRulesList = [
    {
      title: "Face the camera",
      description:
        "The submitter facial features must be visible at all times with good enough lightning conditions.",
    },
    {
      title: "Show your wallet address",
      description:
        "The submitter need to be showing the sign while facing the camera.",
    },
    {
      title: "Say the required phrase",
      description:
        'The submitter must say (in English) "I certify that I am a real human and that I am not already registered in this registry". Submitter should speak in their normal voice.',
    },
    // { title: '',  description: '' },
    // { title: '',  description: '' },
    // { title: '',  description: '' },
  ];

  draggerProps = {
    name: "file",
    multiple: false,
    accept: this.videoOptions.types.label,
    showUploadList: false,
    beforeUpload: (file) => {
      if (!this.videoOptions.types.value.includes(file.type)) {
        message.error("The selected file is not supported.");
        return Upload.LIST_IGNORE;
      } else if (file.size > this.videoOptions.size.value) {
        message.error("The selected file exceeds the size limit of 15MB.");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: ({ file }) => {
      // console.log("onChange file=", file);
      const { status } = file;
      if (status === "done") {
        const blob = new Blob([file.originFileObj], { type: file.type });
        const videoURL = window.URL.createObjectURL(blob);
        getBlobDuration(blob).then((duration) => {
          if (duration <= 60 * 2) {
            this.setState({
              file: blob,
              recording: false,
              cameraEnabled: false,
              recordedVideoUrl: videoURL,
            });
          } else {
            message.error(
              "The selected file should be shorter than two minutes"
            );
          }
        });
      }
      // console.log("onChange videoURL=", videoURL);
    },
    onDrop() {
      // console.log("Dropped files", event.dataTransfer.files);
    },
  };
  saveProgress = (progress) => {
    this.props.stateHandler({ progress });
  };
  uploadVideo = () => {
    if (this.props.state.videoURI !== "")
      this.props.stateHandler({ videoURI: "" });
    const { file } = this.state;
    // console.log(file);

    this.props.next();

    file.arrayBuffer().then((_buffer) => {
      const buffer = Buffer.from(_buffer);
      // let type = file.type.split('/')[1];
      const { size } = file;
      // const { duration } = this.video;

      videoSanitizer(buffer, size, this.props.state.OS, this.saveProgress)
        .then((URI) => {
          // console.log(`videoURI: ${URI}`);
          this.setState({ fileURI: URI });
          this.props.stateHandler({ videoURI: URI });
        })
        .catch(() => {
          // console.error(err);
          // Handle errors
          // console.log("Video upload error=", err);
          this.setState({
            cameraEnabled: false,
            recording: false,
            recordedVideo: [],
            recordedVideoUrl: "",
            videoURI: "",
            file: "",
            mirrored: false,
            // cameraEnabled: true?
          });
        });
    });
  };

  toggleFullscreen = () => {
    this.screen.webkitRequestFullscreen();
    this.setState({ fullscreen: true });
  };
  closeFullscreen = () => {
    document.webkitExitFullscreen();
    this.setState({ fullscreen: false });
  };

  retakeVideo = () => {
    this.setState({
      recording: false,
      cameraEnabled: false,
      recordedVideo: [],
      recordedVideoUrl: "",
      file: "",
      recordingMode: "",
    });
  };

  onUserMedia = (mediaStream) => {
    // console.log("User media detected", mediaStream);
    loadFFMPEG();
    this.setState({ userMedia: mediaStream });
    // maybe move this to another place?
    if (this.state.videoDevices === 0)
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(
          (d) => d.kind === "videoinput"
        ).length;
        this.setState({ videoDevices });
      });
  };

  onUserMediaError = () => {
    // console.error("User media error", error);
  };

  handleStartCaptureClick = () => {
    this.setState({ recording: true });
    this.mediaRecorderRef.current = new MediaRecorder(this.camera.stream, {
      mimeType: this.props.state.OS === "iOS" ? "video/mp4" : "video/webm",
    });

    this.mediaRecorderRef.current.ondataavailable = this.handleDataAvailable;
    this.mediaRecorderRef.current.onstop = this.handleStop;
    this.mediaRecorderRef.current.start();
  };

  handleDataAvailable = ({ data }) => {
    // console.log("data available=", data);
    this.setState({
      recordedVideo: this.state.recordedVideo.concat(data),
    });
  };
  handleStopCaptureClick = () => {
    if (this.state.recording) this.mediaRecorderRef.current.stop();
  };

  handleStop = () => {
    if (this.state.fullscreen) this.closeFullscreen();

    // console.log(this.state.recordedVideo);

    const blob = new Blob(this.state.recordedVideo, {
      type: `${
        this.props.state.OS === "iOS" ? "video/mp4" : "video/webm"
      };codecs=h264,avc1`,
    });
    const videoURL = window.URL.createObjectURL(blob);

    // let buffer = await this.blobToArray(blob);
    // this.uploadVideo(buffer);
    this.setState({
      recordedVideoUrl: videoURL,
      file: blob,
      recording: false,
      cameraEnabled: false,
    });
  };

  mirrorVideo = () => {
    if (this.state.mirrored === true) this.setState({ mirrored: false });
    else this.setState({ mirrored: true });
  };

  switchCamera = () => {
    if (this.state.facingMode === "user")
      this.setState({ facingMode: "environment" });
    else this.setState({ facingMode: "user" });
  };
  goBack = () => {
    this.setState({
      recording: false,
      cameraEnabled: false,
      recordedVideo: [],
      recordedVideoUrl: "",
      file: "",
      recordingMode: "",
    });
    this.props.prev();
  };

  render = () => (
    // console.log("videoTab render state", this.state);

    <>
      {this.state.recordingMode === "" && (
        <Row justify="center">
          <Col span={24}>
            <Title level={2}>Are you ready to speak?</Title>
            <Paragraph>
              You must be in a quiet room, with a working microphone and be able
              to read from your screen. If you are unable to comply, then an
              alternative process is available.
            </Paragraph>
            <Row justify="center">
              <Col
                xs={24}
                xl={12}
                className="video-mode-buttons"
                onClick={() =>
                  this.setState({
                    recordingMode: "speaking",
                    cameraEnabled: true,
                  })
                }
              >
                <Image preview={false} src="/images/speaker.png" width="50%" />
                <Title level={4} style={{ marginTop: "10px" }}>
                  I am able to identify my account using my voice and sight
                </Title>
              </Col>

              <Col
                xs={24}
                xl={12}
                className="video-mode-buttons"
                onClick={() =>
                  this.setState({
                    recordingMode: "visual",
                    cameraEnabled: true,
                  })
                }
              >
                <Image preview={false} src="/images/sign.png" width="50%" />
                <Title level={4} style={{ marginTop: "10px" }}>
                  I would prefer to use a visual method
                </Title>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      {/* <Row>
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

      <Row justify="center">
        {this.state.cameraEnabled && this.state.recordingMode !== "" ? (
          <Col span={24}>
            <Title level={2}>Get ready to say your bit!</Title>
            <Title level={5}>
              Speak the words as they appear on the screen
            </Title>
            <div
              className="video-inner-container"
              ref={(screen) => {
                this.screen = screen;
              }}
            >
              <div className="video-overlay">Text inside video!</div>
              <ReactWebcam
                style={{ width: "100%" }}
                ref={(camera) => {
                  this.camera = camera;
                }}
                audio
                mirrored={this.state.mirrored}
                videoConstraints={{
                  ...this.videoConstraints,
                  facingMode: this.state.facingMode,
                }}
                onCanPlayThrough={() => false}
                onClick={(event) => event.preventDefault()}
                onUserMedia={this.onUserMedia}
                onUserMediaError={this.onUserMediaError}
              />
              <div className="buttons-camera-container">
                {!this.state.recording ? (
                  <>
                    {/* <Row justify="center">

                    </Row> */}
                    <Row justify="center">
                      <Col span={6}>
                        <Button
                          onClick={this.handleStartCaptureClick}
                          shape="round"
                          className="button-orange-camera"
                        >
                          <RecordCamera
                            width="25px"
                            height="40px"
                            fill="white"
                          />
                        </Button>
                      </Col>
                      <Col span={6}>
                        <Button
                          onClick={this.mirrorVideo}
                          shape="round"
                          className="button-orange-camera"
                        >
                          <MirrorCamera
                            width="25px"
                            height="25px"
                            fill="white"
                          />
                        </Button>
                      </Col>

                      {this.state.videoDevices > 1 && (
                        <Col span={6}>
                          <Button
                            onClick={this.switchCamera}
                            shape="round"
                            className="button-orange-camera"
                          >
                            <CameraSwitch
                              width="25px"
                              height="25px"
                              fill="white"
                            />
                          </Button>
                        </Col>
                      )}
                      {this.state.fullscreen ? (
                        <Col span={6}>
                          <Button
                            onClick={this.closeFullscreen}
                            shape="round"
                            className="button-orange-camera"
                          >
                            <ExitFullscreen
                              width="25px"
                              height="25px"
                              fill="white"
                            />
                          </Button>
                        </Col>
                      ) : (
                        <Col span={6}>
                          <Button
                            onClick={this.toggleFullscreen}
                            shape="round"
                            className="button-orange-camera"
                          >
                            <Fullscreen
                              width="25px"
                              height="25px"
                              fill="white"
                            />
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </>
                ) : (
                  <Row justify="center">
                    <Col span={6}>
                      <Paragraph>RECORDING IN PROGRESS</Paragraph>
                      <Paragraph />
                      <Button
                        onClick={this.handleStopCaptureClick}
                        shape="round"
                        className="button-orange-camera"
                      >
                        <Stop width="25px" height="25px" fill="white" />
                      </Button>
                    </Col>
                  </Row>
                )}
              </div>
            </div>

            <Upload.Dragger {...this.draggerProps} className="dragger">
              <FileAddFilled />

              <Paragraph className="ant-upload-text">Upload video</Paragraph>
            </Upload.Dragger>
          </Col>
        ) : !this.state.recording && this.state.recordedVideoUrl !== "" ? (
          <>
            <Row>
              <Col span={24} style={{ display: "block", margin: "0 auto" }}>
                <Video
                  config={{
                    file: {
                      attributes: {
                        crossOrigin: "true",
                      },
                    },
                  }}
                  controls
                  width={"100%"}
                  height={"100%"}
                  url={this.state.recordedVideoUrl}
                />
              </Col>
            </Row>
            <Row justify="center" style={{ width: "100%" }}>
              <Col xl={12} xs={24}>
                <Button
                  onClick={this.retakeVideo}
                  shape="round"
                  className="button-grey"
                >
                  Choose a different video
                </Button>
              </Col>
              <Col xl={12} xs={24}>
                <Button
                  type="primary"
                  disabled={this.state.file === ""}
                  shape="round"
                  className="button-orange"
                  onClick={this.uploadVideo}
                >
                  Upload video
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
      </Row>
      <Row justify="center">
        <Col span={24}>
          <Button
            type="primary"
            shape="round"
            className="button-grey"
            onClick={this.goBack}
          >
            Previous
          </Button>
        </Col>
      </Row>
    </>
  );
}
