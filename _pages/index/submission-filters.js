import { Card, Input, Select, Text } from "@kleros/components";
import { Check, Expired, Pending, Search } from "@kleros/icons";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function SubmissionFilters({
  numberOfSubmissions,
  submissionDuration,
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const dropdownOptions = [
    {
      index: 0,
      key: "all",
      value: undefined,
      color: "none",
      toString: () => t("profile_search_all"),
      query: {},
      Icon: Pending,
    },
    {
      index: 1,
      key: "vouching",
      value: "vouching",
      color: "vouching",
      toString: () => t("profile_status_Vouching"),
      query: { where: { status: "Vouching" } },
      Icon: Pending,
    },
    {
      index: 2,
      key: "pending-registration",
      value: "pending-registration",
      color: "pendingRegistration",
      toString: () => t("profile_status_PendingRegistration"),
      query: { where: { status: "PendingRegistration", disputed: false } },
      Icon: Pending,
    },
    {
      index: 3,
      key: "pending-removal",
      value: "pending-removal",
      color: "pendingRemoval",
      toString: () => t("profile_status_PendingRemoval"),
      query: { where: { status: "PendingRemoval", disputed: false } },
      Icon: Pending,
    },
    {
      index: 4,
      key: "challenged-registration",
      value: "challenged-registration",
      color: "challengedRegistration",
      toString: () => t("profile_status_ChallengedRegistration"),
      query: { where: { status: "PendingRegistration", disputed: true } },
      Icon: Pending,
    },
    {
      index: 5,
      key: "challenged-removal",
      value: "challenged-removal",
      color: "challengedRemoval",
      toString: () => t("profile_status_ChallengedRemoval"),
      query: { where: { status: "PendingRemoval", disputed: true } },
      Icon: Pending,
    },
    {
      index: 6,
      key: "registered",
      value: "registered",
      color: "registered",
      toString: () => t("profile_status_Registered"),
      query: ({ submissionDuration: _submissionDuration }) => ({
        where: {
          status: "None",
          registered: true,
          submissionTime_gte:
            Math.floor(Date.now() / 1000) - (_submissionDuration || 0),
        },
      }),
      Icon: Check,
    },
    {
      index: 7,
      key: "expired",
      value: "expired",
      color: "expired",
      toString: () => t("profile_status_Expired"),
      query: ({ submissionDuration: _submissionDuration }) => ({
        where: {
          status: "None",
          registered: true,
          submissionTime_lt:
            Math.floor(Date.now() / 1000) - (_submissionDuration || 0),
        },
      }),
      Icon: Expired,
    },
  ];

  return (
    <Card
      sx={{ marginBottom: 2 }}
      header={
        <Text sx={{ maxWidth: 150 }}>
          {(numberOfSubmissions || numberOfSubmissions === 0) &&
            `${numberOfSubmissions} ${t("profile_search_profile_text")}${
              numberOfSubmissions === 1
                ? ""
                : t("profile_search_profile_suffix")
            }`}
        </Text>
      }
      headerSx={{ fontWeight: "bold", justifyContent: "flex-end" }}
      mainSx={{
        paddingX: 2,
        paddingY: 1,
        display: "flex",
        flexDirection: ["column", "row", "row", "row"],
      }}
    >
      <Input
        variant="mutedInput"
        aria-label={t("profile_search_search_text")}
        placeholder={t("profile_search_search_text")}
        icon={<Search />}
        value={router.query.search || ""}
        onChange={(event) => {
          const query = { ...router.query };
          if (!event.target.value) delete query.search;
          else query.search = event.target.value;
          router.push({
            pathname: "/",
            query,
          });
        }}
      />
      <Select
        sx={{
          marginLeft: 1,
          width: 240,
          button: { textAlign: "left" },
          marginTop: [2, 0, 0, 0],
        }}
        items={dropdownOptions}
        onChange={({ key, value }) => {
          const query = { ...router.query };

          if (key === "all") {
            delete query.status;
            delete query.submissionDuration;
          } else {
            query.status = value;

            if (value === "registered" || value === "expired") {
              if (submissionDuration)
                query.submissionDuration = submissionDuration.toNumber();
            } else delete query.submissionDuration;
          }

          delete query.skip;

          router.replace({
            pathname: "/",
            query,
          });
        }}
        value={dropdownOptions.find(
          ({ value }) => value === router.query.status
        )}
        label={`${t("profile_search_filter_by_text")}:`}
      />
    </Card>
  );
}
