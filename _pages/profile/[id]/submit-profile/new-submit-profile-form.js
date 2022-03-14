import React from 'react';
import { Steps, Row, Col, Button } from 'antd';
import { FileTextOutlined, FileTextFilled, CameraOutlined, CameraFilled, VideoCameraOutlined, VideoCameraFilled, CheckOutlined, CheckCircleFilled } from '@ant-design/icons';

import InitialTab from './initial-tab';
import ImageTab from './image-tab';
import VideoTab from './video-tab';
import FinalizeTab from './finalize-tab';
import ProofOfHumanityAbi from "subgraph/abis/proof-of-humanity";
import Web3 from "web3";


const Step = Steps.Step;
const web3 = new Web3(process.env.NEXT_PUBLIC_INFURA_ENDPOINT);
const pohContractAddress = "0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb"
const contract = new web3.eth.Contract(ProofOfHumanityAbi, pohContractAddress);
console.log(contract)


export default class NewSubmitProfileForm extends React.Component {
  constructor(props) {
    super(props);
    console.log('newSubmitProfileForm props=', props);
    this.state = {
      current: 0
    };
  }

  submissionSteps = [
    {
      title: 'General information',
      subtitle: 'General information',
      // content: (props) => <GeneralSubmitTab props={props} />,
      content: (props) => <InitialTab {...props} />,
      description: 'Set your name and info',
      icon: <FileTextFilled />
    },
    {
      title: 'Video',
      subtitle: 'Video',
      content: (props) => <VideoTab {...props} />,
      description: 'Upload your video',
      icon: <VideoCameraFilled />
    },
    {
      title: 'Photo',
      subtitle: 'Photo',
      content: (props) => <ImageTab {...props} />,
      description: 'Upload your image',
      icon: <CameraFilled />
    },
    {
      title: 'Finalize',
      subtitle: 'Finalize',
      content: (props) => <FinalizeTab {...props} />,
      description: 'Finalize your registration',
      icon: <CheckCircleFilled />
    }
  ]

  // setFormInfo() // Username, first name, last name, bio
  // setImageUrl()
  // setVideoUrl()

  // change stateHandler to specific functions for tabs to know instead of global one.
  stateHandler = (newState, component) => {
    if (newState) this.setState(newState);
    console.log('StateHandler called from=', component);
  }

  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  uploadToIPFS = async (fileName, buffer) => {
    return fetch("https://ipfs.kleros.io/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        buffer: Buffer.from(buffer),
      }),
    })
      .then((res) => res.json())
      .then(
        ({ data }) =>
          
            `/ipfs/${data[1].hash}${data[0].path}`
          
      );
  }
  returnFiles = async () => {
    let imageURI = this.state.imageURI.split('/');
    let videoURI = this.state.videoURI.split('/');
    let file = {
      name:this.props.state.info.name,
      firstName:this.props.state.info.firstName,
      lastName:this.props.state.info.lastName,
      bio:this.props.state.info.bio,
      photo:`/${imageURI[3]}/${imageURI[4]}/${imageURI[5]}`,
      video:`/${videoURI[3]}/${videoURI[4]}/${videoURI[5]}`
    }
    let fileURI = await this.uploadToIPFS('file.json',JSON.stringify(file));

    let registration={
      fileURI,
      name:"Registration"
    }
    let registrationURI = await this.uploadToIPFS('registration.json',JSON.stringify(registration));
    console.log(fileURI,registrationURI)
    this.setState(registrationURI);
  }

  prepareTransaction= async ()=>{
    this.returnFiles().then(()=>{
      console.log(contract.methods)
      console.log(this.state.registrationURI)

    })
  }

  render() {
    let { current } = this.state;
    let steps = this.submissionSteps;
    let props = {
      stateHandler: this.stateHandler,
      state: this.state,
      i18n: this.props.i18n
    };

    return (
      <Col
        xs={{ span: 24 }}
        xl={{ span: 12 }}>
        <Steps size='small' current={current} responsive={true}>
          {steps.map(step => (
            <Step
              key={step.title}
              title={step.title}
              // subTitle={item.subtitle}
              icon={step.icon}
            />
          ))}
        </Steps>
        <br />
        <div className='steps-content'>
          {
            steps.map((step, index) =>
              <div key={`form-item-${index}`} style={{ 'display': index == current ? 'block' : 'none' }}>
                {step.content(props)}
              </div>
            )
          }
        </div>
        <div className='steps-action'>
          {current > 0 && (
            <Button type='primary' shape='round' style={{ marginRight: '8px' }} onClick={this.prev}>Previous</Button>
          )}
          {current < steps.length - 1 && (
            <Button type='primary' shape='round' onClick={this.next}>Next</Button>
          )}
          {current === steps.length - 1 && (
            <Button type='primary' shape='round' onClick={() => this.prepareTransaction}>Done</Button>
          )}
        </div>
      </Col>
    );
  }
  /*
  return (
      <Form createValidationSchema={
          useCallback(({string, file, eth, web3: _web3}) => {
              const schema = {
                  photo: file().required('Required'),
                  video: file().required('Required')

              }
              return schema;
          })
      }>
          <Field as={FileUpload}
              name='photo'
              label='Face Photo'
              photo
              accept={
                  PHOTO_OPTIONS.types.value
              }
              acceptLabel={
                  PHOTO_OPTIONS.types.label
              }
              maxSizeLabel={
                  PHOTO_OPTIONS.size.label
              }/>
          <Field as={FileUpload}
              name='video'
              label='Video'
              video
              accept={
                  VIDEO_OPTIONS.types.value
              }
              acceptLabel={
                  VIDEO_OPTIONS.types.label
              }
              maxSizeLabel={
                  VIDEO_OPTIONS.size.label
              }/>

      </Form>
  )
  */
}
// NewSubmitProfileForm.displayName = 'NewSubmitProfileForm';
// export default NewSubmitProfileForm;
