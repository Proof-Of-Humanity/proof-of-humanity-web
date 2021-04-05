import { Address, BigInt, ByteArray, crypto } from "@graphprotocol/graph-ts";

import {
  AddSubmissionCall,
  AddSubmissionManuallyCall,
  AddVouchCall,
  ArbitratorComplete,
  ChallengeRequestCall,
  ChangeArbitratorCall,
  ChangeDurationsCall,
  ChangeGovernorCall,
  ChangeLoserStakeMultiplierCall,
  ChangeMetaEvidenceCall,
  ChangeRequiredNumberOfVouchesCall,
  ChangeSharedStakeMultiplierCall,
  ChangeStateToPendingCall,
  ChangeSubmissionBaseDepositCall,
  ChangeWinnerStakeMultiplierCall,
  ExecuteRequestCall,
  FundAppealCall,
  FundSubmissionCall,
  MetaEvidence as MetaEvidenceEvent,
  ProcessVouchesCall,
  ProofOfHumanity,
  ReapplySubmissionCall,
  RemoveSubmissionCall,
  RemoveSubmissionManuallyCall,
  RemoveVouchCall,
  RuleCall,
  SubmitEvidenceCall,
  WithdrawFeesAndRewardsCall,
  WithdrawSubmissionCall,
} from "../generated/ProofOfHumanity/ProofOfHumanity";
import {
  Challenge,
  Contract,
  Contribution,
  Evidence,
  MetaEvidence,
  Request,
  Round,
  Submission,
} from "../generated/schema";

const zeroAddress = "0x0000000000000000000000000000000000000000";

function getStatus(status: number): string {
  if (status == 0) return "None";
  if (status == 1) return "Vouching";
  if (status == 2) return "PendingRegistration";
  if (status == 3) return "PendingRemoval";
  return "Error";
}

function getReason(reason: number): string {
  if (reason == 0) return "None";
  if (reason == 1) return "IncorrectSubmission";
  if (reason == 2) return "Deceased";
  if (reason == 3) return "Duplicate";
  if (reason == 4) return "DoesNotExist";
  return "Error";
}

function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  const out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i];
  for (let j = 0; j < b.length; j++) out[a.length + j] = b[j];
  return out as ByteArray;
}

function updateContribution(
  proofOfHumanityAddress: Address,
  submissionID: Address,
  requestIndex: BigInt,
  challengeIndex: BigInt,
  roundIndex: BigInt,
  roundID: ByteArray,
  contributor: Address,
  time: BigInt
): void {
  const proofOfHumanity = ProofOfHumanity.bind(proofOfHumanityAddress);
  const roundInfo = proofOfHumanity.getRoundInfo(
    submissionID,
    requestIndex,
    challengeIndex,
    roundIndex
  );
  const contributions = proofOfHumanity.getContributions(
    submissionID,
    requestIndex,
    challengeIndex,
    roundIndex,
    contributor
  );

  const round = Round.load(roundID.toHexString());
  if (!round) {
    return;
  }

  round.paidFees = roundInfo.value1;
  round.hasPaid = [
    roundInfo.value0 ? roundInfo.value2 == 0 : roundInfo.value2 == 1,
    roundInfo.value0 ? roundInfo.value2 == 0 : roundInfo.value2 == 2,
  ];
  round.feeRewards = roundInfo.value3;
  round.save();

  const contributionID = crypto
    .keccak256(concatByteArrays(roundID, contributor))
    .toHexString();
  let contribution = Contribution.load(contributionID);
  if (contribution == null) {
    contribution = new Contribution(contributionID);
    contribution.creationTime = time;
    contribution.round = round.id;
    contribution.contributor = contributor;
  }
  contribution.values = [contributions[1], contributions[2]];
  contribution.save();
}

