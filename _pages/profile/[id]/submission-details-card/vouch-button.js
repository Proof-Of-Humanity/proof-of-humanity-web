import {
  Box,
  Button,
  Popup,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { Warning } from "@kleros/icons";
import { useMemo } from "react";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";
import { useTranslation } from 'react-i18next';

export default function VouchButton({ submissionID }) {
  const { t, i18n } = useTranslation();
  const [accounts] = useWeb3("eth", "getAccounts");
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [accounts?.[0]] }), [accounts])
  );

  const [vouched, , status, reCall] = useContract(
    "proofOfHumanity",
    "vouches",
    useMemo(
      () => ({ args: [accounts?.[0], submissionID] }),
      [accounts, submissionID]
    )
  );

  const {
    receipt: addVouchReceipt,
    send: addVouchSend,
    loading: addVouchLoading,
  } = useContract("proofOfHumanity", "addVouch");

  const isGraphSynced = useIsGraphSynced(addVouchReceipt?.blockNumber);

  return registered || vouched ? (
    <Popup
      trigger={
        <Button
          sx={{ marginY: 2, width: "100%" }}
          disabled={
            status === "pending" ||
            accounts?.[0]?.toLowerCase() === submissionID.toLowerCase()
          }
          loading={!isGraphSynced}
        >
          {vouched && t('profile_card_remove')} {t('profile_card_vouch')}
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ padding: 2 }}>
          <Warning />
          <Text sx={{ marginBottom: 2 }}>{t('profile_card_vouch_text')}</Text>
          <Button
            onClick={() =>
              addVouchSend(submissionID)
                .then(reCall)
                .then(() => close())
            }
            loading={addVouchLoading}
          >
            {t('profile_card_vouch')}
          </Button>
        </Box>
      )}
    </Popup>
  ) : null;
}
