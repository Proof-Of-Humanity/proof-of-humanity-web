import { Col, Layout, Row } from "antd";
import { useTranslation } from "react-i18next";

import Image from "./image";
import Link from "./link";
import SocialIcons from "./social-icons";

const { Footer } = Layout;

export default function AppFooter() {
  const { t } = useTranslation();

  return (
    <Footer className="poh-footer">
      <Row>
        <Col xs={12} lg={8}>
          <Row justify="start">
            <Link
              className="poh-footer-text"
              variant="navigation"
              sx={{ fontSize: 1 }}
              newTab
              href="https://proofofhumanity.org/"
            >
              {t("footer_learn_more")}
            </Link>
          </Row>
        </Col>
        <Col xs={0} lg={8}>
          <Row justify="center">
            <Link
              sx={{ alignItems: "center", display: "flex" }}
              newTab
              href="https://ubi.eth.limo"
            >
              <Image
                sx={{ cursor: "pointer" }}
                src="/images/ubi-logo.png"
                width="72"
                height="auto"
              />
            </Link>
          </Row>
        </Col>
        <Col xs={12} lg={8}>
          <Row justify="end">
            <SocialIcons color="#ffffff" />
          </Row>
        </Col>
      </Row>
    </Footer>
  );
}
