import { Book, Bug, Chat, Ether, Help, Telegram } from "@kleros/icons";
import { Box, IconButton } from "theme-ui";

import Link from "./link";
import List, { ListItem } from "./list";
import Popup from "./popup";

import { useTranslation } from 'react-i18next';

export default function HelpPopup({ ...rest }) {
  const { t } = useTranslation();
  const items = [
    {
      key: "get-help-en",
      text: t('header_faq_help'),
      url: "https://t.me/proofhumanity",
      Icon: Telegram,
    },
    {
      key: "get-help-es",
      text: t('header_faq_help_es'),
      url: "https://t.me/proofhumanity",
      Icon: Telegram,
    },
    {
      key: "forums",
      text: t('header_faq_forums'),
      url: "https://gov.proofofhumanity.id/",
      Icon: Chat,
    },
    {
      key: "report-bug",
      text: t('header_faq_bugreport'),
      url: "https://github.com/Proof-Of-Humanity/proof-of-humanity-web/issues",
      Icon: Bug,
    },
    {
      key: "tutorial",
      text: t('header_faq_tutorial'),
      url: "https://kleros.gitbook.io/docs/products/proof-of-humanity/proof-of-humanity-tutorial",
      Icon: Book,
    },
    {
      key: "crypto-guide",
      text: t('header_faq_begginer_guide'),
      url: "https://ethereum.org/en/wallets",
      Icon: Ether,
    },
    {
      key: "faq",
      text: t('header_faq'),
      url: "https://kleros.gitbook.io/docs/products/proof-of-humanity/poh-faq",
      Icon: Help,
    },
  ];

  return (
    <Popup
      contentStyle={{ width: 248, lineHeight: 'initial' }}
      trigger={
        <IconButton aria-label="Help Menu">
          <Help fill="white" />
        </IconButton>
      }
      position="bottom right"
      {...rest}
    >
      <Box sx={{ color: "text", paddingX: 1, paddingY: 2 }}>
        <List sx={{ fontSize: 16, listStyle: "none", padding: 0 }}>
          {items.map(({ key, text, url, Icon }) => (
            <ListItem key={key} sx={{ ":not(:last-child)": { mb: 2, } }}>
              <Link
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                sx={{ display: "inline-flex", alignItems: "center", gap: 8, color: "text", textDecoration: "none", ":hover, :focus": { textDecoration: "underline" } }}
              >
                <Icon sx={{ fill: "primary" }} color="var(--theme-ui-colors-primary,#ff9900)" />
                {text}
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Popup>
  );
}
