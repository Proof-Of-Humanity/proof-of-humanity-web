import React from "react";
import { Row, Space } from 'antd';

export default class FinalizeTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('FinalizeTab props=', props);
  }

  render() {
    // img, video and submitter name source by props
    return (
      <>
        <Row>
          <Space direction='vertical' size={1}>
            <h2>Finalize your registration</h2>
            <p>Verify your submission information and media is correct and submit the transaction to register</p>
            <img></img>
            <video></video>
            {/* Next steps... */}
          </Space>
        </Row>
      </>
    );
  }
}
