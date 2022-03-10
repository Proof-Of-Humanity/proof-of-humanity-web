import {
  Alert,
  EthereumAccount,
  Field,
  Link,
  Text,
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Form, Button, Input } from 'antd';

export default class InitialTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('InitialTab props=', props);
  }

  render() {
    let account = 'asd';
    let submissionName = '';

    return (
      <Form 
        name="basicform"
        onFinishFailed={() => alert('Failed to submit')}
        onFinish={() => alert('Form Submitted')}
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
          <Form.Item label="Enter name" name="Name" rules={[ {required: true, message: 'Please enter your name' }]}>
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
          <Form.Item>
            <Button type="success" htmlType="submit">Submit Username</Button>
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
    );
  }
}
