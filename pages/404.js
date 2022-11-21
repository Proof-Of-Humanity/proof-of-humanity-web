import { Col, Image, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

export default function Custom404() {
  const { t } = useTranslation();
  return (
    <Row justify="center">
      <Col span={12} style={{ textAlign: "center", color: "#fff" }}>
        <Image
          src="/images/404.png"
          style={{ width: "25%", height: "auto" }}
          preview={false}
        />
        <Title level={1}>{t("404_title")}</Title>
        <Paragraph>{t("404_description")}</Paragraph>
      </Col>
    </Row>
  );
}
