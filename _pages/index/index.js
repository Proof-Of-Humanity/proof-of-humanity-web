import { Grid, Pagination, useContract, useQuery } from "@kleros/components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { graphql } from "relay-hooks";

import SubmissionCard from "./submission-card";
import SubmissionFilters from "./submission-filters";

const pageSize = 12;
export default function Index() {
  const router = useRouter();
  const { props } = useQuery();

  const [submissionCounter] = useContract(
    "proofOfHumanity",
    "submissionCounter"
  );
  const [submissionDuration] = useContract(
    "proofOfHumanity",
    "submissionDuration"
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

  const [numberOfPages, setNumberOfPages] = useState(
    router.query.skip ? router.query.skip / pageSize + 1 : 1
  );
  const [page, setPage] = useState(numberOfPages);
  const isLastPage = numberOfPages === page;
  const hasMore = props?.submissions?.length === pageSize + 1;
  useEffect(() => {
    if (!isLastPage && !hasMore) setNumberOfPages(page);
  }, [isLastPage, hasMore, page]);
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
          numberOfPages={
            isLastPage && hasMore ? numberOfPages + 1 : numberOfPages
          }
          maxButtons={Math.min(numberOfPages, 5)}
          onChange={(_page) => {
            if (numberOfPages < _page) setNumberOfPages(_page);
            setPage(_page);

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
  }
`;
