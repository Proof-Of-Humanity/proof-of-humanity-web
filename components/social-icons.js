import { Blog, Github, LinkedIn, Telegram, Twitter } from "@kleros/icons";

import Link from "./link";

export default function SocialIcons({
  twitter = true,
  github = true,
  blog = true,
  linkedIn = true,
  telegram = true,
  color = "#ffffff",
  sx,
}) {
  return (
    <>
      {twitter && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://twitter.com/Kleros_io"
        >
          <Twitter sx={{ fill: color }} />
        </Link>
      )}
      {github && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://github.com/kleros"
        >
          <Github sx={{ fill: color }} />
        </Link>
      )}
      {blog && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://blog.kleros.io"
        >
          <Blog sx={{ fill: color }} />
        </Link>
      )}
      {linkedIn && (
        <Link
          sx={{ marginX: "6px", ...sx }}
          newTab
          href="https://www.linkedin.com/company/kleros"
        >
          <LinkedIn sx={{ fill: color }} />
        </Link>
      )}
      {telegram && (
        <Link sx={{ marginX: "6px", ...sx }} newTab href="https://t.me/kleros">
          <Telegram sx={{ fill: color }} />
        </Link>
      )}
    </>
  );
}
