import { Card, Input, Select, Text } from "@kleros/components";
import { Search } from "@kleros/icons";
import { useRouter } from "next/router";

import { submissionStatusEnum } from "data";

export default function SubmissionFilters({
  numberOfSubmissions,
  submissionDuration,
}) {
  const router = useRouter();
  return (
    <Card
      sx={{ marginBottom: 2 }}
      header={
        <Text sx={{ maxWidth: 150 }}>
          {(numberOfSubmissions || numberOfSubmissions === 0) &&
            `${numberOfSubmissions} Profile${
              numberOfSubmissions === 1 ? "" : "s"
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
        aria-label="Search (case sensitive)"
        placeholder="Search (case sensitive)"
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
        items={submissionStatusEnum.array}
        onChange={(submissionStatus) => {
          const query = { ...router.query };
          if (!submissionStatus.kebabCase) {
            delete query.status;
            delete query.submissionDuration;
          } else {
            query.status = submissionStatus.kebabCase;
            if (
              submissionStatus === submissionStatusEnum.Registered ||
              submissionStatus === submissionStatusEnum.Expired
            ) {
              if (submissionDuration)
                query.submissionDuration = submissionDuration.toNumber();
            } else delete query.submissionDuration;
          }
          delete query.skip;
          router.push({
            pathname: "/",
            query,
          });
        }}
        value={submissionStatusEnum.array.find(
          ({ kebabCase }) => kebabCase === router.query.status
        )}
        label="Filter by status:"
      />
    </Card>
  );
}
