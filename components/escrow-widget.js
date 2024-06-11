import { SecuredByKleros } from "@kleros/icons";
import { useEffect, useRef, useState } from "react";
import { Box, Flex } from "theme-ui";
import Web3 from "web3";

import Button from "./button";
import KlerosEscrow from "./kleros-escrow";
import Link from "./link";
import Popup from "./popup";
import Text from "./text";

const defaultWeb3 = new Web3(process.env.NEXT_PUBLIC_INFURA_ENDPOINT);

export default function EscrowWidget({
  web3,
  court,
  currency,
  metaEvidence,
  children,
  amount,
  ticker = "ETH",
  recipient,
  timeout,
  onOpen,
  onClose,
}) {
  if (!web3) web3 = defaultWeb3;

  const klerosEscrowRef = useRef(new KlerosEscrow(web3));
  useEffect(() => {
    klerosEscrowRef.current.setCourtAndCurrency(court, currency);
  }, [court, currency]);

  const [metaEvidenceFileURI, setMetaEvidenceFileURI] = useState(
    metaEvidence.fileURI
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (metaEvidence.file) {
        const _metaEvidenceFileURI = `${
          klerosEscrowRef.current.archon.arbitrable.ipfsGateway
        }${await klerosEscrowRef.current.upload(
          "metaEvidenceFile",
          metaEvidence.file,
          "metaEvidence"
        )}`;
        if (!cancelled) setMetaEvidenceFileURI(_metaEvidenceFileURI);
      } else if (metaEvidence.fileURI !== metaEvidenceFileURI)
        setMetaEvidenceFileURI(metaEvidence.fileURI);
    })();
    return () => (cancelled = true);
  }, [metaEvidence, metaEvidenceFileURI]);

  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  return (
    <Popup
      trigger={
        typeof children === "string" ? <Button>{children}</Button> : children
      }
      modal
      onOpen={onOpen}
      onClose={() => onClose(loadingRef.current)}
    >
      {(close) => (
        <Box
          sx={{
            padding: 1,
            textAlign: "center",
          }}
        >
          <Text
            sx={{
              fontSize: 3,
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            {metaEvidence.title}
          </Text>
          <Text>{metaEvidence.description}</Text>
          <Text
            sx={{
              fontSize: 3,
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            {web3.utils.fromWei(String(amount))} {ticker}
          </Text>
          <Link
            sx={{
              backgroundColor: "skeleton",
              borderRadius: 5,
              display: "block",
              marginBottom: 2,
              padding: 1,
            }}
            newTab
            href={metaEvidenceFileURI}
          >
            Contract
          </Link>
          <Flex sx={{ justifyContent: "space-between" }}>
            <Button
              variant="secondary"
              sx={{ width: 80 }}
              onClick={() => close()}
            >
              Return
            </Button>
            <Link
              sx={{ alignItems: "center", display: "flex" }}
              newTab
              href="https://kleros.io"
            >
              <SecuredByKleros sx={{ width: 200 }} />
            </Link>
            <Button
              sx={{ width: 80 }}
              loading={loading}
              onClick={() => {
                loadingRef.current = true;
                setLoading(true);
                klerosEscrowRef.current
                  .createTransaction(amount, recipient, timeout, metaEvidence)
                  .then(() => {
                    close();
                    loadingRef.current = false;
                    setLoading(false);
                  })
                  .catch(() => {
                    loadingRef.current = false;
                    setLoading(false);
                    close();
                  });
              }}
            >
              Pay
            </Button>
          </Flex>
        </Box>
      )}
    </Popup>
  );
}
