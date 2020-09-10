import { Grid, useQuery } from "@kleros/components";
import { useRouter } from "next/router";
import { graphql } from "relay-hooks";

import SubmissionCard from "./submission-card";
import SubmissionFilters from "./submission-filters";

export default function Index() {
  const { query } = useRouter();
  const { props } = useQuery();
  return (
    <>
      <SubmissionFilters />
      <Grid gap={2} columns={[1, 2, 3, 4]}>
        {(query.search ? props?.submissionSearch : props?.submissions)?.map(
          (submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          )
        )}
      </Grid>
    </>
  );
}

export const indexQuery = graphql`
  query indexQuery(
    $first: Int = 8
    $where: Submission_filter
    $search: String = ""
  ) {
    submissions(first: $first, where: $where) {
      id
      ...submissionCard
    }
    submissionSearch(text: $search) {
      id
      ...submissionCard
    }
  }
`;
