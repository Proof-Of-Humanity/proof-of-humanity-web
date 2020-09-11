import { BigInt, ByteArray, crypto } from "@graphprotocol/graph-ts";
import {
  AddSubmissionManuallyCall,
  ArbitratorComplete,
  ChangeArbitratorCall,
  ChangeChallengePeriodDurationCall,
  ChangeGovernorCall,
  ChangeLoserStakeMultiplierCall,
  ChangeMetaEvidenceCall,
  ChangeRenewalTimeCall,
  ChangeRequiredNumberOfVouchesCall,
  ChangeSharedStakeMultiplierCall,
  ChangeSubmissionBaseDepositCall,
  ChangeSubmissionChallengeBaseDepositCall,
  ChangeSubmissionDurationCall,
  ChangeWinnerStakeMultiplierCall,
  MetaEvidence as MetaEvidenceEvent,
  ProofOfHumanity as _ProofOfHumanity,
  RemoveSubmissionManuallyCall,
} from "../generated/ProofOfHumanity/ProofOfHumanity";
import {
  Challenge,
  Contract,
  Evidence,
  MetaEvidence,
  Request,
  Round,
  Submission,
} from "../generated/schema";

function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i];
  for (let j = 0; j < b.length; j++) out[a.length + j] = b[j];
  return out as ByteArray;
}

export function metaEvidence(event: MetaEvidenceEvent): void {
  let metaEvidence = new MetaEvidence(event.params._metaEvidenceID.toString());
  metaEvidence.URI = event.params._evidence;
  metaEvidence.save();

  let contract = Contract.load("0");
  if (contract == null) return;
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    new BigInt(1)
  );
  if (event.params._metaEvidenceID.mod(new BigInt(2)).equals(new BigInt(0)))
    contract.registrationMetaEvidence = metaEvidence.id;
  else contract.clearingMetaEvidence = metaEvidence.id;
  contract.save();
}

export function arbitratorComplete(event: ArbitratorComplete): void {
  let ProofOfHumanity = _ProofOfHumanity.bind(event.address);
  let contract = new Contract("0");
  contract.arbitrator = event.params.arbitrator;
  contract.arbitratorExtraData = ProofOfHumanity.arbitratorExtraData();
  contract.governor = event.params.governor;
  contract.submissionBaseDeposit = event.params.submissionBaseDeposit;
  contract.submissionChallengeBaseDeposit =
    event.params.submissionChallengeBaseDeposit;
  contract.submissionDuration = event.params.submissionDuration;
  contract.renewalTime = ProofOfHumanity.renewalTime();
  contract.challengePeriodDuration = event.params.challengePeriodDuration;
  contract.requiredNumberOfVouches = event.params.requiredNumberOfVouches;
  contract.metaEvidenceUpdates = new BigInt(0);
  contract.sharedStakeMultiplier = event.params.sharedStakeMultiplier;
  contract.winnerStakeMultiplier = event.params.winnerStakeMultiplier;
  contract.loserStakeMultiplier = event.params.loserStakeMultiplier;
  contract.registrationMetaEvidence = "0x0";
  contract.clearingMetaEvidence = "0x1";
  contract.save();
}

export function addSubmissionManually(call: AddSubmissionManuallyCall): void {
  let contract = Contract.load("0");
  let submission = new Submission(call.inputs._submissionID.toHexString());
  submission.status = "None";
  submission.registered = true;
  submission.submissionTime = call.block.timestamp;
  submission.renewalTimestamp = call.block.timestamp.plus(
    contract.submissionDuration.minus(contract.renewalTime)
  );
  submission.name = call.inputs._name;
  submission.bio = call.inputs._bio;
  submission.vouchees = [];
  submission.usedVouch = false;
  submission.save();

  let requestID = crypto.keccak256(
    concatByteArrays(call.inputs._submissionID, ByteArray.fromUTF8("0"))
  );
  let request = new Request(requestID.toHexString());
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
  request.nbParallelDisputes = new BigInt(0);
  request.requesterLost = false;
  request.penaltyIndex = new BigInt(0);
  request.metaEvidence = contract.registrationMetaEvidence;
  request.save();

  let evidence = new Evidence(
    crypto
      .keccak256(concatByteArrays(requestID, ByteArray.fromUTF8("Evidence-0")))
      .toHexString()
  );
  evidence.request = request.id;
  evidence.URI = call.inputs._evidence;
  evidence.sender = call.from;
  evidence.save();

  let challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  let challenge = new Challenge(challengeID.toHexString());
  challenge.request = request.id;
  challenge.save();

  let round = new Round(
    crypto
      .keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0")))
      .toHexString()
  );
  round.challenge = challenge.id;
  round.paidFees = [new BigInt(0), new BigInt(0)];
  round.hasPaid = [false, false];
  round.feeRewards = new BigInt(0);
  round.save();
}

