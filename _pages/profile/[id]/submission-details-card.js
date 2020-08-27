import {
  Box,
  Button,
  Card,
  Flex,
  Image,
  Text,
  Video,
} from "@kleros/components";
import { Ether, User } from "@kleros/icons";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

const submissionDetailsCardFragment = graphql`
  fragment submissionDetailsCard on Submission {
    id
    status
    registered
    requests(orderDirection: desc, first: 2) {
      vouches {
        id
      }
      evidence(first: 1) {
        URI
      }
    }
  }
`;
export default function SubmissionDetailsCard({ submission }) {
  const { requests, id, ...rest } = useFragment(
    submissionDetailsCardFragment,
    submission
  );
  const status = submissionStatusEnum.parse(rest);
  const evidence = useEvidenceFile()(
    requests[status.registrationEvidenceFileIndex || 0].evidence[0].URI
  );
  return (
    <Card
      mainSx={{
        alignItems: "stretch",
        flexDirection: ["column", null, null, "row"],
        padding: 0,
      }}
    >
      <Box
        sx={{
          backgroundColor: "muted",
          maxWidth: [null, null, null, 300],
          paddingX: 3,
          paddingY: 4,
          textAlign: "center",
        }}
      >
        <Image variant="avatar" src={evidence?.file?.photo} />
        <Text
          sx={{
            fontSize: 2,
            fontWeight: "bold",
            marginY: 2,
          }}
        >
          {evidence?.file?.name}
        </Text>
        <Text count={2}>{evidence?.file?.bio}</Text>
        <Button
          sx={{
            marginY: 2,
            width: "100%",
          }}
        >
          Vouch
        </Button>
        <Flex>
          <Box
            sx={{
              borderRightColor: "text",
              borderRightStyle: "solid",
              borderRightWidth: 1,
              flex: 1,
            }}
          >
            <Text>Vouchers</Text>
            <Text sx={{ fontWeight: "bold" }}>
              {String(requests[0].vouches.length)}
            </Text>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text>Deposit</Text>
            <Text sx={{ fontWeight: "bold" }}>100%</Text>
          </Box>
        </Flex>
      </Box>
      <Box sx={{ flex: 1, padding: 4 }}>
        <Box>
          <User />{" "}
          <Text as="span" sx={{ fontWeight: "bold" }}>
            {evidence?.file &&
              `${evidence.file.firstName} ${evidence.file.lastName}`}
          </Text>
        </Box>
        <Text variant="clipped" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          <Ether /> {id}
        </Text>
        <Video url={evidence?.file?.video} />
      </Box>
    </Card>
  );
}
