/* eslint-disable jsx-a11y/accessible-emoji */
import {
  Alert,
  Button,
  Card,
  Flex,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { UBI } from "@kleros/icons";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { graphql, useQuery } from "relay-hooks";

import { submissionStatusEnum } from "data";
import ProofOfHumanityAbi from "subgraph/abis/proof-of-humanity";
import UBIAbi from "subgraph/abis/ubi";
import { UBIAddress, address as pohAddress } from "subgraph/config";

function AccruedUBI({ lastMintedSecond, web3, accruedPerSecond, ...rest }) {
  const [, rerender] = useReducer(() => ({}), {});
  useEffect(() => {
    const timeout = setInterval(() => rerender(), 1000);
    return () => clearInterval(timeout);
  }, []);

  let accruedUBI;
  if (lastMintedSecond)
    if (lastMintedSecond.eq(web3.utils.toBN(0))) accruedUBI = lastMintedSecond;
    else if (accruedPerSecond)
      accruedUBI = web3.utils
        .toBN(Math.floor(Date.now() / 1000))
        .sub(lastMintedSecond)
        .mul(accruedPerSecond);

  return (
    <Text {...rest}>
      {accruedUBI && `${web3.utils.fromWei(accruedUBI)} UBI`}
    </Text>
  );
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getVouchCallsElegibleUsers(
  pohInstance,
  requiredNumberOfVouches,
  offChainVouches,
  onChainVouches,
  count = 1
) {
  const users = [...offChainVouches, ...onChainVouches];

  // Due to race conditions of transactions, there
  // is a chance that resources are wasted trying to advance the same user.
  // We can decrease this probability by shuffling the queue.
  shuffle(users);

  const toVouchCalls = [];
  for (const user of users) {
    if (toVouchCalls.length >= count) break;

    let [
      // eslint-disable-next-line prefer-const
      userSubmission,
      ...voucherDatas
    ] = await Promise.all([
      pohInstance.methods.getSubmissionInfo(user.submissionId).call(),
      ...user.vouchers.map((voucher) =>
        pohInstance.methods.getSubmissionInfo(voucher).call()
      ),
    ]);

    voucherDatas = voucherDatas.filter(
      (voucherData) => !voucherData.hasVouched && voucherData.registered
    );

    if (
      voucherDatas.length < requiredNumberOfVouches ||
      Number(userSubmission.status) !== 1
    )
      continue;

    const [latestRequest, round] = await Promise.all([
      pohInstance.methods
        .getRequestInfo(
          user.submissionId,
          Number(userSubmission.numberOfRequests) - 1
        )
        .call(),
      pohInstance.methods
        .getRoundInfo(
          user.submissionId,
          Number(userSubmission.numberOfRequests) - 1,
          0,
          0
        )
        .call(),
    ]);

    if (latestRequest.disputed || Number(round.sideFunded) !== 1) continue;

    if (user.signatures)
      toVouchCalls.push(
        pohInstance.methods
          .changeStateToPending(
            user.submissionId,
            [],
            user.signatures,
            user.expirationTimestamps
          )
          .encodeABI()
      );
    else
      toVouchCalls.push(
        pohInstance.methods
          .changeStateToPending(user.submissionId, user.vouchers, [], [])
          .encodeABI()
      );
  }

  return toVouchCalls;
}

export default function UBICard({
  submissionID,
  lastStatusChange,
  challengePeriodDuration,
  status,
  registeredVouchers,
  firstRoundFullyFunded,
}) {
  const { web3 } = useWeb3();
  const [, rerender] = useReducer(() => ({}), {});
  const [requiredNumberOfVouchesBN] = useContract(
    "proofOfHumanity",
    "requiredNumberOfVouches"
  );
  const requiredNumberOfVouches = useMemo(
    () => Number(requiredNumberOfVouchesBN),
    [requiredNumberOfVouchesBN]
  );
  const { props: vouchesReceivedQuery } = useQuery(
    graphql`
      query ubiCardQuery($id: ID!, $vouchesReceivedLength: BigInt!) {
        submission(id: $id) {
          vouchesReceived {
            id
          }
        }
        submissions(
          first: 100
          where: {
            status: Vouching
            vouchesReceivedLength_gt: $vouchesReceivedLength
          }
          orderBy: submissionTime
          orderDirection: asc
        ) {
          id
          vouchesReceived {
            id
          }
        }
      }
    `,
    { id: submissionID, vouchesReceivedLength: requiredNumberOfVouches }
  );

  const [lastMintedSecond, , lastMintedSecondStatus, reCall] = useContract(
    "UBI",
    "accruedSince",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );
  const {
    send: changeStateToPendingSend,
    loading: changeStateToPendingSendLoading,
  } = useContract("proofOfHumanity", "changeStateToPending");
  const [accruedPerSecond] = useContract("UBI", "accruedPerSecond");

  const { send: batchSend } = useContract("transactionBatcher", "batchSend");
  const { send: reportRemoval, loading: reportRemovalLoading } = useContract(
    "UBI",
    "reportRemoval"
  );
  const { send: startAccruing, loading: startAccruingLoading } = useContract(
    "UBI",
    "startAccruing"
  );

  const pohInstance = useMemo(() => {
    if (!ProofOfHumanityAbi || !pohAddress) return;
    return new web3.eth.Contract(ProofOfHumanityAbi, pohAddress);
  }, [web3.eth.Contract]);

  const ubiInstance = useMemo(() => {
    if (!UBIAbi || !UBIAddress) return;
    return new web3.eth.Contract(UBIAbi, UBIAddress);
  }, [web3.eth.Contract]);

  const challengeTimeRemaining =
    (Number(lastStatusChange) + Number(challengePeriodDuration)) * 1000 -
    Date.now();

  const [fetchingElegible, setFetchingElegible] = useState(false);
  const { submissions } = vouchesReceivedQuery || {};
  const registerAndAdvanceOthers = useCallback(async () => {
    if (
      !pohInstance ||
      !submissionID ||
      !requiredNumberOfVouches ||
      !submissions
    )
      return;

    setFetchingElegible(true);
    const { vouches: offChainVouches } = await (
      await fetch(
        `${
          process.env.NEXT_PUBLIC_VOUCH_DB_URL
        }/vouch/search?minVouches=${Number(requiredNumberOfVouches)}`
      )
    ).json();

    const onChainVouches = submissions.map((s) => ({
      submissionId: s.id,
      vouchers: s.vouchesReceived.map((v) => v.id),
    }));
    const toVouchCalls = await getVouchCallsElegibleUsers(
      pohInstance,
      requiredNumberOfVouches,
      offChainVouches,
      onChainVouches,
      2
    );
    setFetchingElegible(false);
    const executeRequestCall = pohInstance.methods
      .executeRequest(submissionID)
      .encodeABI();
    const startAccruingCall = ubiInstance.methods
      .startAccruing(submissionID)
      .encodeABI();

    batchSend(
      [
        pohAddress,
        UBIAddress,
        ...new Array(toVouchCalls.length).fill(pohAddress),
      ],
      [
        web3.utils.toBN(0),
        web3.utils.toBN(0),
        ...new Array(toVouchCalls.length).fill(web3.utils.toBN(0)),
      ],
      [executeRequestCall, startAccruingCall, ...toVouchCalls],
      { gasLimit: 310000 }
    ).then(reCall);
  }, [
    batchSend,
    pohInstance,
    reCall,
    requiredNumberOfVouches,
    submissionID,
    submissions,
    ubiInstance.methods,
    web3.utils,
  ]);

  // This counts how many vouches the profile received, but
  // that are locked on another submission.
  const [queuedVouches, setQueuedVouches] = useState(new Set());

  // Gasless vouches.
  const [ownValidVouches, setOwnValidVouches] = useState([]);
  useEffect(() => {
    if (!submissionID) return;
    (async () => {
      const user = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/search?submissionId=${submissionID}`
        )
      ).json();

      const validVouches = { signatures: [], expirationTimestamps: [] };
      if (user?.vouches?.length === 0) return;
      const vouches = user.vouches[0];
      for (let i = 0; i < vouches.vouchers.length; i++) {
        if (validVouches.signatures.length >= requiredNumberOfVouches) break;

        const { hasVouched } = await pohInstance.methods
          .getSubmissionInfo(vouches.vouchers[i])
          .call();

        if (!hasVouched) {
          validVouches.signatures.push(vouches.signatures[i]);
          validVouches.expirationTimestamps.push(
            vouches.expirationTimestamps[i]
          );
        } else {
          setQueuedVouches((previous) => previous.add(vouches.vouchers[i]));
          rerender();
        }
      }
      if (validVouches.signatures.length === 0) return;
      setOwnValidVouches(validVouches);
    })();
  }, [
    pohInstance,
    requiredNumberOfVouches,
    status.key,
    submissionID,
    vouchesReceivedQuery,
  ]);

  const { submission } = vouchesReceivedQuery || {};
  const { vouchesReceived } = submission || {};
  const [availableOnchainVouches, setAvailableOnchainVouches] = useState([]);
  useEffect(() => {
    if (!vouchesReceived || !pohInstance) return;
    (async () => {
      const onChainVouches = [];
      for (const vouchReceived of vouchesReceived) {
        if (onChainVouches.length >= requiredNumberOfVouches) break;

        const { hasVouched } = await pohInstance.methods
          .getSubmissionInfo(vouchReceived.id)
          .call();

        if (!hasVouched) onChainVouches.push(vouchReceived.id);
        else setQueuedVouches((previous) => previous.add(vouchReceived.id));
      }
      setAvailableOnchainVouches(onChainVouches);
    })();
  }, [pohInstance, requiredNumberOfVouches, vouchesReceived]);

  const advanceToPending = useCallback(() => {
    if (
      !ownValidVouches &&
      (!availableOnchainVouches || availableOnchainVouches.length === 0)
    )
      return;

    if (ownValidVouches?.signatures?.length >= requiredNumberOfVouches)
      changeStateToPendingSend(
        submissionID,
        [],
        ownValidVouches.signatures,
        ownValidVouches.expirationTimestamps
      ).then(reCall);
    else if (availableOnchainVouches.length >= requiredNumberOfVouches)
      changeStateToPendingSend(
        submissionID,
        availableOnchainVouches,
        [],
        []
      ).then(reCall);
  }, [
    availableOnchainVouches,
    changeStateToPendingSend,
    ownValidVouches,
    reCall,
    requiredNumberOfVouches,
    submissionID,
  ]);

  return (
    <>
      <Card
        variant="muted"
        mainSx={{
          justifyContent: ["center", "center", "center", "space-between"],
          padding: 1,
          flexDirection: ["column", "column", "column", "row"],
        }}
      >
        <Flex sx={{ marginBottom: [2, 2, 2, 0] }}>
          <UBI size={32} />
          <AccruedUBI
            lastMintedSecond={lastMintedSecond}
            web3={web3}
            accruedPerSecond={accruedPerSecond}
            sx={{ marginLeft: 2 }}
          />
        </Flex>
        {lastMintedSecond &&
          lastMintedSecond.gt(web3.utils.toBN(0)) &&
          typeof registered === "boolean" &&
          !registered && (
            <Button
              variant="secondary"
              disabled={lastMintedSecondStatus === "pending"}
              onClick={() => reportRemoval(submissionID).then(reCall)}
              loading={reportRemovalLoading}
            >
              Seize UBI
            </Button>
          )}
        {status.key === submissionStatusEnum.Vouching.key &&
          [...queuedVouches.keys()].length === registeredVouchers.length &&
          `Vouches in use in other submissions: ${
            [...queuedVouches.keys()].length
          }`}
        {(ownValidVouches?.signatures?.length >= requiredNumberOfVouches ||
          availableOnchainVouches?.length >= requiredNumberOfVouches) &&
          status.key === submissionStatusEnum.Vouching.key &&
          firstRoundFullyFunded && (
            <Flex sx={{ alignItems: "center" }}>
              <Text sx={{ marginRight: 2 }}>Wait or</Text>
              <Button
                variant="secondary"
                onClick={advanceToPending}
                loading={changeStateToPendingSendLoading}
              >
                Advance to Pending
              </Button>
            </Flex>
          )}
        {challengeTimeRemaining < 0 &&
          (status.key === submissionStatusEnum.PendingRegistration.key ? (
            <Button
              variant="secondary"
              disabled={fetchingElegible}
              onClick={registerAndAdvanceOthers}
              loading={fetchingElegible}
            >
              Finalize registration and start accruing{" "}
              <Text as="span" role="img" sx={{ marginLeft: 1 }}>
                💧
              </Text>
            </Button>
          ) : (
            status.key === submissionStatusEnum.Registered.key &&
            lastMintedSecond?.eq(web3.utils.toBN(0)) && (
              <Button
                variant="secondary"
                disabled={lastMintedSecondStatus === "pending"}
                onClick={() => startAccruing(submissionID).then(reCall)}
                loading={startAccruingLoading}
              >
                Start Accruing{" "}
                <Text as="span" role="img" sx={{ marginLeft: 1 }}>
                  💧
                </Text>
              </Button>
            )
          ))}
      </Card>
      {status.key === submissionStatusEnum.Vouching.key &&
        [...queuedVouches.keys()].length === registeredVouchers.length && (
          <Alert type="muted" title="Pending Vouch Release" sx={{ mt: 3 }}>
            <Text>
              All vouches given to this submission are being used by other
              submissions. Either wait for them to resolve or ask that someone
              alse with a free vouch to also vouch for you.
            </Text>
          </Alert>
        )}
    </>
  );
}
