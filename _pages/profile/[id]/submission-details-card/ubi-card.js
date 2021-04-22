/* eslint-disable jsx-a11y/accessible-emoji */
import {
  Button,
  Card,
  Flex,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { UBI } from "@kleros/icons";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

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

async function findElegibleUsers(
  pohInstance,
  requiredNumberOfVouches,
  count = 1
) {
  const { vouches: users } = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/search?minVouches=${Number(
        requiredNumberOfVouches
      )}`
    )
  ).json();

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
  }
  return toVouchCalls;
}

export default function UBICard({
  submissionID,
  lastStatusChange,
  challengePeriodDuration,
  status,
}) {
  const { web3 } = useWeb3();

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

  const [requiredNumberOfVouches] = useContract(
    "proofOfHumanity",
    "requiredNumberOfVouches"
  );
  const [accruedPerSecond] = useContract("UBI", "accruedPerSecond");

  const { send: batchSend, loading: batchSendLoading } = useContract(
    "transactionBatcher",
    "batchSend"
  );
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

  const registerAndAdvanceOthers = useCallback(async () => {
    if (!pohInstance || !submissionID || !requiredNumberOfVouches) return;

    const toVouchCalls = await findElegibleUsers(
      pohInstance,
      requiredNumberOfVouches
    );
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
    ubiInstance.methods,
    web3.utils,
  ]);

  const [ownValidVouches, setOwnValidVouches] = useState(false);
  useEffect(() => {
    if (!submissionID) return;
    (async () => {
      const user = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/search?submissionId=${submissionID}`
        )
      ).json();

      const validVouches = { signatures: [], expirationTimestamps: [] };
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
        }
      }
      if (validVouches.signatures.length === 0) return;
      setOwnValidVouches(validVouches);
    })();
  }, [pohInstance, requiredNumberOfVouches, status.key, submissionID]);

  const advanceToPending = useCallback(async () => {
    if (!ownValidVouches) return;
    const toVouchCalls = await findElegibleUsers(
      pohInstance,
      requiredNumberOfVouches
    );
    const changeStateToPendingCall = pohInstance.methods
      .changeStateToPending(
        submissionID,
        [],
        ownValidVouches.signatures,
        ownValidVouches.expirationTimestamps
      )
      .encodeABI();

    batchSend(
      [pohAddress, ...new Array(toVouchCalls.length).fill(pohAddress)],
      [
        web3.utils.toBN(0),
        ...new Array(toVouchCalls.length).fill(web3.utils.toBN(0)),
      ],
      [changeStateToPendingCall, ...toVouchCalls],
      { gasLimit: 300000 }
    ).then(reCall);
  }, [
    batchSend,
    ownValidVouches,
    pohInstance,
    reCall,
    requiredNumberOfVouches,
    submissionID,
    web3.utils,
  ]);

  return (
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
      {ownValidVouches?.signatures?.length >= requiredNumberOfVouches &&
        status.key === submissionStatusEnum.Vouching.key && (
          <Button
            variant="secondary"
            onClick={advanceToPending}
            loading={batchSendLoading}
          >
            Advance to pending
          </Button>
        )}
      {challengeTimeRemaining < 0 &&
        (status.key === submissionStatusEnum.PendingRegistration.hes ? (
          <Button
            variant="secondary"
            disabled={lastMintedSecondStatus === "pending"}
            onClick={registerAndAdvanceOthers}
            loading={batchSendLoading}
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
  );
}
