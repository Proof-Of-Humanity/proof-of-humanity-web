import { Check, Pending, X } from "@kleros/icons";
import lodashKebabCase from "lodash.kebabcase";
import lodashStartCase from "lodash.startcase";

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const ethereumAddressRegExp = /^0x[\dA-Fa-f]{40}$/;

const createEnum = (keys, parse) => {
  const _enum = keys.reduce(
    (acc, key, index) => {
      let extra;
      if (Array.isArray(key)) [key, extra] = key;

      const value = {
        key,
        index,
        camelCase: key[0].toLowerCase() + key.slice(1),
        kebabCase: lodashKebabCase(key),
        startCase: lodashStartCase(key),
        ...extra,
      };
      acc[key] = value;
      acc[index] = value;
      acc[value.camelCase] = value;
      acc[value.kebabCase] = value;
      acc[value.startCase] = value;
      return acc;
    },
    {
      parse:
        parse ||
        ((arrayOrKey) =>
          Array.isArray(arrayOrKey)
            ? arrayOrKey.reduce((acc, key) => {
                const value = _enum[key];
                acc[key] = value;
                acc[value.index] = value;
                acc[value.camelCase] = value;
                acc[value.kebabCase] = value;
                acc[value.startCase] = value;
                return acc;
              }, {})
            : _enum[arrayOrKey]),
    }
  );
  _enum.map = (callback) => keys.map((_, index) => callback(_enum[index]));
  _enum.find = (callback) =>
    Object.values(_enum).find((value) => callback(value));
  return _enum;
};

export const submissionStatusEnum = createEnum(
  [
    ["None", { kebabCase: undefined, startCase: "All" }],
    ["Vouching", { Icon: Pending, query: { where: { status: "Vouching" } } }],
    [
      "PendingRegistration",
      { Icon: Pending, query: { where: { status: "PendingRegistration" } } },
    ],
    [
      "PendingRemoval",
      {
        Icon: Pending,
        query: { where: { status: "PendingRemoval" } },
        registrationEvidenceFileIndex: 1,
      },
    ],
    [
      "Registered",
      { Icon: Check, query: { where: { status: "None", registered: true } } },
    ],
    [
      "Removed",
      {
        Icon: X,
        query: { where: { status: "None", registered: false } },
      },
    ],
  ],
  ({ status, registered }) =>
    status === submissionStatusEnum.None.key
      ? registered
        ? submissionStatusEnum.Registered
        : submissionStatusEnum.Removed
      : submissionStatusEnum[status]
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
