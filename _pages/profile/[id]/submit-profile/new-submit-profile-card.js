import {
  Box,
  Card,
  Progress,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import renderEmpty from "antd/lib/config-provider/renderEmpty";
import React, { useCallback, useMemo, useState } from "react";
import { graphql, useFragment } from "relay-hooks";

import NewSubmitProfileForm from "./new-submit-profile-form";

export default class NewSubmitProfileCard extends React.Component {
  constructor(props) {
    super(props);

    // contract,
    // submission,
    // reapply,
    // afterSend = () => {},
    // afterSendError = () => {},

    console.log('newSubmitProfileCard props=', props);
  }

  render() {
    return (
      <div>
        <NewSubmitProfileForm />
      </div>
    );
  }
}