function requestStatusChange(
  submissionID: Address,
  timestamp: BigInt,
  messageSender: Address,
  evidenceURI: string,
  proofOfHumanityAddress: Address,
  time: BigInt
): void {
  const contract = Contract.load("0");
  const submission = Submission.load(submissionID.toHexString());

  if (!(contract && submission)) {
    return;
  }

  const requestID = crypto.keccak256(
    concatByteArrays(
      submissionID,
      ByteArray.fromUTF8(submission.requestsLength.toString())
    )
  );
  submission.requestsLength = submission.requestsLength.plus(BigInt.fromI32(1));
  submission.save();

  const request = new Request(requestID.toHexString());
  request.creationTime = time;
  request.submission = submission.id;
  request.disputed = false;
  request.lastStatusChange = timestamp;
  request.resolved = false;
  request.requester = messageSender;
  request.arbitrator = contract.arbitrator;
  request.arbitratorExtraData = contract.arbitratorExtraData;
  request.vouches = [];
  request.usedReasons = [];
  request.currentReason = "None";
  request.nbParallelDisputes = BigInt.fromI32(0);
  request.requesterLost = false;
  request.penaltyIndex = BigInt.fromI32(0);
  request.metaEvidence =
    (submission.status == "PendingRemoval"
      ? contract.clearingMetaEvidence
      : contract.registrationMetaEvidence) ?? "";
  request.registration = submission.status == "Vouching";
  request.evidenceLength = BigInt.fromI32(1);
  request.challengesLength = BigInt.fromI32(1);
  request.save();

  const evidence = new Evidence(
    crypto
      .keccak256(concatByteArrays(requestID, ByteArray.fromUTF8("Evidence-0")))
      .toHexString()
  );
  evidence.creationTime = time;
  evidence.request = request.id;
  evidence.URI = evidenceURI;
  evidence.sender = messageSender;
  evidence.save();

  const challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  const challenge = new Challenge(challengeID.toHexString());
  challenge.creationTime = time;
  challenge.request = request.id;
  challenge.challengeID = BigInt.fromI32(0);
  challenge.roundsLength = BigInt.fromI32(1);
  challenge.save();

  const roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );
  const round = new Round(roundID.toHexString());
  round.creationTime = time;
  round.challenge = challenge.id;
  round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
  round.hasPaid = [false, false];
  round.feeRewards = BigInt.fromI32(0);
  round.save();

  updateContribution(
    proofOfHumanityAddress,
    submissionID,
    submission.requestsLength.minus(BigInt.fromI32(1)),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    messageSender,
    time
  );
}

function processVouchesHelper(
  submissionID: Address,
  requestID: BigInt,
  iterations: BigInt
): void {
  const request = Request.load(
    crypto
      .keccak256(
        concatByteArrays(submissionID, ByteArray.fromUTF8(requestID.toString()))
      )
      .toHexString()
  );

  if (!request) {
    return;
  }

  const requestVouchesLength = BigInt.fromI32(request.vouches.length);
  const actualIterations = iterations
    .plus(request.penaltyIndex)
    .gt(requestVouchesLength)
    ? requestVouchesLength.minus(request.penaltyIndex)
    : iterations;
  const endIndex = actualIterations.plus(request.penaltyIndex);
  request.penaltyIndex = endIndex;
  request.save();

  for (let i = 0; i < endIndex.toI32(); i++) {
    const vouches = request.vouches;
    const requestUsedReasons = request.usedReasons;

    const voucher = Submission.load(vouches[i]);
    if (voucher) {
      voucher.usedVouch = null;

      if (request.ultimateChallenger != null) {
        if (
          requestUsedReasons[requestUsedReasons.length - 1] == "Duplicate" ||
          requestUsedReasons[requestUsedReasons.length - 1] == "DoesNotExist"
        ) {
          if (
            voucher.status == "Vouching" ||
            voucher.status == "PendingRegistration"
          ) {
            const voucherRequest = Request.load(
              crypto
                .keccak256(
                  concatByteArrays(
                    ByteArray.fromHexString(voucher.id),
                    ByteArray.fromUTF8(
                      voucher.requestsLength.minus(BigInt.fromI32(1)).toString()
                    )
                  )
                )
                .toHexString()
            );
            if (voucherRequest) {
              voucherRequest.requesterLost = true;
              voucherRequest.save();
            }
          }

          voucher.registered = false;
        }
      }

      voucher.save();
    }
  }
}

