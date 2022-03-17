import { useState } from "react";

import { useArchon } from "./archon-provider";
import Button from "./button";
import FileUpload from "./file-upload";
import Form, { Field } from "./form";
import Popup from "./popup";
import Textarea from "./textarea";
import { useContract } from "./web3-provider";

import { useTranslation } from 'react-i18next';

const FILE_OPTIONS = {
  size: {
    value: 2 * 1024 * 1024,
    label: "2 MB",
  },
};


export default function SubmitEvidenceButton({ contract, args }) {
  const { t, i18n } = useTranslation();
  const { upload } = useArchon();
  const { send } = useContract(contract, "submitEvidence");
  const [state, setState] = useState("idle");

  const createValidationSchema = ({ string, file }) => ({
    name: string()
      .max(50, t('profile_evidence_name_validation'))
      .required(t('profile_evidence_error_required')),
    description: string()
      .max(300, t('profile_evidence_description_validation'))
      .required(t('profile_evidence_error_required')),
    file: file().test(
      "fileSize",
      t('profile_evidence_file_size', { max_size: FILE_OPTIONS.size.label }),
      (value) => (!value ? true : value.size <= FILE_OPTIONS.size.value)
    ),
  });

  return (
    <Popup trigger={<Button>{t('profile_evidence_submit_evidence')}</Button>} modal>
      {(close) => (
        <Form
          sx={{ padding: 2 }}
          createValidationSchema={createValidationSchema}
          onSubmit={async ({ name, description, file }) => {
            const evidence = { name, description };
            if (state !== "idle") return;

            if (file) {
              setState("uploading-file");
              const fileUploadResult = await upload(file.name, file.content);
              evidence.fileURI = fileUploadResult.pathname;
            }

            setState("uploading-evidence");
            const evidenceUploadResult = await upload(
              "evidence.json",
              JSON.stringify(evidence)
            );

            setState("submitting-tx");
            await send(...args, evidenceUploadResult.pathname);

            setState("idle");
            close();
          }}
        >
          {({ isSubmitting }) => (
            <>
              <Field name="name" label="Name" placeholder={t('profile_evidence_example_placeholder')} />
              <Field as={Textarea} name="description" label={t('profile_evidence_example_description')} />
              <Field as={FileUpload} name="file" label="File" />
              <Button type="submit" loading={state !== "idle"} disabled={isSubmitting} >
                {
                  {
                    idle: t('profile_evidence_submit_evidence'),
                    "uploading-file": t('profile_evidence_uploading_file'),
                    "uploading-evidence": t('profile_evidence_uploading_evidence'),
                    "submitting-tx": t('profile_evidence_submitting_tx'),
                  }[state]
                }
              </Button>
            </>
          )}
        </Form>
      )}
    </Popup>
  );
}
