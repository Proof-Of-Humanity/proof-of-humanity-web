import {
  CheckCircleFilled,
  CloseCircleFilled,
  FileAddFilled,
} from "@ant-design/icons";
import { Camera, CameraSwitch } from "@kleros/icons";
import {
  Button,
  Image,
  List,
  Row,
  Slider,
  Space,
  Typography,
  Upload,
  message,
  Col
} from "antd";
import React from "react";
import Cropper from "react-easy-crop";
import ReactWebcam from "react-webcam";

import getCroppedImg from "./crop-image";

const { Title, Paragraph, Text } = Typography;

import { photoSanitizer } from "lib/media-controller";

export default class ImageTab extends React.Component {
  constructor(props) {
    super(props);
    // //console.log('ImageTab props=', props);

    this.state = {
      cameraEnabled: true,
      image: null,
      fileURI: "",
      loading: false,
      crop: {
        x: 0,
        y: 0,
      },
      rotation: 0,
      zoom: 1,
      croppedAreaPixels: null,
      croppedImage: null,
      userMedia: null,
      facingMode: "user",
      videoDevices: 0,
      maxZoom: 3,
    };
  }

  photoOptions = {
    types: {
      value: ["image/jpeg", "image/png"],
      label: ".jpg, .jpeg, .png",
    },
    size: {
      value: 3 * 1024 * 1024,
      label: "3 MB",
    },
  };

  cameraConstraints = {
    width: {
      min: 640,
      ideal: 1920,
    }, //     width: { min: 640, ideal: 1280, max: 1920 },
    height: {
      min: 480,
      ideal: 1080,
    }, //     height: { min: 480, ideal: 720, max: 1080 }
  };