export function metaEvidence(event: MetaEvidenceEvent): void {
  const metaEvidence = new MetaEvidence(
    event.params._metaEvidenceID.toHexString()
  );
  metaEvidence.URI = event.params._evidence;
  metaEvidence.save();

  const contract = Contract.load("0");
  if (contract == null) {
    return;
  }
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    BigInt.fromI32(1)
  );
  if (
    event.params._metaEvidenceID
      .mod(BigInt.fromI32(2))
      .equals(BigInt.fromI32(0))
  )
    contract.registrationMetaEvidence = metaEvidence.id;
  else contract.clearingMetaEvidence = metaEvidence.id;
  contract.save();
}

export function arbitratorComplete(event: ArbitratorComplete): void {
  const proofOfHumanity = ProofOfHumanity.bind(event.address);
  const contract = new Contract("0");
  contract.arbitrator = event.params._arbitrator;
  const arbitratorDataList = proofOfHumanity.arbitratorDataList(
    BigInt.fromI32(0)
  );
  contract.arbitratorExtraData = arbitratorDataList.value2;
  contract.governor = event.params._governor;
  contract.submissionBaseDeposit = event.params._submissionBaseDeposit;
  contract.submissionChallengeBaseDeposit = BigInt.fromI32(0);
  contract.submissionDuration = event.params._submissionDuration;
  contract.renewalTime = proofOfHumanity.renewalPeriodDuration();
  contract.challengePeriodDuration = event.params._challengePeriodDuration;
  contract.requiredNumberOfVouches = event.params._requiredNumberOfVouches;
  contract.metaEvidenceUpdates = BigInt.fromI32(0);
  contract.sharedStakeMultiplier = event.params._sharedStakeMultiplier;
  contract.winnerStakeMultiplier = event.params._winnerStakeMultiplier;
  contract.loserStakeMultiplier = event.params._loserStakeMultiplier;
  contract.registrationMetaEvidence = "0x0";
  contract.clearingMetaEvidence = "0x1";
  contract.save();
}

export function addSubmissionManually(call: AddSubmissionManuallyCall): void {
  const submissionIDs = call.inputs._submissionIDs;
  const evidences = call.inputs._evidence;
  const names = call.inputs._names;
  const contract = Contract.load("0");

  if (!contract) {
    return;
  }

  for (const [i, submissionID] of submissionIDs.entries()) {
    const submission = new Submission(submissionID.toHexString());
    submission.creationTime = call.block.timestamp;
    submission.status = "None";
    submission.registered = true;
    submission.submissionTime = call.block.timestamp;
    submission.name = names[i];
    submission.vouchees = [];
    submission.vouchesReceived = [];
    submission.disputed = false;
    submission.requestsLength = BigInt.fromI32(1);
    submission.save();

    const requestID = crypto.keccak256(
      concatByteArrays(submissionID, ByteArray.fromUTF8("0"))
    );
    const request = new Request(requestID.toHexString());
    request.creationTime = call.block.timestamp;
    request.submission = submission.id;
    request.disputed = false;
    request.lastStatusChange = call.block.timestamp;
    request.resolved = true;
    request.requester = call.from;
    request.arbitrator = contract.arbitrator;
    request.arbitratorExtraData = contract.arbitratorExtraData;
    request.vouches = [];
    request.usedReasons = [];
    request.currentReason = "None";
    request.nbParallelDisputes = BigInt.fromI32(0);
    request.requesterLost = false;
    request.penaltyIndex = BigInt.fromI32(0);
    request.metaEvidence = contract.registrationMetaEvidence ?? "";
    request.registration = true;
    request.evidenceLength = BigInt.fromI32(1);
    request.challengesLength = BigInt.fromI32(1);
    request.save();

    const evidence = new Evidence(
      crypto
        .keccak256(
          concatByteArrays(requestID, ByteArray.fromUTF8("Evidence-0"))
        )
        .toHexString()
    );
    evidence.creationTime = call.block.timestamp;
    evidence.request = request.id;
    evidence.URI = evidences[i];
    evidence.sender = call.from;
    evidence.save();

    const challengeID = crypto.keccak256(
      concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
    );
    const challenge = new Challenge(challengeID.toHexString());
    challenge.challengeID = BigInt.fromI32(0);
    challenge.creationTime = call.block.timestamp;
    challenge.request = request.id;
    challenge.roundsLength = BigInt.fromI32(1);
    challenge.save();

    const round = new Round(
      crypto
        .keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0")))
        .toHexString()
    );
    round.creationTime = call.block.timestamp;
    round.challenge = challenge.id;
    round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    round.hasPaid = [false, false];
    round.feeRewards = BigInt.fromI32(0);
    round.save();
  }
}

