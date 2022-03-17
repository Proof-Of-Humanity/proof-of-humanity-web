import {
  EthereumAccount,
  Field,
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Alert, Form, Button, Input, List, Row, Space, Typography, Col } from 'antd';
const { Link, Paragraph, Title } = Typography;
export default class PostSubmitTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('Final steps props=', props);
  }
  goToProfile = () => {
    window.location.reload();
  }
  render() {
    return (
      
      <Row style={{display:'block', margin:'0 auto'}}>
        <Space direction="vertical">
        
    <Title level={4}>Your submission was sent and it will soon be confirmed on the blockchain.</Title>
    <Title level={4}>What&apos;s next?</Title>
    <Paragraph>Your profile will be on 'Vouching Phase'. This means that someone who is already registered must vouch for you.</Paragraph>
    <Title level={4}>How can I get vouched?</Title>
    <List>
      <List.Item>Share the link to your profile with someone who is already registered.</List.Item>
      <List.Item>Join the crowdvoucher group on <Link href="https://t.me/PoHCrowdvoucher" target="_blank">Telegram</Link></List.Item>
      {this.props.state.crowdfund &&(
<>
<Title level={4}>How can I get crowdfunded?</Title>
<List.Item>Share the link to your profile with someone you know who is able to pay for your deposit.</List.Item>
<List.Item>Join the crowdfunding group on <Link href="https://t.me/PoHcrowdfunding" target="_blank">Telegram</Link></List.Item>
</>
      )}
    </List>

    {this.props.state.confirmed && (
      <Button type='primary' shape='round' style={{fontWeight:'bold',display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none', width:'50%',height:'60px'}} onClick={this.goToProfile}>Go to my profile now!</Button>
    )}

    
    </Space>
    </Row>
    
    )}
}