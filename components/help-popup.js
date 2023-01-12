import { Book, Bug, Chat, Ether, Help, Telegram } from "@kleros/icons";
import { useTranslation } from "react-i18next";
import { Box, IconButton } from "theme-ui";

import Image from "./image";
import Link from "./link";
import List, { ListItem } from "./list";
import Popup from "./popup";

export default function HelpPopup({ ...rest }) {
  const { t } = useTranslation();
  const items = [
    {
      key: "get-help-en",
      text: t("header_faq_help"),
      url: "https://t.me/proofofhumanityDAOen",
      Icon: Telegram,
    },
    {
      key: "get-help-es",
      text: t("header_faq_help_es"),
      url: "https://t.me/proofofhumanityDAOes",
      Icon: Telegram,
    },
    {
      key: "forums",
      text: t("header_faq_forums"),
      url: "https://ubidao.social/",
      Icon: Chat,
    },
    {
      key: "report-bug",
      text: t("header_faq_bugreport"),
      url: "https://github.com/OpenProofOfHumanity",
      Icon: Bug,
    },
    {
      key: "tutorial",
      text: t("header_faq_tutorial"),
      url: "https://proof-of-humanity.gitbook.io/docs/",
      Icon: Book,
    },
    {
      key: "crypto-guide",
      text: t("header_faq_begginer_guide"),
      url: "https://ethereum.org/en/wallets",
      Icon: Ether,
    },
    {
      key: "faq",
      text: t("header_faq"),
      url: "https://proof-of-humanity.gitbook.io/docs/proof-of-humanity-faq",
      Icon: Help,
    },
  ];

  return (
    <Popup
      className="poh-header-dropdown"
      contentStyle={{ width: 248, lineHeight: "initial" }}
      trigger={
        <IconButton
          className="poh-header-text"
          sx={{
            backgroundColor: "transparent",
            backgroundImage: "none !important",
            color: "white",
            boxShadow: "none !important",
            fontSize: 16,
            borderRadius: 25,
            width: 50,
            height: 40,
            border: "1px solid #ffffff1d",
            px: "16px !important",
            py: "8px !important",
            mx: [0, "4px", "8px"],
            cursor: "pointer",
          }}
        >
          <Image
            src="/images/dots.svg"
            crossOrigin="anonymous"
            sx={{ objectFit: "contain" }}
          />
        </IconButton>
      }
      position="bottom right"
      {...rest}
    >
      <Box sx={{ color: "text", paddingX: 1, paddingY: 2 }}>
        <List sx={{ fontSize: 16, listStyle: "none", padding: 0 }}>
          {items.map(({ key, text, url, Icon }) => (
            <ListItem key={key} sx={{ ":not(:last-child)": { mb: 2 } }}>
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
                  ":hover, :focus": { textDecoration: "underline" },
                }}
              >
                <Icon
                  sx={{ fill: "primary" }}
                  color="var(--theme-ui-colors-primary,#ff9900)"
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
