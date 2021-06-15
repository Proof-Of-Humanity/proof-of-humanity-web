import { Grid, Pagination, useContract, useQuery } from "@kleros/components";
import { useRouter } from "next/router";
import { graphql } from "relay-hooks";

import SubmissionCard from "./submission-card";
import SubmissionFilters from "./submission-filters";

const pageSize = 12;

function getSubmissionCounter(defaultSubmissionCounter, statusFilter, props) {
  switch (statusFilter) {
    case "vouching":
      return props?.counter?.vouchingPhase || 0;
    case "pending-registration":
      return props?.counter?.pendingRegistration || 0;
    case "pending-removal":
      return props?.counter?.pendingRemoval || 0;
    case "challenged-registration":
      return props?.counter?.challengedRegistration || 0;
    case "challenged-removal":
      return props?.counter?.challengedRemoval || 0;
    case "registered":
      return props?.counter?.registered || 0;
    case "expired":
      return props?.counter?.expired || 0;
    case "removed":
      return props?.counter?.removed || 0;
    default:
      return defaultSubmissionCounter;
  }
}

export default function Index() {
  const router = useRouter();
  const { props } = useQuery();

  const [submissionDuration] = useContract(
    "proofOfHumanity",
    "submissionDuration"
  );
  const [defaultSubmissionCounter] = useContract(
    "proofOfHumanity",
    "submissionCounter"
  );
  const submissionCounter = getSubmissionCounter(
    defaultSubmissionCounter,
    router.query?.status,
    props
  );

  const startsWithNormalized = props?.startsWith || [];
  const endsWithNormalized = props?.endsWith || [];
  const byAddressNormalized = props?.byAddress || [];

  const submissions = router.query.search
    ? startsWithNormalized
        .concat(
          endsWithNormalized.filter(
            (endsW) =>
              startsWithNormalized &&
              startsWithNormalized.filter((startsW) => startsW.id === endsW.id)
                .length === 0
          )
        )
        .concat(byAddressNormalized)
    : props?.submissions?.slice(0, pageSize);

  const page = router.query.skip ? router.query.skip / pageSize + 1 : 1;
  const hasMore = props?.submissions?.length === pageSize + 1;
  return (
    <>
      <SubmissionFilters
        numberOfSubmissions={submissionCounter}
        submissionDuration={submissionDuration}
      />
      <Grid sx={{ minHeight: 750 }} gap={2} columns={[1, 2, 3, 4]} rows={2}>
        {submissions?.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            contract={props.contract}
          />
        ))}
      </Grid>
      {!router.query.search && (
        <Pagination
          sx={{ marginTop: 2, width: "100%" }}
          initialPage={page}
          numberOfPages={hasMore ? page + 1 : page}
          maxButtons={Math.min(page, 5)}
          onChange={(_page) => {
            const query = { ...router.query };
            query.skip = (_page - 1) * pageSize;
            router.push({
              query,
            });
          }}
        />
      )}
    </>
  );
}

export const indexQuery = graphql`
  query indexQuery(
    $skip: Int = 0
    $first: Int = 13
    $where: Submission_filter
    $search: String = ""
    $address: ID
  ) {
    contract(id: 0) {
      ...submissionCardContract
    }
    submissions(
      orderBy: creationTime
      orderDirection: desc
      skip: $skip
      first: $first
      where: $where
    ) {
      id
      ...submissionCardSubmission
    }
    startsWith: submissions(where: { name_starts_with: $search }) {
      id
      ...submissionCardSubmission
    }
    endsWith: submissions(where: { name_ends_with: $search }) {
      id
      ...submissionCardSubmission
    }
    byAddress: submissions(where: { id: $address }) {
      id
      ...submissionCardSubmission
    }
    counter(id: 1) {
      vouchingPhase
      pendingRemoval
      pendingRegistration
      challengedRemoval
      challengedRegistration
      registered
      expired
      removed
    }
  }
`;