export function removeSubmissionManually(
  call: RemoveSubmissionManuallyCall
): void {
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  submission.registered = false;
  submission.save();
}

export function changeSubmissionBaseDeposit(
  call: ChangeSubmissionBaseDepositCall
): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.submissionBaseDeposit = call.inputs._submissionBaseDeposit;
  contract.save();
}

export function changeDurations(call: ChangeDurationsCall): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.submissionDuration = call.inputs._submissionDuration;
  contract.renewalTime = call.inputs._renewalPeriodDuration;
  contract.challengePeriodDuration = call.inputs._challengePeriodDuration;
  contract.save();
}

export function changeRequiredNumberOfVouches(
  call: ChangeRequiredNumberOfVouchesCall
): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.requiredNumberOfVouches = call.inputs._requiredNumberOfVouches;
  contract.save();
}

export function changeSharedStakeMultiplier(
  call: ChangeSharedStakeMultiplierCall
): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.sharedStakeMultiplier = call.inputs._sharedStakeMultiplier;
  contract.save();
}

export function changeWinnerStakeMultiplier(
  call: ChangeWinnerStakeMultiplierCall
): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.winnerStakeMultiplier = call.inputs._winnerStakeMultiplier;
  contract.save();
}

export function changeLoserStakeMultiplier(
  call: ChangeLoserStakeMultiplierCall
): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.loserStakeMultiplier = call.inputs._loserStakeMultiplier;
  contract.save();
}

export function changeGovernor(call: ChangeGovernorCall): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.governor = call.inputs._governor;
  contract.save();
}

export function changeMetaEvidence(call: ChangeMetaEvidenceCall): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    BigInt.fromI32(1)
  );

  const registrationMetaEvidenceID = contract.metaEvidenceUpdates.times(
    BigInt.fromI32(2)
  );
  const registrationMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.toHexString()
  );
  registrationMetaEvidence.URI = call.inputs._registrationMetaEvidence;
  registrationMetaEvidence.save();

  const clearingMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.plus(BigInt.fromI32(1)).toHexString()
  );
  clearingMetaEvidence.URI = call.inputs._clearingMetaEvidence;
  clearingMetaEvidence.save();

  contract.registrationMetaEvidence = registrationMetaEvidence.id;
  contract.clearingMetaEvidence = clearingMetaEvidence.id;
  contract.save();
}

export function changeArbitrator(call: ChangeArbitratorCall): void {
  const contract = Contract.load("0");
  if (!contract) {
    return;
  }

  contract.arbitrator = call.inputs._arbitrator;
  contract.arbitratorExtraData = call.inputs._arbitratorExtraData;
  contract.save();
}

