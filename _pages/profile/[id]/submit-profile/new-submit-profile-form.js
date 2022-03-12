import {Button} from "@kleros/components";
import React from "react";
import { Steps, Row, Col } from 'antd';
import { FileTextOutlined, FileTextFilled, CameraOutlined, CameraFilled, VideoCameraOutlined, VideoCameraFilled, CheckOutlined, CheckCircleFilled } from '@ant-design/icons';

import InitialTab from './initial-tab';
import ImageTab from './image-tab';
import VideoTab from './video-tab';
import FinalizeTab from './finalize-tab';

const Step = Steps.Step;

const steps = [
    {
        title: 'General information',
        subtitle: 'General information',
        // content: (props) => <GeneralSubmitTab props={props} />,
        content: (props) => <InitialTab {...props}/>,
        description: 'Set your name and info',
        icon: <FileTextFilled />
    }, 
    {
        title: 'Photo',
        subtitle: 'Photo',
        content: (props) => <ImageTab {...props} />,
        description: 'Upload your image',
        icon: <CameraFilled />
    }, 
    {
        title: 'Video',
        subtitle: 'Video',
        content: (props) => <VideoTab {...props}/>,
        description: 'Upload your video',
        icon: <VideoCameraFilled />
    },
    {
        title: 'Finalize',
        subtitle: 'Finalize',
        content: (props) => <FinalizeTab {...props}/>,
        description: 'Finalize your registration',
        icon: <CheckCircleFilled />
    }
];

export default class NewSubmitProfileForm extends React.Component {
    constructor(props) {
        super(props);
        console.log('newSubmitProfileForm props=', props);
        this.state = {
            current: 0
        };
    }

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

    render() {
        let { current } = this.state;
        let props = {
            stateHandler: this.stateHandler
        };

        return (
            <Col 
                xs={{ span: 24 }}
                xl={{ span: 12 }}>
                <Steps size="small" current={current} responsive={true}>
                {steps.map(item => (
                    <Step 
                        key={item.title} 
                        title={item.title}
                        // subTitle={item.subtitle}
                        icon={item.icon}
                    />
                ))}
                </Steps>
                <br />
                <div className="steps-content">
                    {
                        steps.map((item, index) => 
                            <div key={`form-item-${index}`} style={{ 'display': index == current ? 'block' : 'none' }}>
                                {steps[index].content(props)}
                            </div>
                        )
                    }
                </div>
                <div className="steps-action">
                {current > 0 && (
                    <Button style={{ marginLeft: 8 }} onClick={this.prev}>Previous</Button>
                )}
                    {current < steps.length - 1 && (
                    <Button type="primary" onClick={this.next}>Next</Button>
                )}
                    {current === steps.length - 1 && (
                    <Button type="primary" onClick={() => alert("Processing complete!")}>Done</Button>
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
                    photo: file().required("Required"),
                    video: file().required("Required")

                }
                return schema;
            })
        }>
            <Field as={FileUpload}
                name="photo"
                label="Face Photo"
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
                name="video"
                label="Video"
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
// NewSubmitProfileForm.displayName = "NewSubmitProfileForm";
// export default NewSubmitProfileForm;
