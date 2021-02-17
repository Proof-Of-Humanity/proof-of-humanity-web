import { Card, Image, Text, useQuery, useWeb3 } from "@kleros/components";
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

  const reapply = query.id === "reapply";
  if (
    props &&
    accounts &&
    props.submission === null &&
    (!accounts[0] || accounts[0] === query.id || reapply)
  )
    return <SubmitProfileCard contract={props.contract} reapply={reapply} />;

  const status =
    props?.submission &&
    props?.contract &&
    submissionStatusEnum.parse({ ...props.submission, ...props.contract });
  const isExpired =
    status === submissionStatusEnum.Registered &&
    props?.submission &&
    Date.now() / 1000 - props.submission.submissionTime >
      props.contract.submissionDuration;
  return (
    <>
      <Card
        sx={{ marginBottom: 2 }}
        mainSx={{
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingY: 1,
        }}
      >
        <Text
          sx={{
            alignItems: "center",
            display: "flex",
            fontWeight: "bold",
            minWidth: "fit-content",
          }}
        >
          <Image
            sx={{ height: 30, marginRight: 2 }}
            src="/images/proof-of-humanity-logo-black.png"
          />
          Profile Status
        </Text>
        <Text>
          {status && (
            <>
              {status.startCase}
              {isExpired && " (Expired)"}{" "}
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
        <>
          <SubmissionDetailsCard
            submission={props.submission}
            contract={props.contract}
            vouchers={props.vouchers}
          />
          <SubmissionDetailsAccordion
            submission={props.submission}
            contract={props.contract}
          />
        </>
      )}
    </>
  );
}

export const IdQuery = graphql`
  query IdQuery($id: ID!, $_id: [String!]) {
    contract(id: 0) {
      submissionDuration
      ...submitProfileCard
      ...submissionDetailsCardContract
      ...submissionDetailsAccordionContract
    }
    submission(id: $id) {
      status
      registered
      submissionTime
      disputed
      ...submissionDetailsCardSubmission
      ...submissionDetailsAccordionSubmission
    }
    vouchers: submissions(where: { vouchees_contains: $_id, usedVouch: null }) {
      ...submissionDetailsCardVouchers
    }
  }
`;
