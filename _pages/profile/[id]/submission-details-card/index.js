import {
  Alert,
  Box,
  Card,
  EthereumAccount,
  Flex,
  FundButton,
  Image,
  Link,
  Text,
  Video,
  useContract,
  useWeb3,
} from "@kleros/components";
import { User } from "@kleros/icons";
import base2048 from "base-2048";
import lodashOrderBy from "lodash.orderby";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { graphql, useFragment } from "relay-hooks";

import Deadlines from "./deadlines";
import GaslessVouchButton from "./gasless-vouch";
import SmallAvatar from "./small-avatar";
import UBICard from "./ubi-card";
import VouchButton from "./vouch-button";

import {
  challengeReasonEnum,
  partyEnum,
  submissionStatusEnum,
  useEvidenceFile,
} from "data";

const submissionDetailsCardFragments = {
  contract: graphql`
    fragment submissionDetailsCardContract on Contract {
      submissionBaseDeposit
      submissionDuration
      requiredNumberOfVouches
      challengePeriodDuration
      ...deadlinesContract
    }
  `,
  submission: graphql`
    fragment submissionDetailsCardSubmission on Submission {
      id
      status
      registered
      submissionTime
      name
      disputed
      vouchees {
        id
        requests {
          lastStatusChange
        }
      }
      requests(
        orderBy: creationTime
        orderDirection: asc
        where: { registration: true }
      ) {
        arbitrator
        arbitratorExtraData
        lastStatusChange
        evidence(orderBy: creationTime, orderDirection: desc) {
          URI
        }
        vouches {
          id
          submissionTime
        }
      }
      latestRequest: requests(
        orderBy: creationTime
        orderDirection: desc
        first: 1
      ) {
        challenges(orderBy: creationTime) {
          disputeID
          lastRoundID
          reason
          duplicateSubmission {
            id
          }
          rounds(orderBy: creationTime, first: 1) {
            contributions {
              values
            }
            hasPaid
          }
        }
      }
      ...deadlinesSubmission
    }
  `,
  vouchers: graphql`
    fragment submissionDetailsCardVouchers on Submission @relay(plural: true) {
      id
      submissionTime
      name
      requests(
        orderBy: creationTime
        orderDirection: desc
        first: 1
        where: { registration: true }
      ) {
        evidence(orderBy: creationTime, first: 1) {
          URI
        }
      }
    }
  `,
};