export function addSubmission(call: AddSubmissionCall): void {
  const submissionID = call.from.toHexString();
  let submission = Submission.load(submissionID);
  if (submission == null) {
    submission = new Submission(submissionID);
    submission.creationTime = call.block.timestamp;
    submission.registered = false;
    submission.name = call.inputs._name;
    submission.vouchees = [];
    submission.vouchesReceived = [];
    submission.disputed = false;
    submission.requestsLength = BigInt.fromI32(0);
  }
  submission.status = "Vouching";
  submission.save();

  requestStatusChange(
    call.from,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function reapplySubmission(call: ReapplySubmissionCall): void {
  const submission = Submission.load(call.from.toHexString());
  if (!submission) {
    return;
  }

  submission.status = "Vouching";
  submission.save();

  requestStatusChange(
    call.from,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function removeSubmission(call: RemoveSubmissionCall): void {
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  submission.status = "PendingRemoval";
  submission.save();

  requestStatusChange(
    call.inputs._submissionID,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function fundSubmission(call: FundSubmissionCall): void {
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  const challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  const roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    call.from,
    call.block.timestamp
  );
}

export function addVouch(call: AddVouchCall): void {
  const submission = Submission.load(call.from.toHexString());
  if (submission != null) {
    submission.vouchees = submission.vouchees.concat([
      call.inputs._submissionID.toHexString(),
    ]);
    submission.save();

    const vouchedSubmission = Submission.load(
      call.inputs._submissionID.toHexString()
    );
    if (vouchedSubmission != null) {
      vouchedSubmission.vouchesReceived = vouchedSubmission.vouchees.concat([
        call.from.toHexString(),
      ]);
      vouchedSubmission.save();
    }
  }
}

export function removeVouch(call: RemoveVouchCall): void {
  const submission = Submission.load(call.from.toHexString());
  if (submission != null) {
    const vouchees = submission.vouchees;
    const nextVouchees = new Array<string>(vouchees.length - 1);
    for (let i = 0; i < vouchees.length; i++)
      if (vouchees[i] != call.inputs._submissionID.toHexString())
        nextVouchees.push(vouchees[i]);
    submission.vouchees = nextVouchees;
    submission.save();

    const vouchedSubmission = Submission.load(
      call.inputs._submissionID.toHexString()
    );
    if (vouchedSubmission != null) {
      const vouchers = vouchedSubmission.vouchesReceived;
      const updatedVouchers = new Array<string>(vouchers.length - 1);
      for (let i = 0; i < vouchers.length; i++)
        if (vouchers[i] != call.from.toHexString())
          updatedVouchers.push(vouchers[i]);
      vouchedSubmission.vouchesReceived = updatedVouchers;
      vouchedSubmission.save();
    }
  }
}

export function withdrawSubmission(call: WithdrawSubmissionCall): void {
  const submission = Submission.load(call.from.toHexString());
  if (!submission) {
    return;
  }

  submission.status = "None";
  submission.save();

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestID = crypto.keccak256(
    concatByteArrays(call.from, ByteArray.fromUTF8(requestIndex.toString()))
  );
  const request = Request.load(requestID.toHexString());
  if (!request) {
    return;
  }

  request.resolved = true;
  request.save();

  const challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  const roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );
  updateContribution(
    call.to,
    call.from,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    call.from,
    call.block.timestamp
  );
}

export function changeStateToPending(call: ChangeStateToPendingCall): void {
  const contract = Contract.load("0");
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!(submission && contract)) {
    return;
  }

  submission.status = "PendingRegistration";
  submission.save();

  const request = Request.load(
    crypto
      .keccak256(
        concatByteArrays(
          call.inputs._submissionID,
          ByteArray.fromUTF8(
            submission.requestsLength.minus(BigInt.fromI32(1)).toString()
          )
        )
      )
      .toHexString()
  );
  if (!request) {
    return;
  }

  request.lastStatusChange = call.block.timestamp;

  const vouches = call.inputs._vouches;
  for (const vouch of vouches) {
    const voucher = Submission.load(vouch.toHexString());
    if (!voucher) {
      continue;
    }

    if (
      !voucher.usedVouch &&
      voucher.registered &&
      call.block.timestamp
        .minus(voucher.submissionTime as BigInt)
        .le(contract.submissionDuration) &&
      voucher.vouchees.includes(submission.id)
    ) {
      request.vouches = request.vouches.concat([voucher.id]);
      voucher.usedVouch = submission.id;
      voucher.save();
    }
  }
  request.save();
}

export function challengeRequest(call: ChallengeRequestCall): void {
  const callInputsReason = getReason(call.inputs._reason);
  const proofOfHumanity = ProofOfHumanity.bind(call.to);
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  submission.disputed = true;
  submission.save();

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  const request = Request.load(requestID.toHexString());
  if (!request) {
    return;
  }

  request.disputed = true;
  request.usedReasons = request.usedReasons.concat([callInputsReason]);
  request.currentReason = callInputsReason;
  request.nbParallelDisputes = request.nbParallelDisputes.plus(
    BigInt.fromI32(1)
  );

  if (call.inputs._evidence != zeroAddress) {
    const evidenceIndex = request.evidenceLength;
    request.evidenceLength = evidenceIndex.plus(BigInt.fromI32(1));
    const evidence = new Evidence(
      crypto
        .keccak256(
          concatByteArrays(
            requestID,
            ByteArray.fromUTF8(`Evidence-${evidenceIndex.toString()}`)
          )
        )
        .toHexString()
    );
    evidence.creationTime = call.block.timestamp;
    evidence.request = request.id;
    evidence.URI = call.inputs._evidence;
    evidence.sender = call.from;
    evidence.save();
  }

  let challengeIndex = request.challengesLength.minus(BigInt.fromI32(1));
  let challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8(`Challenge-${challengeIndex.toString()}`)
    )
  );
  let challenge = Challenge.load(challengeID.toHexString());
  if (!challenge) {
    return;
  }

  if (challenge.disputeID) {
    challengeIndex = request.challengesLength;
    request.challengesLength = request.challengesLength.plus(BigInt.fromI32(1));
    challengeID = concatByteArrays(
      requestID,
      ByteArray.fromUTF8(`Challenge-${challengeIndex.toString()}`)
    );
    challenge = new Challenge(challengeID.toHexString());
    challenge.creationTime = call.block.timestamp;
    challenge.request = request.id;

    const requestInfo = proofOfHumanity.getRequestInfo(
      call.inputs._submissionID,
      requestIndex
    );
    challenge.challengeID = BigInt.fromI32(requestInfo.value6);
  }
  request.save();

  const challengeInfo = proofOfHumanity.getChallengeInfo(
    call.inputs._submissionID,
    requestIndex,
    challengeIndex
  );
  challenge.reason = callInputsReason;
  challenge.disputeID = challengeInfo.value2;
  challenge.challenger = call.from;
  if (callInputsReason == "Duplicate") {
    challenge.duplicateSubmission = call.inputs._duplicateID.toHexString();
  }
  challenge.roundsLength = BigInt.fromI32(2);
  challenge.save();

  const round = new Round(
    crypto
      .keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("1")))
      .toHexString()
  );
  round.creationTime = call.block.timestamp;
  round.challenge = challenge.id;
  round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
  round.hasPaid = [false, false];
  round.feeRewards = BigInt.fromI32(0);
  round.save();

  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    challengeIndex,
    BigInt.fromI32(0),
    crypto.keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0"))),
    call.from,
    call.block.timestamp
  );
}

