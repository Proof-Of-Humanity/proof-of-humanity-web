import {
  EthereumAccount,
  Field,
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Alert, Form, Button, Input, Row, Space, Typography } from 'antd';
const { Link, Paragraph, Title } = Typography;
export default class InitialTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('InitialTab props=', props);
  }
  
  
  handleAdvance = () => {
    if(this.props.state.name){
      
    let current = this.props.state.current + 1;
    this.props.stateHandler({current})
  }
  }
  render() {
    
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
          onFinish={this.handleAdvance}
          onValuesChange={(values) =>this.props.stateHandler({...values})}
          initialValues={{ remember: true }}>
          <Alert type="info"
           message={
           <>
           <Title level={5}>Public address</Title><EthereumAccount address={this.props.account} diameter={24} sx={{ maxWidth: 388, color: "text", fontWeight: "bold" }} />
            <Paragraph>
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
            </Paragraph>
            </>
          } style={{ marginBottom: "15px" }} showIcon>
            
          </Alert>
          <Alert type={"info"} message={
            <>
            <Title level={5}>Advice</Title>
            <Paragraph>
              Submissions are final and cannot be edited. Be sure to follow
              all submission rules to not lose your deposit.
            </Paragraph>
            </>
          } style={{ marginBottom: "15px" }} closable showIcon>
            
          </Alert>
          <Form.Item label="Enter name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Enter short bio" name="bio">
            <Input.TextArea />
          </Form.Item>
          { this.props.state.name !== "" && (
          <Form.Item>
          <Button type='primary' htmlType="submit" shape='round' style={{display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.handleAdvance}>Next</Button>
          </Form.Item>
          )}
        </Form>
      </>
    );
  }
}
