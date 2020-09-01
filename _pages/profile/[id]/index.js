import { Card, Text, useQuery } from "@kleros/components";
import { graphql } from "relay-hooks";

import SubmissionDetailsAccordion from "./submission-details-accordion";
import SubmissionDetailsCard from "./submission-details-card";

import { submissionStatusEnum } from "data";

export default function ProfileWithID() {
  const { props } = useQuery();
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
        <SubmissionDetailsCard submission={props.submission} />
      )}
      <SubmissionDetailsAccordion />
    </>
  );
}

export const IdQuery = graphql`
  query IdQuery($id: ID!) {
    submission(id: $id) {
      status
      registered
      ...submissionDetailsCard
    }
  }
`;
