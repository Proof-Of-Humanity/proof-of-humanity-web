import {
  Box,
  Card,
  Flex,
  Image,
  NextETHLink,
  Text,
  Video,
  useContract,
  useWeb3,
} from "@kleros/components";
import { Ether, User } from "@kleros/icons";
import { useMemo } from "react";
import { graphql, useFragment } from "relay-hooks";

import Deadlines from "./deadlines";
import FundButton from "./fund-button";
import VouchButton from "./vouch-button";

import { partyEnum, submissionStatusEnum, useEvidenceFile } from "data";

const submissionDetailsCardFragments = {
  contract: graphql`
    fragment submissionDetailsCardContract on Contract {
      submissionBaseDeposit
      requiredNumberOfVouches
      sharedStakeMultiplier
      ...deadlinesContract
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
      ...deadlinesSubmission
    }
  `,
};
export default function SubmissionDetailsCard({ submission, contract }) {
  const { requests, id, ...rest } = (submission = useFragment(
    submissionDetailsCardFragments.submission,
    submission
  ));
  const status = submissionStatusEnum.parse(rest);
  const request = requests[status.registrationEvidenceFileIndex || 0];

  const evidence = useEvidenceFile()(request.evidence[0].URI);
  const contributions = useMemo(
    () =>
      request.challenges[0].rounds[0].contributions.map((contribution) =>
        partyEnum.parse(contribution.values)
      ),
    [request]
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
  const {
    sharedStakeMultiplier,
    submissionBaseDeposit,
    requiredNumberOfVouches,
  } = (contract = useFragment(
    submissionDetailsCardFragments.contract,
    contract
  ));
  const totalCost = useMemo(
    () =>
      arbitrationCost
        ?.add(
          arbitrationCost
            .mul(web3.utils.toBN(sharedStakeMultiplier))
            .div(web3.utils.toBN(10000))
        )
        .add(web3.utils.toBN(submissionBaseDeposit)),
    [arbitrationCost, web3.utils, sharedStakeMultiplier, submissionBaseDeposit]
  );
  const totalContribution = useMemo(
    () =>
      contributions.reduce(
        (acc, { Requester }) => acc.add(web3.utils.toBN(Requester)),
        web3.utils.toBN(0)
      ),
    [contributions, web3.utils]
  );
  return (
    <Card
      mainSx={{
        alignItems: "stretch",
        flexDirection: ["column", null, null, "row"],
        padding: 0,
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          backgroundColor: "muted",
          flexDirection: "column",
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
        <Box sx={{ marginY: 2, width: "100%" }}>
          {status === submissionStatusEnum.Vouching && (
            <>
              {totalCost?.gt(totalContribution) && (
                <FundButton
                  totalCost={totalCost}
                  totalContribution={totalContribution}
                  submissionID={id}
                />
              )}
              <VouchButton submissionID={id} />
            </>
          )}
        </Box>
        <Flex sx={{ width: "100%" }}>
          <Box
            sx={{
              borderRightColor: "text",
              borderRightStyle: "solid",
              borderRightWidth: 1,
              flex: 1,
              marginBottom: 3,
            }}
          >
            <Text>Vouchers</Text>
            <Text sx={{ fontWeight: "bold" }}>
              {String(request.vouches.length)}/{requiredNumberOfVouches}
            </Text>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text>Deposit</Text>
            <Text sx={{ fontWeight: "bold" }}>
              {totalCost &&
                `${Math.floor(
                  totalContribution
                    .mul(web3.utils.toBN(100))
                    .div(totalCost)
                    .toNumber()
                )}%`}
            </Text>
          </Box>
        </Flex>
        <Box sx={{ marginTop: "auto" }}>
          <Deadlines
            submission={submission}
            contract={contract}
            status={status}
          />
        </Box>
      </Flex>
      <Box sx={{ flex: 1, padding: 4 }}>
        <Box>
          <User />{" "}
          <Text as="span" sx={{ fontWeight: "bold" }}>
            {evidence?.file &&
              `${evidence.file.firstName} ${evidence.file.lastName}`}
          </Text>
        </Box>
        <Text variant="clipped" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          <Ether /> <NextETHLink address={id}>{id}</NextETHLink>
        </Text>
        <Video url={evidence?.file?.video} />
      </Box>
    </Card>
  );
}
