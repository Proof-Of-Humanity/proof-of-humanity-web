import { Github, Telegram, Twitter } from "@kleros/icons";

import Image from "./image";
import Link from "./link";

export default function SocialIcons({
  twitter = true,
  github = true,
  telegram = true,
  snapshot = true,
  color = "#ffffff",
  sx,
}) {
  return (
    <>
      {twitter && (
        <Link
          sx={{ marginX: "6px", marginY: "4px", ...sx }}
          newTab
          href="https://twitter.com/pohdao"
        >
          <Twitter sx={{ fill: color, height: "24px", width: "24px" }} />
        </Link>
      )}
      {github && (
        <Link
          sx={{ marginX: "6px", marginY: "4px", ...sx }}
          newTab
          href="https://github.com/OpenProofOfHumanity"
        >
          <Github sx={{ fill: color, height: "24px", width: "24px" }} />
        </Link>
      )}
      {telegram && (
        <Link
          sx={{ marginX: "6px", marginY: "4px", ...sx }}
          newTab
          href="https://t.me/proofofhumanityDAOen"
        >
          <Telegram sx={{ fill: color, height: "24px", width: "24px" }} />
        </Link>
      )}
      {snapshot && (
        <Link
          sx={{ marginX: "6px", marginY: "4px", ...sx }}
          newTab
          href="https://snapshot.org/#/poh.eth"
        >
          <Image
            src="/images/snapshot.png"
            crossOrigin="anonymous"
            sx={{
              fill: color,
              height: "24px",
              width: "24px",
              marginTop: "-3px",
            }}
          />
        </Link>
      )}
    </>
  );
}
