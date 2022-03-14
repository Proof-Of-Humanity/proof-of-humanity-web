import React from "react";
import {Row, Space, Col, Button} from 'antd';

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
            size={1}>
            <h2>Finalize your registration</h2>
            <p>Verify your submission information and media is correct and submit the transaction to register</p>
            <Col>
              <div style={
                {textAlign: "center"}
              }>
                This is your picture:
                <img style={
                    {width: "50%"}
                  }
                  src={
                    this.props.state.imageURI
                }></img>
              </div>
            </Col>
            <Col>
              <div style={
                {textAlign: "center"}
              }>
                <video controls
                  style={
                    {width: '50%'}
                  }
                  src={
                    this.props.state.videoURI
                }></video>

              </div>
            </Col>


            {/* Next steps... */} 
            
            </Space>
        </Row>
      </>
    );
  }
}
