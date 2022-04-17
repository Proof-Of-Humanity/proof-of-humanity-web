import { useTranslation } from 'react-i18next';

import { Row, Col, Layout } from 'antd';
import Link from "./link";
import SocialIcons from "./social-icons";
import { SecuredByKlerosWhite } from "@kleros/icons";

const { Footer } = Layout;

export default function AppFooter() {
  const { t } = useTranslation();

  return (
    <Footer className="poh-footer">
      <Row>
        <Col xs={12} lg={8}>
          <Row justify="start">
            <Link className="poh-footer-text" variant="navigation" sx={{ fontSize: 1 }} newTab href="https://www.proofofhumanity.id/">
              {t('footer_learn_more')}
            </Link>
          </Row>
        </Col>
        <Col xs={0} lg={8}>
          <Row justify="center">
            <Link sx={{ alignItems: "center", display: "flex" }} newTab href="https://kleros.io">
              <SecuredByKlerosWhite sx={{ width: 200 }} />
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
