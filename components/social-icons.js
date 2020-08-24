import { Blog, Github, LinkedIn, Telegram, Twitter } from "@kleros/icons";

import Link from "./link";

export default function SocialIcons({
  twitter = true,
  github = true,
  blog = true,
  linkedIn = true,
  telegram = true,
}) {
  return (
    <>
      {twitter && (
        <Link
          sx={{ marginX: "6px" }}
          newTab
          href="https://twitter.com/Kleros_io"
        >
          <Twitter />
        </Link>
      )}
      {github && (
        <Link sx={{ marginX: "6px" }} newTab href="https://github.com/kleros">
          <Github />
        </Link>
      )}
      {blog && (
        <Link sx={{ marginX: "6px" }} newTab href="https://blog.kleros.io">
          <Blog />
        </Link>
      )}
      {linkedIn && (
        <Link
          sx={{ marginX: "6px" }}
          newTab
          href="https://www.linkedin.com/company/kleros"
        >
          <LinkedIn />
        </Link>
      )}
      {telegram && (
        <Link sx={{ marginX: "6px" }} newTab href="https://t.me/kleros">
          <Telegram />
        </Link>
      )}
    </>
  );
}
