import React from "react";
import {
  Row,
  Space,
  Col,
  Button,
  Radio
} from 'antd';
import {block} from "subgraph/config";

export default class FinalizeTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('FinalizeTab props=', props);
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
              <p>This is your picture:</p>
              <img style={
                  {
                    width: "25%",
                    borderRadius: "50%"
                  }
                }
                src={
                  this.props.state.imageURI
              }></img>
            </div>


            <div style={
              {textAlign: "center"}
            }>
              <p>This is your video:</p>
              <video controls
                style={
                  {width: '25%'}
                }
                src={
                  this.props.state.videoURI
              }></video>
              
            </div>
            <Radio onChange={
                (e) => {
                  console.log(e);
                  this.props.stateHandler({crowdfund: e.target.checked})
                }
              }>I wan't to use Crowdfund (0 deposit)</Radio>

            {/* Next steps... */} </Space>

        </Row>
      </>
    );
  }
}
