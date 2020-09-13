import { Card, Text, useQuery, useWeb3 } from "@kleros/components";
import { useRouter } from "next/router";
import { graphql } from "relay-hooks";

import SubmissionDetailsAccordion from "./submission-details-accordion";
import SubmissionDetailsCard from "./submission-details-card";
import SubmitProfileCard from "./submit-profile-card";

import { submissionStatusEnum } from "data";

export default function ProfileWithID() {
  const { props } = useQuery();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { query } = useRouter();

  const notLoading = props && accounts;
  if (
    notLoading &&
    props.submission === null &&
    (!accounts[0] || accounts[0] === query.id)
  )
    return <SubmitProfileCard contract={props.contracts[0]} />;

  const status =
    props?.submission && submissionStatusEnum.parse(props.submission);
  return (
    <>
      <Card
        sx={{ marginBottom: 2 }}
        mainSx={{ justifyContent: "space-between", paddingY: 1 }}
      >
        <Text sx={{ fontWeight: "bold", minWidth: "fit-content" }}>
          Profile Status
        </Text>
        <Text>
          {status && (
            <>
              {status.startCase}{" "}
              <status.Icon
                sx={{
                  path: { fill: "text" },
                  stroke: "text",
                  strokeWidth: 0,
                }}
              />
            </>
          )}
        </Text>
      </Card>
      {props?.submission && (
        <SubmissionDetailsCard
          submission={props.submission}
          contract={props.contracts[0]}
        />
      )}
      {notLoading && <SubmissionDetailsAccordion />}
    </>
  );
}

export const IdQuery = graphql`
  query IdQuery($id: ID!) {
    contracts(first: 1) {
      ...submitProfileCard
      ...submissionDetailsCardContract
    }
    submission(id: $id) {
      status
      registered
      ...submissionDetailsCardSubmission
    }
  }
`;
