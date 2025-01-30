import { WarningCircle } from "@kleros/icons";
import { Flex, Text } from "theme-ui";

import Link from "./link";

function Disclaimer() {
  return (
    <Flex
      sx={{
        backgroundColor: "muted",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "center",
          width: "92vw",
          backgroundColor: "white",
          border: "1px solid",
          borderColor: "primary",
          marginTop: 2,
          marginBottom: 2,
          px: 2,
        }}
      >
        <WarningCircle size={24} sx={{ ml: 2 }} />
        <Flex
          sx={{
            flexDirection: "column",
            ml: 2,
            flex: 1,
            lineHeight: 1.5,
            my: 2,
          }}
        >
          <Text sx={{ fontWeight: "bold", fontSize: 2, color: "primary" }}>
            Disclaimer: This is an unsupported version of Proof of Humanity
          </Text>

          <Text sx={{ fontSize: 1 }}>
            This version of Proof of Humanity is no longer supported or
            maintained by Kleros Cooperative. Users are advised that any
            interactions with this platform are done at their own risk. Kleros
            Cooperative assumes no responsibility for any issues, including but
            not limited to deposit losses, security vulnerabilities, technical
            failures, or inaccuracies, that may arise from the continued use of
            this version. For the latest supported version, please refer to{" "}
            <Link href="https://v2.proofofhumanity.id/">
              Proof of Humanity v2
            </Link>
            .
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Disclaimer;
