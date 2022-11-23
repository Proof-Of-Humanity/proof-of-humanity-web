import { Col, Steps, message } from "antd";
import React from "react";
import UserAgent from "ua-parser-js";

import FinalizeTab from "./finalize-tab";
import ImageTab from "./image-tab";
import InitialTab from "./initial-tab";
import VideoTab from "./video-tab";

const Step = Steps.Step;

export default class NewSubmitProfileForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current: 0,
      imageURI: "",
      videoURI: "",
      name: this.props.submission?.name,
      error: null,
      txHash: "",
      progress: 0,
      OS: this.getOS(),
      deposit: {
        bigNumber: 0,
        ether: 0,
      },
      customDeposit: "0",
      cameraPermission: true,
      userMediaError: "",
      currentCamera: "",
    };
  }

  submissionSteps = [
    {
      title: "Info",
      subtitle: "General information",
      // content: (props) => <GeneralSubmitTab props={props} />,
      content: (props) => <InitialTab {...props} />,
      description: "Set your name and info",
      // icon: 1,
    },

    {
      title: "Selfie",
      subtitle: "Photo",
      content: (props) => <ImageTab {...props} />,
      description: "Upload your image",
      // icon: 2,
    },
    {
      title: "Video",
      subtitle: "Video",
      content: (props) => <VideoTab {...props} />,
      description: "Upload your video",
      // icon: 3,
    },
    {
      title: "Review",
      subtitle: "Finalize",
      content: (props) => (
        <FinalizeTab
          {...props}
          calculateDeposit={this.calculateDeposit}
          prepareTransaction={this.prepareTransaction}
          rules={this.props.rules}
        />
      ),
      description: "Finalize your registration",
      // icon: 4,
    },
  ];

  getOS = () => {
    const userAgent = UserAgent(window.navigator.userAgent);
    // console.log(userAgent);
    return userAgent;
  };

  componentDidUpdate = () => {
    // console.log(previousProps);
    if (this.props.contract !== undefined && this.state.deposit.ether === 0) {
      this.calculateDeposit();
    }
    // if (this.state.permission === null) {
    //   if (this.state.OS.device.type !== "mobile") {
    //     navigator.permissions.query({ name: "camera" }).then((res) => {
    //       if (res.state === "granted") {
    //         this.setState({ permission: true });
    //       } else if (res.state === "prompt") {
    //         navigator.mediaDevices
    //           .getUserMedia({ audio: true, video: true })
    //           .then(() => {
    //             this.setState({ permission: true });
    //           })
    //           .catch(() => {
    //             this.setState({ permission: false, recordingMode: "visual" });
    //           });
    //       } else if (res.state === "denied") {
    //         this.setState({ permission: false, recordingMode: "visual" });
    //       }
    //     });
    //   } else {
    //     navigator.mediaDevices
    //       .getUserMedia({ audio: true, video: true })
    //       .then(() => {
    //         this.setState({ permission: true });
    //       })
    //       .catch(() => {
    //         this.setState({ permission: false, recordingMode: "visual" });
    //       });
    //   }
    // }
  };

  stateHandler = (state) => {
    if (state) {
      this.setState(state);
    }
  };

  next = () => {
    window.location.href = "#top";
    const current = this.state.current + 1;
    this.setState({ current });
  };

  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  reset = () => {
    this.setState({
      current: 0,
      imageURI: "",
      videoURI: "",
      name: "",
      loading: false,
    });
  };

  uploadToIPFS = async (fileName, buffer) => {
    try {
      const request = await fetch("https://ipfs.kleros.io/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          buffer: Buffer.from(buffer),
        }),
      });

      const { data } = await request.json();
      return `/ipfs/${data[1].hash}${data[0].path}`;
    } catch (err) {
      console.error("Upload to IPFS error", err);
      message.error("Upload to IPFS error");
    }
  };

  returnFiles = async () => {
    const imageURI = this.state.imageURI.split("/");
    const videoURI = this.state.videoURI.split("/");
    const name = this.state.name || this.props.submission?.name;
    // console.log(this.state.language)
    const file = {
      name,
      bio: this.state.bio,
      photo: `/${imageURI[3]}/${imageURI[4]}/${imageURI[5]}`,
      video: `/${videoURI[3]}/${videoURI[4]}/${videoURI[5]}`,
      confirmation: this.state.recordingMode,
      language: this.state.language,
    };

    try {
      const fileURI = await this.uploadToIPFS(
        "file.json",
        JSON.stringify(file)
      );
      const registration = { fileURI, name: "Registration" };
      const registrationURI = await this.uploadToIPFS(
        "registration.json",
        JSON.stringify(registration)
      );

      return registrationURI;
    } catch (err) {
      console.error("Return files error", err);
      message.error("There was an error uploading files");
    }
  };

  calculateDeposit = async () => {
    const arbitrationCost =
      await this.props.web3.contracts?.klerosLiquid?.methods
        .arbitrationCost(this.props.contract?.arbitratorExtraData)
        .call();
    const { toBN, fromWei } = this.props.web3.utils;
    const _submissionBaseDeposit = toBN(
      this.props.contract.submissionBaseDeposit
    );
    // console.log(_submissionBaseDeposit, this.props.contract.submissionBaseDeposit)
    // const _submissionBaseDeposit = toBN(this.props.contract?.submissionBaseDeposit);

    const _arbitrationCost = toBN(arbitrationCost);
    // console.log(arbitrationCost,_arbitrationCost)
    const deposit = _submissionBaseDeposit.add(_arbitrationCost);
    const ether = fromWei(deposit, "ether").toString();
    this.setState({ deposit: { bigNumber: deposit, ether } });
  };

  prepareTransaction = async () => {
    try {
      const { toWei } = this.props.web3.utils;
      const registrationURI = await this.returnFiles();
      // console.log(registrationURI)
      const method = this.props.reapply
        ? this.props.web3.contracts.proofOfHumanity.methods.reapplySubmission
        : this.props.web3.contracts.proofOfHumanity.methods.addSubmission;

      const name = this.state.name || this.props.submission?.name;

      method(registrationURI, name)
        .send({
          from: this.props.account,
          value:
            this.state.crowdfund === "crowd"
              ? toWei(this.state.customDeposit, "ether")
              : this.state.deposit.bigNumber,
        })
        .on("transactionHash", (tx) => {
          this.setState({ txHash: tx });

          const config = {
            content:
              "Transaction succesfully sent! Click this message to view it.",
            duration: 10,
            onClick: () => {
              window.open(`https://etherscan.io/tx/${tx}`, "_blank");
            },
          };
          message.info(config);
        })
        .on("receipt", () => {
          this.setState({ confirmed: true });
        })
        .on("error", (error) => {
          if (error.stack) {
            message.error(error.message, 5);
          } else if (error.code === 4001) {
            message.error("Transaction rejected", 5);
          }

          this.setState({ error });
        });
    } catch (err) {
      this.setState({ error: err });
      console.error("There was an error preparing the transaction", err);
      message.error("Unexpected error");
    }
  };

  render() {
    // console.log(this.state.name)
    const { current } = this.state;
    const steps = this.submissionSteps;
    const props = {
      stateHandler: this.stateHandler,
      state: this.state,
      i18n: this.props.i18n,
      next: this.next,
      prev: this.prev,
      reset: this.reset,
      account: this.props.account,
      submission: this.props.submission,
      reapply: this.props.reapply,
    };

    return (
      <Col
        id="top"
        className="submit-profile-card"
        xs={{ span: 24 }}
        xl={{ span: 12 }}
      >
        <Steps size="small" current={current} responsive={false}>
          {steps.map((step) => (
            <Step
              key={step.title}
              title={step.title}
              // subTitle={item.subtitle}
              icon={step.icon}
            />
          ))}
        </Steps>

        <div className="steps-content">
          {steps.map((step, index) => (
            <div
              key={`form-item-${index}`}
              style={{ display: index === current ? "block" : "none" }}
            >
              {step.content(props)}
            </div>
          ))}
        </div>
        {/*
        
        <div>
          helper buttons;
          <Button onClick={() => this.prev()}>Prev</Button>
          <Button onClick={() => this.next()}>Next</Button>
        </div>
          */}
      </Col>
    );
  }
}
