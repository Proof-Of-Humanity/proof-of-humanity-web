import {
  Alert, // need to deprecate this!
  EthereumAccount,
  Field,
  Link, // need to deprecate this!
  Text, // need to deprecate this!
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Form, Button, Input, Row, Space } from 'antd';

export default class InitialTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('InitialTab props=', props);
  }

  render() {
    let account = 'asd';
    let submissionName = '';
    let { t } = this.props.i18n;

    return (
      <>
        <Row>
          <Space direction='vertical' size={1}>
            <h2>{t('Submit your profile')}</h2>
            <p>{t('Follow the steps to register to Proof of Humanity')}</p>
            <p>{t('How registration works? (link)')}</p>
            {/* Add links or example how a profile gets registered? Register -> Vouch -> Pending (3.5 days) -> Start accruing UBI */}
          </Space>
        </Row>
        <Form
          name="basicform"
          onFinishFailed={() => alert('Failed to submit')}
          onFinish={(values) =>this.props.stateHandler({info:values})}
          initialValues={{ remember: true }}>
          <Alert title="Public Address" sx={{ mb: 3 }}>
            {/* <EthereumAccount
              address={account}
              diameter={24}
              sx={{ maxWidth: 388, color: "text", fontWeight: "bold" }}
            /> */}
            <Text>
              To improve your privacy, we recommend using an address which is
              already public or a new one-seeded through{" "}
              <Link
                href="https://tornado.cash"
                target="_blank"
                rel="noreferrer noopener"
              >
                tornado.cash
              </Link>
              .
            </Text>
          </Alert>
          <Alert title="Advice" sx={{ mb: 3 }}>
            <Text>
              Submissions are final and cannot be edited. Be sure to follow
              all submission rules to not lose your deposit.
            </Text>
          </Alert>
          <Form.Item label="Enter name" name="Name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Enter first name" name="First name">
            <Input />
          </Form.Item>
          <Form.Item label="Enter last name" name="Last name">
            <Input />
          </Form.Item>
          <Form.Item label="Enter short bio" name="Something about yourself">
            <Input.TextArea />
          </Form.Item>
          <Alert title="Pro Tip" sx={{ mb: 3 }}>
            <Text>
              People can try to notify you of problems in your submission and
              save your deposit via your{" "}
              <Link href="https://ethmail.cc/">ethmail.cc</Link>. Make sure to
              check it while submission is being processed.
            </Text>
          </Alert>
        </Form>
      </>
    );
  }
}
