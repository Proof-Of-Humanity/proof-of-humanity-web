import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";

const { Link, Paragraph, Title } = Typography;

export default class InitialTab extends React.Component {
  constructor(props) {
    super(props);
    // console.log('InitialTab props=', props);
    this.state = {
      currentStep: "address",
      checked: false,
    };
  }

  handleAdvance = () => {
    this.props.next();
  };

  render() {
    // console.log(this.props.submission)
    const { t } = this.props.i18n;

    return (
      <>
        {this.state.currentStep === "address" && (
          <Row>
            <Space direction="vertical" size={1}>
              <Title level={2} style={{ fontWeight: "bold" }}>
                {this.props.reapply
                  ? t("submit_profile_initial_title_reapply")
                  : t("submit_profile_initial_title")}
              </Title>
              <Paragraph>
                {this.props.reapply
                  ? t("submit_profile_initial_description_reapply")
                  : t("submit_profile_initial_description")}
              </Paragraph>
              <Link
                className="tornado-link"
                href="https://tornado.cash"
                target="_blank"
                rel="noopener"
                style={{ margin: "0 10%" }}
              >
                {t("submit_profile_tornado_cash")}
              </Link>
              {/* Add links or example how a profile gets registered? Register -> Vouch -> Pending (3.5 days) -> Start accruing UBI */}

              <Paragraph>{t("submit_profile_your_wallet")}</Paragraph>
              <Paragraph
                className="wallet-address"
                style={{
                  fontFamily: "monospace",
                  color: "#fff",
                }}
              >
                {this.props.account}
              </Paragraph>
              {!this.props.reapply && (
                <Checkbox
                  style={{ fontWeight: "bold" }}
                  onChange={(event) => {
                    this.setState({ checked: event.target.checked });
                  }}
                >
                  {t("submit_profile_sensitive_info")}
                </Checkbox>
              )}
              <Button
                disabled={!this.state.checked && !this.props.reapply}
                type="primary"
                htmlType="submit"
                shape="round"
                className="button-orange"
                onClick={() => this.setState({ currentStep: "name" })}
              >
                {t("submit_profile_next")}
              </Button>
            </Space>
          </Row>
        )}
        {this.state.currentStep === "name" && (
          <Row>
            <Space direction="vertical" size={1}>
              <Title level={2} style={{ fontWeight: "bold" }}>
                {t("submit_profile_info_title")}
              </Title>
              <Paragraph>
                {!(this.props.reapply || this.props?.submission)
                  ? t("submit_profile_info_description")
                  : null}
              </Paragraph>

              <Form
                name="basicform"
                onValuesChange={(values) =>
                  this.props.stateHandler({ ...values })
                }
                initialValues={{ remember: true }}
              >
                <Title level={5}>{t("submit_profile_info_name_title")}</Title>
                <Form.Item
                  label=""
                  name="name"
                  initialValue={this.props.submission?.name}
                  rules={[
                    {
                      required: true,
                      message: t("submit_profile_info_name_error_help"),
                    },
                  ]}
                >
                  <Input
                    autoComplete="off"
                    disabled={this.props.submission !== null}
                    placeholder={t("submit_profile_info_name_placeholder")}
                    style={{ fontWeight: "bold" }}
                  />
                </Form.Item>
                <Title level={5}>{t("submit_profile_info_bio_title")}</Title>
                <Form.Item label="" name="bio">
                  <Input.TextArea
                    placeholder={t("submit_profile_info_bio_placeholder")}
                    style={{ fontWeight: "bold" }}
                  />
                </Form.Item>

                <Form.Item>
                  <Row>
                    <Col span={12} style={{ margin: "0 auto" }}>
                      <Button
                        type="primary"
                        shape="round"
                        className="button-grey"
                        onClick={() =>
                          this.setState({ currentStep: "address" })
                        }
                      >
                        {t("submit_profile_previous")}
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        disabled={
                          (this.props.state.name === undefined ||
                            this.props.state.name === "") &&
                          this.props?.submission === null
                        }
                        htmlType="submit"
                        shape="round"
                        className="button-orange"
                        onClick={this.handleAdvance}
                      >
                        {t("submit_profile_next")}
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Space>
          </Row>
        )}
      </>
    );
  }
}
