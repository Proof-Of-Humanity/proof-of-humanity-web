import { useArchon } from "./archon-provider";
import Button from "./button";
import FileUpload from "./file-upload";
import Form, { Field } from "./form";
import Popup from "./popup";
import Textarea from "./textarea";
import { useContract } from "./web3-provider";

const createValidationSchema = ({ string, file }) => ({
  name: string().max(50, "Must be 50 characters or less.").required("Required"),
  description: string()
    .max(300, "Must be 300 characters or less.")
    .required("Required"),
  file: file(),
});
export default function SubmitEvidenceButton({ contract, args }) {
  const { upload } = useArchon();
  const { send } = useContract(contract, "submitEvidence");
  return (
    <Popup trigger={<Button>Submit Evidence</Button>} modal>
      {(close) => (
        <Form
          sx={{ padding: 2 }}
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
            await send(...args, evidence);
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
              <Field
                as={FileUpload}
                name="file"
                label="File"
                accept="image/png, image/jpeg, application/pdf"
                maxSize={2}
              />
              <Button type="submit" loading={isSubmitting}>
                Submit Evidence
              </Button>
            </>
          )}
        </Form>
      )}
    </Popup>
  );
}
