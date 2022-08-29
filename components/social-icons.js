import {
  Blog,
  Discord,
  Github,
  LinkedIn,
  Telegram,
  Twitter,
} from "@kleros/icons";

import Link from "./link";

export default function SocialIcons({
  twitter = true,
  github = true,
  blog = true,
  linkedIn = true,
  telegram = true,
  discord = true,
  color = "#ffffff",
  sx,
}) {
  return (
    <>
      {twitter && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://twitter.com/pohdao"
        >
          <Twitter sx={{ fill: color }} />
        </Link>
      )}
      {github && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://github.com/OpenProofOfHumanity"
        >
          <Github sx={{ fill: color }} />
        </Link>
      )}
      {blog && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://proofofhumanity.org"
        >
          <Blog sx={{ fill: color }} />
        </Link>
      )}
      {linkedIn && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://www.linkedin.com/company/74985941/admin/"
        >
          <LinkedIn sx={{ fill: color }} />
        </Link>
      )}
      {telegram && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://t.me/proofofhumanityDAOen"
        >
          <Telegram sx={{ fill: color }} />
        </Link>
      )}
      {discord && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://discord.gg/eQGnF6aW6p"
        >
          <Discord sx={{ fill: color }} />
        </Link>
      )}
    </>
  );
}