export default function SubmissionDetailsCard({
  submission,
  contract,
  vouchers,
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const {
    latestRequest: [latestRequest],
    id,
    name,
    vouchees,
    ...rest
  } = (submission = useFragment(
    submissionDetailsCardFragments.submission,
    submission
  ));
  const { requests } = submission;

  const orderedVouchees = lodashOrderBy(
    vouchees,
    (a) => a.requests[a.requests.length - 1].lastStatusChange,
    "desc"
  );

  const [accounts] = useWeb3("eth", "getAccounts");

  const requestID =
    query.request === undefined ||
    query.request > requests.length ||
    query.request <= 0 ||
    Number.isNaN(Number(query.request))
      ? requests.length - 1
      : query.request - 1;
  const { lastStatusChange } = requests[requestID];
  const isSelf =
    accounts?.[0] && accounts[0].toLowerCase() === id.toLowerCase();
  const isLatestRequest = requestID === requests.length - 1;
  const {
    submissionBaseDeposit,
    submissionDuration,
    requiredNumberOfVouches,
    challengePeriodDuration,
  } = (contract = useFragment(
    submissionDetailsCardFragments.contract,
    contract
  ));

  const status = submissionStatusEnum.parse({ ...rest, submissionDuration });
  const { challenges } = latestRequest || {};
  const activeChallenges = challenges.filter(
    ({ disputeID }) => disputeID !== null
  );

  // Note that there is a challenge object with first round data even if there
  // is no challenge.
  const challenge = (challenges && challenges[0]) || {};
  const { rounds, lastRoundID } = challenge || {};
  const round = (rounds && rounds[0]) || {};
  const { hasPaid } = round || {};

  const lastEvidence = requests[requestID].evidence.length - 1;
  const evidence = useEvidenceFile()(
    requests[requestID].evidence[lastEvidence].URI
  );

  const contributions = useMemo(
    () =>
      round.contributions.map((contribution) =>
        partyEnum.parse(contribution.values)
      ),
    [round.contributions]
  );

  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: requests[0].arbitrator,
        args: [requests[0].arbitratorExtraData],
      }),
      [requests]
    )
  );
  const { web3 } = useWeb3();
  const totalCost = useMemo(
    () => arbitrationCost?.add(web3.utils.toBN(submissionBaseDeposit)),
    [arbitrationCost, web3.utils, submissionBaseDeposit]
  );
  const totalContribution = useMemo(
    () =>
      contributions.reduce(
        (acc, { Requester }) => acc.add(web3.utils.toBN(Requester)),
        web3.utils.toBN(0)
      ),
    [contributions, web3.utils]
  );

  const [offChainVouches, setOffChainVouches] = useState([]);
  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      const res = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/search?submissionId=${id}`
        )
      ).json();
      if (res && res.vouches && res.vouches.length > 0) {
        setOffChainVouches(res.vouches[0].vouchers);
      }
    })();
  }, [id]);

  const registeredGraphVouchers = useFragment(
    submissionDetailsCardFragments.vouchers,
    vouchers
  ).filter(
    (voucher) =>
      Date.now() / 1000 - voucher.submissionTime < submissionDuration &&
      voucher.id !== id.toLowerCase()
  );

  const currentGraphVouchers = requests[0].vouches.filter(
    (voucher) =>
      Date.now() / 1000 - voucher.submissionTime < submissionDuration &&
      voucher.id !== id.toLowerCase()
  );

  const [registeredVouchers, currentVouchers] = useMemo(() => {
    const completeSet = new Set();
    const onlyCurrentSet = new Set();

    offChainVouches.forEach((v) => {
      if (v !== id.toLowerCase()) {
        completeSet.add(v);
        onlyCurrentSet.add(v);
      }
    });
    registeredGraphVouchers.forEach((v) => completeSet.add(v.id));
    currentGraphVouchers.forEach((v) => onlyCurrentSet.add(v.id));

    return [[...completeSet], [...onlyCurrentSet]];
  }, [offChainVouches, registeredGraphVouchers, currentGraphVouchers, id]);

  const shareTitle =
    status === submissionStatusEnum.Vouching
      ? t("profile_share_vouching_title")
      : t("profile_share_check_out_title");

  const firstRoundFullyFunded = Number(lastRoundID) === 0 && hasPaid[0];
  const [shouldCheckVideo, checkedVideo] = useState(true);
  const generatePhrase = (language) => {
    const address = id.slice(2);
    const bytes = Buffer.from(address, "hex");

    if (language === "en") {
      const words = base2048.english.encode(bytes);
      // console.log(words)
      return words.split(" ").slice(0, 8).join(" ");
    }
    if (language === "es") {
      const words = base2048.spanish.encode(bytes);
      return words.split(" ").slice(0, 8).join(" ");
    }
  };

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
        <Image
          crossOrigin="anonymous"
          sx={{ objectFit: "contain" }}
          variant="avatar"
          src={evidence?.file?.photo}
        />
        <Text
          sx={{
            fontSize: 2,
            fontWeight: "bold",
            marginY: 2,
            overflowWrap: "anywhere",
          }}
        >
          {evidence instanceof Error
            ? t("profile_card_maintenance")
            : evidence?.file?.name &&
              (name.replaceAll(/[^\s\w]/g, "") ===
              evidence.file.name.replaceAll(/[^\s\w]/g, "")
                ? evidence.file.name
                : name)}
        </Text>
        <Text sx={{ wordBreak: "break-word" }} count={2}>
          {evidence?.file ? evidence.file.bio || " " : null}
        </Text>
        <Box sx={{ marginY: 2, width: "100%" }}>
          {status === submissionStatusEnum.Vouching && (
            <>
              {((totalCost?.gt(totalContribution) && Number(lastRoundID) > 0) ||
                (Number(lastRoundID) === 0 && !hasPaid[0])) && (
                <FundButton
                  totalCost={totalCost}
                  totalContribution={totalContribution}
                  contract="proofOfHumanity"
                  method="fundSubmission"
                  args={[id]}
                >
                  {t("profile_card_fund_submission")}
                </FundButton>
              )}
              {isLatestRequest ? (
                !isSelf ? (
                  !shouldCheckVideo ? (
                    <>
                      <GaslessVouchButton submissionID={id} />
                      <VouchButton submissionID={id} />
                    </>
                  ) : (
                    <Text>{t("profile_card_video_check")}</Text>
                  )
                ) : null
              ) : (
                <Text>
                  Please go to the{" "}
                  <Link href={`?request=${requests.length}`}>
                    current request
                  </Link>{" "}
                  to vouch for this profile
                </Text>
              )}
            </>
          )}
        </Box>
        <Flex sx={{ width: "100%" }}>
          <Box sx={{ flex: 1, marginBottom: 3, paddingX: 1 }}>
            <Text>{t("profile_card_vouchers")}</Text>
            <Text sx={{ fontWeight: "bold", paddingX: 1 }}>
              {String(currentVouchers.length)}/{requiredNumberOfVouches}
            </Text>
          </Box>
          {status !== submissionStatusEnum.Registered && (
            <Box
              sx={{
                flex: 1,
                borderLeftColor: "text",
                borderLeftStyle: "solid",
                borderLeftWidth: 1,
              }}
            >
              <Text>{t("profile_card_deposit")}</Text>
              <Text sx={{ fontWeight: "bold" }}>
                {firstRoundFullyFunded
                  ? "100%"
                  : totalCost
                  ? `${(
                      totalContribution
                        .mul(web3.utils.toBN(10000)) // Basis points.
                        .div(totalCost)
                        .toNumber() / 100
                    ).toFixed(2)}%`
                  : "0%"}
              </Text>
            </Box>
          )}
        </Flex>
        {challenges?.length > 0 && challenge.disputeID !== null && (
          <Flex
            sx={{ alignItems: "center", flexDirection: "column", marginTop: 3 }}
          >
            <Text sx={{ fontWeight: "bold" }}>
              {`${t("profile_card_dispute_text")}${
                activeChallenges?.length > 1
                  ? t("profile_card_dispute_suffix")
                  : ""
              }:`}
            </Text>
            {activeChallenges.map(
              ({ disputeID, reason, duplicateSubmission }, i) => (
                <Flex key={i} sx={{ flexDirection: "row" }}>
                  <Link
                    newTab
                    href={`https://resolve.kleros.io/cases/${disputeID}`}
                    sx={{ marginLeft: 1 }}
                  >
                    #{disputeID}{" "}
                    {challengeReasonEnum.parse(reason).startCase !== "None"
                      ? t(
                          `profile_status_challenge_reason_${
                            challengeReasonEnum.parse(reason).key
                          }`
                        )
                      : null}
                    {challengeReasonEnum.parse(reason).startCase === "Duplicate"
                      ? ` ${t("profile_status_duplicate_of")} -`
                      : null}
                  </Link>
                  {challengeReasonEnum.parse(reason).startCase ===
                  "Duplicate" ? (
                    <SmallAvatar submissionId={duplicateSubmission.id} />
                  ) : null}
                </Flex>
              )
            )}
          </Flex>
        )}
        <Box sx={{ marginTop: "auto" }}>
          <Deadlines
            submission={submission}
            contract={contract}
            status={status}
          />
        </Box>
      </Flex>
      <Box sx={{ flex: 1, padding: 4 }}>
        <Flex sx={{ alignItems: "center", gap: 8, marginBottom: "4px" }}>
          <User />
          <Text as="span" sx={{ fontWeight: "bold" }}>
            {name}
          </Text>
        </Flex>
        <EthereumAccount
          diameter={16}
          address={id}
          sx={{ marginBottom: 2, fontWeight: "bold" }}
        />
        {evidence?.file?.confirmation === "speaking" && (
          <Alert
            title={t("profile_card_confirmation_phrase_title")}
            style={{ marginBottom: "15px" }}
          >
            {generatePhrase(evidence?.file?.language)}
          </Alert>
        )}

        <Video
          config={{ file: { attributes: { crossOrigin: "true" } } }}
          url={evidence?.file?.video}
          onEnded={() => {
            checkedVideo(false);
          }}
        />
        <UBICard
          submissionID={id}
          lastStatusChange={lastStatusChange}
          challengePeriodDuration={challengePeriodDuration}
          status={status}
          registeredVouchers={registeredVouchers}
          firstRoundFullyFunded={firstRoundFullyFunded}
        />
        {status === submissionStatusEnum.Vouching && (
          <Alert
            type="muted"
            title={t("profile_card_something_wrong")}
            sx={{ mt: 3, wordWrap: "break-word" }}
          >
            <Text>
              <Trans
                i18nKey="profile_card_save_deposit_text"
                t={t}
                values={{ email: `${id}@ethmail.cc` }}
                components={[
                  <Link href={`mailto:${id}@ethmail.cc`} key="mail" />,
                ]}
              />
            </Text>
          </Alert>
        )}
        {registeredVouchers.length > 0 && (
          <>
            <Text sx={{ marginTop: 2, marginBottom: 1, opacity: 0.45 }}>
              {t("profile_card_vouched_by")}:
            </Text>
            <Flex sx={{ flexWrap: "wrap" }}>
              {registeredVouchers.map((voucherId) => (
                <SmallAvatar key={voucherId} submissionId={voucherId} />
              ))}
            </Flex>
          </>
        )}
        {vouchees.length > 0 && (
          <>
            <Text sx={{ marginTop: 2, marginBottom: 1, opacity: 0.45 }}>
              {t("profile_card_vouched_for")}:
            </Text>
            <Flex sx={{ flexWrap: "wrap" }}>
              {orderedVouchees.map(({ id: address }) => (
                <SmallAvatar key={address} submissionId={address} />
              ))}
            </Flex>
          </>
        )}

        <Flex sx={{ justifyContent: "flex-end" }}>
          <RedditShareButton url={location.href} title={shareTitle}>
            <RedditIcon size={32} />
          </RedditShareButton>
          <TelegramShareButton url={location.href} title={shareTitle}>
            <TelegramIcon size={32} />
          </TelegramShareButton>
          <TwitterShareButton
            url={location.href}
            title={shareTitle}
            via="Kleros_io"
            hashtags={["kleros", "proofofhumanity"]}
          >
            <TwitterIcon size={32} />
          </TwitterShareButton>
        </Flex>
      </Box>
    </Card>
  );
}