export function fundAppeal(call: FundAppealCall): void {
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  const challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8(`Challenge-${call.inputs._challengeID.toString()}`)
    )
  );
  const challenge = Challenge.load(challengeID.toHexString());
  if (!challenge) {
    return;
  }

  let roundIndex = challenge.roundsLength.minus(BigInt.fromI32(1));
  const roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8(roundIndex.toString()))
  );

  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    call.inputs._challengeID,
    roundIndex,
    roundID,
    call.from,
    call.block.timestamp
  );

  let round = Round.load(roundID.toHexString());
  if (!round) {
    return;
  }

  if (!round.hasPaid.includes(false)) {
    roundIndex = challenge.roundsLength;
    challenge.roundsLength = roundIndex.plus(BigInt.fromI32(1));
    challenge.save();
    round = new Round(
      crypto
        .keccak256(
          concatByteArrays(
            challengeID,
            ByteArray.fromUTF8(roundIndex.toString())
          )
        )
        .toHexString()
    );
    round.creationTime = call.block.timestamp;
    round.challenge = challenge.id;
    round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    round.hasPaid = [false, false];
    round.feeRewards = BigInt.fromI32(0);
    round.save();
  }
}

export function executeRequest(call: ExecuteRequestCall): void {
  const proofOfHumanity = ProofOfHumanity.bind(call.to);
  const submissionInfo = proofOfHumanity.getSubmissionInfo(
    call.inputs._submissionID
  );

  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  submission.status = "None";
  submission.registered = submissionInfo.value3;
  submission.submissionTime = submissionInfo.value1;
  submission.save();

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  const request = Request.load(requestID.toHexString());
  if (!request) {
    return;
  }

  request.resolved = true;
  request.save();

  const challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  processVouchesHelper(
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(10) // AUTO_PROCESSED_VOUCH
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    crypto.keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0"))),
    request.requester as Address,
    call.block.timestamp
  );
}

