import { Card, Input, Option, Select, Text } from "@kleros/components";
import { Search } from "@kleros/icons";
import { useRouter } from "next/router";

import { submissionStatusEnum } from "data";

export default function SubmissionFilters() {
  const submissionsCount = 1;
  const router = useRouter();
  return (
    <Card
      sx={{ marginBottom: 2 }}
      header={
        <Text>
          <Text as="span">{submissionsCount}</Text> Profile
          {Number(submissionsCount) === 1 ? "" : "s"}
        </Text>
      }
      headerSx={{ fontWeight: "bold", justifyContent: "flex-end" }}
      mainSx={{ paddingX: 2, paddingY: 1 }}
    >
      <Input
        variant="mutedInput"
        aria-label="Search"
        placeholder="Search"
        icon={<Search />}
      />
      <Select
        sx={{ width: "190px" }}
        value={
          submissionStatusEnum.find(
            (status) => status.kebabCase === router.query.status
          ).startCase
        }
        onChange={(event) => {
          const query = { ...router.query };
          const status =
            submissionStatusEnum[event.currentTarget.value].kebabCase;
          if (!status) delete query.status;
          else query.status = status;
          router.push({
            query,
          });
        }}
      >
        {submissionStatusEnum.map((status) => (
          <Option key={status.key}>{status.startCase}</Option>
        ))}
      </Select>
    </Card>
  );
}
