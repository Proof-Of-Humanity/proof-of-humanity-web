import { Box, Image, Link, NextLink, Popup } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import { useEvidenceFile } from "data";

const voucherFragment = graphql`
  fragment voucher on Submission {
    id
    name
    requests(
      orderBy: creationTime
      orderDirection: desc
      first: 1
      where: { registration: true }
    ) {
      evidence(orderBy: creationTime, first: 1) {
        URI
      }
    }
  }
`;
export default function Voucher({ submission }) {
  const {
    requests: [request],
    id,
    name: _name,
  } = useFragment(voucherFragment, submission);
  const evidence = useEvidenceFile()(request.evidence[0].URI);
  const name =
    evidence instanceof Error
      ? "Tampered Data, Reject"
      : evidence?.file?.name &&
        (_name.replaceAll(/[^\s\w]/g, "") ===
        evidence.file.name.replaceAll(/[^\s\w]/g, "")
          ? evidence.file.name
          : "Tampered Data, Reject");
  return (
    <NextLink href="/profile/[id]" as={`/profile/${id}`}>
      <Link
        sx={{
          height: 32,
          marginRight: 1,
        }}
        newTab
      >
        <Popup
          trigger={
            <Box
              sx={{
                span: { display: "flex" },
              }}
            >
              <Image variant="smallAvatar" src={evidence?.file?.photo} />
            </Box>
          }
          on={["focus", "hover"]}
          sx={{
            color: "text",
            fontSize: 1,
            textAlign: "center",
          }}
        >
          {name}
        </Popup>
      </Link>
    </NextLink>
  );
}