export function removeSubmissionManually(
  call: RemoveSubmissionManuallyCall
): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  submission.registered = false;
  submission.save();
}

export function changeSubmissionBaseDeposit(
  call: ChangeSubmissionBaseDepositCall
): void {
  let contract = Contract.load("0");
  contract.submissionBaseDeposit = call.inputs._submissionBaseDeposit;
  contract.save();
}

export function changeSubmissionChallengeBaseDeposit(
  call: ChangeSubmissionChallengeBaseDepositCall
): void {
  let contract = Contract.load("0");
  contract.submissionChallengeBaseDeposit =
    call.inputs._submissionChallengeBaseDeposit;
  contract.save();
}

export function changeSubmissionDuration(
  call: ChangeSubmissionDurationCall
): void {
  let contract = Contract.load("0");
  contract.submissionDuration = call.inputs._submissionDuration;
  contract.save();
}

export function changeRenewalTime(call: ChangeRenewalTimeCall): void {
  let contract = Contract.load("0");
  contract.renewalTime = call.inputs._renewalTime;
  contract.save();
}

export function changeChallengePeriodDuration(
  call: ChangeChallengePeriodDurationCall
): void {
  let contract = Contract.load("0");
  contract.challengePeriodDuration = call.inputs._challengePeriodDuration;
  contract.save();
}

export function changeRequiredNumberOfVouches(
  call: ChangeRequiredNumberOfVouchesCall
): void {
  let contract = Contract.load("0");
  contract.requiredNumberOfVouches = call.inputs._requiredNumberOfVouches;
  contract.save();
}

export function changeSharedStakeMultiplier(
  call: ChangeSharedStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.sharedStakeMultiplier = call.inputs._sharedStakeMultiplier;
  contract.save();
}

export function changeWinnerStakeMultiplier(
  call: ChangeWinnerStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.winnerStakeMultiplier = call.inputs._winnerStakeMultiplier;
  contract.save();
}

export function changeLoserStakeMultiplier(
  call: ChangeLoserStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.loserStakeMultiplier = call.inputs._loserStakeMultiplier;
  contract.save();
}

export function changeGovernor(call: ChangeGovernorCall): void {
  let contract = Contract.load("0");
  contract.governor = call.inputs._governor;
  contract.save();
}

export function changeMetaEvidence(call: ChangeMetaEvidenceCall): void {
  let contract = Contract.load("0");
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    new BigInt(1)
  );

  let registrationMetaEvidenceID = contract.metaEvidenceUpdates.times(
    new BigInt(2)
  );
  let registrationMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.toHexString()
  );
  registrationMetaEvidence.URI = call.inputs._registrationMetaEvidence;
  registrationMetaEvidence.save();

  let clearingMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.plus(new BigInt(1)).toHexString()
  );
  clearingMetaEvidence.URI = call.inputs._clearingMetaEvidence;
  clearingMetaEvidence.save();

  contract.registrationMetaEvidence = registrationMetaEvidence.id;
  contract.clearingMetaEvidence = clearingMetaEvidence.id;
  contract.save();
}

export function changeArbitrator(call: ChangeArbitratorCall): void {
  let contract = Contract.load("0");
  contract.arbitrator = call.inputs._arbitrator;
  contract.arbitratorExtraData = call.inputs._arbitratorExtraData;
  contract.save();
}
