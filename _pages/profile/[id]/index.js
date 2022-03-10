import {
  Alert,
  Card,
  Image,
  Text,
  useQuery,
  useWeb3,
} from "@kleros/components";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { graphql } from "relay-hooks";

import SubmissionDetailsAccordion from "./submission-details-accordion";
import SubmissionDetailsCard from "./submission-details-card";
import SubmitProfileCard from "./submit-profile-card";
import NewSubmitProfileCard from './submit-profile/new-submit-profile-card';

import { submissionStatusEnum } from "data";

export default function ProfileWithID() {
  const { props } = useQuery();
  const [accounts] = useWeb3("eth", "getAccounts");
  const account = accounts?.[0];

  const router = useRouter();
  const { query } = router;

  const reapply = query.reapply === "true";
  const registered = props?.submission?.registered ?? false;

  const handleAfterSend = useCallback(async () => {
    if (reapply)
      router.push({
        pathname: "/profile/[id]",
        query: { id: account },
      });
    await new Promise((r) => setTimeout(r, 3000));
    location.reload();
  }, [reapply, router, account]);

  const isReapply = account === query.id && reapply;
  const isRegistration = account === query.id && props?.submission === null;
  const isResubmit =
    account === query.id &&
    props?.submission &&
    props?.submission.status === "None" &&
    !registered;

  if (props && account && (isReapply || isRegistration || isResubmit))
    return (
      <>
        <Head>
          <title>Submit Profile | Proof of Humanity</title>
        </Head>
        {/* <SubmitProfileCard
          contract={props.contract}
          submission={props.submission}
          reapply={reapply && registered}
          afterSend={handleAfterSend}
        /> */}
        <NewSubmitProfileCard
          contract={props.contract}
          submission={props.submission}
          reapply={reapply && registered}
          afterSend={handleAfterSend}
        />
      </>
    );

  const status =
    props?.submission &&
    props?.contract &&
    submissionStatusEnum.parse({ ...props.submission, ...props.contract });
  const isExpired =
    status === submissionStatusEnum.Registered &&
    props?.submission &&
    Date.now() / 1000 - props.submission.submissionTime >
      props.contract.submissionDuration;

  const name = props?.submission?.name ?? "";
  return (
    <>
      <Head>
        <title>{`Profile: ${
          name ? `${name} (${query.id})` : query.id
        } | Proof of Humanity`}</title>
      </Head>
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
        <Text
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {status && (
            <>
              {status.startCase}
              {isExpired && " (Expired)"}
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
      {status === submissionStatusEnum.Vouching && (
        <Alert type="muted" title="Advice" sx={{ mb: 2, fontSize: 14 }}>
          <Text>
            Gasless vouches have no cost. Beware of scammers that intend to
            charge for those type of vouches.
          </Text>
        </Alert>
      )}
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
      name
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
