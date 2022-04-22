import {
  CheckCircleFilled,
  CloseCircleFilled,
  FileAddFilled,
} from "@ant-design/icons";
import {
  Camera,
  CameraSwitch,
  ExitFullscreen,
  Fullscreen,
} from "@kleros/icons";
import {
  Button,
  Col,
  Image,
  List,
  Row,
  Slider,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import React from "react";
import Cropper from "react-easy-crop";
import { Trans } from "react-i18next";
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
      fullscreen: false,
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
      description: (
        <Row justify="center">
          <Col span={6}>
            <Image
              src="/images/front-facing.jpg"
              preview={false}
              className="image-rules"
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
          <Col span={6}>
            <Image
              src="/images/not-front-facing.jpg"
              preview={false}
              className="image-rules"
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>

          <Col span={6}>
            <Image
              src="/images/glasses.jpg"
              preview={false}
              className="image-rules"
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
          <Col span={6}>
            <Image
              src="/images/sunglasses.jpg"
              preview={false}
              className="image-rules"
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
        </Row>
      ),
    },
    {
      title: "",
      description: (
        <Row justify="center">
          <Col span={6}>
            <Image
              src="/images/hijab.jpg"
              preview={false}
              className="image-rules"
            />
            <CheckCircleFilled
              style={{
                fontSize: "20px",
                color: "green",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
          <Col span={6}>
            <Image
              src="/images/niqab.jpg"
              preview={false}
              className="image-rules"
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
          <Col span={6}>
            <Image
              src="/images/b&w.jpg"
              preview={false}
              className="image-rules"
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
          <Col span={6}>
            <Image
              src="/images/mask.jpg"
              preview={false}
              className="image-rules"
            />
            <CloseCircleFilled
              style={{
                fontSize: "20px",
                color: "red",
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>
        </Row>
      ),
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
    if (croppedAreaPixels.width > 256 && croppedAreaPixels.height > 256) {
      this.setState({ croppedAreaPixels });
    } else {
      message.error(this.props.i18n.t("submit_profile_image_size_error"));
    }
  };
  setCroppedImage = (croppedImage) => this.setState({ croppedImage });

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    // console.log("cropped area: " + JSON.stringify(croppedArea))
    this.setCroppedAreaPixels(croppedAreaPixels);
  };
  onMediaLoaded = (media) => {
    const maxZoom = Math.floor(
      Math.min(media.naturalWidth, media.naturalHeight) / 256
    );
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

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  draggerProps = {
    name: "file",
    multiple: false,
    accept: this.photoOptions.types.label,
    beforeUpload: (file) => {
      if (this.photoOptions.types.value.includes(file.type)) {
        return true;
      }

      message.error(this.props.i18n.t("submit_profile_file_not_supported"));
      return Upload.LIST_IGNORE;
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

    photoSanitizer(buffer)
      .then((response) => {
        this.setState({ fileURI: response, loading: false });
        this.props.stateHandler({ imageURI: response });
        window.location.href = "#top";
        this.props.next();
      })
      .catch((err) => {
        if (err === "image_grayscale") {
          message.error(this.props.i18n.t("submit_profile_image_grayscale"), 5);
        }
        // console.log(error)
        else {
          message.error(
            "There was an error parsing your image, please try again",
            5
          );
        }

        this.retakePicture();
      });
  };

  takePicture = () => {
    // console.log(this.camera);
    if (this.state.fullscreen) {
      this.closeFullscreen();
    }
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
      loading: false,
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
    if (this.state.videoDevices === 0) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(
          (d) => d.kind === "videoinput"
        ).length;
        this.setState({ videoDevices });
      });
    }

    // this.camera.video.webkitRequestFullscreen();
    // this.screen.webkitRequestFullscreen();
  };

  onUserMediaError = (error) => {
    // console.error("User media error", error);
    // console.log(error.name); /* handle the error */
    if (
      error.name === "NotFoundError" ||
      error.name === "DevicesNotFoundError"
    ) {
      this.props.stateHandler({ userMediaError: "NoCamera" });
      // required track is missing
    } else if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      // permission denied in browser
      this.props.stateHandler({ cameraPermission: false });
    } else if (
      error.name === "OverconstrainedError" ||
      error.name === "ConstraintNotSatisfiedError"
    ) {
      // constraints can not be satisfied by avb. devices
      this.props.stateHandler({ userMediaError: "NoConstraints" });
    } else if (
      error.name === "NotReadableError" ||
      error.name === "TrackStartError"
    ) {
      this.props.stateHandler({ userMediaError: "NoCamera" });
      // webcam or mic are already in use
    }
  };
  switchCamera = () => {
    if (this.state.facingMode === "user") {
      this.setState({ facingMode: "environment" });
    } else {
      this.setState({ facingMode: "user" });
    }
  };
  toggleFullscreen = () => {
    this.screen.webkitRequestFullscreen();
    this.setState({ fullscreen: true });
  };
  closeFullscreen = () => {
    document.webkitExitFullscreen();
    this.setState({ fullscreen: false });
  };

  render() {
    const { t } = this.props.i18n;

    return (
      <>
        {this.state.cameraEnabled &&
        this.props.state.cameraPermission &&
        this.props.state.userMediaError === "" ? (
          <>
            <Row>
              <Col span={24}>
                <Title level={2}>{t("submit_profile_image_title")}</Title>
                <Paragraph style={{ color: "black", whiteSpace: "pre-line" }}>
                  {t("submit_profile_image_description")}
                </Paragraph>
              </Col>
            </Row>
            <div
              className="video-inner-container"
              ref={(screen) => {
                this.screen = screen;
              }}
            >
              <ReactWebcam
                style={{ width: "100%", display: "block" }}
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
              />

              <div className="buttons-camera-container">
                <Row justify="center">
                  {this.state.videoDevices > 1 && (
                    <Col span={6}>
                      <Button
                        onClick={this.switchCamera}
                        shape="round"
                        className="button-orange-camera"
                      >
                        <CameraSwitch fill="white" width="25px" height="25px" />
                      </Button>
                    </Col>
                  )}
                  <Col span={6}>
                    <Button
                      onClick={this.takePicture}
                      shape="round"
                      className="button-orange-camera"
                    >
                      <Camera fill="white" width="25px" height="25px" />
                    </Button>
                  </Col>

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
                        <Fullscreen width="25px" height="25px" fill="white" />
                      </Button>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
            <Title level={2}>{t("submit_profile_image_upload_title")}</Title>
            <Row justify="center">
              <Col xs={12} lg={6}>
                <Upload.Dragger {...this.draggerProps} className="dragger">
                  <FileAddFilled />
                  <Paragraph className="ant-upload-text">
                    {t("submit_profile_image_upload_button")}
                  </Paragraph>
                </Upload.Dragger>
              </Col>
            </Row>
          </>
        ) : !this.state.image ? (
          <>
            <Row>
              <Col span={24}>
                {!this.props.state.cameraPermission && (
                  <>
                    <Title level={2}>
                      {t("submit_profile_missing_permissions")}
                    </Title>
                    <Paragraph
                      style={{ color: "black", whiteSpace: "pre-line" }}
                    >
                      {t("submit_profile_missing_permissions_description")}
                    </Paragraph>
                  </>
                )}
                {this.props.state.userMediaError === "NoCamera" && (
                  <>
                    <Title level={2}>
                      {t("submit_profile_missing_camera")}
                    </Title>
                    <Paragraph
                      style={{ color: "black", whiteSpace: "pre-line" }}
                    >
                      {t("submit_profile_missing_camera_description")}
                    </Paragraph>
                  </>
                )}
                {this.props.state.userMediaError === "NoConstraints" && (
                  <>
                    <Title level={2}>
                      {t("submit_profile_missing_constraints")}
                    </Title>
                    <Paragraph
                      style={{ color: "black", whiteSpace: "pre-line" }}
                    >
                      {t("submit_profile_missing_constraints_description")}
                    </Paragraph>
                  </>
                )}
              </Col>
            </Row>

            <Title level={2}>{t("submit_profile_image_upload_title")}</Title>
            <Row justify="center">
              <Col xs={12} lg={6}>
                <Upload.Dragger {...this.draggerProps} className="dragger">
                  <FileAddFilled />
                  <Paragraph className="ant-upload-text">
                    {t("submit_profile_image_upload_button")}
                  </Paragraph>
                </Upload.Dragger>
              </Col>
            </Row>
          </>
        ) : null}

        {this.state.image && this.state.picture && !this.state.croppedImage && (
          <>
            <Row>
              <Space direction="vertical" size={1}>
                <Title level={2}>{t("submit_profile_image_crop_title")}</Title>
                <Paragraph style={{ color: "black" }}>
                  {t("submit_profile_image_crop_description")}
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
            <Row justify="center">
              <Col xs={24} xl={12}>
                {t("submit_profile_image_crop_zoom")}
                <Slider
                  value={this.state.zoom}
                  className="slider"
                  min={1}
                  max={this.state.maxZoom}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(zoom) => this.setZoom(zoom)}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Col xs={24} xl={12}>
                {t("submit_profile_image_crop_rotation")}
                <Slider
                  value={this.state.rotation}
                  style={{ color: "black" }}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(rotation) => this.setRotation(rotation)}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Col span={12}>
                <Button
                  onClick={this.retakePicture}
                  color="primary"
                  shape="round"
                  className="button-grey"
                >
                  {t("submit_profile_image_retake")}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  onClick={this.showCroppedImage}
                  color="primary"
                  shape="round"
                  className="button-orange"
                >
                  {t("submit_profile_image_crop_result")}
                </Button>
              </Col>
            </Row>
          </>
        )}

        {this.state.croppedImage ? (
          <>
            <Space direction="vertical">
              <Title level={2}>{t("submit_profile_image_verify_title")}</Title>
              <Paragraph style={{ whiteSpace: "pre-line" }}>
                <Trans
                  i18nKey="submit_profile_image_verify_description"
                  t={t}
                  components={[
                    <Text key="1" strong />,
                    <Text key="2" strong />,
                  ]}
                />
              </Paragraph>

              <Row justify="center" align="middle">
                <Col xs={24} lg={12}>
                  <Title
                    level={4}
                    style={{ textAlign: "center", marginBottom: "3%" }}
                  >
                    {t("submit_profile_image_result_title")}
                  </Title>
                  <Image
                    preview={false}
                    style={{
                      width: "50%",
                      height: "auto",
                      borderRadius: "50%",
                      border: "1px solid black",
                      display: "block",
                      margin: "0 auto",
                    }}
                    src={this.state.croppedImage}
                    alt="Crop result"
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <Title level={4} style={{ textAlign: "center" }}>
                    {this.props.i18n.t("submit_profile_image_rules_title")}
                  </Title>
                  <List
                    style={{ width: "100%" }}
                    itemLayout="horizontal"
                    dataSource={this.imageRulesList}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta description={item.description} />
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </Space>
            <Row justify="center">
              <Col span={12}>
                <Button
                  type="primary"
                  shape="round"
                  className="button-grey"
                  onClick={this.retakePicture}
                >
                  {t("submit_profile_image_retake")}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  disabled={this.state.croppedImage === null}
                  shape="round"
                  className="button-orange"
                  onClick={this.uploadPicture}
                  loading={this.state.loading}
                >
                  {t("submit_profile_image_verify_next")}
                </Button>
              </Col>
            </Row>
          </>
        ) : null}

        <Row justify="center">
          <Col span={24}>
            <Button
              type="primary"
              shape="round"
              className="button-grey"
              onClick={this.props.prev}
            >
              {t("submit_profile_previous")}
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}
