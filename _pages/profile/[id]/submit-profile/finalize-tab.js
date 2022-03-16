import React from "react";
import {
  Alert,
  Row,
  Space,
  Image,
  Col,
  Button,
  Typography,
  Radio,
  Spin
} from 'antd';
import {block} from "subgraph/config";
const {Title, Link, Paragraph} = Typography;

export default class FinalizeTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('FinalizeTab props=', props);
    this.state = {
      loading:false
    }
  }

  handleSubmit = () =>{
    this.setState({loading:true})
    this.props.prepareTransaction();
  }
  render() {
    console.log(this.props)
    // img, video and submitter name source by props
    return (
      <>
        <Row>
          <Space direction='vertical'
            size={1}
            style={
              {
                textAlign: 'center'
              }
          }>
            <h2>Finalize your registration</h2>
            <p>Verify your submission information and media is correct and submit the transaction to register</p>
            <Alert message={
            <>
            <Title level={5}>Pro tip</Title>
            <Paragraph>
              People can try to notify you of problems in your submission and
              save your deposit via your{" "}
              <Link href="https://ethmail.cc/">ethmail.cc</Link>. Make sure to
              check it while submission is being processed.
            </Paragraph>
            </>
          } style={{ marginBottom: "15px" }} closable showIcon>
            
          </Alert>
            {
            this.props.state.name && (
              <h5>The name you submitted is: {
                this.props.state.name
              }</h5>
            )
          }

            {
            this.props.state.bio && (
              <h5>The name you submitted is: {
                this.props.state.bio
              }</h5>
            )
          }

            <div style={
              {textAlign: "center"}
            }>
              {this.props.state.imageURI !== '' ?
              <>
              <Paragraph>This is your picture:</Paragraph>
              <Image preview={false} style={
                  {
                    width: "25%",
                    borderRadius: "50%"
                  }
                }
                src={
                  this.props.state.imageURI
              }></Image>
              </>
              : <><Paragraph>Your video is loading, please wait.</Paragraph><Spin/></>
            }
              
            </div>


            <div style={
              {textAlign: "center"}
            }>
              {this.props.state.videoURI !== '' ?
              <>
              <p>This is your video:</p>
              <video controls
                style={
                  {width: '25%'}
                }
                src={
                  this.props.state.videoURI
              }></video>
              </> : <><Paragraph>Your video is loading, please wait.</Paragraph><Spin/></>
              }
              
              
            </div>
            <Radio onChange={
                (e) => {
                  console.log(e);
                  this.props.stateHandler({crowdfund: e.target.checked})
                }
              }>I want to use Crowdfund (0 deposit)</Radio>
          
            {/* Next steps... */} </Space>
            <Button type='primary' shape='round' style={{display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.props.prev}>Previous</Button>
            <Button type='primary' disabled={this.props.state.videoURI == '' || this.props.state.imageURI == ''} shape='round' style={{display:'block', margin:'0 auto', backgroundColor:"#ffb978", border:'none'}} onClick={this.handleSubmit} loading={this.state.loading && !this.props.state.error}>Done</Button>
         
        </Row>
        {this.props.state.error !== null && this.props.state.error?.code == 4001 &&(
          <Alert type="error" message="Transaction rejected. " />
         )} 
      </>
    );
  }
}
