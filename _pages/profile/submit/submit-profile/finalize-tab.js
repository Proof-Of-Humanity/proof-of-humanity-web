import {
  Alert,
  Button,
  // Checkbox,
  Col,
  Image,
  InputNumber,
  Progress,
  Radio,
  Row,
  Spin,
  Typography,
} from "antd";
import { withRouter } from "next/router";
import React from "react";
import Video from "react-player";

import { exitFFMPEG } from "lib/media-controller";

const { Title, Link, Paragraph } = Typography;

class _FinalizeTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      playedVideo: false,
    };
  }

  handleVideo = () => {
    this.setState({ playedVideo: true });
  };

  handleSubmit = () => {
    this.props.stateHandler({ error: null });
    this.setState({ loading: true });
    this.props.prepareTransaction();
  };

  goToProfile = () => {
    this.props.router.push({
      pathname: "/profile/[id]",
      query: { id: this.props.account },
    });
  };

  exitAndPrev = () => {
    exitFFMPEG();
    this.props.prev();
    this.props.stateHandler({
      progress: 0,
    });
  };
  playVideo = () => {
    this.setState({ playing: true });
  };
  setDepositAmount = (value) => {
    if (value === null) {
      this.props.stateHandler({ customDeposit: "0" });
    } else {
      this.props.stateHandler({ customDeposit: String(value) });
    }
  };

  render() {
    // console.log(this.props.state)
    // img, video and submitter name source by props
    const { t } = this.props.i18n;

    if (this.props.state.txHash === "") {
      return (
        <Row>
          <Col span={24}>
            <Title level={2}>{t("submit_profile_finalize_title")}</Title>
            <Paragraph>{t("submit_profile_finalize_description")}</Paragraph>
            {/* Change how we show this alert.. this design should be new */}
            {/* <Alert
              message={
                <>
                  <Title level={5}>Pro tip</Title>
                  <Paragraph>
                    People can try to notify you of problems in your submission
                    and save your deposit via your{" "}
                    <Link href="https://ethmail.cc/">ethmail.cc</Link>. Make sure
                    to check it while submission is being processed.
                  </Paragraph>
                </>
              }
              style={{ marginBottom: "15px" }}
              closable
              showIcon
            /> */}
            {this.props.state.name && (
              <Row>
                <Title level={4}>
                  {t("submit_profile_finalize_name")}:&nbsp;
                  <div
                    style={{ fontWeight: "initial", display: "inline-block" }}
                  >
                    {this.props.state.name}
                  </div>
                </Title>
              </Row>
            )}
            {this.props.account && (
              <Row>
                <Title level={4}>
                  {t("submit_profile_finalize_eth_addr")}:{" "}
                </Title>
                <Paragraph
                  style={{
                    width: "100%",
                    fontWeight: "bold",
                    border: "2px solid #ffb978",
                    borderRadius: "15px",
                    textAlign: "center",
                    margin: "0 auto",
                    padding: "5px",
                  }}
                >
                  {this.props.account}
                </Paragraph>
              </Row>
            )}
            {this.props.state.bio && (
              <Row>
                <Title level={4}>
                  {t("submit_profile_finalize_about")}: {this.props.state.bio}
                </Title>
              </Row>
            )}
            <Row justify="center" align="middle" style={{ marginTop: "5%" }}>
              <Col
                xl={12}
                xs={24}
                style={{
                  margin: "0 auto",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {this.props.state.imageURI !== "" ? (
                  <Image
                    crossOrigin="anonymous"
                    preview={false}
                    style={{
                      width: "50%",
                      borderRadius: "50%",
                      border: "1px solid black",
                      display: "block",
                      margin: "0 auto",
                    }}
                    src={this.props.state.imageURI}
                  />
                ) : (
                  <Row justify="center">
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Paragraph>
                        {t("submit_profile_finalize_loading_picture")}
                      </Paragraph>
                      <Spin />
                    </Col>
                  </Row>
                )}
              </Col>
              <Col xl={12} xs={24}>
                {this.props.state.videoURI !== "" ? (
                  <>
                    <Video
                      config={{
                        file: {
                          attributes: {
                            crossOrigin: "true",
                          },
                        },
                      }}
                      controls
                      playing={this.state.playing}
                      onEnded={(event) => this.handleVideo(event)}
                      style={{ width: "100%", display: "block" }}
                      width="100%"
                      height="100%"
                      url={this.props.state.videoURI}
                    />
                    {!this.state.playedVideo && (
                      <Paragraph style={{ textAlign: "center" }}>
                        {t("submit_profile_finalize_video_check")}
                      </Paragraph>
                    )}
                  </>
                ) : (
                  <Row justify="center">
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Paragraph>
                        {t("submit_profile_finalize_loading_video")}
                      </Paragraph>
                      <Spin />
                      <Progress
                        percent={Math.round(this.props.state.progress * 100)}
                        status="active"
                      />
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <Row justify="center">
              <Radio.Group
                onChange={(event) => {
                  this.props.stateHandler({ crowdfund: event.target.value });
                }}
                style={{
                  marginTop: "5%",
                }}
              >
                <Radio value="self" style={{ fontSize: "18px" }}>
                  {t("submit_profile_finalize_selffund")} (
                  {this.props.state.deposit.ether} ETH)
                </Radio>

                <Radio value="crowd" style={{ fontSize: "18px" }}>
                  {t("submit_profile_finalize_crowdfund")}
                </Radio>
              </Radio.Group>
              {this.props.state.crowdfund === "self" && (
                <Alert
                  style={{ marginTop: "2%" }}
                  message={t("submit_profile_deposit_info")}
                  type="info"
                  closable
                />
              )}
              {this.props.state.crowdfund === "crowd" && (
                <InputNumber
                  min={0}
                  max={this.props.state.deposit.ether}
                  defaultValue={0}
                  onChange={this.setDepositAmount}
                />
              )}
            </Row>
            <Alert
              style={{
                textAlign: "center",
                width: "fit-content",
                margin: "0 auto",
                marginTop: "3%",
              }}
              message={
                <Link
                  href={this.props.rules}
                  target="_blank"
                  rel="noopener"
                  style={{ color: "black", fontWeight: "bold" }}
                >
                  {t("submit_profile_rules_info")}
                </Link>
              }
              type="info"
            />
            {/* Next steps... */}{" "}
          </Col>
          <Button
            type="primary"
            shape="round"
            className="button-grey"
            onClick={this.exitAndPrev}
          >
            {t("submit_profile_previous")}
          </Button>
          {this.state.playedVideo ? (
            <Button
              type="primary"
              disabled={
                this.props.state.crowdfund === null ||
                this.props.state.videoURI === "" ||
                this.props.state.imageURI === "" ||
                !this.state.playedVideo
              }
              shape="round"
              className="button-orange"
              onClick={this.handleSubmit}
              loading={this.state.loading && this.props.state.error === null}
            >
              {t("submit_profile")}
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              className="button-orange"
              onClick={this.playVideo}
            >
              {t("submit_profile_finalize_video_check")}
            </Button>
          )}
        </Row>
      );
    }

    return (
      <Row style={{ display: "block", margin: "0 auto" }}>
        <Col span={24}>
          <Title level={2}>{t("submit_profile_nextsteps_title")}</Title>
          <Title level={4}>{t("submit_profile_nextsteps_description")}</Title>
          <Row justify="center" align="middle">
            <Col span={24}>
              <Title level={4} style={{ display: "block", margin: "0 auto" }}>
                {t("submit_profile_nextsteps_vouch_help")}
              </Title>
            </Col>
          </Row>
          <Row justify="center" align="middle">
            <Col span={24}>
              <Link
                href="https://t.me/PoHCrowdvoucher"
                target="_blank"
                className="button-orange"
                style={{
                  width: "75%",
                  height: "30%",
                  borderRadius: "25px",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {t("submit_profile_nextsteps_crowdvoucher_group")}
              </Link>
            </Col>
          </Row>

          {this.props.state.crowdfund === "crowd" && (
            <Row justify="center">
              <Col span={24}>
                <Title level={4} style={{ display: "block", margin: "0 auto" }}>
                  {t("submit_profile_nextsteps_deposit_help")}
                </Title>
                <Link
                  href="https://t.me/PoHcrowdfunding"
                  target="_blank"
                  className="button-orange"
                  style={{
                    width: "75%",
                    borderRadius: "25px",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {t("submit_profile_nextsteps_crowdfunding_group")}
                </Link>
              </Col>
            </Row>
          )}

          {this.props.state.confirmed && (
            <Button
              type="primary"
              shape="round"
              style={{
                fontWeight: "bold",
                display: "block",
                margin: "50px auto",
                backgroundColor: "#ffb978",
                border: "none",
                width: "50%",
                height: "60px",
              }}
              onClick={this.goToProfile}
            >
              {t("submit_profile_nexsteps_goto_profile")}
            </Button>
          )}
        </Col>
      </Row>
    );
  }
}

const FinalizeTab = withRouter(_FinalizeTab);
export default FinalizeTab;
