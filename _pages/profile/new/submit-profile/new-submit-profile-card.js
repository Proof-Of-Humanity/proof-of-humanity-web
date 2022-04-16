import { Row } from "antd";
import React from "react";
import { useQuery } from "relay-hooks";
import NewSubmitProfileForm from "./new-submit-profile-form";

export default function NewSubmitProfileCard(props) {
  const {props:_props} = useQuery(newSubmitProfileCardQuery,{
    id:props.account.toLowerCase()
  })
  console.log(_props?.contract)
  return (
    
    <Row justify="center">
      <NewSubmitProfileForm
        i18n={props.i18n}
        web3={props.web3}
        account={props.account}
        contract={_props?.contract}
      />
    </Row>
  );
}
export const newSubmitProfileCardQuery = graphql`
query newSubmitProfileCardQuery($id: ID!) {
  contract(id: 0) {
    submissionDuration
    submissionBaseDeposit
    arbitratorExtraData
  }
  submission(id: $id) {
    name
    status
    registered
    submissionTime
  }
}
`;
