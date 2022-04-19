import {
  Button,
  Card,
  Field,
  FileUpload,
  Form,
  Popup,
  Text,
  Textarea,
  useArchon,
  useContract,
  useWeb3,
} from "@kleros/components";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { graphql, useFragment } from "relay-hooks";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";

const removeButtonFragments = {
  contract: graphql`
    fragment removeButtonContract on Contract {
      submissionBaseDeposit
      sharedStakeMultiplier
    }
  `,
  request: graphql`
    fragment removeButtonRequest on Request {
      arbitrator
      arbitratorExtraData
    }
  `,
};

export default function RemoveButton({ request, contract, submissionID }) {
  const { t } = useTranslation();

  const { arbitrator, arbitratorExtraData } = useFragment(
    removeButtonFragments.request,
    request
  );

  const { upload } = useArchon();

  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: arbitrator,
        args: [arbitratorExtraData],
      }),
      [arbitrator, arbitratorExtraData]
    )
  );
  const { web3 } = useWeb3();
  const { submissionBaseDeposit } = useFragment(
    removeButtonFragments.contract,
    contract
  );
  const totalCost = arbitrationCost?.add(
    web3.utils.toBN(submissionBaseDeposit)
  );

  const { receipt, send } = useContract("proofOfHumanity", "removeSubmission");
  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);

  const createValidationSchema = ({ string, file }) => ({
    name: string()
      .max(50, t("profile_evidence_name_validation"))
      .required(t("profile_evidence_error_required")),
    description: string()
      .max(300, t("profile_evidence_description_validation"))
      .required(t("profile_evidence_error_required")),
    file: file(),
  });

  return (
    <Popup
      contentStyle={{ width: undefined }}
      trigger={
        <Button sx={{ marginY: 1, width: "100%" }} loading={!isGraphSynced}>
          {t("profile_card_request_removal")}
        </Button>
      }
      modal
    >
      {(close) => (
        <Form
          sx={{ fontWeight: "bold", padding: 2 }}
          createValidationSchema={createValidationSchema}
          onSubmit={async ({ name, description, file }) => {
            let evidence = { name, description };

            if (file)
              evidence.fileURI = (
                await upload(file.name, file.content)
              ).pathname;
            ({ pathname: evidence } = await upload(
              "evidence.json",
              JSON.stringify(evidence)
            ));

            await send(submissionID, evidence, { value: totalCost });
            close();
          }}
        >
          {({ isSubmitting }) => (
            <>
              <Text sx={{ fontSize: 1, marginBottom: 1 }}>
                {t("profile_card_deposit")}:
              </Text>
              <Card
                variant="muted"
                sx={{ fontSize: 2, marginBottom: 3 }}
                mainSx={{ padding: 0 }}
              >
                <Text>
                  {totalCost && `${web3.utils.fromWei(totalCost)} ETH`}
                </Text>
              </Card>
              <Field
                name="name"
                label={t("profile_card_request_removal_evidence_name")}
                placeholder={t("profile_evidence_example_placeholder")}
              />
              <Field
                as={Textarea}
                name="description"
                label={t("profile_evidence_example_description")}
              />
              <Field
                as={FileUpload}
                name="file"
                label={t("profile_card_file")}
                accept="image/png, image/jpeg, application/pdf"
                maxSize={2 * 1024 * 1024}
              />
              <Button
                sx={{ display: "block", margin: "auto" }}
                type="submit"
                disabled={!totalCost}
                loading={isSubmitting}
              >
                {t("profile_card_request_removal")}
              </Button>
            </>
          )}
        </Form>
      )}
    </Popup>
  );
}