export function processVouches(call: ProcessVouchesCall): void {
  processVouchesHelper(
    call.inputs._submissionID,
    call.inputs._requestID,
    call.inputs._iterations
  );
}

export function withdrawFeesAndRewards(call: WithdrawFeesAndRewardsCall): void {
  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(call.inputs._requestID.toString())
    )
  );
  const challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8(`Challenge-${call.inputs._challengeID.toString()}`)
    )
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    call.inputs._requestID,
    call.inputs._challengeID,
    call.inputs._round,
    crypto.keccak256(
      concatByteArrays(
        challengeID,
        ByteArray.fromUTF8(call.inputs._round.toString())
      )
    ),
    call.inputs._beneficiary,
    call.block.timestamp
  );
}

export function rule(call: RuleCall): void {
  const proofOfHumanity = ProofOfHumanity.bind(call.to);
  const disputeData = proofOfHumanity.arbitratorDisputeIDToDisputeData(
    call.from,
    call.inputs._disputeID
  );
  const submissionInfo = proofOfHumanity.getSubmissionInfo(disputeData.value1);

  const submission = Submission.load(disputeData.value1.toHexString());
  if (!submission) {
    return;
  }

  submission.status = getStatus(submissionInfo.value0);
  submission.registered = submissionInfo.value3;
  submission.submissionTime = submissionInfo.value1;

  const requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  const requestInfo = proofOfHumanity.getRequestInfo(
    disputeData.value1,
    requestIndex
  );
  submission.disputed = false;
  submission.save();
  const requestID = crypto.keccak256(
    concatByteArrays(
      disputeData.value1,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  const request = Request.load(requestID.toHexString());
  if (!request) {
    return;
  }

  request.disputed = requestInfo.value0;
  request.lastStatusChange = call.block.timestamp;
  request.resolved = requestInfo.value1;
  request.currentReason = getReason(requestInfo.value3);
  request.nbParallelDisputes = BigInt.fromI32(requestInfo.value4);
  request.ultimateChallenger = requestInfo.value8;
  request.requesterLost = requestInfo.value2;
  request.save();

  const challenge = Challenge.load(
    crypto
      .keccak256(
        concatByteArrays(
          requestID,
          ByteArray.fromUTF8(`Challenge-${disputeData.value0.toString()}`)
        )
      )
      .toHexString()
  );
  if (!challenge) {
    return;
  }

  challenge.ruling = proofOfHumanity.getChallengeInfo(
    disputeData.value1,
    requestIndex,
    disputeData.value0
  ).value2;
  challenge.save();
}

export function submitEvidence(call: SubmitEvidenceCall): void {
  const submission = Submission.load(call.inputs._submissionID.toHexString());
  if (!submission) {
    return;
  }

  const requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(
        submission.requestsLength.minus(BigInt.fromI32(1)).toString()
      )
    )
  );

  const request = Request.load(requestID.toHexString());
  if (!request) {
    return;
  }

  const evidenceIndex = request.evidenceLength;
  request.evidenceLength = evidenceIndex.plus(BigInt.fromI32(1));
  request.save();

  const evidence = new Evidence(
    crypto
      .keccak256(
        concatByteArrays(
          requestID,
          ByteArray.fromUTF8(`Evidence-${evidenceIndex.toString()}`)
        )
      )
      .toHexString()
  );
  evidence.creationTime = call.block.timestamp;
  evidence.request = request.id;
  evidence.URI = call.inputs._evidence;
  evidence.sender = call.from;
  evidence.save();
}
