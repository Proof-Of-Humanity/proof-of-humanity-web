import { Check, Pending, X } from "@kleros/icons";
import lodashKebabCase from "lodash.kebabcase";
import lodashStartCase from "lodash.startcase";

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
    { parse }
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

export const queryEnums = { status: submissionStatusEnum };
