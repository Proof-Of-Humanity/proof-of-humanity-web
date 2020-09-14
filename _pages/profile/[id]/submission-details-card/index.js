import {
  Box,
  Card,
  Flex,
  Image,
  Text,
  Video,
  useContract,
  useWeb3,
} from "@kleros/components";
import { Ether, User } from "@kleros/icons";
import { useMemo } from "react";
import { graphql, useFragment } from "relay-hooks";

import VouchButton from "./vouch-button";

import { partyEnum, submissionStatusEnum, useEvidenceFile } from "data";

const submissionDetailsCardFragments = {
  contract: graphql`
    fragment submissionDetailsCardContract on Contract {
      submissionBaseDeposit
      sharedStakeMultiplier
    }
  `,
  submission: graphql`
    fragment submissionDetailsCardSubmission on Submission {
      id
      status
      registered
      requests(orderDirection: desc, first: 2) {
        arbitrator
        arbitratorExtraData
        vouches {
          id
        }
        evidence(first: 1) {
          URI
        }
        challenges(first: 1) {
          rounds(first: 1) {
            contributions {
              values
            }
          }
        }
      }
    }
  `,
};
export default function SubmissionDetailsCard({ submission, contract }) {
  const { requests, id, ...rest } = useFragment(
    submissionDetailsCardFragments.submission,
    submission
  );
  const status = submissionStatusEnum.parse(rest);
  const request = requests[status.registrationEvidenceFileIndex || 0];

  const evidence = useEvidenceFile()(request.evidence[0].URI);
  const contributions = request.challenges[0].rounds[0].contributions.map(
    (contribution) => partyEnum.parse(contribution)
  );

  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: request.arbitrator,
        args: [request.arbitratorExtraData],
      }),
      [request]
    )
  );
  const { web3 } = useWeb3();
  const { sharedStakeMultiplier, submissionBaseDeposit } = useFragment(
    submissionDetailsCardFragments.contract,
    contract
  );
  const totalCost = arbitrationCost
    ?.add(
      arbitrationCost
        .mul(web3.utils.toBN(sharedStakeMultiplier))
        .div(web3.utils.toBN(10000))
    )
    .add(web3.utils.toBN(submissionBaseDeposit));
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
        <VouchButton submissionID={id} />
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
              {String(request.vouches.length)}
            </Text>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text>Deposit</Text>
            <Text sx={{ fontWeight: "bold" }}>
              {totalCost &&
                `${Math.floor(
                  contributions
                    .reduce(
                      (acc, { values: { Requester } }) =>
                        acc.add(web3.utils.toBN(Requester)),
                      web3.utils.toBN(0)
                    )
                    .mul(web3.utils.toBN(100))
                    .div(totalCost)
                    .toNumber()
                )}%`}
            </Text>
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
