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
import base2048 from "base-2048";
import getVideoEmptyBorderSize from "/lib/get-video-empty-border-size";

const { Title, Paragraph } = Typography;

import { loadFFMPEG, videoSanitizer } from "lib/media-controller";

export default class VideoTab extends React.Component {
  constructor(props) {
    super(props);
    // console.log(this.props.state.OS.device.type)
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
    
    width: this.props.state.OS.device.type === "mobile"?{min: 640, exact: 1280 }:{min:640, ideal:1920}, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: this.props.state.OS.device.type === "mobile"?{min: 480, exact: 720 }:{min:480, ideal:1080}, //     height: { min: 480, ideal: 720, max: 1080 }
    framerate: { min: 24, ideal: 60 },
    /*mandatory:{
      maxWidth:this.props.state.OS.device.type === "mobile"?1280 : 1920,
      maxHeight:this.props.state.OS.device.type === "mobile"?720:1080,
      minWidth:640,
      minHeight:480
    }*/
    
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
        message.error(this.props.i18n.t("submit_profile_file_not_supported"));
        return Upload.LIST_IGNORE;
      } else if (file.size > this.videoOptions.size.value) {
        message.error(this.props.i18n.t("submit_profile_video_too_big"));
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
          // console.log("duration",duration)
          if (duration <= 60 * 2) {
            const video = document.createElement("video");
            video.crossOrigin = "anonymous";
            video.src = videoURL;
            video.preload = "auto";

            video.addEventListener("loadeddata", () => {
              const {videoWidth, videoHeight } = video;
              const {minWidth,minHeight} = this.videoOptions.dimensions;
              const borders = getVideoEmptyBorderSize(video);
              // console.log(videoWidth, borders.width, minWidth)
              if (videoWidth - borders.width > minWidth && videoHeight - borders.height > minHeight) {
                this.setState({
                  file: blob,
                  recording: false,
                  cameraEnabled: false,
                  recordedVideoUrl: videoURL,
                  duration
                });
              } else {
                message.error(this.props.i18n.t("submit_profile_video_too_small"));
              }
            });
          } else {
            message.error(this.props.i18n.t("submit_profile_video_too_long"));
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
    if (this.props.state.videoURI !== "") {
      this.props.stateHandler({ videoURI: "" });
    }

    const { file } = this.state;
    // console.log(file);

    this.props.next();

    file.arrayBuffer().then((_buffer) => {
      const buffer = Buffer.from(_buffer);
      // let type = file.type.split('/')[1];
      const { size } = file;
      // const { duration } = this.video;
      // console.log("duration",this.state.duration)
      videoSanitizer(buffer, size, this.props.state.OS.os.name, this.saveProgress, this.state.mirrored,this.state.duration)
        .then((URI) => {
          // console.log(`videoURI: ${URI}`);
          this.setState({ fileURI: URI });
          this.props.stateHandler({ videoURI: URI });
        })
        .catch((error) => {
          console.error(error);
          message.error("There was an error parsing your video, please try again", 5);

          this.setState({
            cameraEnabled: false, // true?
            recording: false,
            recordedVideo: [],
            recordedVideoUrl: "",
            videoURI: "",
            file: "",
            mirrored: false,
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

  onUserMediaError = (error) => {
    console.error("User media error", error);
  };

  handleStartCaptureClick = () => {
    this.setState({ recording: true });
    this.props.stateHandler({language:this.props.i18n.resolvedLanguage});
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

  handleStop = async () => {
    if (this.state.fullscreen) this.closeFullscreen();

    // console.log(this.state.recordedVideo);

    const blob = new Blob(this.state.recordedVideo, {
      type: `${this.props.state.OS === "iOS" ? "video/mp4" : "video/webm"
        };codecs=h264,avc1`,
    });
    const videoURL = window.URL.createObjectURL(blob);
    const duration = await getBlobDuration(blob);
    // console.log(duration)
    // let buffer = await this.blobToArray(blob);
    // this.uploadVideo(buffer);
    this.setState({
      recordedVideoUrl: videoURL,
      file: blob,
      recording: false,
      cameraEnabled: false,
      duration
    });
  };

  mirrorVideo = () => {
    if (this.state.mirrored === true) {
      this.setState({ mirrored: false });
    } else {
      this.setState({ mirrored: true });
    }
  };

  switchCamera = () => {
    if (this.state.facingMode === "user") {
      this.setState({ facingMode: "environment" });
    } else {
      this.setState({ facingMode: "user" });
    }
  };

  goBack = () => {
    if (this.state.recordingMode !== ""){
      this.setState({
        recording: false,
        cameraEnabled: false,
        recordedVideo: [],
        recordedVideoUrl: "",
        file: "",
        recordingMode: "",
      });
    } else {
      this.setState({
        recording: false,
        cameraEnabled: false,
        recordedVideo: [],
        recordedVideoUrl: "",
        file: "",
        recordingMode: "",
      });

      this.props.prev()
    }
  }

  generatePhrase = () => {
    const address = this.props.account.substring(2);
    const bytes = Buffer.from(address, 'hex');
    const { resolvedLanguage } = this.props.i18n;

    if (resolvedLanguage === "en") {
      const words = base2048.english.encode(bytes);
      // console.log(words);
      return " My confirmation phrase is: \n" + words.split(" ").slice(0, 8).join(' ');
    } else if (resolvedLanguage === "es"){
      const words = base2048.spanish.encode(bytes);
      return " Mi frase de confirmación es: \n"+ words.split(" ").slice(0, 8).join(' ');
    }
  }

  render = () => {
    const { t } = this.props.i18n;
    // console.log(this.videoConstraints);
    return (
      // console.log("videoTab render state", this.state);

      <>
        {this.state.recordingMode === "" && (
          <Row justify="center">
            <Col span={24}>
              <Title level={2}>{t("submit_profile_video_title")}</Title>
              <Paragraph>{t("submit_profile_video_description")}</Paragraph>
              <Row justify="center">
                <Col
                  xs={24}
                  xl={12}
                  className="video-mode-buttons"
                  onClick={() =>{
                    this.props.stateHandler({
                      recordingMode: "speaking",
                    })
                    this.setState({
                      recordingMode: "speaking",
                      cameraEnabled: true,
                    })
                  }
                }
                >
                  <Image preview={false} src="/images/speaker.png" width="50%" />
                  <Title level={4} style={{ marginTop: "10px" }}>
                    {t("submit_profile_video_by_voice")}
                  </Title>
                </Col>

                <Col
                  xs={24}
                  xl={12}
                  className="video-mode-buttons"
                  onClick={() =>{
                    this.props.stateHandler({
                      recordingMode: "visual",
                    })
                    this.setState({
                      recordingMode: "visual",
                      cameraEnabled: true,
                    })
                  }
                }
                >
                  <Image preview={false} src="/images/sign.png" width="50%" />
                  <Title level={4} style={{ marginTop: "10px" }}>
                    {t("submit_profile_video_visual")}
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
              <Title level={2}>{t("submit_profile_video_ready_title")}</Title>
              <Title level={5}>
                {t("submit_profile_video_ready_help")}
              </Title>
              <div
                className={this.state.mirrored?"video-inner-container video-mirrored":"video-inner-container"}
                ref={(screen) => {
                  this.screen = screen;
                }}
              >
                
                  <div className={this.state.mirrored?"video-overlay video-mirrored":"video-overlay"}>
                    <div className="video-overlay-content">
                  {t("submit_profile_video_phrase")}
                  {this.state.recordingMode === "speaking" &&(this.generatePhrase())}
                  </div>
                </div>
                
                
                <ReactWebcam
                  style={{ width: "100%" }}
                  ref={(camera) => {
                    this.camera = camera;
                  }}
                  audio
                  //mirrored={this.state.mirrored}
                  videoConstraints={{
                    ...this.videoConstraints,
                    facingMode: this.state.facingMode,
                  }}
                  onCanPlayThrough={() => false}
                  onClick={(event) => event.preventDefault()}
                  onUserMedia={this.onUserMedia}
                  onUserMediaError={this.onUserMediaError}
                />
                {this.state.recording && <i className="camera-recording-icon" />}
                <div className={this.state.mirrored?"buttons-camera-container video-mirrored":"buttons-camera-container"}>
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
              {this.state.recordingMode === "visual" && (
                <Upload.Dragger {...this.draggerProps} className="dragger">
                <FileAddFilled />

                <Paragraph className="ant-upload-text">{t("submit_profile_video_upload")}</Paragraph>
              </Upload.Dragger>
              )}
              
            </Col>
          ) : !this.state.recording && this.state.recordedVideoUrl !== "" ? (
            <>
              <Row>
                <Col span={24} style={{ display: "block", margin: "0 auto" }}>
                  <Video
                    className={this.state.mirrored?"video-mirrored":""}
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
                    {t("submit_profile_video_retake")}
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
                    {t("submit_profile_video_upload")}
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
              {t("submit_profile_previous")}
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}