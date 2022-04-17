import { Row } from "antd";
import React from "react";

import NewSubmitProfileForm from "./new-submit-profile-form";

export default function NewSubmitProfileCard(props) {
// console.log(props)
  return (
    <Row justify="center">
      <NewSubmitProfileForm
        i18n={props.i18n}
        web3={props.web3}
        account={props.account}
        contract={props.contract}
        submission={props.submission}
        reapply={props.reapply}
        rules={props.rules}
      />
    </Row>
  );
};

