import { useState } from "react";

import { useArchon } from "./archon-provider";
import Button from "./button";
import FileUpload from "./file-upload";
import Form, { Field } from "./form";
import Popup from "./popup";
import Textarea from "./textarea";
import { useContract } from "./web3-provider";

const FILE_OPTIONS = {
  size: {
    value: 2 * 1024 * 1024,
    label: "2 MB",
  },
};

const createValidationSchema = ({ string, file }) => ({
  name: string().max(50, "Must be 50 characters or less.").required("Required"),
  description: string()
    .max(300, "Must be 300 characters or less.")
    .required("Required"),
  file: file().test(
    "fileSize",
    `File should be ${FILE_OPTIONS.size.label} or less`,
    (value) => (!value ? true : value.size <= FILE_OPTIONS.size.value)
  ),
});
export default function SubmitEvidenceButton({ contract, args }) {
  const { upload } = useArchon();
  const { send } = useContract(contract, "submitEvidence");
  const [state, setState] = useState("idle");

  return (
    <Popup trigger={<Button>Submit Evidence</Button>} modal>
      {(close) => (
        <Form
          sx={{ padding: 2 }}
          createValidationSchema={createValidationSchema}
          onSubmit={async ({ name, description, file }) => {
            const evidence = { name, description };
            if (state !== "idle") return;

            if (file) {
              setState("uploading-file");
              const fileUploadResult = await upload(
                file.name,
                file.content,
                "file"
              );
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
              <Field
                name="name"
                label="Name"
                placeholder="E.g. The submitter is not a real person."
              />
              <Field
                as={Textarea}
                name="description"
                label="Description (Your Arguments)"
              />
              <Field as={FileUpload} name="file" label="File" />
              <Button
                type="submit"
                loading={state !== "idle"}
                disabled={isSubmitting}
              >
                {
                  {
                    idle: "Submit Evidence",
                    "uploading-file": "Saving the File",
                    "uploading-evidence": "Saving the Evidence",
                    "submitting-tx": "Preparing the Transaction",
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
