import { useTranslation } from 'react-i18next'; 
import {  useWeb3 } from "@kleros/components";
import { Row, Col, Button, Space } from 'antd';

export default function ProfileNew() {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t, i18n } = useTranslation();

  return (
    <Row justify="center">
      <Col xs={24} md={12}>
        <Space direction="vertical" size="middle">
          <h2>Create your PoH profile</h2>
          <p>It seems you don't have a wallet already, please</p>
          <Button onClick={connect}>Connect an Ethereum Wallet</Button>
          <Button>Create a Wallet</Button>
        </Space>
      </Col>
    </Row>
  );
}