  styles = {
    cropContainer: {
      position: "relative",
      width: "100%",
      height: 400,
      background: "#000",
    },
    cropButton: {
      flexShrink: 0,
      marginLeft: 16,
    },
    controls: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    },
  };

  imageRulesList = [
    {
      title: "Image rules",
      description: (
        <Space direction="horizontal" align="center">
          <Space direction="vertical">
            <Image
              src="/images/front-facing.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
          <Space direction="vertical">
            <Image
              src="/images/not-front-facing.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>

          <Space direction="vertical">
            <Image
              src="/images/glasses.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
          <Space direction="vertical">
            <Image
              src="/images/sunglasses.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
        </Space>
      ),
    },
    {
      title: "",
      description: (
        <Space direction="horizontal" align="center">
          <Space direction="vertical">
            <Image
              src="/images/hijab.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
          <Space direction="vertical">
            <Image
              src="/images/niqab.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
          <Space direction="vertical">
            <Image
              src="/images/b&w.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
          <Space direction="vertical">
            <Image
              src="/images/mask.jpg"
              preview={false}
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "block",
              }}
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Space>
        </Space>
      ),
    },
    {
      title: "",
      description: "",
    },
  ];

  setCrop = (crop) => {
    // console.log(crop);
    this.setState({ crop });
  };
  setRotation = (rotation) => {
    // console.log(rotation)
    this.setState({ rotation });
  };
  setZoom = (zoom) => {
    // console.log(zoom)
    this.setState({ zoom });
  };
  setCroppedAreaPixels = (croppedAreaPixels) => {
    // console.log(croppedAreaPixels)
    // let maxZoom = croppedAreaPixels.width / 256;
    if (croppedAreaPixels.width > 256 && croppedAreaPixels.height > 256)
      this.setState({ croppedAreaPixels });
    else message.error("The cropped area must be greater than 256 pixels.");
  };
  setCroppedImage = (croppedImage) => this.setState({ croppedImage });

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    // console.log("cropped area: " + JSON.stringify(croppedArea))
    this.setCroppedAreaPixels(croppedAreaPixels);
  };
  onMediaLoaded = (media) => {
    const maxZoom = Math.floor(Math.min(media.naturalWidth, media.naturalHeight) / 256);
    this.setState({ maxZoom });
    // console.log(media)
  };

  showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        this.state.image,
        this.state.croppedAreaPixels,
        this.state.rotation
      );
      // console.log('donee', {croppedImage})
      const buffer = this.urlB64ToUint8Array(croppedImage.split(",")[1]);
      // console.log(buffer)
      this.setCroppedImage(croppedImage);
      this.setState({ picture: buffer });
    } catch {
      // console.error(err);
    }
  };

  onClose = () => {
    this.setCroppedImage(null);
  };

  enableCamera = () => {
    // console.log(this.camera);
    this.setState({ cameraEnabled: true });
  };

  urlB64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replaceAll("-", "+")
      .replaceAll("_", "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i)
      outputArray[i] = rawData.charCodeAt(i);

    return outputArray;
  };
  draggerProps = {
    name: "file",
    multiple: false,
    accept: this.photoOptions.types.label,
    beforeUpload: (file) => {
      if(this.photoOptions.types.value.indexOf(file.type) !== -1){
        return true
      } else{
        message.error("The selected file is not supported.")
        return Upload.LIST_IGNORE
      }
    },
    onChange: ({ file }) => {
      // console.log('onChange file=', file);
      
      const blob = new Blob([file.originFileObj], { type: file.type });
      const imageURL = window.URL.createObjectURL(blob);

      // console.log(blob)
      blob.arrayBuffer().then((arrayBuffer) => {
        this.setState({
          picture: arrayBuffer,
          image: imageURL,
          cameraEnabled: false,
        });
      });
     

      // console.log('onChange imageURL=', imageURL);
    },
    onDrop: () => {
      // console.log('Dropped files', event.dataTransfer.files);
    },
  };
  uploadPicture = () => {
    this.setState({ loading: true });

    const { picture } = this.state;
    const buffer = Buffer.from(picture);
    // console.log("image sanitizer")

    photoSanitizer(buffer)
      .then((response) => {
        if (response === "grayscale") {
          message.error(
            "Image can't be black and white, please choose or take another one.",
            10
          );
          this.setState({ loading: false, picture: false });
          this.retakePicture();
        } else {
          // console.log('Image URI=', response);

          this.setState({ fileURI: response, loading: false });
          this.props.stateHandler({ imageURI: response });

          this.props.next();
        }
      })
      .catch(() => {
        // Handle errors
        // console.log('Image upload error=', error);

        this.setState({
          picture: false,
          // cameraEnabled: true?
        });
      });
  };

  takePicture = () => {
    // console.log(this.camera);
    const picture = this.camera.getScreenshot();
    const buffer = this.urlB64ToUint8Array(picture.split(",")[1]);
    // console.log('Picture b64=', picture);
    const blob = new Blob([buffer], { type: "buffer" });
    // console.log(blob)
    const imageURL = window.URL.createObjectURL(blob);
    // console.log(imageURL)
    // this.uploadPicture(picture); // we shouldn't upload every time a picture is taken, but at the end/when user selects it as final image

    // this.props.stateHandler({ picture }, 'ImageTab'); // proof props method can be called (save form status)
    // send picture as props and dont use image state?

    this.setState({ picture: buffer, image: imageURL, cameraEnabled: false });
  };

  retakePicture = () => {
    this.setState({
      picture: null,
      image: "",
      cameraEnabled: true,
      croppedImage: null,
      croppedAreaPixels: null,
      zoom: 1,
      crop: {
        x: 0,
        y: 0,
      },
      rotation: 0,
    });
  };

  onUserMedia = () => {
    // console.log('User media detected', mediaStream);
    if (this.state.videoDevices === 0)
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(
          (d) => d.kind === "videoinput"
        ).length;
        this.setState({ videoDevices });
      });

    // this.camera.video.webkitRequestFullscreen();
    // this.screen.webkitRequestFullscreen();
  };

  onUserMediaError = () => {
    // console.error("User media error", error);
  };
  switchCamera = () => {
    if (this.state.facingMode === "user")
      this.setState({ facingMode: "environment" });
    else this.setState({ facingMode: "user" });
  };

  render() {
    return (
      <>
        {this.state.cameraEnabled ? (
          <>
            <Row>
              <Space direction="vertical" size={1}>
                <Title level={2}>Smile for the camera!</Title>
                <Paragraph style={{ color: "black" }}>
                  Take out any masks, sunglasses or anything that could block
                  your face and look straight at the camera.
                </Paragraph>
              </Space>
            </Row>
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
                mirrored={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={1}
                forceScreenshotSourceSize
                videoConstraints={{
                  ...this.cameraConstraints,
                  facingMode: this.state.facingMode,
                }}
                onCanPlayThrough={() => false}
                onClick={(event) => event.preventDefault()}
                onUserMedia={this.onUserMedia}
                onUserMediaError={this.onUserMediaError}
              >
                <div>TEST</div>
              </ReactWebcam>

              <div className="buttons-camera-container">
                <Space size={1} direction="horizontal">
                  <Button
                    onClick={this.takePicture}
                    shape="round"
                    className="button-orange"
                    style={{
                      margin: "20px",
                      width: "max-content",
                      height: "100%",
                      verticalAlign: "middle",
                      display: "flex",
                    }}
                  >
                    <Camera fill="white" width="25px" height="25px" />
                  </Button>
                  {this.state.videoDevices > 1 && (
                    <Button
                      onClick={this.switchCamera}
                      shape="round"
                      className="button-orange"
                      style={{
                        margin: "20px",
                        width: "max-content",
                        height: "100%",
                        verticalAlign: "middle",
                        display: "flex",
                      }}
                    >
                      <CameraSwitch fill="white" width="25px" height="25px" />
                    </Button>
                  )}
                </Space>
              </div>
            </div>
            <Space
              direction="vertical"
              size={1}
              style={{ margin: "0 auto", display: "block" }}
            >
              <Upload.Dragger
                {...this.draggerProps}
                style={{
                  width: "25%",
                  height: "100%",
                  backgroundColor: "#ffb978",
                  fontWeight: "bold",
                  display: "block",
                  margin: "0 auto",
                  border: "none",
                  borderRadius: "10px",
                  marginTop: "15px",
                }}
              >
                <FileAddFilled />

                <Paragraph className="ant-upload-text">Upload image</Paragraph>
              </Upload.Dragger>
            </Space>
          </>
        ) : null}

        {this.state.image && this.state.picture && !this.state.croppedImage && (
          <>
            <Row>
              <Space direction="vertical" size={1}>
                <Title level={2}>Crop your image!</Title>
                <Paragraph style={{ color: "black" }}>
                  Make sure your face is centered and not rotated.
                </Paragraph>
              </Space>
            </Row>
            <div style={this.styles.cropContainer}>
              <Cropper
                image={this.state.image}
                crop={this.state.crop}
                rotation={this.state.rotation}
                zoom={this.state.zoom}
                maxZoom={this.state.maxZoom}
                aspect={1}
                cropShape="round"
                onCropChange={this.setCrop}
                onRotationChange={this.setRotation}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.setZoom}
                onMediaLoaded={this.onMediaLoaded}
              />
            </div>
            <div style={this.styles.controls}>
              <div style={this.styles.sliderContainer}>
                Zoom
                <Slider
                  value={this.state.zoom}
                  className="slider"
                  min={1}
                  max={this.state.maxZoom}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(zoom) => this.setZoom(zoom)}
                />
              </div>
              <div style={this.styles.sliderContainer}>
                Rotation
                <Slider
                  value={this.state.rotation}
                  style={{ color: "black" }}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(rotation) => this.setRotation(rotation)}
                />
              </div>
            </div>
            <Space direction="horizontal" size={1}>
              <Button
                onClick={this.retakePicture}
                color="primary"
                shape="round"
                className="button-grey"
              >
                Take a different picture
              </Button>
              <Button
                onClick={this.showCroppedImage}
                color="primary"
                shape="round"
                className="button-orange"
              >
                Show Result
              </Button>
            </Space>
          </>
        )}
        
        {this.state.croppedImage ? (
          <div style={{ textAlign: "center" }}>
            <Space direction="vertical">
              <Title level={2}>Verify your photo!</Title>
              <Paragraph>
                Make sure <Text strong>your facial features are visible</Text>{" "}
                and{" "}
                <Text strong>
                  not covered under heavy make up, masks or other coverings.
                </Text>{" "}
                You also must be looking straight at the camera.
              </Paragraph>

              <Row justify="center">
                <Col xs={24} lg={12}>
                  <Image
                    preview={false}
                    style={{
                      width: "300px",
                      height: "auto",
                      borderRadius: "50%",
                      border: "1px solid black",
                    }}
                    src={this.state.croppedImage}
                    alt="Crop result"
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <List
                    style={{ width: "100%" }}
                    itemLayout="horizontal"
                    dataSource={this.imageRulesList}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.title}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </Space>
            <Row justify="center">
              <Col span={12}>
                <Button type="primary" shape="round" className="button-grey" onClick={this.retakePicture}>
                  Take another picture
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" disabled={this.state.croppedImage === null} shape="round" className="button-orange" onClick={this.uploadPicture} loading={this.state.loading}>
                  It&apos;s looking great!
                </Button>
              </Col>
            </Row>
          </div>
        ) : null}
        <Row justify="center">
          <Col span={24}>
            <Button type="primary" shape="round" className="button-grey" onClick={this.props.prev}>
              Go back!
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}
