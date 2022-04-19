import { createEnum } from "@kleros/components";
import { Check, Expired, Pending, X } from "@kleros/icons";

const dropdownOptions = [
  ["None", { kebabCase: undefined, startCase: "All" }],
  [
    "Vouching",
    {
      startCase: "Vouching Phase",
      Icon: Pending,
      query: { where: { status: "Vouching" } },
    },
  ],
  [
    "PendingRegistration",
    {
      Icon: Pending,
      query: { where: { status: "PendingRegistration", disputed: false } },
    },
  ],
  [
    "PendingRemoval",
    {
      Icon: Pending,
      query: { where: { status: "PendingRemoval", disputed: false } },
    },
  ],
  [
    "ChallengedRegistration",
    {
      Icon: Pending,
      query: { where: { status: "PendingRegistration", disputed: true } },
    },
  ],
  [
    "ChallengedRemoval",
    {
      Icon: Pending,
      query: { where: { status: "PendingRemoval", disputed: true } },
    },
  ],
  [
    "Registered",
    {
      Icon: Check,
      query: ({ submissionDuration }) => ({
        where: {
          status: "None",
          registered: true,
          submissionTime_gte:
            Math.floor(Date.now() / 1000) - (submissionDuration || 0),
        },
      }),
    },
  ],
  [
    "Expired",
    {
      Icon: Expired,
      query: ({ submissionDuration }) => ({
        where: {
          status: "None",
          registered: true,
          submissionTime_lt:
            Math.floor(Date.now() / 1000) - (submissionDuration || 0),
        },
      }),
    },
  ],
];

const dropdownOptionsEnum = createEnum(
  dropdownOptions,
  ({ status, registered, submissionTime, submissionDuration, disputed }) => {
    if (status === dropdownOptionsEnum.None.key) {
      if (!registered) return dropdownOptionsEnum.Removed;
      return submissionTime >=
        Math.floor(Date.now() / 1000) - submissionDuration
        ? dropdownOptionsEnum.Registered
        : dropdownOptionsEnum.Expired;
    }
    if (disputed)
      return status === dropdownOptionsEnum.PendingRegistration.key
        ? dropdownOptionsEnum.ChallengedRegistration
        : dropdownOptionsEnum.ChallengedRemoval;
    return dropdownOptionsEnum[status];
  }
);

const allStatus = dropdownOptions.concat([
  [
    "Removed",
    {
      Icon: X,
      query: { where: { status: "None", registered: false } },
    },
  ],
]);

export const submissionStatusEnum = createEnum(
  allStatus,
  ({ status, registered, submissionTime, submissionDuration, disputed }) => {
    if (status === submissionStatusEnum.None.key) {
      if (!registered) return submissionStatusEnum.Removed;
      return submissionTime >=
        Math.floor(Date.now() / 1000) - submissionDuration
        ? submissionStatusEnum.Registered
        : submissionStatusEnum.Expired;
    }
    if (disputed)
      return status === submissionStatusEnum.PendingRegistration.key
        ? submissionStatusEnum.ChallengedRegistration
        : submissionStatusEnum.ChallengedRemoval;
    return submissionStatusEnum[status];
  }
);

export const partyEnum = createEnum(["Requester", "Challenger"], (array) => ({
  [partyEnum.Requester.key]: array[0],
  [partyEnum.Challenger.key]: array[1],
}));

export const challengeReasonEnum = createEnum([
  "None",
  [
    "IncorrectSubmission",
    {
      imageSrc: "/images/incorrect-submission.png",
      description: "Parts of the submission are incorrect.",
    },
  ],
  [
    "Deceased",
    {
      imageSrc: "/images/deceased.png",
      description: "The submitter has passed away.",
    },
  ],
  [
    "Duplicate",
    {
      imageSrc: "/images/duplicate.png",
      description: "The submitter is already registered.",
    },
  ],
  [
    "DoesNotExist",
    {
      imageSrc: "/images/does-not-exist.png",
      description: "The submitter does not exist.",
    },
  ],
]);

export const queryEnums = { status: submissionStatusEnum };
