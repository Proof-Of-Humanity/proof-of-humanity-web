import {
  EthereumAccount,
  Field,
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Alert, Form, Checkbox, Button, Input, Row, Space, Typography, Col } from 'antd';
const { Link, Paragraph, Title } = Typography;
export default class InitialTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('InitialTab props=', props);
    this.state = {
      currentStep:'address',
      checked:false
    }
  }
  
  
  handleAdvance = () => {
    this.props.next();
  }
  
  render() {
    
    let submissionName = '';
    let { t } = this.props.i18n;
    

    return (
      
      <>
        
        {this.state.currentStep == 'address' && (
          <Row>
          <Space direction='vertical' size={1}>
            <h2 style={{fontWeight:'bold'}}>{t('Create your Proof Of Humanity Profile')}</h2>
            <p>{t('Submitting your profile to Proof of Humanity takes an average of 5-10 minutes, an existing Ethereum account and requires you to record a video of yourself talking.')}</p>
            
            {/* Add links or example how a profile gets registered? Register -> Vouch -> Pending (3.5 days) -> Start accruing UBI */}
          
          
            <p>{t('Your connected wallet:')}</p>
            <p style={{color:"#ffb978", fontWeight:'bold', border:"3px solid #ffb978", borderRadius:"15px", width:"max-content", textAlign:"center", margin:'0 auto', padding:"5px"}}>{this.props.account}</p>
            <Checkbox style={{fontWeight:'bold'}} onChange={()=>this.setState({checked:true})}>I understand this wallet will be irreversebly linked to my real world person and I will not use that wallet for any private or sensitive information.</Checkbox>
            <Link href={'https://tornado.cash'} target='_blank' rel='noopener' style={{fontWeight:'bold'}}>Learn how to increase your privacy with Tornado Cash</Link>
            <Button disabled = {!this.state.checked} type='primary' htmlType="submit" shape='round' style={{fontWeight:'bold', display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={()=>this.setState({currentStep:'name'})}>Next step: short bio</Button>
          </Space>
        </Row>
        )}
        {this.state.currentStep == 'name' && (
          <Row>
          <Space direction='vertical' size={1}>
            <h2 style={{fontWeight:'bold'}}>{t('Tell us something about yourself')}</h2>
            <p>{t('You can use a pseudonym if you feel more comfortable, but please provide some basic information about yourself.')}</p>
            
          <Form
          name="basicform"
          onValuesChange={(values) =>this.props.stateHandler({...values})}
          initialValues={{ remember: true }}>
          {/*<Alert type="info"
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
            
          </Alert>*/}
          <Title level={5}>I like to be called...</Title>
          <Form.Item label="" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input placeholder="Your name" style={{fontWeight:'bold'}}/>
          </Form.Item>
          <Title level={5}>Tell us something about yourself</Title>
          <Form.Item label="" name="bio">
            <Input.TextArea placeholder="Where you are from, how old you are, what things you like, etc" style={{fontWeight:'bold'}} />
          </Form.Item>
         
          <Form.Item>
          <Row>
            <Col xl={8} xs={24} style={{ margin:'0 auto'}}>
          <Button type='primary' shape='round' style={{fontWeight:'bold', display:'block', margin:'0 auto', backgroundColor:"#95a5a6", border:'none'}} onClick={()=>this.setState({currentStep:'address'})}>Go back</Button>
          </Col>
          <Col xl={8} xs={24}>
          <Button disabled = {this.props.state.name == ""} type='primary' htmlType="submit" shape='round' style={{fontWeight:'bold', display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.handleAdvance}>Next step: selfie</Button>
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
