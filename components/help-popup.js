import { Book, Bug, Ether, Help, Telegram } from "@kleros/icons";
import { Box, IconButton } from "theme-ui";

import Link from "./link";
import List, { ListItem } from "./list";
import Popup from "./popup";

const items = [
  {
    key: "get-help",
    text: "Get Help",
    url: "https://t.me/proofhumanity",
    Icon: Telegram,
  },
  {
    key: "report-bug",
    text: "Report a Bug",
    url: "https://github.com/Proof-Of-Humanity/proof-of-humanity-web/issues",
    Icon: Bug,
  },
  {
    key: "tutorial",
    text: "Tutorial",
    url: "https://kleros.gitbook.io/docs/products/proof-of-humanity/proof-of-humanity-tutorial",
    Icon: Book,
  },
  {
    key: "crypto-guide",
    text: "Crypto Beginner's Guide",
    url: "https://ethereum.org/en/wallets",
    Icon: Ether,
  },
  {
    key: "faq",
    text: "FAQ",
    url: "https://kleros.gitbook.io/docs/products/proof-of-humanity/poh-faq",
    Icon: Help,
  },
];

export default function HelpPopup({ ...rest }) {
  return (
    <Popup
      contentStyle={{ width: 248 }}
      trigger={
        <IconButton aria-label="Help Menu">
          <Help size="auto" />
        </IconButton>
      }
      position="bottom right"
      {...rest}
    >
      <Box
        sx={{
          color: "text",
          paddingX: 1,
          paddingY: 2,
        }}
      >
        <List
          sx={{
            fontSize: 16,
            listStyle: "none",
            padding: 0,
          }}
        >
          {items.map(({ key, text, url, Icon }) => (
            <ListItem
              key={key}
              sx={{
                ":not(:last-child)": {
                  mb: 2,
                },
              }}
            >
              <Link
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "text",
                  textDecoration: "none",
                  ":hover, :focus": {
                    textDecoration: "underline",
                  },
                }}
              >
                <Icon
                  sx={{
                    fill: "primary",
                  }}
                />
                {text}
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Popup>
  );
}
